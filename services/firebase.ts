
// @ts-ignore
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Wrapper for Google Sign In to match existing component usage
export const signInWithGoogle = async (authInstance: any) => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
};

// Alias for password update to match Dashboard usage
export const updateUserPassword = updatePassword;

// Export all Auth functions used by the app
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

// Export User type for TypeScript usage
export type { User };
