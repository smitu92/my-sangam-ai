-- CreateExtensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "schemes" (
    "id" SERIAL NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "details" TEXT,
    "benefits" TEXT,
    "eligibility" TEXT,
    "application" TEXT,
    "documents" TEXT,
    "level" TEXT,
    "schemeCategory" TEXT,
    "tags" TEXT,
    "full_text" TEXT,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);
