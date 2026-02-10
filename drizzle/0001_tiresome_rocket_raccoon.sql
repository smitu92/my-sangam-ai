ALTER TABLE "schemes" ALTER COLUMN "benefits" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schemes" ALTER COLUMN "eligibility" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "ministry" text NOT NULL;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "state" text DEFAULT 'Central' NOT NULL;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "documents_required" text[];--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "gender" text DEFAULT 'All';--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "age_min" integer;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "age_max" integer;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "income_limit" real;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "caste" text[];--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "residence" text DEFAULT 'Both';--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "application_url" text;--> statement-breakpoint
ALTER TABLE "schemes" ADD COLUMN "tags" text[];