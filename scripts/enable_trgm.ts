const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Checking pg_trgm extension...');
  try {
    // Check if similarity function works
    const result = await prisma.$queryRawUnsafe(`SELECT similarity('Prime Minister', 'prime') as score;`);
    console.log('✅ Extension pg_trgm is ENABLED and WORKING.');
    console.log('🧪 Test Score for "Prime Minister" vs "prime":', result[0].score);
  } catch (e) {
    console.log('❌ Extension pg_trgm is NOT enabled or similarity function missing.');
    try {
        console.log('🛠 Attempting to enable it...');
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
        console.log('✅ Extension pg_trgm enabled.');
    } catch (err) {
        console.error('🛑 Critical Failure: Could not enable extension.', err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
