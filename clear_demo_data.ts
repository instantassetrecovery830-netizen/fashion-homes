import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const collectionsToClear = [
  'products',
  'vendors',
  'orders',
  'notifications',
  'waitlist',
  'reviews',
  'followers',
  'direct_messages',
  'cart_items',
  'saved_items',
  'votes',
  'cms',
  'landing_content',
  'messages',
  'contact_submissions',
  'shipments',
  'user_logs',
  'shared_wishlists'
];

async function clearDatabase() {
  console.log("Starting fast parallel database cleanup...");
  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      if (snap.docs.length > 0) {
        console.log(`Clearing ${snap.docs.length} docs from '${colName}'...`);
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, colName, d.id))));
      } else {
        console.log(`Collection '${colName}' is already empty.`);
      }
    } catch (e) {
      console.error(`Error clearing ${colName}:`, e);
    }
  }

  // Ensure primary admin account exists in 'users' collection
  const adminEmail = 'instantassetrecovery830@gmail.com';
  console.log(`Setting up initial clean Admin account in 'users' for ${adminEmail}...`);
  await setDoc(doc(db, 'users', adminEmail), {
    id: adminEmail,
    name: 'Platform Admin',
    email: adminEmail,
    role: 'ADMIN',
    joined: new Date().toISOString(),
    status: 'ACTIVE',
    avatar: 'https://ui-avatars.com/api/?name=Admin'
  });

  console.log("SUCCESS: Database completely cleared afresh!");
}

clearDatabase().catch(console.error);
