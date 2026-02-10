import { db } from "@/db";
import { users } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userId = session.userId as string;

    const { 
        mobile, dob, gender, category, occupation, income, location,
        fatherName, fatherProfession, motherName, motherProfession,
        aadhar, pan, name
    } = body;

    const updatedUser = await db
      .update(users)
      .set({
        name,
        mobile, 
        dob, 
        gender, 
        category, 
        occupation, 
        income, 
        location,
        fatherName, 
        fatherProfession, 
        motherName, 
        motherProfession,
        aadhar, 
        pan,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json(
      { message: "Profile updated successfully", user: updatedUser[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
