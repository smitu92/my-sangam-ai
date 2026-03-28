import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-utils';

/**
 * SEARCH v3.1: PURE DATABASE-DRIVEN HYBRID SEARCH
 * ---------------------------------------------
 * 100% Organic results using:
 *  - pgvector (<=>) for Semantic Meaning (handles 'pm', 'pmm', 'scholarship' automatically)
 *  - pg_trgm (%) for Character-level Fuzzy matching on specific attributes.
 *  - NO hardcoded interceptors.
 */

export async function POST(req: Request) {
    try {
        const { query, attribute = 'title', limit = 10 } = await req.json();

        // 1. Get Query Embedding from the FastAPI backend
        // This is key for semantic matching (knowing 'pm' relates to 'prime minister')
        const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const embedRes = await fetch(`${FASTAPI_URL}/api/embed-query`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Internal-Secret': process.env.INTERNAL_API_SECRET || ''
            },
            body: JSON.stringify({ query: query })
        });

        if (!embedRes.ok) throw new Error('Failed to generate embedding');
        const embedData = await embedRes.json();
        const embedding = embedData.vector;

        if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
            throw new Error('Invalid or empty embedding received');
        }

        const vectorString = `[${embedding.join(',')}]`;

        // 2. Fetch User Profile for filtering (State/Caste)
        let userState = "Central";
        let userCaste = "General";

        const user = await getServerUser();
        if (user) {
            const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
            if (profile) {
                userState = profile.state;
                userCaste = profile.caste;
            }
        }

        // 3. PURE HYBRID SQL (Vector Distance + Trigram Similarity)
        // targetColumn points to: scheme_name, details, "schemeCategory", or level
        let targetCol = 'scheme_name';
        if (attribute === 'details') targetCol = 'details';
        else if (attribute === 'category') targetCol = '"schemeCategory"';
        else if (attribute === 'level') targetCol = 'level';

        // Note: score = (1 - vector_dist) * 0.4 + (trigram_sim) * 0.6
        // We use $1 for embedding, $2 for state, $3 for caste, $4 for query string, $5 for limit
        const results = await prisma.$queryRawUnsafe<any[]>(
            `
            WITH semantic_matches AS (
                SELECT 
                    id, scheme_name, details, "schemeCategory", level, eligibility,
                    (1 - (embedding <=> '${vectorString}'::vector)) as vector_score
                FROM schemes
                ORDER BY embedding <=> '${vectorString}'::vector
                LIMIT 50
            ),
            fuzzy_matches AS (
                SELECT 
                    id, scheme_name, details, "schemeCategory", level, eligibility,
                    similarity(${targetCol}::text, $3::text) as fuzzy_score
                FROM schemes
                WHERE ${targetCol}::text % $3::text
                OR ${targetCol}::text ILIKE $3::text
                LIMIT 50
            )
            SELECT 
                COALESCE(s.id, f.id) as id,
                COALESCE(s.scheme_name, f.scheme_name) as scheme_name,
                COALESCE(s.details, f.details) as details,
                COALESCE(s."schemeCategory", f."schemeCategory") as "schemeCategory",
                COALESCE(s.level, f.level) as level,
                (COALESCE(s.vector_score, 0) * 0.4 + COALESCE(f.fuzzy_score, 0) * 0.6) as final_score
            FROM semantic_matches s
            FULL OUTER JOIN fuzzy_matches f ON s.id = f.id
            WHERE 
                (LOWER(COALESCE(s.details, f.details)) LIKE LOWER($1::text) OR LOWER(COALESCE(s.level, f.level)) = 'central')
                AND (COALESCE(s.eligibility, f.eligibility) ILIKE $2::text OR COALESCE(s.eligibility, f.eligibility) ILIKE '%All Categories%' OR COALESCE(s.eligibility, f.eligibility) IS NULL)
            ORDER BY final_score DESC
            LIMIT $4;
            `,
            `%${userState}%`,           // $1: State
            `%${userCaste}%`,           // $2: Caste
            `%${query}%`,               // $3: Raw query for ILIKE/trigram
            limit                       // $4: Limit
        );

        return NextResponse.json(results.map(s => ({
            id: s.id.toString(),
            title: s.scheme_name,
            description: (s.details || "").substring(0, 200),
            category: s.schemeCategory || "Other",
            state: s.level || "Central",
            matchScore: Math.round(s.final_score * 100),
            source: 'hybrid-v3.1'
        })));

    } catch (error: any) {
        console.error('Search v3.1 Error:', error);
        return NextResponse.json({ error: 'Organic search failed', details: error.message }, { status: 500 });
    }
}
