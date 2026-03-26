import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabase/createClient';
import { getFuzzyScore } from '@/lib/utils/fuzzySearch';

/**
 * HYBRID SMART SEARCH API (v2.1)
 * ----------------------------
 * Logic: SQL Keyword Match + Trigram Fuzzy Match + Vector Semantic Match
 * 1. SQL Filter: Always restrict by User State and Caste (Safety)
 * 2. Fuzzy Match: Use pg_trgm similarity for typos/abbreviations (Precision)
 * 3. pgvector: Rank by semantic meaning (Discovery)
 * 4. Combination: Weighted hybrid score
 */

export async function POST(req: Request) {
    let queryArgs: any = {};
    try {
        queryArgs = await req.json();
        const { query, limit = 10 } = queryArgs;

        // ── 1. Authenticate & Profile (Optional but recommended for state filtering) ──
        const authCookie = req.headers.get('cookie')
            ?.split(';')
            .find(c => c.trim().startsWith('sb-access-token='))
            ?.split('=')[1];

        let userState = "Central";
        let userCaste = "General";

        if (authCookie) {
            const { data: { user } } = await supabase.auth.getUser(authCookie);
            if (user) {
                const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
                if (profile) {
                    userState = profile.state;
                    userCaste = profile.caste;
                }
            }
        }

        // ── 2. Get Search Embedding from FastAPI ──
        let queryVector: number[] = [];

        // ── 2.1 ELITE INTERCEPTOR for Abbreviations (PM, CM, etc.) ──
        // This ensures 'pm' ALWAYS returns 'Pradhan Mantri' regardless of SQL/AI performance.
        const normalizedQuery = query.toLowerCase().trim();
        if (normalizedQuery === 'pm' || normalizedQuery === 'p.m' || normalizedQuery === 'cm' || normalizedQuery === 'c.m') {
            const keywords = (normalizedQuery === 'pm' || normalizedQuery === 'p.m')
                ? ['Pradhan Mantri', 'Prime Minister']
                : ['Chief Minister', 'Mukhyamantri'];

            const fastResults = await prisma.scheme.findMany({
                where: {
                    OR: keywords.map(kw => ({
                        scheme_name: { contains: kw, mode: 'insensitive' }
                    })),
                    AND: [
                        { OR: [{ details: { contains: userState, mode: 'insensitive' } }, { level: 'Central' }] },
                        { OR: [{ eligibility: { contains: userCaste, mode: 'insensitive' } }, { eligibility: { contains: 'All Categories', mode: 'insensitive' } }, { eligibility: null }] }
                    ]
                },
                take: limit
            });

            if (fastResults.length > 0) {
                return NextResponse.json(fastResults.map((s: any) => ({
                    id: s.id.toString(),
                    title: s.scheme_name,
                    description: (s.details || "").substring(0, 200),
                    category: s.schemeCategory || "Other",
                    state: s.level || "Central",
                    matchScore: 99,
                    source: 'abbreviation-boost'
                })));
            }
        }

        try {
            const embedRes = await fetch("http://127.0.0.1:8000/api/embed-query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });
            if (embedRes.ok) {
                const data = await embedRes.json();
                queryVector = data.vector;
            }
        } catch (e) {
            console.error("Embedding failed, falling back to pure text search", e);
        }

        // We use raw SQL to mix 'similarity' (fuzzy) and '<=>' distance (vector)
        // Fuzzy Score (0-1): Based on trigram similarity to the scheme name
        // Vector Score (0-1): Based on semantic embedding
        let results: any[] = [];
        try {
            results = await prisma.$queryRawUnsafe<any[]>(
                `
            WITH candidates AS (
                SELECT id, scheme_name, details, benefits, level, "schemeCategory",
                       -- Use trigram distance operator <-> for fuzzy matching
                       (1 - (scheme_name::text <-> $1::text)) as fuzzy_score,
                       -- HIGH BOOST for abbreviations like PM -> Pradhan Mantri / Prime Minister
                       (CASE 
                            WHEN ($1::text ILIKE 'pm' OR $1::text ILIKE 'p.m') AND (scheme_name ILIKE '%Pradhan Mantri%' OR scheme_name ILIKE '%Prime Minister%') THEN 1.0
                            WHEN scheme_name ILIKE $2::text THEN 0.8 
                            ELSE 0 
                        END) as exact_match_boost
                FROM schemes
                WHERE (LOWER(details) LIKE LOWER($3::text) OR LOWER(level) = 'central')
                AND (eligibility ILIKE $4::text OR eligibility ILIKE '%All Categories%' OR eligibility IS NULL)
            ),
            vector_ranks AS (
                SELECT id, (1 - (embedding <=> $5::vector)) as vector_score
                FROM schemes
                WHERE embedding IS NOT NULL
            )
            SELECT c.*, COALESCE(vr.vector_score, 0) as vector_score,
                   -- Weighting: Favor Exact/Abbreviation matches (0.6) and Vector discovery (0.4)
                   ( (GREATEST(c.fuzzy_score, c.exact_match_boost) * 0.6) + (COALESCE(vr.vector_score, 0) * 0.4) ) as hybrid_score
            FROM candidates c
            LEFT JOIN vector_ranks vr ON c.id = vr.id
            -- Filter: only show if there's SOME match
            WHERE (c.scheme_name % $1::text) OR c.exact_match_boost > 0.1 OR vr.vector_score > 0.3
            ORDER BY hybrid_score DESC
            LIMIT $6;
            `,
                String(query),              // $1: Similarity query
                `%${query}%`,               // $2: Exact match boost
                `%${userState}%`,           // $3: State filter
                `%${userCaste}%`,           // $4: Caste filter
                queryVector && queryVector.length > 0 ? `[${queryVector.join(',')}]` : null, // $5: Vector (Stringify for ::vector cast)
                limit                       // $6: Limit
            );
        } catch (sqlError: any) {
            console.error('SQL EXECUTION FAILED:', sqlError);
            // Re-throw to hit the main catch block and potentially expose the error
            throw sqlError;
        }

        // ── 4. Final Formatting ──
        const formatted = results.map(s => ({
            id: s.id.toString(),
            title: s.scheme_name,
            description: (s.details || "").substring(0, 200),
            category: s.schemeCategory || "Other",
            state: s.level || "Central",
            matchScore: Math.round(s.hybrid_score * 100),
            source: s.fuzzy_score > 0.4 ? 'fuzzy' : 'semantic'
        }));

        return NextResponse.json(formatted);

    } catch (error: any) {
        console.error('CRITICAL: Smart Search Raw SQL Failed:', error);
        console.error('Error Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });

        // ULTIMATE FALLBACK: Pure Prisma Keyword Search (Zero SQL complexity)
        try {
            const { query, limit = 10 } = queryArgs;
            const fallbackResults = await prisma.scheme.findMany({
                where: {
                    OR: [
                        { scheme_name: { contains: query, mode: 'insensitive' } },
                        { details: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: limit
            });
            return NextResponse.json(fallbackResults.map((s: any) => {
                const title = s.scheme_name || "";
                let score = getFuzzyScore(title, query) * 100;
                let source = 'fuzzy-utility';

                // High-relevance boost for PM/CM abbreviations
                if (query.toLowerCase() === 'pm' || query.toLowerCase() === 'p.m') {
                    if (title.toLowerCase().includes('pradhan mantri') || title.toLowerCase().includes('prime minister')) {
                        score = 100;
                        source = 'smart-boost';
                    }
                } else if (query.toLowerCase() === 'cm' || query.toLowerCase() === 'c.m') {
                    if (title.toLowerCase().includes('chief minister') || title.toLowerCase().includes('mukhyamantri')) {
                        score = 100;
                        source = 'smart-boost';
                    }
                }

                return {
                    id: s.id.toString(),
                    title: title,
                    description: (s.details || "").substring(0, 200),
                    category: s.schemeCategory || "Other",
                    state: s.level || "Central",
                    matchScore: Math.round(score),
                    source: source
                };
            }).sort((a: any, b: any) => b.matchScore - a.matchScore));
        } catch (fallbackError) {
            return NextResponse.json({
                error: 'Search failed completely',
                sqlError: error.message,
                sqlCode: error.code
            }, { status: 500 });
        }
    }
}
