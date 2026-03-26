import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { message: "Missing userId parameter" },
                { status: 400 }
            );
        }

        let profile = await prisma.userProfile.findUnique({
            where: { userId },
        });

        // If not found in UserProfile, check AdminUser table
        if (!profile) {
            const admin = await prisma.adminUser.findUnique({
                where: { userId },
            });
            
            if (admin) {
                // Return a combined object with the admin role
                return NextResponse.json({ 
                    profile: { 
                        ...admin,
                        name: admin.name,
                        role: "admin" 
                    } 
                }, { status: 200 });
            }

            return NextResponse.json(
                { message: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ profile }, { status: 200 });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
