import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AIService } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase/createClient';

// ── Helper: Build niche keywords from the UserProfile schema fields ──
function buildNicheKeywords(profile: any): string[] {
    const keywords: string[] = [];
    const occ = profile.occupation || '';

    switch (occ) {
        case 'Student':
            keywords.push('scholarship', 'student', 'education');
            if (profile.educationLevel) {
                const eduMap: Record<string, string[]> = {
                    'Below10th': ['pre-matric', 'school'],
                    'Class10th': ['matric', '10th', 'secondary'],
                    'Class12th': ['post-matric', '12th', 'higher secondary'],
                    'ITI': ['ITI', 'vocational', 'technical'],
                    'Diploma': ['diploma', 'polytechnic'],
                    'Graduate': ['graduate', 'degree', 'undergraduate', 'B.Tech'],
                    'Postgraduate': ['postgraduate', 'masters', 'M.Tech'],
                    'PhD': ['research', 'doctoral', 'PhD'],
                };
                keywords.push(...(eduMap[profile.educationLevel] || []));
            }
            if (profile.courseName) keywords.push(profile.courseName);
            if (profile.institutionType === 'Government') keywords.push('government institution');
            break;

        case 'Farmer':
            keywords.push('farmer', 'agriculture', 'kisan', 'crop');
            if (profile.cropType) keywords.push(profile.cropType);
            if (profile.irrigationAccess === false) keywords.push('irrigation');
            if (profile.landSizeAcres && profile.landSizeAcres < 2) keywords.push('small farmer', 'marginal');
            break;

        case 'DairyFarm':
            keywords.push('dairy', 'animal husbandry', 'cattle', 'livestock');
            if (profile.animalType) keywords.push(profile.animalType);
            break;

        case 'Business':
        case 'SmallBusiness':
            keywords.push('entrepreneur', 'business', 'startup', 'MSME');
            if (profile.msmeRegistered) keywords.push('MSME registered');
            if (profile.businessType) keywords.push(profile.businessType);
            break;

        case 'JobSeeker':
            keywords.push('employment', 'skill training', 'placement', 'job');
            break;

        case 'Teacher':
            keywords.push('teacher', 'education', 'faculty', 'teaching');
            break;

        case 'Researcher':
            keywords.push('research', 'fellowship', 'innovation', 'R&D');
            break;

        case 'SelfEmployed':
            keywords.push('self-employed', 'artisan', 'micro enterprise', 'livelihood');
            break;

        default:
            keywords.push(occ.toLowerCase());
            break;
    }

    // Caste-based keywords
    if (profile.caste === 'SC') keywords.push('SC', 'Scheduled Caste');
    if (profile.caste === 'ST') keywords.push('ST', 'Scheduled Tribe', 'tribal');
    if (profile.caste === 'OBC') keywords.push('OBC', 'Other Backward');
    if (profile.caste === 'EWS') keywords.push('EWS', 'Economically Weaker');

    // Disability
    if (profile.disability) keywords.push('disability', 'specially-abled', 'handicapped');

    // Gender-specific
    if (profile.gender === 'Female') keywords.push('women', 'girl', 'mahila');

    // BPL
    if (profile.rationCard === 'BPL' || profile.rationCard === 'AAY') keywords.push('BPL', 'below poverty');

    return [...new Set(keywords)]; // Deduplicate
}

export async function GET(req: Request) {
    try {
        // ── 1. Authenticate ──
        const authCookie = req.headers.get('cookie')
            ?.split(';')
            .find(c => c.trim().startsWith('sb-access-token='))
            ?.split('=')[1];

        if (!authCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user } } = await supabase.auth.getUser(authCookie);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── 2. Load User Profile ──
        const userProfile = await prisma.userProfile.findUnique({
            where: { userId: user.id }
        });

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        const userState = userProfile.state; // e.g. "Gujarat"
        const nicheKeywords = buildNicheKeywords(userProfile);

        console.log(`📋 Recommendation Pipeline for: ${userProfile.name} (${userProfile.occupation})`);
        console.log(`  State: ${userState}`);
        console.log(`  Niche Keywords: ${nicheKeywords.join(', ')}`);

        // ══════════════════════════════════════════════════════════════
        // STAGE 1: Hard State Filter (User's State + Central)
        // The `level` column stores "State" or "Central", NOT the actual 
        // state name. The actual state name is embedded in `details` text.
        // So we filter: (details ILIKE '%Gujarat%') OR (level = 'Central')
        // ══════════════════════════════════════════════════════════════

        const stateFilteredSchemes = await prisma.$queryRawUnsafe<any[]>(
            `SELECT id, scheme_name, details, benefits, eligibility, level, "schemeCategory", tags
             FROM schemes
             WHERE (LOWER(details) LIKE LOWER($1) OR LOWER(level) = 'central')
             LIMIT 500`,
            `%${userState}%`
        );

        console.log(`  Stage 1: ${stateFilteredSchemes.length} schemes after state filter (${userState} + Central)`);

        // ══════════════════════════════════════════════════════════════
        // STAGE 2: Occupation Niche Filter (Keyword Matching)
        // From the Stage 1 pool, filter schemes that match the user's
        // occupation-specific keywords in title, details, or eligibility.
        // ══════════════════════════════════════════════════════════════

        const nicheMatches = stateFilteredSchemes.filter(scheme => {
            const searchText = `${scheme.scheme_name} ${scheme.details || ''} ${scheme.eligibility || ''} ${scheme.benefits || ''} ${scheme.schemeCategory || ''}`.toLowerCase();
            
            // A scheme matches if ANY of the niche keywords appear in its text
            return nicheKeywords.some(kw => searchText.includes(kw.toLowerCase()));
        });

        console.log(`  Stage 2: ${nicheMatches.length} schemes after niche filter`);

        // If niche is too strict, relax to just state-filtered schemes
        const candidatePool = nicheMatches.length >= 3 ? nicheMatches : stateFilteredSchemes;

        // Pick top 15 from the pool (shuffle for variety on each refresh)
        const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
        const top15 = shuffled.slice(0, 15);

        // ══════════════════════════════════════════════════════════════
        // STAGE 3: AI Ranking + Supportive Reason Generation
        // Send the filtered candidates to the LLM for personalized
        // ranking and one-liner supportive reasons.
        // ══════════════════════════════════════════════════════════════

        // Transform to UI format first
        const mappedCandidates = top15.map((s: any) => ({
            id: s.id.toString(),
            title: s.scheme_name || "Unknown",
            description: (s.details || "").substring(0, 300),
            category: s.schemeCategory || "Other",
            state: s.level || "Central",
            benefits: (s.benefits || "").substring(0, 200),
            matchScore: nicheMatches.includes(s) ? 85 : 60,
            status: 'active'
        }));

        // Generate AI reasons
        let reasons: Record<string, string> = {};
        try {
            console.log('🤖 Stage 3: Generating AI reasons for top candidates...');
            reasons = await AIService.generateReasons(userProfile, mappedCandidates);
        } catch (aiError) {
            console.error('⚠️ AI reason generation failed:', aiError);
        }

        const finalResults = mappedCandidates.map((s: any) => ({
            ...s,
            matchReason: reasons[s.id] || `Relevant to your profile as a ${userProfile.occupation} in ${userState}.`
        }));

        console.log(`  Stage 3: Returning ${finalResults.length} final recommendations`);

        return NextResponse.json(finalResults);

    } catch (error: any) {
        console.error('Recommendation API Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
