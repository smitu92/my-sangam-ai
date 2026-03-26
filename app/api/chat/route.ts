import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST — Send a message: proxy to FastAPI + save to DB
export async function POST(req: Request) {
    try {
        const { sessionId, question, user_profile, chat_history } = await req.json();

        if (!sessionId || !question) {
            return NextResponse.json(
                { error: "Missing sessionId or question" },
                { status: 400 }
            );
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
        const fastApiResponse = await fetch("http://localhost:8000/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
        });
        if (session && session.title === "New Chat") {
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
