ALTER TABLE "users" RENAME COLUMN "image" TO "mobile";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dob" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "category" text DEFAULT 'General';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "income" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "father_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "father_profession" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mother_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mother_profession" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "aadhar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "documents" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "applied_schemes" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "saved_schemes" jsonb DEFAULT '[]'::jsonb;