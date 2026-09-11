import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import config from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const collectionsToClear = [
  'products',
  'vendors',
  'orders',
  'users',
  'notifications',
  'followers',
  'direct_messages',
  'cms',
  'landing_content',
  'contact_submissions',
  'reviews',
  'cart',
  'saved_items',
  'shipments',
  'waitlist',
  'shared_wishlists',
  'chat_messages'
];

async function clearAllData() {
  console.log("Starting full cleanup of demo data in Firestore database...");

  for (const collectionName of collectionsToClear) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      console.log(`Found ${snapshot.size} documents in collection '${collectionName}'.`);
      
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
      await Promise.all(deletePromises);
      console.log(`Successfully cleared collection '${collectionName}'.`);
    } catch (err) {
      console.error(`Error clearing collection '${collectionName}':`, err);
    }
  }

  console.log("Firestore Database cleared successfully! Database is now completely fresh.");
  process.exit(0);
}

clearAllData();
