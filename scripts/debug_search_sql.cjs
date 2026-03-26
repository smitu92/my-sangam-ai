const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSearch() {
  const query = 'prime';
  const userState = 'Central';
  const userCaste = 'General';
  const queryVector = new Array(1536).fill(0); // Mock vector
  const limit = 5;

  console.log('🔍 Debugging Search SQL...');
  
  try {
    const results = await prisma.$queryRawUnsafe(`
        WITH candidates AS (
            SELECT id, scheme_name, details, benefits, level, "schemeCategory",
                   similarity(scheme_name, $1) as fuzzy_score,
                   (CASE WHEN scheme_name ILIKE $2 THEN 1.0 ELSE 0 END) as exact_match_boost
            FROM schemes
            WHERE (LOWER(details) LIKE LOWER($3) OR LOWER(level) = 'central')
            AND (eligibility ILIKE $4 OR eligibility ILIKE '%All Categories%' OR eligibility IS NULL)
        ),
        vector_ranks AS (
            SELECT id, (1 - (embedding <=> $5::vector)) as vector_score
            FROM schemes
            WHERE embedding IS NOT NULL
        )
        SELECT c.*, COALESCE(vr.vector_score, 0) as vector_score,
               ( (GREATEST(c.fuzzy_score, c.exact_match_boost) * 0.5) + (COALESCE(vr.vector_score, 0) * 0.5) ) as hybrid_score
        FROM candidates c
        LEFT JOIN vector_ranks vr ON c.id = vr.id
        WHERE c.fuzzy_score > 0.1 OR c.exact_match_boost > 0 OR vr.vector_score > 0.5
        ORDER BY hybrid_score DESC
        LIMIT $6;
    `, 
    query, 
    `%${query}%`, 
    `%${userState}%`, 
    `%${userCaste}%`, 
    queryVector, 
    limit
    );

    console.log('✅ SQL Success! Results count:', results.length);
    if (results.length > 0) console.log('First result:', results[0].scheme_name);
  } catch (e) {
    console.error('❌ SQL ERROR DETECTED:');
    console.error(e);
    
    if (e.message.includes('column "schemeCategory" does not exist')) {
        console.log('💡 TIP: Check if the column is actually "category" or "scheme_category"');
    }
    if (e.message.includes('operator does not exist: vector <=> double precision[]')) {
        console.log('💡 TIP: Try casting $5 to vector explicitly or passing it as a string');
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugSearch();
