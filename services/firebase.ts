import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, 
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged, 
  sendEmailVerification as firebaseSendEmailVerification, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, 
  updatePassword as firebaseUpdatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId === "(default)" ? undefined : firebaseConfig.firestoreDatabaseId);

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();

// --- MOCK AUTH IMPLEMENTATION (For Preview/Dev Environments) ---
let mockUser: User | null = null;
const authListeners: ((user: User | null) => void)[] = [];

export const setMockUser = (user: any) => {
  mockUser = {
    ...user,
    emailVerified: true, // Auto-verify mock users
    reload: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
      token: 'mock-token',
      signInProvider: 'custom',
      claims: {},
      authTime: Date.now().toString(),
      issuedAtTime: Date.now().toString(),
      expirationTime: (Date.now() + 3600000).toString(),
    }),
  } as User;
  
  // Notify listeners
  authListeners.forEach(listener => listener(mockUser));
  return mockUser;
};

// Wrapper for onAuthStateChanged to support both Firebase and Mock
export const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
  // 1. Register for Firebase updates
  const firebaseUnsubscribe = firebaseOnAuthStateChanged(authInstance, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUser);
    } else {
      // If Firebase says logged out, check if we have a mock user
      callback(mockUser);
    }
  });

  // 2. Register for Mock updates
  authListeners.push(callback);

  // 3. Return unsubscribe
  return () => {
    firebaseUnsubscribe();
    const index = authListeners.indexOf(callback);
    if (index > -1) authListeners.splice(index, 1);
  };
};

export const signOut = async (authInstance: any) => {
  try {
    await firebaseSignOut(authInstance);
  } catch (e) {
    console.warn("Firebase signout failed, clearing mock user only", e);
  }
  mockUser = null;
  authListeners.forEach(listener => listener(null));
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const updateUserPassword = async (user: User, newPassword: string) => {
  if (mockUser && user.uid === mockUser.uid) {
    return; // No-op for mock user
  }
  return firebaseUpdatePassword(user, newPassword);
};

// Export original functions but aliased if needed, or wrapped
export const signInWithEmailAndPassword = firebaseSignInWithEmailAndPassword;
export const createUserWithEmailAndPassword = firebaseCreateUserWithEmailAndPassword;
export const sendEmailVerification = firebaseSendEmailVerification;
export const sendPasswordResetEmail = firebaseSendPasswordResetEmail;


