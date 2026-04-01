import { apiSignUp, apiSignIn, apiUpdatePassword } from './dataService.ts';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: any[];
  reload: () => Promise<void>;
}

class MockAuth {
  currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    const savedUser = localStorage.getItem('myfitstore_auth_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        // Add reload method back
        if (this.currentUser) {
            this.currentUser.reload = async () => {};
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.currentUser));
    if (this.currentUser) {
      localStorage.setItem('myfitstore_auth_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('myfitstore_auth_user');
    }
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const dbUser = await apiSignIn(email, password);
    this.currentUser = {
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.email.split('@')[0],
      photoURL: `https://ui-avatars.com/api/?name=${dbUser.email}`,
      emailVerified: true,
      phoneNumber: null,
      isAnonymous: false,
      tenantId: null,
      providerData: [],
      reload: async () => {}
    };
    this.notifyListeners();
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const dbUser = await apiSignUp(email, password);
    this.currentUser = {
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.email.split('@')[0],
      photoURL: `https://ui-avatars.com/api/?name=${dbUser.email}`,
      emailVerified: true,
      phoneNumber: null,
      isAnonymous: false,
      tenantId: null,
      providerData: [],
      reload: async () => {}
    };
    this.notifyListeners();
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    this.notifyListeners();
  }

  async updatePassword(newPassword: string) {
    if (!this.currentUser || !this.currentUser.email) throw new Error("No user logged in");
    await apiUpdatePassword(this.currentUser.email, newPassword);
  }
}

export const auth = new MockAuth();

export const onAuthStateChanged = (authInstance: MockAuth, callback: (user: User | null) => void) => {
  return authInstance.onAuthStateChanged(callback);
};

export const signInWithEmailAndPassword = (authInstance: MockAuth, email: string, password: string) => {
  return authInstance.signInWithEmailAndPassword(email, password);
};

export const createUserWithEmailAndPassword = (authInstance: MockAuth, email: string, password: string) => {
  return authInstance.createUserWithEmailAndPassword(email, password);
};

export const signOut = (authInstance: MockAuth) => {
  return authInstance.signOut();
};

export const updateUserPassword = (user: User, newPassword: string) => {
  return auth.updatePassword(newPassword);
};

export const sendEmailVerification = async (user: User) => {
  // Mock email verification
  return Promise.resolve();
};

export const sendPasswordResetEmail = async (authInstance: MockAuth, email: string) => {
  // Mock password reset
  return Promise.resolve();
};

export const signInWithGoogle = async () => {
  // Mock Google Sign-In
  const email = `google_${Date.now()}@gmail.com`;
  const dbUser = await apiSignUp(email, 'google-oauth-mock');
  auth.currentUser = {
    uid: dbUser.uid,
    email: dbUser.email,
    displayName: 'Google User',
    photoURL: `https://ui-avatars.com/api/?name=Google+User`,
    emailVerified: true,
    phoneNumber: null,
    isAnonymous: false,
    tenantId: null,
    providerData: [],
    reload: async () => {}
  };
  (auth as any).notifyListeners();
  return { user: auth.currentUser };
};

export const GoogleAuthProvider = class {};
export const signInWithPopup = async () => {};


