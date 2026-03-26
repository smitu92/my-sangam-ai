import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * SEARCH v4: ADVANCED MULTI-FILTER ORGANIC SEARCH
 * ---------------------------------------------
 * 1. Title Search: Pure Fuzzy (Trigram). No Vector.
 * 2. Details Search: Pure Semantic (pgvector).
 * 3. Level Filter: Strict ILIKE (Center / Gujarat / etc).
 * 4. Caste Filter: Strict ILIKE (General / OBC / SC / ST / PWD).
 * NO profile-based filtering.
 */

export async function POST(req: Request) {
    try {
        const { query, mode = 'title', level = 'All', caste = 'All', limit = 10 } = await req.json();

        // 1. FOR DETAILS SEARCH: Get Embedding
        let vectorString = "[]";
        if (mode === 'details' && query) {
            const embedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/embed-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });
            if (embedRes.ok) {
                const embedData = await embedRes.json();
                if (embedData.vector && Array.isArray(embedData.vector)) {
                    vectorString = `[${embedData.vector.join(',')}]`;
                }
            }
        }

        // 2. BUILD DYNAMIC SQL FILTERS
        // Since many schemes have NULL level/eligibility, we search both the column AND the details text for robustness
        let filterSql = "";
        const sqlParams: any[] = [];
        let pIndex = 1;

        if (level !== 'All') {
            filterSql += ` AND (level ILIKE $${pIndex} OR details ILIKE $${pIndex} OR scheme_name ILIKE $${pIndex})`;
            sqlParams.push(`%${level}%`);
            pIndex++;
        }

        if (caste !== 'All') {
            filterSql += ` AND (eligibility ILIKE $${pIndex} OR details ILIKE $${pIndex})`;
            sqlParams.push(`%${caste}%`);
            pIndex++;
        }

        // 3. EXECUTE BASED ON MODE
        let results = [];

        if (mode === 'title') {
            // mode: title -> PURE FUZZY (Trigram)
            const baseQuery = `
                SELECT id, scheme_name, details, "schemeCategory", level,
                (similarity(scheme_name, $${pIndex}) * 100) as match_score
                FROM schemes
                WHERE (scheme_name % $${pIndex} OR scheme_name ILIKE $${pIndex + 1})
                ${filterSql}
                ORDER BY match_score DESC
                LIMIT $${pIndex + 2};
            `;
            const finalParams = [...sqlParams, query, `%${query}%`, limit];
            results = await prisma.$queryRawUnsafe<any[]>(baseQuery, ...finalParams);
        } else {
            // mode: details -> PURE SEMANTIC (pgvector)
            // If query is empty, just filter
            if (!query) {
                results = await prisma.$queryRawUnsafe<any[]>(
                    `SELECT id, scheme_name, details, "schemeCategory", level, 100 as match_score FROM schemes WHERE 1=1 ${filterSql} LIMIT $${pIndex};`,
                    ...sqlParams, limit
                );
            } else {
                const baseQuery = `
                    SELECT id, scheme_name, details, "schemeCategory", level,
                    ((1 - (embedding <=> '${vectorString}'::vector)) * 100) as match_score
                    FROM schemes
                    WHERE 1=1 ${filterSql}
                    ORDER BY embedding <=> '${vectorString}'::vector
                    LIMIT $${pIndex};
                `;
                results = await prisma.$queryRawUnsafe<any[]>(baseQuery, ...sqlParams, limit);
            }
        }

        return NextResponse.json(results.map(s => ({
            id: s.id.toString(),
            title: s.scheme_name,
            description: (s.details || "").substring(0, 200),
            category: s.schemeCategory || "Other",
            state: s.level || "Central",
            matchScore: Math.round(s.match_score || 0),
            source: `v4-${mode}`
        })));

    } catch (error: any) {
        console.error('Search v4 Error:', error);
        return NextResponse.json({ error: 'Organic search failed', details: error.message }, { status: 500 });
    }
}
