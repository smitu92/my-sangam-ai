import { z } from "zod";

// ── Enums ─────────────────────────────────────────────────────
export const GenderEnum = z.enum(["Male", "Female", "Other"]);
export const CasteEnum = z.enum(["General", "OBC", "SC", "ST", "EWS"]);
export const RationCardEnum = z.enum(["APL", "BPL", "AAY", "None"]);
export const OccupationEnum = z.enum([
  "Student", "Farmer", "Teacher", "Researcher",
  "Business", "SmallBusiness", "DairyFarm",
  "JobSeeker", "SelfEmployed", "Other",
]);
export const EducationLevelEnum = z.enum([
  "Below10th", "Class10th", "Class12th", "ITI",
  "Diploma", "Graduate", "Postgraduate", "PhD", "Other",
]);
export const InstitutionTypeEnum = z.enum([
  "Government", "Private", "CentralUniversity", "StateUniversity", "Other",
]);

// ── Base Schema (universal fields, everyone fills these) ──────
const BaseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.number().int().min(1).max(120),
  gender: GenderEnum,
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  caste: CasteEnum,
  annualIncome: z.number().int().min(0),
  disability: z.boolean().default(false),
  disabilityType: z.string().nullable().optional(),
  rationCard: RationCardEnum.default("None"),
  religion: z.string().optional(),
  occupation: OccupationEnum,
});

// ── Occupation-specific Schemas ───────────────────────────────
const StudentFields = z.object({
  educationLevel: EducationLevelEnum,
  institutionType: InstitutionTypeEnum,
  courseName: z.string().min(1, "Course name is required"),
  yearOfStudy: z.number().int().min(1).max(7),
  marksPercentage: z.number().min(0).max(100).optional(),
});

const TeacherResearcherFields = z.object({
  educationLevel: EducationLevelEnum,
  institutionType: InstitutionTypeEnum,
  courseName: z.string().optional(),  // subject/department
  experienceYears: z.number().int().min(0),
});

const FarmerFields = z.object({
  landSizeAcres: z.number().min(0),
  landOwnership: z.boolean(),
  cropType: z.string().min(1, "Crop type is required"),
  irrigationAccess: z.boolean(),
});

const DairyFields = z.object({
  landSizeAcres: z.number().min(0).optional(),
  landOwnership: z.boolean().optional(),
  animalCount: z.number().int().min(1),
  animalType: z.string().min(1, "Animal type is required"),
});

const BusinessFields = z.object({
  businessType: z.string().min(1, "Business type is required"),
  gstRegistered: z.boolean(),
  employeeCount: z.number().int().min(0).optional(),
  annualTurnover: z.number().int().min(0).optional(),
});

const SmallBusinessFields = BusinessFields.extend({
  msmeRegistered: z.boolean(),
  udyamNumber: z.string().optional(),
});

const JobSeekerFields = z.object({
  educationLevel: EducationLevelEnum,
  experienceYears: z.number().int().min(0).default(0),
});

// ── Discriminated Union — main schema ─────────────────────────
export const UserProfileSchema = z.discriminatedUnion("occupation", [
  BaseSchema.extend({ occupation: z.literal("Student"), ...StudentFields.shape }),
  BaseSchema.extend({ occupation: z.literal("Teacher"), ...TeacherResearcherFields.shape }),
  BaseSchema.extend({ occupation: z.literal("Researcher"), ...TeacherResearcherFields.shape }),
  BaseSchema.extend({ occupation: z.literal("Farmer"), ...FarmerFields.shape }),
  BaseSchema.extend({ occupation: z.literal("DairyFarm"), ...DairyFields.shape }),
  BaseSchema.extend({ occupation: z.literal("Business"), ...BusinessFields.shape }),
  BaseSchema.extend({ occupation: z.literal("SmallBusiness"), ...SmallBusinessFields.shape }),
  BaseSchema.extend({ occupation: z.literal("JobSeeker"), ...JobSeekerFields.shape }),
  BaseSchema.extend({ occupation: z.literal("SelfEmployed") }),
  BaseSchema.extend({ occupation: z.literal("Other") }),
]);

export type UserProfileZ = z.infer<typeof UserProfileSchema>;

// ── Helper: convert profile to plain string for LLM ──────────
export function profileToString(profile: UserProfileZ): string {
  const base = `Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}, 
State: ${profile.state}, District: ${profile.district}, 
Caste: ${profile.caste}, Annual Income: ₹${profile.annualIncome}, 
Disability: ${profile.disability ? profile.disabilityType || "Yes" : "No"}, 
Ration Card: ${profile.rationCard}, Occupation: ${profile.occupation}`;

  const extras: string[] = [];

  if ("educationLevel" in profile && profile.educationLevel)
    extras.push(`Education: ${profile.educationLevel}`);
  if ("courseName" in profile && profile.courseName)
    extras.push(`Course: ${profile.courseName}`);
  if ("institutionType" in profile && profile.institutionType)
    extras.push(`Institution: ${profile.institutionType}`);
  if ("yearOfStudy" in profile && profile.yearOfStudy)
    extras.push(`Year of Study: ${profile.yearOfStudy}`);
  if ("marksPercentage" in profile && profile.marksPercentage)
    extras.push(`Marks: ${profile.marksPercentage}%`);
  if ("landSizeAcres" in profile && profile.landSizeAcres !== undefined)
    extras.push(`Land: ${profile.landSizeAcres} acres`);
  if ("cropType" in profile && profile.cropType)
    extras.push(`Crops: ${profile.cropType}`);
  if ("animalType" in profile && profile.animalType)
    extras.push(`Animals: ${profile.animalCount} ${profile.animalType}`);
  if ("businessType" in profile && profile.businessType)
    extras.push(`Business: ${profile.businessType}`);
  if ("msmeRegistered" in profile)
    extras.push(`MSME: ${profile.msmeRegistered ? "Yes" : "No"}`);
  if ("experienceYears" in profile && profile.experienceYears !== undefined)
    extras.push(`Experience: ${profile.experienceYears} years`);

  return extras.length > 0 ? `${base}, ${extras.join(", ")}` : base;
}