-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "CasteCategory" AS ENUM ('General', 'OBC', 'SC', 'ST', 'EWS');

-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('Student', 'Farmer', 'Teacher', 'Researcher', 'Business', 'SmallBusiness', 'DairyFarm', 'JobSeeker', 'SelfEmployed', 'Other');

-- CreateEnum
CREATE TYPE "RationCard" AS ENUM ('APL', 'BPL', 'AAY', 'None');

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('Government', 'Private', 'CentralUniversity', 'StateUniversity', 'Other');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('Below10th', 'Class10th', 'Class12th', 'ITI', 'Diploma', 'Graduate', 'Postgraduate', 'PhD', 'Other');

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "caste" "CasteCategory" NOT NULL,
    "annualIncome" INTEGER NOT NULL,
    "disability" BOOLEAN NOT NULL DEFAULT false,
    "disabilityType" TEXT,
    "rationCard" "RationCard" NOT NULL DEFAULT 'None',
    "religion" TEXT,
    "occupation" "Occupation" NOT NULL,
    "educationLevel" "EducationLevel",
    "institutionType" "InstitutionType",
    "courseName" TEXT,
    "yearOfStudy" INTEGER,
    "marksPercentage" DOUBLE PRECISION,
    "experienceYears" INTEGER,
    "landSizeAcres" DOUBLE PRECISION,
    "landOwnership" BOOLEAN,
    "cropType" TEXT,
    "irrigationAccess" BOOLEAN,
    "animalCount" INTEGER,
    "animalType" TEXT,
    "businessType" TEXT,
    "gstRegistered" BOOLEAN,
    "msmeRegistered" BOOLEAN,
    "udyamNumber" TEXT,
    "employeeCount" INTEGER,
    "annualTurnover" INTEGER,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
