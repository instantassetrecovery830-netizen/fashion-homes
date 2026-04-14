import { sql } from './db.ts';

export const logUserAction = async (userId: string, action: string, details: any) => {
    try {
        await sql`
            INSERT INTO user_logs (id, user_id, action, details, timestamp)
            VALUES (gen_random_uuid(), ${userId}, ${action}, ${JSON.stringify(details)}, ${new Date().toISOString()})
        `;
    } catch (error) {
        console.error("Error logging user action:", error);
    }
};
