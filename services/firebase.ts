// Mock Firebase Service to resolve missing dependency errors

// Mock User object structure used in the app
export interface MockUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

// Internal state
let currentUser: MockUser | null = null;
const listeners: ((user: MockUser | null) => void)[] = [];

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
  
  const newUser: MockUser = {
    uid: `user_${Math.random().toString(36).substr(2, 9)}`,
    email,
    emailVerified: false // Default to unverified to test flow
  };
  
  currentUser = newUser;
  notify();
  
  return { user: newUser };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Accept any login for demo purposes
  const user: MockUser = {
    uid: `user_${Math.random().toString(36).substr(2, 9)}`,
    email,
    emailVerified: true // Auto-verified for login convenience
  };
  
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
    emailVerified: true
  };
  currentUser = user;
  notify();
  return { user };
};

export const signInWithGoogle = async (authInstance: any) => {
    return signInWithPopup(authInstance, new GoogleAuthProvider());
};