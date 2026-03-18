import prisma from "./seed"
import * as fs from "fs"
import * as path from "path"
import Papa from "papaparse"

/* npx tsx feed_csv.ts 
Transpiles TS → JS in memory
*/
/* 
# tsc — saves a real .js file, then you run it
npx tsc feed_csv.ts       # creates feed_csv.js
node feed_csv.js          # then run it
 */

async function main() {
    // Read CSV file
    console.log(__dirname)
    const csvPath = path.join(process.cwd(), "../DataClearning/data/schemes_clean.csv")
    // const csvPath2 = path.join(__dirname, "../DataClearning/data/schemes_clean.csv")
    const csvFile = fs.readFileSync(csvPath, "utf8")

    // Parse CSV
    const { data } = Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
    })

    console.log(`📦 Found ${data.length} schemes`)

    // Batch insert — 100 at a time (avoid timeout)
    const batchSize = 100
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize) as any[]

        await prisma.scheme.createMany({
            data: batch.map((row) => ({
                scheme_name: row.scheme_name || "",
                details: row.details || "",
                benefits: row.benefits || "",
                eligibility: row.eligibility || "",
                application: row.application || "",
                documents: row.documents || "",
                level: row.level || "",
                schemeCategory: row.schemeCategory || "",
                tags: row.tags || "",
                full_text: row.full_text || "",
            })),
            skipDuplicates: true,
        })

        console.log(`✅ Inserted batch ${i / batchSize + 1}`)
    }

    console.log("🎉 All schemes uploaded!")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())