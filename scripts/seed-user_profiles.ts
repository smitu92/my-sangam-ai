import prisma from "../lib/prisma";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";



const testUsers = [
  {
    name: "Arjun (Student)",
    userId: "a568c5fc-7a5c-4349-87fc-a82e74be771d", // <-- 🔴 Paste UUID from Supabase here
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
    userId: "73ab9afc-164e-49a6-99bd-b0087eca8acf", // <-- 🔴 Paste UUID from Supabase here
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
    userId: "6bfa3176-cc47-466d-88cc-f4f715e03c1b", // <-- 🔴 Paste UUID from Supabase here
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
    userId: "9ddeb00f-4739-463b-bdb2-52e2a7f87771", // <-- 🔴 Paste UUID from Supabase here
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
  console.log("🌱 Starting Prisma Profile Seed...");

  for (const user of testUsers) {
    if (user.userId === "PASTE_UUID_HERE" || !user.userId) {
      console.log(`⚠️ Skipping ${user.name} - UUID is missing!`);
      continue;
    }

    try {
      await prisma.userProfile.create({
        data: {
          userId: user.userId,
          name: user.name,
          ...user.profile,
        },
      });
      console.log(`✅ Success: Profile created for ${user.name}`);
    } catch (error) {
      console.error(`❌ Error creating Profile for ${user.name}:`, error);
    }
  }

  console.log("🎉 Profile seed finished!");
}

seed();
