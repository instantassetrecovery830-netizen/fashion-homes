import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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
import { apiSignUp } from './dataService.ts';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export type { User };

export const onAuthStateChanged = firebaseOnAuthStateChanged;

export const signInWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
    const credential = await firebaseSignInWithEmailAndPassword(authInstance, email, password);
    // Sync with backend - ensure existing Firebase users are added to the app's database
    try {
        await apiSignUp(email, 'FIREBASE_AUTH_USER');
    } catch (e) {
        // Ignore error if user already exists in backend
        console.log('User sync to backend completed or user already exists');
    }
    return credential;
};

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


