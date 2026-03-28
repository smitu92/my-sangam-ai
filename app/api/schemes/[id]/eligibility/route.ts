import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { adminSupabase as supabase } from "@/lib/supabase/adminSupabase";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const schemeId = parseInt(id, 10);
        
        if (isNaN(schemeId)) {
            return NextResponse.json({ error: 'Invalid Scheme ID' }, { status: 400 });
        }

        // 1. Authenticate using the synced cookie
        const authCookie = req.headers.get('cookie')
            ?.split(';')
            .find(c => c.trim().startsWith('sb-access-token='))
            ?.split('=')[1];

        if (!authCookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(authCookie);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Load User Profile & Scheme Details concurrently
        const [userProfile, scheme] = await Promise.all([
            prisma.userProfile.findUnique({ where: { userId: user.id } }),
            prisma.scheme.findUnique({ where: { id: schemeId } })
        ]);

        if (!userProfile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }
        if (!scheme) {
            return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
        }

        // Map scheme to a compact form for the LLM payload
        const mappedScheme = {
            title: scheme.scheme_name || "Unknown",
            description: scheme.details || "",
            benefits: scheme.benefits || "",
            eligibility: scheme.eligibility || ""
        };

        // 3. Delegate complex reasoning back to Python FastAPI
        try {
            const aiRes = await fetch("http://127.0.0.1:8000/api/eligibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    user_profile: userProfile,
                    scheme: mappedScheme 
                })
            });
            
            if (aiRes.ok) {
                const aiData = await aiRes.json();
                if (aiData.result) {
                    return NextResponse.json(aiData.result, { status: 200 });
                }
            }
            
            console.error("FastAPI failed or returned invalid shape:", await aiRes.text());
            
        } catch (e) {
            console.error("Failed to reach Python API for eligibility", e);
        }

        // Fallback if AI fails:
        return NextResponse.json({
            chance: "Unknown",
            criteria: [
                { label: "AI Eligibility Service is currently offline", match: false }
            ]
        }, { status: 503 });

    } catch (error: any) {
        console.error('Eligibility Route Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
