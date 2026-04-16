import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from './firebase-applet-config.json' assert { type: 'json' };

try {
    const app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.projectId
    });
    const db = getFirestore(app, config.firestoreDatabaseId);
    
    await db.collection('test').doc('test').set({ test: true });
    console.log("Firebase Admin works!");
} catch (e) {
    console.error("Firebase Admin failed:", e);
}
