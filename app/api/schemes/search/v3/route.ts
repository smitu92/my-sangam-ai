import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { adminSupabase as supabase } from "@/lib/supabase/adminSupabase";
import { getFuzzyScore } from '@/lib/utils/fuzzySearch';

/**
 * SEARCH v3: MULTI-ATTRIBUTE HYBRID SEARCH
 * ---------------------------------------
 * Allows searching specifically by Title, Details, Level, or Category.
 * Supports: Abbreviation Boost (PM/CM) + Fuzzy Utility + Prisma Fallback.
 */

export async function POST(req: Request) {
    let queryArgs: any = {};
    try {
        queryArgs = await req.json();
        const { query, attribute = 'title', limit = 10 } = queryArgs;

        // 1. Map attribute to column name
        let targetColumn = 'scheme_name';
        if (attribute === 'details') targetColumn = 'details';
        else if (attribute === 'category') targetColumn = '"schemeCategory"';
        else if (attribute === 'level') targetColumn = 'level';

        // 2. Fetch User Profile for State/Caste filtering
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

        // 3. ELITE INTERCEPTOR for Abbreviations (Only if searching by title)
        if (attribute === 'title') {
            const normalizedQuery = query.toLowerCase().trim();
            if (normalizedQuery === 'pm' || normalizedQuery === 'p.m' || normalizedQuery === 'cm' || normalizedQuery === 'c.m') {
                const isPM = normalizedQuery === 'pm' || normalizedQuery === 'p.m';
                const searchKeywords = isPM 
                    ? ['Pradhan Mantri', 'Prime Minister', 'PM '] 
                    : ['Chief Minister', 'Mukhyamantri', 'CM '];
                
                const fastResults = await prisma.scheme.findMany({
                    where: {
                        OR: searchKeywords.map(kw => ({
                            scheme_name: { contains: kw, mode: 'insensitive' } as any
                        }))
                    },
                    take: 100 // Maximum results for abbreviations
                });

                if (fastResults.length > 0) {
                    return NextResponse.json(fastResults.map((s: any) => ({
                        id: s.id.toString(),
                        title: s.scheme_name,
                        description: (s.details || "").substring(0, 200),
                        category: s.schemeCategory || "Other",
                        state: s.level || "Central",
                        matchScore: 100,
                        source: 'smart-boost'
                    })));
                }
            }
        }

        // 4. MAIN SEARCH EXECUTION (Optimized Raw SQL)
        // We inject the column name carefully to avoid SQL injection while maintaining raw performance
        const results = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT id, scheme_name, details, "schemeCategory", level
            FROM schemes
            WHERE ${targetColumn}::text ILIKE $1::text
            AND (LOWER(details) LIKE LOWER($2::text) OR LOWER(level) = 'central')
            AND (eligibility ILIKE $3::text OR eligibility ILIKE '%All Categories%' OR eligibility IS NULL)
            LIMIT $4;
            `,
            `%${query}%`, // $1: Match by selected attribute
            `%${userState}%`, // $2: State filter
            `%${userCaste}%`, // $3: Caste filter
            limit * 2 // Fetch more for fuzzy re-ranking
        );

        // 5. POST-RANKING WITH FUZZY UTILITY
        const formatted = results.map(s => {
            const matchValue = String(attribute === 'title' ? s.scheme_name : 
                             attribute === 'category' ? s.schemeCategory :
                             attribute === 'level' ? s.level : s.details || "");
            
            const score = getFuzzyScore(matchValue, query) * 100;

            return {
                id: s.id.toString(),
                title: s.scheme_name,
                description: (s.details || "").substring(0, 200),
                category: s.schemeCategory || "Other",
                state: s.level || "Central",
                matchScore: Math.round(score),
                source: 'fuzzy-pro'
            };
        }).sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);

        return NextResponse.json(formatted);

    } catch (error: any) {
        console.error('Search v3 Error:', error);
        
        // ULTIMATE FALLBACK (Pure Prisma)
        try {
            const { query, attribute = 'title', limit = 10 } = queryArgs;
            let filter: any = {};
            if (attribute === 'details') filter = { details: { contains: query, mode: 'insensitive' } };
            else if (attribute === 'category') filter = { schemeCategory: { contains: query, mode: 'insensitive' } };
            else if (attribute === 'level') filter = { level: { contains: query, mode: 'insensitive' } };
            else filter = { scheme_name: { contains: query, mode: 'insensitive' } };

            const fallbackResults = await prisma.scheme.findMany({
                where: filter,
                take: limit
            });

            return NextResponse.json(fallbackResults.map((s: any) => ({
                id: s.id.toString(),
                title: s.scheme_name,
                description: (s.details || "").substring(0, 200),
                category: s.schemeCategory || "Other",
                state: s.level || "Central",
                matchScore: 50,
                source: 'v3-fallback'
            })));
        } catch (fatal) {
            return NextResponse.json({ error: 'Critical failure' }, { status: 500 });
        }
    }
}
