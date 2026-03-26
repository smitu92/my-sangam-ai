import prisma from './lib/prisma';

async function main() {
  const categories = await prisma.scheme.findMany({
    select: { schemeCategory: true },
    distinct: ['schemeCategory']
  })
  console.log("Categories in DB:")
  categories.forEach(c => console.log(`- "${c.schemeCategory}"`))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
