import { Pool, neonConfig } from '@neondatabase/serverless';

// Suppress security warning for browser usage
// This allows the app to function without flooding the console, 
// accepting the risks of client-side DB access for this prototype.
// @ts-ignore
neonConfig.disableWarningInBrowsers = true;

// In a real production environment, this should be in an environment variable.
// For this demo, we use the provided connection string.
const connectionString = 'postgresql://neondb_owner:npg_PI5t9MdFbZBK@ep-withered-tree-aegoqm9w-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export const pool = new Pool({ connectionString });