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
import firebaseConfig from '../firebase-applet-config.json';
import { apiSignUp, apiSignIn } from './dataService.ts';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export type { User };

export const onAuthStateChanged = firebaseOnAuthStateChanged;

export const signInWithEmailAndPassword = firebaseSignInWithEmailAndPassword;

export const createUserWithEmailAndPassword = async (authInstance: any, email: string, password: string) => {
    const credential = await firebaseCreateUserWithEmailAndPassword(authInstance, email, password);
    // Sync with backend
    await apiSignUp(email, 'email-password');
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
        await apiSignUp(credential.user.email, 'google-oauth');
    }
    return credential;
};


