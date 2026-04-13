import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  signInWithPopup as firebaseSignInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  type User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { apiSignUp } from './dataService.ts';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvX8-_2t88SHZ6bCQmqy4EFGYDst6Dkg0",
  authDomain: "myfitstore2-97079.firebaseapp.com",
  projectId: "myfitstore2-97079",
  storageBucket: "myfitstore2-97079.firebasestorage.app",
  messagingSenderId: "54647664240",
  appId: "1:54647664240:web:f7bc131c9ede9c330e4eb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export type { User };

export const onAuthStateChanged = firebaseOnAuthStateChanged;

export const signInWithEmailAndPassword = firebaseSignInWithEmailAndPassword;

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
    const credential = await firebaseCreateUserWithEmailAndPassword(authInstance, email, password);
    // Sync with backend - we pass a placeholder password since Firebase handles the real one
    await apiSignUp(email, 'FIREBASE_AUTH_USER');
    return credential;
};

export const signOut = firebaseSignOut;

export const sendEmailVerification = firebaseSendEmailVerification;

export const sendPasswordResetEmail = firebaseSendPasswordResetEmail;

export const updateUserPassword = firebaseUpdatePassword;

export const signInWithGoogle = async () => {
    const credential = await firebaseSignInWithPopup(auth, googleProvider);
    // Sync with backend
    if (credential.user.email) {
        await apiSignUp(credential.user.email, 'GOOGLE_AUTH_USER');
    }
    return credential;
};


