import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Parse scheme ID because Prisma needs an Integer (Drizzle used UUID string)
    const schemeId = parseInt(id, 10);
    if (isNaN(schemeId)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const rawScheme = await prisma.scheme.findUnique({
      where: { id: schemeId }
    });

    if (!rawScheme) {
      return NextResponse.json({ message: "Scheme not found" }, { status: 404 });
    }

    // Map Prisma row back to legacy UI fields safely
    const scheme = {
      id: rawScheme.id.toString(),
      title: rawScheme.scheme_name || "Unknown",
      description: rawScheme.details || "No details provided",
      category: rawScheme.schemeCategory || "General",
      state: rawScheme.level || "Central",
      benefits: rawScheme.benefits || "N/A",
      eligibility: rawScheme.eligibility || "N/A",
      ministry: "Govt. of India",
      status: 'active'
    };

    return NextResponse.json({ scheme }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scheme [id]:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
