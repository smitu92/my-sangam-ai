import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/auth-utils";

/**
 * Recommendations v2: Hybrid AI-Powered Engine
 * -----------------------------------------
 * 1. Fetch user profile from Prisma.
 * 2. Send profile to FastAPI for intent parsing.
 * 3. Use intent to search for relevant schemes.
 * 4. Generate AI reasons for matching.
 */

export async function GET(req: Request) {
    try {
        // 1. Authenticate User
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch User Profile
        const profile = await prisma.userProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // 3. Contact FastAPI for Recommendation Intent
        const apiHost = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const intentRes = await fetch(`${apiHost}/api/recommend-intent`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-Internal-Secret": process.env.INTERNAL_API_SECRET || ""
            },
            body: JSON.stringify({
                state: profile.state,
                category: profile.caste,
                occupation: profile.occupation,
                income: profile.annualIncome
            })
        });

        let query = profile.occupation || "citizen";
        if (intentRes.ok) {
            const intentData = await intentRes.json();
            query = intentData.query || query;
        }

        // 4. Hybrid Search (Keyword + State/Category filter)
        // We fetch candidates that match the user's state or are Central.
        const candidates = await prisma.scheme.findMany({
            where: {
                OR: [
                    { level: { contains: profile.state, mode: "insensitive" } },
                    { level: "Central" },
                ],
                AND: [
                    {
                        OR: [
                            { scheme_name: { contains: query, mode: "insensitive" } },
                            { details: { contains: query, mode: "insensitive" } },
                            { schemeCategory: { contains: profile.occupation || "", mode: "insensitive" } }
                        ]
                    },
                    {
                        OR: [
                            { eligibility: { contains: profile.caste, mode: "insensitive" } },
                            { eligibility: { contains: "All Categories", mode: "insensitive" } },
                            { eligibility: null }
                        ]
                    }
                ]
            },
            take: 10
        });

        if (candidates.length === 0) {
            return NextResponse.json([]);
        }

        // 5. Generate AI Reasons for the top 3
        const top3 = candidates.slice(0, 3);
        const reasonsRes = await fetch(`${apiHost}/api/generate-reasons`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-Internal-Secret": process.env.INTERNAL_API_SECRET || ""
            },
            body: JSON.stringify({
                profile: `State: ${profile.state}, Category: ${profile.caste}, Occupation: ${profile.occupation}`,
                schemes: top3.map(s => ({ title: s.scheme_name, details: s.details }))
            })
        });

        let reasonsMap: Record<string, string> = {};
        if (reasonsRes.ok) {
            reasonsMap = await reasonsRes.json();
        }

        // 6. Final Formatting
        const results = top3.map(s => ({
            id: s.id.toString(),
            title: s.scheme_name,
            description: s.details,
            category: s.schemeCategory || "Other",
            matchReason: reasonsMap[s.scheme_name] || "Matches your profile criteria."
        }));

        return NextResponse.json(results);

    } catch (error: any) {
        console.error("Recommendations API error:", error);
        return NextResponse.json({ error: "Failed to load recommendations" }, { status: 500 });
    }
}
