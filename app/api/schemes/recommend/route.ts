
import { NextResponse } from 'next/server';
import { db, schemes, users } from '@/db';
import { AIService } from '@/lib/ai-service';
import { eq, and, or, desc } from 'drizzle-orm';
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const userPayload = await getSession();
        if (!userPayload?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userProfile = await db.query.users.findFirst({
            where: eq(users.id, userPayload.userId)
        });

        if (!userProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // profile data
        const dob = userProfile.dob;
        let userAge = 0;
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            userAge = today.getFullYear() - birthDate.getFullYear();
            if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                userAge--;
            }
        }
        
        const userIncome = userProfile.income ? parseFloat(userProfile.income.replace(/[^0-9.]/g, '')) : 0;
        const userOccupation = (userProfile.occupation || '').toLowerCase();
        const userGender = userProfile.gender || 'All';
        const userCategory = (userProfile.category || '').toLowerCase();
        const userLocation = (userProfile.location || '').toLowerCase();

        // 1. Fetch Candidates (Basic filter)
        let candidates = await db.select().from(schemes).where(eq(schemes.status, 'active'));
        
        // 2. High Precision Scoring
        const rankedCandidates = candidates
            .filter(s => {
                // STICT GENDER CHECK
                if (s.gender !== 'All' && s.gender !== userGender) return false;

                // STICT AGE CHECK
                if (userAge > 0) {
                    if (s.ageMin && userAge < s.ageMin) return false;
                    if (s.ageMax && userAge > s.ageMax) return false;
                }

                // STICT INCOME CHECK
                if (userIncome > 0 && s.incomeLimit && userIncome > s.incomeLimit) return false;

                // STICT CASTE CHECK (if scheme lists specific castes)
                if (s.caste && s.caste.length > 0 && userCategory) {
                    const normalizedCaste = s.caste.map(c => c.toLowerCase());
                    if (!normalizedCaste.includes(userCategory)) return false;
                }

                // STATE CHECK (Central or Local State)
                const schemeState = s.state.toLowerCase();
                if (schemeState !== 'central') {
                    if (!userLocation.includes(schemeState)) return false;
                }

                return true; // Eligible
            })
            .map(s => {
                let score = 50.0; // Base score for eligibility
                const schemeCat = s.category.toLowerCase();
                const schemeTitle = s.title.toLowerCase();
                const schemeDesc = s.description.toLowerCase();

                // --- PRIORITY 1: Occupation-Category Alignment (+30) ---
                if (userOccupation) {
                    // Logic: Farmer -> Agriculture, Student -> Education, Business -> Business
                    if (userOccupation.includes('farmer') && schemeCat.includes('agri')) score += 30;
                    else if (userOccupation.includes('student') && schemeCat.includes('education')) score += 30;
                    else if (userOccupation.includes('entrepreneur') && schemeCat.includes('business')) score += 30;
                    else if (userOccupation.includes('business') && schemeCat.includes('business')) score += 30;
                    else if (userOccupation.includes('startup') && schemeCat.includes('business')) score += 30;
                    
                    // Minor boost for keyword in title/tags (+10)
                    if (schemeTitle.includes(userOccupation)) score += 10;
                    if (s.tags?.some(t => t.toLowerCase().includes(userOccupation))) score += 10;
                }

                // --- PRIORITY 2: Targeted Caste Relevance (+10) ---
                if (s.caste && s.caste.length > 0 && s.caste.length < 4) {
                    score += 10; // If it's specifically for minority/specific castes and user is eligible
                }

                // --- PRIORITY 3: State Specificity (+5) ---
                if (s.state.toLowerCase() !== 'central') {
                    score += 5; // Local state schemes are usually more targeted
                }

                const finalScore = Math.min(score, 99);
                return { ...s, matchScore: parseFloat(finalScore.toFixed(1)) };
            })
            // Only suggest if score is actually boosted (don't show random general schemes as "Recommended")
            .filter(s => s.matchScore > 50) 
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 20);

        if (rankedCandidates.length === 0) return NextResponse.json([]);

        // 3. AI Insights (Disabled for performance)
        // const reasons = await AIService.generateReasons(userProfile, rankedCandidates);
        
        const finalResults = rankedCandidates.map(s => ({
            ...s,
            // matchReason: reasons[s.id] || "Your profile strongly aligns with the objectives of this specialized scheme."
             matchReason: "Your profile strongly aligns with the objectives of this specialized scheme."
        }));

        return NextResponse.json(finalResults);

    } catch (error: any) {
        console.error('Recommendation API Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
