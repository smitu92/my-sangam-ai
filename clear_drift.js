import { PrismaClient } from './lib/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Dropping leaked drift states directly from the database...");
    
    // Safely drop the column we added via db push earlier so Prisma's
    // migrate dev can take full credit for creating it cleanly.
    await prisma.$executeRawUnsafe('ALTER TABLE "schemes" DROP COLUMN IF EXISTS "embedding";');
    
    // Safely drop the testing users table directly.
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "users" CASCADE;');
    
    console.log("Drift successfully cleared.");
  } catch (e) {
    console.error("Error clearing drift:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
