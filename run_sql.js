import fs from 'fs';
import { execSync } from 'child_process';
try {
  let envFile;
  try { envFile = fs.readFileSync('.env.local', 'utf-8'); }
  catch(e) { envFile = fs.readFileSync('.env', 'utf-8'); }
  
  const match = envFile.match(/^DATABASE_URL=(.+)$/m);
  if (match) {
    let url = match[1].replace(/['"]/g, '').trim();
    console.log("Found Database connection. Executing drop script...");
    execSync(`npx prisma db execute --url "${url}" --file clear.sql`, { stdio: 'inherit' });
    console.log("Successfully manually cleared drift from Supabase.");
  } else {
    console.error("DATABASE_URL not found in env files.");
  }
} catch (e) {
  console.error("Script failed:", e.message);
}
