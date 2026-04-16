import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: 'json' };

try {
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);
    
    await setDoc(doc(db, 'test', 'test'), { test: true });
    console.log("Firebase Client works!");
} catch (e) {
    console.error("Firebase Client failed:", e);
}
