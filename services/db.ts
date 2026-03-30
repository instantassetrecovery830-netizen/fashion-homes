import { neon } from '@neondatabase/serverless';

let sqlClient: ReturnType<typeof neon> | null = null;

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  let dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl || dbUrl === 'undefined' || dbUrl === 'null') {
    console.warn("NEON_DATABASE_URL not set or invalid, returning empty results");
    return [];
  }

  // Remove leading and trailing quotes and whitespace
  dbUrl = dbUrl.trim().replace(/^["']|["']$/g, '');
  
  if (!sqlClient) {
    try {
      sqlClient = neon(dbUrl);
    } catch (e) {
      console.error("Failed to initialize Neon client with URL:", dbUrl, e);
      return [];
    }
  }
  
  try {
    return sqlClient(strings, ...values);
  } catch (e) {
    console.error("SQL Execution Error:", e);
    throw e;
  }
};
