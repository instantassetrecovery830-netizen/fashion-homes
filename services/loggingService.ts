import { db } from './firebase.ts';
import { collection, addDoc } from 'firebase/firestore';

export const logUserAction = async (userId: string, action: string, details: any) => {
    try {
        await addDoc(collection(db, 'user_logs'), {
            userId,
            action,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error logging user action:", error);
    }
};
