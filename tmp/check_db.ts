
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const subjects = await prisma.syllabusSubject.findMany({
    include: { _count: { select: { topics: true } } }
  })
  console.log('Syllabus Subjects:', JSON.stringify(subjects, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
