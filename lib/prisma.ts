import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
    // ⚠️ We use a small, fast pool for Serverless (Vercel) to avoid exhausting DB connections.
    const connectionString = `${process.env.DATABASE_URL}${process.env.DATABASE_URL?.includes('?') ? '&' : '?'}pgbouncer=true`;
    
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
