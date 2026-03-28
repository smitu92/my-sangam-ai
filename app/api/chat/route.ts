import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-utils";

export const runtime = "nodejs";

// POST — Send a message: proxy to FastAPI + save to DB
export async function POST(req: Request) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, question, user_profile, chat_history } = await req.json();

        // 0. Verify sessionId belongs to user
        const chatSessionRef = await prisma.chatSession.findUnique({
            where: { id: sessionId },
        });

        if (!chatSessionRef || chatSessionRef.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized or Session not found" }, { status: 401 });
        }

        // 1. Save user message to DB
        await prisma.chatMessage.create({
            data: {
                sessionId,
                role: "user",
                content: question,
            },
        });

        // 2. Forward to FastAPI v2
        const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";
        const fastApiResponse = await fetch(`${FASTAPI_URL}/query`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-Internal-Secret": process.env.INTERNAL_API_SECRET || ""
            },
            body: JSON.stringify({
                question,
                user_profile: user_profile || "",
                chat_history: chat_history || [],
                session_id: sessionId,
            }),
        });

        if (!fastApiResponse.ok) {
            throw new Error(`FastAPI responded with ${fastApiResponse.status}`);
        }

        const data = await fastApiResponse.json();

        // 3. Save assistant message to DB
        await prisma.chatMessage.create({
            data: {
                sessionId,
                role: "assistant",
                content: data.answer || "I couldn't find a relevant answer.",
                schemesFound: data.schemes_found || null,
            },
        });

        // 4. Update session title if it's the first message (title is still "New Chat")
        if (chatSessionRef.title === "New Chat") {
            await prisma.chatSession.update({
                where: { id: sessionId },
                data: {
                    title: question.slice(0, 50) + (question.length > 50 ? "…" : ""),
                },
            });
        }

        // 5. Touch session updatedAt
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({
            answer: data.answer,
            type: data.type || "GENERAL",
            schemes_found: data.schemes_found || [],
        });
    } catch (error: any) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
