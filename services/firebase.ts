
// Mock Firebase Service
// Replaces actual firebase imports to resolve environment issues where the package is missing or types are incompatible.

// Mock User Interface
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  reload: () => Promise<void>;
}

// Your web app's Firebase configuration  
const firebaseConfig = {  
  apiKey: "AIzaSyBZkNjNGQT0A7sKnWj2dNCJxyvS8d5OxOA",  
  authDomain: "myfitstore2-97079.firebaseapp.com",  
  projectId: "myfitstore2-97079",  
  storageBucket: "myfitstore2-97079.firebasestorage.app",  
  messagingSenderId: "54647664240",  
  appId: "1:54647664240:web:31c452f1c34e3e800e4eb5"  
};  
  
// Initialize Firebase  
const app = initializeApp(firebaseConfig);
};

// Internal State
let _currentUser: User | null = null;
const _listeners: Array<(user: User | null) => void> = [];

function _notify() {
    _listeners.forEach(cb => cb(_currentUser));
}

// Mock Auth Object
export const auth = {
    get currentUser() { return _currentUser; },
    set currentUser(v) { _currentUser = v; }
};

// --- Mock Functions ---

export const initializeApp = (config: any) => {
    console.log('Firebase Mock Initialized');
    return {};
};

export const getAuth = (app: any) => auth;

export const createUserWithEmailAndPassword = async (a: any, email: string, pass: string) => {
    // Simulate user creation
    const user: User = {
        uid: 'user_' + Date.now(),
        email,
        emailVerified: false,
        displayName: email.split('@')[0],
        photoURL: null,
        reload: async () => {
            // Simulate verification on reload for demo purposes
            if (_currentUser && _currentUser.email === email) {
                // In a real app this would check server status. 
                // Here we verify it to unblock the demo flow.
                const updated = { ..._currentUser, emailVerified: true };
                _currentUser = updated;
                // No notify needed for reload usually, but updating state internally
            }
        }
    };
    _currentUser = user;
    _notify();
    return { user };
};

export const signInWithEmailAndPassword = async (a: any, email: string, pass: string) => {
    // Basic mock login - allow any credentials in mock
    if (email.includes('error')) throw new Error('Mock Login Failed');
    
    const user: User = {
        uid: 'user_' + Date.now(),
        email,
        emailVerified: true, // Assume verified for login simplicity in mock
        displayName: email.split('@')[0],
        photoURL: null,
        reload: async () => {}
    };
    _currentUser = user;
    _notify();
    return { user };
};

export const signOut = async (a: any) => {
    _currentUser = null;
    _notify();
};

export const onAuthStateChanged = (a: any, cb: (user: User | null) => void) => {
    _listeners.push(cb);
    // Trigger immediately with current state
    cb(_currentUser);
    // Return unsubscribe function
    return () => {
        const idx = _listeners.indexOf(cb);
        if (idx !== -1) _listeners.splice(idx, 1);
    };
};

export const sendEmailVerification = async (user: User) => {
    console.log(`[Mock] Verification email sent to ${user.email}`);
};

export const sendPasswordResetEmail = async (a: any, email: string) => {
    console.log(`[Mock] Password reset email sent to ${email}`);
};

export const updatePassword = async (user: User, pass: string) => {
    console.log(`[Mock] Password updated for ${user.email}`);
};

export class GoogleAuthProvider {}

export const signInWithPopup = async (a: any, provider: any) => {
    const user: User = {
        uid: 'google_' + Date.now(),
        email: 'google@example.com',
        emailVerified: true,
        displayName: 'Google User',
        photoURL: null,
        reload: async () => {}
    };
    _currentUser = user;
    _notify();
    return { user };
};

export const signInWithGoogle = async () => {
  return signInWithPopup(auth, new GoogleAuthProvider());
};
