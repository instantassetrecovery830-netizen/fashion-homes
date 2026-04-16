import { db } from './firebase.ts';
import { collection, setDoc, doc } from 'firebase/firestore';

export const logUserAction = async (userId: string, action: string, details: any) => {
    try {
        const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'user_logs', id), {
            id,
            userId,
            action,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error logging user action:", error);
    }
};
