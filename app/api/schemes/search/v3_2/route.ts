import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * SEARCH v3.2: ORGANIC ATTRIBUTE SEARCH
 * -------------------------------------
 * 1. Title Search: Pure Fuzzy (Trigram + ILIKE). No Vector.
 * 2. Details Search: Hybrid (Vector + Trigram).
 * 3. Level/Category Search: Strict SQL Filters (WHERE col = val).
 * NO profile-based filtering (state/caste check).
 */

export async function POST(req: Request) {
    try {
        const { query, attribute = 'title', limit = 10 } = await req.json();

        // 1. FOR DETAILS SEARCH: Get Embedding (Only needed for details)
        let vectorString = "[]";
        if (attribute === 'details') {
            const embedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/embed-query`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Internal-Secret': process.env.INTERNAL_API_SECRET || ''
                },
                body: JSON.stringify({ query: query })
            });
            if (embedRes.ok) {
                const embedData = await embedRes.json();
                if (embedData.vector && Array.isArray(embedData.vector)) {
                    vectorString = `[${embedData.vector.join(',')}]`;
                }
            }
        }

        // 2. DYNAMIC SQL GENERATION
        let results = [];

        if (attribute === 'title') {
            // PURE FUZZY TITLE SEARCH
            results = await prisma.$queryRawUnsafe<any[]>(
                `
                SELECT id, scheme_name, details, "schemeCategory", level,
                (similarity(scheme_name, $1::text) * 100) as match_score
                FROM schemes
                WHERE scheme_name % $1::text OR scheme_name ILIKE $2::text
                ORDER BY match_score DESC
                LIMIT $3;
                `,
                query,
                `%${query}%`,
                limit
            );
        } else if (attribute === 'details') {
            // HYBRID DETAILS SEARCH
            results = await prisma.$queryRawUnsafe<any[]>(
                `
                SELECT id, scheme_name, details, "schemeCategory", level,
                ((1 - (embedding <=> '${vectorString}'::vector)) * 0.4 + similarity(details, $1::text) * 0.6) * 100 as match_score
                FROM schemes
                WHERE details % $1::text OR details ILIKE $2::text OR (embedding <=> '${vectorString}'::vector) < 0.7
                ORDER BY match_score DESC
                LIMIT $3;
                `,
                query,
                `%${query}%`,
                limit
            );
        } else if (attribute === 'level') {
            // STRICT LEVEL FILTER (State/Center)
            // Query can be "Central", "Gujarat", etc.
            results = await prisma.$queryRawUnsafe<any[]>(
                `
                SELECT id, scheme_name, details, "schemeCategory", level, 100 as match_score
                FROM schemes
                WHERE level ILIKE $1::text OR details ILIKE $2::text
                LIMIT $3;
                `,
                query,
                `%${query}%`,
                limit
            );
        } else if (attribute === 'category') {
            // STRICT CATEGORY FILTER (General, OBC, etc.)
            results = await prisma.$queryRawUnsafe<any[]>(
                `
                SELECT id, scheme_name, details, "schemeCategory", level, 100 as match_score
                FROM schemes
                WHERE eligibility ILIKE $1::text OR eligibility ILIKE '%All Categories%'
                LIMIT $2;
                `,
                `%${query}%`,
                limit
            );
        }

        return NextResponse.json(results.map(s => ({
            id: s.id.toString(),
            title: s.scheme_name,
            description: (s.details || "").substring(0, 200),
            category: s.schemeCategory || "Other",
            state: s.level || "Central",
            matchScore: Math.round(s.match_score),
            source: `v3.2-${attribute}`
        })));

    } catch (error: any) {
        console.error('Search v3.2 Error:', error);
        return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
    }
}
