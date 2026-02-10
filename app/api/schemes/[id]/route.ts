import { db } from "@/db";
import { schemes } from "@/db/schemas/scheme";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const scheme = await db
      .select()
      .from(schemes)
      .where(eq(schemes.id, id))
      .limit(1);

    if (scheme.length === 0) {
      return NextResponse.json({ message: "Scheme not found" }, { status: 404 });
    }

    return NextResponse.json({ scheme: scheme[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scheme:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
