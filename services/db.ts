import { neon } from '@neondatabase/serverless';

const isServer = typeof window === 'undefined';

const getDbUrl = () => {
    if (isServer) {
        return process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    }
    return undefined;
};

const dbUrl = getDbUrl();

if (isServer && !dbUrl) {
  console.warn('WARNING: DATABASE_URL environment variable is not set. Database operations will fail.');
}

export const sql = (isServer && dbUrl) ? neon(dbUrl) : (() => {
    if (!isServer) throw new Error('SQL client cannot be used in the browser. Use the API instead.');
    throw new Error('DATABASE_URL is not configured. Please set it in the environment.');
}) as any;
