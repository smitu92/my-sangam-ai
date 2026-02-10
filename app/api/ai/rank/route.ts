
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { schemes } from '@/db/schemas/scheme';
import { AIService } from '@/lib/ai-service';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { userProfile } = await req.json();

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile is required' }, { status: 400 });
        }

        // Fetch all active schemes
        const allSchemes = await db.select().from(schemes).where(eq(schemes.status, 'active'));

        // Rank them
        const rankedResults = await AIService.rankSchemes(userProfile, allSchemes);

        // Sort by score descending
        rankedResults.sort((a, b) => b.score - a.score);

        // Attach full scheme details to the response ? Or just IDs?
        // Let's attach minimal details to display
        const enrichedResults = rankedResults.map(r => {
            const scheme = allSchemes.find(s => s.id === r.schemeId);
            return {
                ...r,
                title: scheme?.title,
                category: scheme?.category,
                amount: scheme?.amount
            };
        });

        return NextResponse.json(enrichedResults);
    } catch (error: any) {
        console.error('Ranking API Error:', error);
        return NextResponse.json({ error: 'Failed to rank schemes' }, { status: 500 });
    }
}
