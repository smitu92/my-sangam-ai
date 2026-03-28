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
import prisma from "../lib/prisma";

// No need for manual adapter or dotenv here as the '../lib/prisma' 
// singleton already handles it correctly for both local and prod.

export default prisma;


/* quick revision
what is prisma?
   it is an ORM (Object-Relational Mapping) library for TypeScript and JavaScript.
   it is used to interact with databases in a type-safe manner.
   but have in-buillt engine to convert code of typescript to sql queries instead of using database-drive like pg 

why here we are using PrismaPg?
    reason behind this ,latest version of prisma does not support prisma's own rust engine ,also some server like cloudnery does not support prisma's own rust engine 


to create new prisma project we use this command
    npx prisma init
    npx prisma generate

    these are typescripts commands
    npm install @types/pg
    npm install pg  
    npm install @prisma/adapter-pg
    npm install @prisma/client
    npm install tsx

usecase:
    use of tsx is to run the typescript file 

    pg-client is used to create connection between prisma and postgresql database

these command to work with postsqls database
    npx prisma db push
    npx prisma db seed


*/