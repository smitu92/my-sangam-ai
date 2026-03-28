import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { adminSupabase as supabase } from "@/lib/supabase/adminSupabase"; // Or createBrowserClient if server context is tricky, but let's just use the api key or token

export async function GET(req: Request) {
  try {
    // For admin stats, we need to verify the user is an admin.
    // In a real app we'd pass the token and use createServerClient, or check AdminUser in Prisma.
    // For simplicity right now, since it's just stats, we'll verify if an admin session header or cookie exists.
    
    // We can extract the token from the Authorization header or cookies
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1] || req.headers.get('cookie')?.split('sb-access-token=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Verify user is in AdminUser table
    const adminRecord = await prisma.adminUser.findUnique({
      where: { userId: user.id }
    });

    if (!adminRecord) {
      return NextResponse.json(
        { message: "Forbidden - Not an Admin" },
        { status: 403 }
      );
    }

    // 1. Total Users
    const userCount = await prisma.userProfile.count();

    // 2. Active Schemes
    // Using string "active" as status doesn't exist on Scheme right now, but we'll use count
    const schemeCount = await prisma.scheme.count();

    // 3. Pending/Inactive
    const pendingCount = 0; // Placeholder

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
