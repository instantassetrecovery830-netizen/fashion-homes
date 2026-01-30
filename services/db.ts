
import { Pool, neonConfig } from '@neondatabase/serverless';

// Disable standard WebSocket warning for client-side usage in this specific architecture
try {
  // @ts-ignore
  neonConfig.disableWarningInBrowsers = true;
} catch (e) {
  console.warn("Could not disable Neon browser warning", e);
}

// Connection string from your provided configuration
const connectionString = 'postgresql://neondb_owner:npg_PI5t9MdFbZBK@ep-withered-tree-aegoqm9w-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({ connectionString });
