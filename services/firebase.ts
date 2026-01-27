import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBeM4QB0gkxenQHyGh3vyBz91_-q4qL0o",
  authDomain: "myfitstore-922b4.firebaseapp.com",
  projectId: "myfitstore-922b4",
  storageBucket: "myfitstore-922b4.firebasestorage.app",
  messagingSenderId: "85430306162",
  appId: "1:85430306162:web:0190d789d2a032f15249eb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);