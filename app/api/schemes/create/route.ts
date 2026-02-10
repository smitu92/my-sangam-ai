import { db } from "@/db";
import { schemes } from "@/db/schemas/scheme";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();

    if (!body.title || !body.ministry || !body.description || !body.category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Ensure arrays are arrays
    const ensureArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    };

    const newSchemeData = {
        title: body.title,
        ministry: body.ministry,
        description: body.description,
        category: body.category,
        type: body.type || "General",
        state: body.state || "Central",
        
        benefits: body.benefits || "",
        eligibility: body.eligibility || "",
        documentsRequired: ensureArray(body.documentsRequired),
        amount: body.amount ? parseFloat(body.amount) : null,
        
        gender: body.gender || "All",
        ageMin: body.ageMin ? parseInt(body.ageMin) : null,
        ageMax: body.ageMax ? parseInt(body.ageMax) : null,
        incomeLimit: body.incomeLimit ? parseFloat(body.incomeLimit) : null,
        caste: ensureArray(body.caste),
        residence: body.residence || "Both",

        deadline: body.deadline ? new Date(body.deadline) : null,
        status: (body.status as "active" | "closed" | "upcoming") || "active",
        
        applicationUrl: body.applicationUrl || null,
        tags: ensureArray(body.tags),
        
        createdBy: session.userId,
    };

    const newScheme = await db.insert(schemes).values(newSchemeData).returning();

    return NextResponse.json(
      { message: "Scheme created successfully", scheme: newScheme[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating scheme:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
