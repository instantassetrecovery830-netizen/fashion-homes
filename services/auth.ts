
import { getUserAuthData, createVendorInDb, createUserInDb, updatePasswordInDb } from './dataService.ts';
import { UserRole, Vendor, User } from '../types.ts';

const SESSION_KEY = 'myfitstore_session';

class AuthService {
  private currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }

  get user() {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async signIn(email: string, pass: string) {
    const dbUser = await getUserAuthData(email);
    if (!dbUser) throw new Error("User not found.");
    
    const hash = await this.hashPassword(pass);
    if (dbUser.password_hash !== hash) throw new Error("Incorrect password.");

    const sessionUser = {
      uid: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.name,
      role: dbUser.role || (dbUser.type === 'VENDOR' ? UserRole.VENDOR : UserRole.BUYER),
      photoURL: dbUser.avatar,
      emailVerified: true // Assume verified for database auth
    };

    this.currentUser = sessionUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    this.notify();
    return sessionUser;
  }

  async register(email: string, pass: string, role: UserRole, details: any) {
    const hash = await this.hashPassword(pass);
    const uid = 'usr_' + Date.now();
    const avatar = details.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(details.name)}`;

    if (role === UserRole.VENDOR) {
      const vendor: Vendor = {
        id: uid,
        name: details.brandName,
        email,
        avatar,
        bio: `Bio for ${details.brandName}`,
        verificationStatus: 'PENDING',
        subscriptionStatus: 'INACTIVE',
        location: 'Unknown',
        coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070',
        subscriptionPlan: 'Atelier',
        visualTheme: 'MINIMALIST'
      };
      await createVendorInDb(vendor, hash);
    } else {
      const user: Partial<User> = {
        id: uid,
        name: details.name,
        email,
        role: UserRole.BUYER,
        avatar,
        status: 'ACTIVE'
      };
      await createUserInDb(user, hash);
    }

    // Auto sign in
    return this.signIn(email, pass);
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    this.notify();
  }

  async updatePassword(newPass: string) {
    if (!this.currentUser || !this.currentUser.email) throw new Error("No user logged in");
    const hash = await this.hashPassword(newPass);
    await updatePasswordInDb(this.currentUser.email, hash);
  }
}

export const authService = new AuthService();
