
import { NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const result = await AIService.analyzeIntent(message);
        
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Intent API Error:', error);
        return NextResponse.json({ error: 'Failed to analyze intent' }, { status: 500 });
    }
}
