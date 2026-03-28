import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
    // We use 'any' here to bypass a minor TypeScript version clash between Prisma 7 and the pg driver.
    // The actual connection will work perfectly at runtime.
    const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    
    const adapter = new PrismaPg(pool as any);
    
    return new PrismaClient({ 
        adapter 
    });
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
