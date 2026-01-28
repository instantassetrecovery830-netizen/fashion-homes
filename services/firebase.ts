
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updatePassword,
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBeM4QB0gkxenQHyGh3vyBz91_-q4qL0o",
  authDomain: "myfitstore-922b4.firebaseapp.com",
  projectId: "myfitstore-922b4",
  messagingSenderId: "85430306162",
  appId: "1:85430306162:web:0190d789d2a032f15249eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Export Firebase Auth functions
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider
};

// Alias for compatibility with existing components
export const updateUserPassword = updatePassword;

// Helper for Google Sign In to match existing signature
export const signInWithGoogle = async (authInstance: any) => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
};
