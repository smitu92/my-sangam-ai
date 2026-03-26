import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/adminSupabase";

export async function POST(request: Request) {
  try {
    const { name, email, password, secretKey } = await request.json();

    // Simple hardcoded secret for demo purposes
    if (secretKey !== "admin123") {
      return NextResponse.json(
        { message: "Invalid Admin Secret Key" },
        { status: 403 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Create admin via Supabase Admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'admin' }
    });

    if (authError) {
      console.error("Supabase Admin Auth Error:", authError);
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      );
    }

    const userId = authData?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Failed to retrieve user ID from Supabase" },
        { status: 500 }
      );
    }

    // 2. Create AdminUser in Prisma
    const newAdmin = await prisma.adminUser.create({
      data: {
        userId,
        email,
        name,
        role: "admin",
      },
    });

    return NextResponse.json(
      { message: "Admin created successfully", user: { id: newAdmin.id, name: newAdmin.name, role: newAdmin.role } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
