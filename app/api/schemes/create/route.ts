import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { adminSupabase as supabase } from "@/lib/supabase/adminSupabase";

export async function POST(request: Request) {
  try {
    // 1. Verify admin
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || request.headers.get('cookie')?.split('sb-access-token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const adminRecord = await prisma.adminUser.findUnique({
      where: { userId: user.id }
    });

    if (!adminRecord) {
      return NextResponse.json(
        { message: "Forbidden - Not an Admin" },
        { status: 403 }
      );
    }

    // 2. Parse payload
    const body = await request.json();

    // Map the admin form fields to the existing Prisma schema fields
    const newScheme = await prisma.scheme.create({
      data: {
        scheme_name: body.title,
        details: body.description,
        benefits: body.benefits,
        eligibility: body.eligibility,
        application: body.applicationUrl,
        documents: body.documentsRequired,
        level: body.state, // Storing "Central" or State name
        schemeCategory: body.category,
        tags: body.tags,
        // The rest are extra fields from the UI that aren't strictly mapped into the slim Prisma table yet,
        // so we append them into the full_text search string or just leave them out.
        // For a true implementation later, we can add them to Prisma if needed.
        full_text: `${body.title} ${body.description} ${body.category} ${body.ministry} ${body.tags}`
      }
    });

    return NextResponse.json(
      { message: "Scheme created successfully", scheme: newScheme },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create scheme error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
