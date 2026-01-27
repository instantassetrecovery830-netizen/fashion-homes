import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBBeM4QB0gkxenQHyGh3vyBz91_-q4qL0o",
  authDomain: "myfitstore-922b4.firebaseapp.com",
  projectId: "myfitstore-922b4",
  storageBucket: "myfitstore-922b4.firebasestorage.app",
  messagingSenderId: "85430306162",
  appId: "1:85430306162:web:0190d789d2a032f15249eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Export standard Firebase Auth functions directly
export { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged
};

// Wrapper for Google Sign In to match the app's existing interface
export const signInWithGoogle = async (authInstance: any) => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(authInstance, provider);
};