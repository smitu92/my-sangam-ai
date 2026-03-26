import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AIService } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase/createClient';

export async function GET(req: Request) {
    try {
        // ── 1. Authenticate ──
        const authCookie = req.headers.get('cookie')
            ?.split(';')
            .find(c => c.trim().startsWith('sb-access-token='))
            ?.split('=')[1];

        if (!authCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const { data: { user } } = await supabase.auth.getUser(authCookie);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // ── 2. Load User Profile ──
        const userProfile = await prisma.userProfile.findUnique({
            where: { userId: user.id }
        });
        if (!userProfile) return NextResponse.json({ error: 'User profile not found' }, { status: 404 });

        const userState = userProfile.state;
        const userCaste = userProfile.caste;

        // ══════════════════════════════════════════════════════════════
        // STAGE 1: Hard SQL Filter (The Guardrail)
        // Only fetch IDs that match the State and Caste exactly.
        // This is safe and performs well even at 100k rows.
        // ══════════════════════════════════════════════════════════════

        // Build a raw SQL query for maximum control over text matching
        // We look for the user's state in 'details' and match caste in 'eligibility' OR 'details'
        const candidatePool = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id, scheme_name, details, benefits, level, "schemeCategory", embedding <=> $1::vector as distance
             FROM schemes
             WHERE (LOWER(details) LIKE LOWER($2) OR LOWER(level) = 'central')
             -- Add caste filter if applicable (SC/ST/OBC/General)
             AND (
                eligibility ILIKE $3 
                OR eligibility ILIKE '%All Categories%'
                OR eligibility IS NULL
             )
             ORDER BY embedding <=> $1::vector ASC
             LIMIT 20`,
            // Stage 2: We get the interest vector from FastAPI
            JSON.stringify(await getInterestVector(userProfile)),
            `%${userState}%`,
            `%${userCaste}%`
        );

        console.log(`🚀 v2 Pipeline: Found ${candidatePool.length} matches using SQL + pgvector`);

        // ── 3. Transform & Rank ──
        const mappedResults = candidatePool.map((s: any) => ({
            id: s.id.toString(),
            title: s.scheme_name,
            description: (s.details || "").substring(0, 300),
            category: s.schemeCategory || "Other",
            state: s.level || "Central",
            benefits: (s.benefits || "").substring(0, 200),
            matchScore: Math.round((1 - (s.distance || 0)) * 100),
            status: 'active'
        }));

        // ── 4. AI Reason Generation ──
        let reasons: Record<string, string> = {};
        try {
            reasons = await AIService.generateReasons(userProfile, mappedResults.slice(0, 6));
        } catch (e) {
            console.error('AI Reason Error:', e);
        }

        const finalResults = mappedResults.map((s: any) => ({
            ...s,
            matchReason: reasons[s.id] || `This ${s.state} scheme matches your ${userProfile.occupation} profile.`
        }));

        return NextResponse.json(finalResults);

    } catch (error: any) {
        console.error('v2 Recommendation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper to fetch clean interest vector from FastAPI (Stage 2)
async function getInterestVector(profile: any) {
    try {
        const res = await fetch("http://127.0.0.1:8000/api/embed-interests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_profile: profile })
        });
        if (res.ok) {
            const data = await res.json();
            return data.vector;
        }
    } catch (e) {
        console.error("Interest embedding failed", e);
    }
    // Fallback to zero vector if failed
    return new Array(3072).fill(0);
}
