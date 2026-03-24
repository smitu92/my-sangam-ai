import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — Load all messages for a session
export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({ session }, { status: 200 });
    } catch (error) {
        console.error("Error fetching session:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// DELETE — Delete a chat session (messages cascade delete)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        await prisma.chatSession.delete({
            where: { id: sessionId },
        });

        return NextResponse.json({ message: "Session deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// PATCH — Rename a chat session
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const { title } = await request.json();

        if (!title) {
            return NextResponse.json({ message: "Missing title" }, { status: 400 });
        }

        const session = await prisma.chatSession.update({
            where: { id: sessionId },
            data: { title },
        });

        return NextResponse.json({ session }, { status: 200 });
    } catch (error) {
        console.error("Error renaming session:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
