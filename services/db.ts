import { Pool, neonConfig } from '@neondatabase/serverless';

// Suppress security warning for browser usage
// This allows the app to function without flooding the console.
try {
  // @ts-ignore
  neonConfig.disableWarningInBrowsers = true;
} catch (e) {
  console.warn("Could not disable Neon browser warning", e);
}

// Connection string provided for the Neon database
const connectionString = 'postgresql://neondb_owner:npg_PI5t9MdFbZBK@ep-withered-tree-aegoqm9w-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

export const pool = new Pool({ connectionString });