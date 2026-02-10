import { db } from "@/db";
import { users } from "@/db/schemas/user";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.userId as string;

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        mobile: users.mobile,
        dob: users.dob, // Ensure this date is handled correctly on frontend
        gender: users.gender,
        category: users.category,
        occupation: users.occupation,
        income: users.income,
        location: users.location,
        fatherName: users.fatherName,
        fatherProfession: users.fatherProfession,
        motherName: users.motherName,
        motherProfession: users.motherProfession,
        aadhar: users.aadhar,
        pan: users.pan,
        documents: users.documents,
        appliedSchemes: users.appliedSchemes,
        savedSchemes: users.savedSchemes,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user: user[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
