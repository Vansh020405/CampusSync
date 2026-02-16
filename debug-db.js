import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const faculty = await prisma.faculty.findMany({
        select: { id: true, name: true, facultyId: true }
    })
    console.log("Faculty in DB:", faculty)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
