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
  throw new Error('DATABASE_URL environment variable is required');
}

export const sql = isServer ? neon(dbUrl!) : (() => {
    throw new Error('SQL client cannot be used in the browser. Use the API instead.');
}) as any;
