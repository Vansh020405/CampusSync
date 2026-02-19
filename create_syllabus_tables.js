
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Ensuring syllabus tables exist...");

        // SyllabusSubject
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SyllabusSubject" (
                "id" TEXT NOT NULL,
                "subjectName" TEXT NOT NULL,
                "subjectCode" TEXT,
                "department" TEXT NOT NULL,
                CONSTRAINT "SyllabusSubject_pkey" PRIMARY KEY ("id")
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SyllabusSubject_subjectName_key" ON "SyllabusSubject"("subjectName");`);

        // SyllabusTopic
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SyllabusTopic" (
                "id" TEXT NOT NULL,
                "subjectId" TEXT NOT NULL,
                "title" TEXT NOT NULL,
                "totalLectures" INTEGER NOT NULL DEFAULT 1,
                "order" INTEGER NOT NULL DEFAULT 0,
                "examType" TEXT,
                CONSTRAINT "SyllabusTopic_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "SyllabusTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "SyllabusSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        // SubjectAssignment
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SubjectAssignment" (
                "id" TEXT NOT NULL,
                "subjectId" TEXT NOT NULL,
                "department" TEXT NOT NULL,
                "semester" TEXT NOT NULL,
                "batch" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "SubjectAssignment_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "SubjectAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "SyllabusSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SubjectAssignment_subjectId_department_semester_batch_key" ON "SubjectAssignment"("subjectId", "department", "semester", "batch");`);

        // TopicProgress
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "TopicProgress" (
                "id" TEXT NOT NULL,
                "topicId" TEXT NOT NULL,
                "facultyId" TEXT NOT NULL,
                "section" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
                "completedLectures" INTEGER NOT NULL DEFAULT 0,
                "completedDate" TIMESTAMP(3),
                "notes" TEXT,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "TopicProgress_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "TopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "SyllabusTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TopicProgress_topicId_facultyId_section_key" ON "TopicProgress"("topicId", "facultyId", "section");`);

        console.log("All syllabus tables verified/created.");
    } catch (e) {
        console.error("Error creating tables:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
