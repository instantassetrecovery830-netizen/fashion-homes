import { neon } from '@neondatabase/serverless';

let sqlClient: ReturnType<typeof neon> | null = null;

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  if (!sqlClient) {
    const dbUrl = process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
      throw new Error("NEON_DATABASE_URL environment variable is not set");
    }
    sqlClient = neon(dbUrl);
  }
  return sqlClient(strings, ...values);
};
