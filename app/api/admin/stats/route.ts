import { db } from "@/db";
import { users } from "@/db/schemas/user";
import { schemes } from "@/db/schemas/scheme";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { count, eq } from "drizzle-orm"; // Ensure count is available or use raw sql if needed, but for now length is fine for small scale or sql`count(*)`

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Fetch Stats
    // Note: Drizzle count() usage might vary by version/driver, 
    // for simplicity in this rapid dev env we can use array length or SQL raw
    // Let's try simple array selection for now as it's guaranteed to work without complex sql imports
    
    // 1. Total Users
    const allUsers = await db.select({ id: users.id }).from(users);
    const userCount = allUsers.length;

    // 2. Active Schemes
    const activeSchemes = await db.select({ id: schemes.id }).from(schemes).where(eq(schemes.status, "active"));
    const schemeCount = activeSchemes.length;

    // 3. Pending/Inactive (Using closed/upcoming schemes as proxy for now)
    const inactiveSchemes = await db.select({ id: schemes.id }).from(schemes).where(eq(schemes.status, "closed"));
    const pendingCount = inactiveSchemes.length; // Or we can use this for something else

    return NextResponse.json(
      { 
        stats: {
            users: userCount,
            schemes: schemeCount,
            pending: pendingCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
