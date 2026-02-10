import { pgTable, text, timestamp, boolean, uuid, date, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(), // Add password hash
  name: text("name"),
  role: text("role").default("user"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  
  // Profile Information
  mobile: text("mobile"),
  dob: date("dob"),
  gender: text("gender"), // Male, Female, Other
  category: text("category").default("General"), // General, OBC, SC, ST
  occupation: text("occupation"),
  income: text("income"), // Annual Income as string to handle formatted inputs
  location: text("location"),
  
  // Family Details
  fatherName: text("father_name"),
  fatherProfession: text("father_profession"),
  motherName: text("mother_name"),
  motherProfession: text("mother_profession"),

  // Documents & IDs
  aadhar: text("aadhar"),
  pan: text("pan"),
  documents: jsonb("documents").default([]), // specific uploaded docs paths/metadata

  // Scheme Interactions
  appliedSchemes: jsonb("applied_schemes").default([]), // array of scheme IDs or objects
  savedSchemes: jsonb("saved_schemes").default([]), // array of scheme IDs or objects

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
