import admin from 'firebase-admin';
import config from './firebase-applet-config.json' assert { type: 'json' };

try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.projectId
    });
    const db = admin.firestore();
    db.settings({ databaseId: config.firestoreDatabaseId });
    
    await db.collection('test').doc('test').set({ test: true });
    console.log("Firebase Admin works!");
} catch (e) {
    console.error("Firebase Admin failed:", e);
}
