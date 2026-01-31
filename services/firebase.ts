
// Mock implementation of Firebase Auth to resolve import errors
// and provide functional authentication in the preview environment.

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  reload: () => Promise<void>;
}

let currentUser: User | null = null;
const observers: Array<(user: User | null) => void> = [];

const notifyObservers = () => {
  observers.forEach(cb => cb(currentUser));
};

// Persistence helper
const saveUser = (user: User | null) => {
  if (user) {
    // We strip methods before saving to JSON
    const { reload, ...userData } = user;
    localStorage.setItem('firebase_mock_user', JSON.stringify(userData));
  } else {
    localStorage.removeItem('firebase_mock_user');
  }
};

const loadUser = (): User | null => {
  const stored = localStorage.getItem('firebase_mock_user');
  if (stored) {
    const u = JSON.parse(stored);
    // Restore method
    u.reload = async () => {
        const fresh = loadUser();
        if (fresh && currentUser) {
            currentUser.emailVerified = fresh.emailVerified;
            // update local ref
            Object.assign(currentUser, fresh);
        }
    };
    return u;
  }
  return null;
};

// Initialize from storage on load
currentUser = loadUser();

export const auth = {
  get currentUser() { return currentUser; }
};

export const onAuthStateChanged = (authObj: any, callback: (user: User | null) => void) => {
  observers.push(callback);
  // Fire immediately
  callback(currentUser);
  return () => {
    const idx = observers.indexOf(callback);
    if (idx > -1) observers.splice(idx, 1);
  };
};

export const signOut = async (authObj: any) => {
  currentUser = null;
  saveUser(null);
  notifyObservers();
};

export const signInWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network delay
  
  if (pass === 'error') throw { code: 'auth/wrong-password', message: 'Invalid password' };
  
  // Simulate login success - for demo, we assume existing users are verified
  // unless we want to test the unverified flow via login (rare in demos)
  const user: User = {
    uid: 'mock-uid-' + Date.now(),
    email,
    displayName: email.split('@')[0],
    emailVerified: true, 
    photoURL: 'https://i.pravatar.cc/150?u=' + email,
    reload: async () => {}
  };
  
  currentUser = user;
  saveUser(user);
  notifyObservers();
  return { user };
};

export const createUserWithEmailAndPassword = async (authObj: any, email: string, pass: string) => {
  await new Promise(r => setTimeout(r, 800));
  
  const user: User = {
    uid: 'mock-uid-' + Date.now(),
    email,
    displayName: null,
    emailVerified: false, // New users start unverified
    photoURL: null,
    reload: async () => {
         const fresh = loadUser();
         if (fresh) {
             user.emailVerified = fresh.emailVerified;
         }
    }
  };
  
  currentUser = user;
  saveUser(user);
  notifyObservers();
  return { user };
};

export const sendEmailVerification = async (user: User) => {
  console.log('Mock Verification Email sent to', user.email);
  // Auto-verify after 3 seconds to simulate user clicking email link
  setTimeout(() => {
    const u = loadUser();
    if (u && u.uid === user.uid) {
        u.emailVerified = true;
        saveUser(u);
        console.log('Mock User email verified automatically (backend simulation).');
    }
  }, 3000);
};

export const sendPasswordResetEmail = async (authObj: any, email: string) => {
    console.log('Mock Password Reset sent to', email);
    await new Promise(r => setTimeout(r, 500));
};

export const updatePassword = async (user: User, newPass: string) => {
    console.log('Mock Password updated');
    await new Promise(r => setTimeout(r, 500));
};

export const signInWithGoogle = async () => {
    await new Promise(r => setTimeout(r, 1000));
    const user: User = {
        uid: 'google-uid-' + Date.now(),
        email: 'google_user@example.com',
        displayName: 'Google User',
        emailVerified: true,
        photoURL: 'https://via.placeholder.com/150',
        reload: async () => {}
    };
    currentUser = user;
    saveUser(user);
    notifyObservers();
    return { user };
};

export const signInWithPopup = async (authObj: any, provider: any) => {
    return signInWithGoogle();
};

export class GoogleAuthProvider {}
