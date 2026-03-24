// prisma/test2.ts
import prisma from "./seed"

// ✅ wrap in async main function
async function main() {
    const scheme = await prisma.scheme.create({   // ← singular 'scheme' not 'schemes'
        data: {
            details: "sdfd",
            released_date: new Date(),
            level: "sdfd",
            eligibilty: "dfds",
            age: 34
        }
    })
    console.log("Created:", scheme)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
