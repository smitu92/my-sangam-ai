import { db } from "@/db";
import { users } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin User
    const newUser = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        role: "admin", // Explicitly set role to admin
      })
      .returning();

    return NextResponse.json(
      { message: "Admin created successfully", user: newUser[0] },
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
