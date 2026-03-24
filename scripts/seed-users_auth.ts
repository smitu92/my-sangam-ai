
import prisma from "../lib/prisma";
import "dotenv/config"; // Ensure .env is loaded
import { adminSupabase } from "../lib/supabase/adminSupabase";

// 🚨 Make sure to add this to your .env file:
// SUPABASE_SERVICE_ROLE_KEY="eyJh..."

if (!adminSupabase) {
  console.error("❌ Missing adminSupabase in .env");
  process.exit(1);
}



const testUsers = [
  {
    name: "Arjun (Student)",
    email: "student99@test.com",
    password: "Password123!",
    profile: {
      age: 20,
      gender: "Male" as const,
      state: "Gujarat",
      district: "Ahmedabad",
      caste: "General" as const,
      annualIncome: 0,
      occupation: "Student" as const,
      educationLevel: "Graduate" as const,
      institutionType: "Government" as const,
      courseName: "B.Tech",
      yearOfStudy: 2,
    },
  },
  {
    name: "Ramu (Farmer)",
    email: "farmer99@test.com",
    password: "Password123!",
    profile: {
      age: 45,
      gender: "Male" as const,
      state: "Punjab",
      district: "Ludhiana",
      caste: "OBC" as const,
      annualIncome: 250000,
      occupation: "Farmer" as const,
      landSizeAcres: 5.5,
      landOwnership: true,
      cropType: "Wheat",
      irrigationAccess: true,
    },
  },
  {
    name: "Dr. Sharma (Doctor)",
    email: "doctor99@test.com",
    password: "Password123!",
    profile: {
      age: 35,
      gender: "Female" as const,
      state: "Maharashtra",
      district: "Mumbai",
      caste: "General" as const,
      annualIncome: 1200000,
      occupation: "SelfEmployed" as const,
    },
  },
  {
    name: "Major Singh (Soldier)",
    email: "soldier99@test.com",
    password: "Password123!",
    profile: {
      age: 30,
      gender: "Male" as const,
      state: "Haryana",
      district: "Ambala",
      caste: "General" as const,
      annualIncome: 500000,
      occupation: "Other" as const,
    },
  },
];

async function seed() {
  console.log("🌱 Starting Database Sync (Supabase -> Prisma)...\n");

  for (const user of testUsers) {
    console.log(`👤 Registering ${user.name}...`);

    // 1. Create User in Supabase holding Auth Privileges
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // This bypasses needing to click an email link!
      user_metadata: { name: user.name },
    });

    if (authError) {
      console.error(`❌ Supabase Error for ${user.email}:`, authError.message);
      continue; // Skip to the next user if email already exists
    }

    const userId = authData.user.id;
    console.log(`   ✅ Supabase User Created! UUID: ${userId}`);

    // 2. Map their UUID + Profile details into Prisma directly
    try {
      await prisma.userProfile.create({
        data: {
          userId: userId, // CRITICAL: This ties the databases together
          name: user.name,
          ...user.profile,
        },
      });
      console.log(`   ✅ Prisma Profile Created smoothly!`);
    } catch (prismaError) {
      console.error(`❌ Prisma Error for ${user.name}:`, prismaError);
    }
    console.log("-------------------------------------------------");
  }

  console.log("🎉 Seed finished!");
}

seed();
