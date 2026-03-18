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
