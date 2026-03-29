import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
    // 🏠 Use the environment URL directly to avoid auth corruption.
    const connectionString = process.env.DATABASE_URL;
    
    const pool = new Pool({ 
        connectionString,
        max: 5, // Keep this low for Vercel
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
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
