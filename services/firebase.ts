
// Mocking Firebase Authentication for the purpose of this environment where 'firebase' module seems unavailable or typed incorrectly.
// In a real application, you would install 'firebase' via npm and use the imports.

// Simulating the user type
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  reload: () => Promise<void>;
}

let currentUser: MockUser | null = null;
const authStateListeners: ((user: MockUser | null) => void)[] = [];

const notifyListeners = () => {
  authStateListeners.forEach(listener => listener(currentUser));
};

export const auth = {
  get currentUser() {
    return currentUser;
  }
};

export const onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  authStateListeners.push(callback);
  // Initial callback
  setTimeout(() => callback(currentUser), 10);
  return () => {
    const index = authStateListeners.indexOf(callback);
    if (index > -1) authStateListeners.splice(index, 1);
  };
};

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
  const newUser: MockUser = {
    uid: 'mock-uid-' + Date.now(),
    email,
    displayName: email.split('@')[0],
    photoURL: 'https://via.placeholder.com/150',
    emailVerified: false,
    reload: async () => {
        // Mock reload behavior
    }
  };
  currentUser = newUser;
  notifyListeners();
  return { user: newUser };
};

export const signInWithEmailAndPassword = async (authInstance: any, email: string, pass: string) => {
  // Simulate successful login
  const user: MockUser = {
    uid: 'mock-uid-login',
    email,
    displayName: email.split('@')[0],
    photoURL: 'https://via.placeholder.com/150',
    emailVerified: true, // Auto verify for convenience in mock
    reload: async () => {}
  };
  currentUser = user;
  notifyListeners();
  return { user };
};

export const signOut = async (authInstance: any) => {
  currentUser = null;
  notifyListeners();
};

export const sendEmailVerification = async (user: any) => {
  console.log(`[Mock] Email verification sent to ${user.email}`);
};

export const sendPasswordResetEmail = async (authInstance: any, email: string) => {
  console.log(`[Mock] Password reset email sent to ${email}`);
};

export const updatePassword = async (user: any, newPassword: string) => {
  console.log(`[Mock] Password updated for ${user.email}`);
};

// Aliased export for dashboard usage
export const updateUserPassword = updatePassword;

export const signInWithPopup = async (authInstance: any, provider: any) => {
  const user: MockUser = {
    uid: 'mock-google-uid-' + Date.now(),
    email: 'user@gmail.com',
    displayName: 'Google User',
    photoURL: 'https://via.placeholder.com/150',
    emailVerified: true,
    reload: async () => {}
  };
  currentUser = user;
  notifyListeners();
  return { user };
};

export const GoogleAuthProvider = class {};

// Wrapper for signInWithGoogle as requested by AuthView
export const signInWithGoogle = async (authInstance: any) => {
    return signInWithPopup(authInstance, new GoogleAuthProvider());
};
