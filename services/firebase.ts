
// Mock Firebase Service to resolve missing dependency errors

// Mock User object structure used in the app
export interface MockUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName?: string | null;
  photoURL?: string | null;
}

// Internal state
let currentUser: MockUser | null = null;
const listeners: ((user: MockUser | null) => void)[] = [];
// In-memory store to persist users during the session for testing verification flows
const userStore: Record<string, MockUser> = {};

const notify = () => {
  listeners.forEach(l => l(currentUser));
};

// Mock Auth Object
export const auth = {
  get currentUser() { return currentUser; }
};

// --- Auth Functions ---

export const initializeApp = (config: any) => {
  // console.log('Mock Firebase App initialized');
  return {};
};

export const getAuth = (app?: any) => auth;

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (userStore[email]) {
      const error: any = new Error("Email already in use");
      error.code = 'auth/email-already-in-use';
      throw error;
  }

  const newUser: MockUser = {
    uid: `user_${Math.random().toString(36).substr(2, 9)}`,
    email,
    emailVerified: false // Default to unverified to test flow
  };
  
  userStore[email] = newUser;
  currentUser = newUser;
  notify();
  
  return { user: newUser };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check in-memory store first (for registered users in this session)
  if (userStore[email]) {
      currentUser = userStore[email];
      notify();
      return { user: currentUser };
  }
  
  // Accept any login for demo purposes (simulating existing verified user)
  const user: MockUser = {
    uid: `user_${Math.random().toString(36).substr(2, 9)}`,
    email,
    emailVerified: true // Auto-verified for login convenience if not explicitly created in this session
  };
  
  // Persist this auto-created user for consistency
  userStore[email] = user;
  currentUser = user;
  notify();
  
  return { user };
};

export const signOut = async (authInstance: any) => {
  currentUser = null;
  notify();
};

export const sendEmailVerification = async (user: any) => {
  console.log(`[Mock] Verification email sent to ${user.email}`);
  return Promise.resolve();
};

// NEW: Helper to manually verify email in demo mode
export const mockVerifyEmail = async (email: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  if (userStore[email]) {
    userStore[email].emailVerified = true;
  }
  if (currentUser && currentUser.email === email) {
    currentUser.emailVerified = true;
  }
  notify();
  return Promise.resolve();
};

export const sendPasswordResetEmail = async (authInstance: any, email: string) => {
  console.log(`[Mock] Password reset email sent to ${email}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve();
};

export const updateUserPassword = async (user: any, newPassword: string) => {
  console.log(`[Mock] Password updated for ${user.email} to ${newPassword}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.resolve();
};

export const onAuthStateChanged = (authInstance: any, callback: (user: MockUser | null) => void) => {
  listeners.push(callback);
  // Immediate callback with current state
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export class GoogleAuthProvider {}

export const signInWithPopup = async (authInstance: any, provider: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const user: MockUser = {
    uid: `google_${Math.random().toString(36).substr(2, 9)}`,
    email: 'user@gmail.com',
    emailVerified: true,
    displayName: 'Google User',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200'
  };
  currentUser = user;
  notify();
  return { user };
};

export const signInWithGoogle = async (authInstance: any) => {
    return signInWithPopup(authInstance, new GoogleAuthProvider());
};
