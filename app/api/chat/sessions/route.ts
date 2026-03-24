import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/createClient";

// GET — List all chat sessions for the authenticated user
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("x-user-id");
        if (!authHeader) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const sessions = await prisma.chatSession.findMany({
            where: { userId: authHeader },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        });

        return NextResponse.json({ sessions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// POST — Create a new chat session
export async function POST(request: Request) {
    try {
        const { userId, title } = await request.json();

        if (!userId) {
            return NextResponse.json({ message: "Missing userId" }, { status: 400 });
        }

        const session = await prisma.chatSession.create({
            data: {
                userId,
                title: title || "New Chat",
            },
        });

        return NextResponse.json({ session }, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
