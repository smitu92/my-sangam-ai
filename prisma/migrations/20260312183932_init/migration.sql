-- CreateTable
CREATE TABLE "Schemes" (
    "id" SERIAL NOT NULL,
    "details" TEXT NOT NULL,
    "released_date" TIMESTAMP(3) NOT NULL,
    "level" TEXT NOT NULL,
    "eligibilty" TEXT NOT NULL,
    "age" INTEGER NOT NULL,

    CONSTRAINT "Schemes_pkey" PRIMARY KEY ("id")
);
