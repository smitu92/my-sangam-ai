import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserProfileSchema } from "@/prisma/zod/Userprofile.schema";
import { supabase } from "@/lib/supabase/createClient";


export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { ...profileData } = body;
        const { name, email, password } = body;

        //zod to valide user
        const validatedProfile = UserProfileSchema.safeParse(profileData);
        if (!validatedProfile.success) {
            console.log(validatedProfile.error)
            return NextResponse.json({
                message: "Invalid profile data",
                error: validatedProfile.error.issues,
            }, { status: 400 });

        }

        console.log("Validated.data Profile:", validatedProfile.data);
        console.log("Validated Profile:", validatedProfile);

        //supabase signup
        const { data: authData, error: authError } = await supabase.auth.signUp({ //it has issue of of 4 request an hour.
            email: email,
            password: password,

        })
        console.log("Auth Data:", authData);
        console.log("Auth Error:", authError);

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            return NextResponse.json(
                { message: authError.message }, // Will return "User already registered" if email exists
                { status: 400 }
            );
        }

        const userId = authData?.user?.id;
        if (!userId) {
            return NextResponse.json(
                { message: "Failed to retrieve user ID from authentication provider" },
                { status: 500 }
            );
        }

        // ── Create UserProfile in Prisma using Supabase User ID ────────────
        // We directly create UserProfile with the `userId` returned from Supabase.
        const result = await prisma.userProfile.create({
            data: {
                userId: userId,
                name: profileData.name || name,
                age: profileData.age,
                gender: profileData.gender,
                state: profileData.state,
                district: profileData.district,
                caste: profileData.caste,
                annualIncome: profileData.annualIncome,
                disability: profileData.disability ?? false,
                disabilityType: profileData.disabilityType || null,
                rationCard: profileData.rationCard || "None",
                religion: profileData.religion || null,
                occupation: profileData.occupation,

                // Student / Teacher / Researcher
                educationLevel: profileData.educationLevel || null,
                institutionType: profileData.institutionType || null,
                courseName: profileData.courseName || null,
                yearOfStudy: profileData.yearOfStudy || null,
                marksPercentage: profileData.marksPercentage || null,
                experienceYears: profileData.experienceYears || null,

                // Farmer / Dairy
                landSizeAcres: profileData.landSizeAcres || null,
                landOwnership: profileData.landOwnership ?? null,
                cropType: profileData.cropType || null,
                irrigationAccess: profileData.irrigationAccess ?? null,
                animalCount: profileData.animalCount || null,
                animalType: profileData.animalType || null,

                // Business / MSME
                businessType: profileData.businessType || null,
                gstRegistered: profileData.gstRegistered ?? null,
                msmeRegistered: profileData.msmeRegistered ?? null,
                udyamNumber: profileData.udyamNumber || null,
                employeeCount: profileData.employeeCount || null,
                annualTurnover: profileData.annualTurnover || null,
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: result.id, name: result.name } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}




