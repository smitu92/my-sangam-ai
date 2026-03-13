// import dotenv from "dotenv"

// dotenv.config()

// import { PrismaClient } from "../lib/generated/prisma/client"
// import { PrismaPg } from "@prisma/adapter-pg"

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
// const prisma = new PrismaClient({ adapter })

// export { prisma };



//next.js seed syntax

// import dotenv from "dotenv"
// dotenv.config()

// import { PrismaClient } from "../lib/generated/prisma/client"
// import { PrismaPg } from "@prisma/adapter-pg"

// const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// const globalForPrisma = global as unknown as {
//     prisma: PrismaClient
// }
// const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })


// export default prisma


// prisma/seed.ts — clean version
import dotenv from "dotenv"
// dotenv.config({ path: "../.env" })  // path relative to prisma/ folder
dotenv.config()

import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})


const prisma = new PrismaClient({ adapter })

export default prisma
