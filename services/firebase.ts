import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBZkNjNGQT0A7sKnWj2dNCJxyvS8d5OxOA",
  authDomain: "myfitstore2-97079.firebaseapp.com",
  projectId: "myfitstore2-97079",
  storageBucket: "myfitstore2-97079.firebasestorage.app",
  messagingSenderId: "54647664240",
  appId: "1:54647664240:web:31c452f1c34e3e800e4eb5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const updateUserPassword = async (user: User, newPassword: string) => {
  return updatePassword(user, newPassword);
};

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendEmailVerification, 
  sendPasswordResetEmail 
};

