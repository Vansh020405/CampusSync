import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const timetable = await prisma.timetable.findMany()
    console.log("Timetable Entries:", timetable)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
