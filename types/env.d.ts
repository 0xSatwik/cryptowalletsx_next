// This file extends the ImportMeta interface to include the env property
// which is used by Vite/Next.js for environment variables
 
interface ImportMeta {
  env: Record<string, string>;
} 