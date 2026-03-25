import { neon } from '@neondatabase/serverless';

let sqlClient: ReturnType<typeof neon> | null = null;

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const dbUrl = process.env.NEON_DATABASE_URL;
  if (!dbUrl) {
    console.warn("NEON_DATABASE_URL not set, returning empty results");
    return [];
  }
  if (!sqlClient) {
    sqlClient = neon(dbUrl);
  }
  return sqlClient(strings, ...values);
};
