// Mock Firebase Service to resolve module errors and provide demo functionality
// This replaces the real Firebase SDK dependencies which are causing build issues

// Mock User object class
class MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;

  constructor(email: string, displayName: string = 'Demo User') {
    this.uid = 'mock_user_' + Math.random().toString(36).substr(2, 9);
    this.email = email;
    this.displayName = displayName;
    this.emailVerified = true; // Default to verified for easier demo
    this.photoURL = 'https://via.placeholder.com/150';
  }

  // Simulate reloading user profile
  async reload() {
    this.emailVerified = true;
    notifyListeners();
  }
}

// Internal state
let _currentUser: MockUser | null = null;
const listeners: Array<(user: MockUser | null) => void> = [];

const notifyListeners = () => {
  listeners.forEach(l => l(_currentUser));
};

// Mock Auth Object
export const auth = {
  get currentUser() { return _currentUser; },
  set currentUser(u) { _currentUser = u; notifyListeners(); }
};

// --- Auth Functions ---

export const onAuthStateChanged = (authInstance: any, callback: (user: MockUser | null) => void) => {
  listeners.push(callback);
  // Async callback to simulate real behavior
  setTimeout(() => callback(_currentUser), 10);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  await new Promise(r => setTimeout(r, 500));
  if (password === 'error') throw new Error('Invalid credentials');
  
  _currentUser = new MockUser(email);
  notifyListeners();
  return { user: _currentUser };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
  await new Promise(r => setTimeout(r, 500));
  
  _currentUser = new MockUser(email);
  _currentUser.emailVerified = false; // Require verification for new users flow
  notifyListeners();
  return { user: _currentUser };
};

export const signOut = async (authInstance: any) => {
  await new Promise(r => setTimeout(r, 200));
  _currentUser = null;
  notifyListeners();
};

export const sendEmailVerification = async (user: any) => {
  console.log(`[Mock] Verification email sent to ${user.email}`);
};

export const sendPasswordResetEmail = async (authInstance: any, email: string) => {
  console.log(`[Mock] Password reset email sent to ${email}`);
};

export const updatePassword = async (user: any, password: string) => {
  console.log(`[Mock] Password updated`);
};

// Aliases
export const updateUserPassword = updatePassword;

// Providers
export class GoogleAuthProvider {}

export const signInWithPopup = async (authInstance: any, provider: any) => {
   await new Promise(r => setTimeout(r, 500));
   _currentUser = new MockUser('google_demo@example.com', 'Google User');
   notifyListeners();
   return { user: _currentUser };
};

export const signInWithGoogle = async (authInstance: any) => {
  return signInWithPopup(authInstance, new GoogleAuthProvider());
};