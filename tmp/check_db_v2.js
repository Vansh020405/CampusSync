
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const subjects = await prisma.syllabusSubject.findMany({
    select: { subjectName: true }
  })
  console.log('Syllabus Subject Names:', subjects.map(s => s.subjectName))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
