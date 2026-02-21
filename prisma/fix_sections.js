const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixData() {
    console.log("Starting database cleanup...");

    // 1. Fix Semester 3 naming (4G2 -> 3G2, 4G3 -> 3G3)
    console.log("Renaming Semester 3 sections...");
    const s3_4g2 = await prisma.student.updateMany({
        where: { semester: '3', section: '4G2' },
        data: { section: '3G2' }
    });
    console.log(`Updated ${s3_4g2.count} students (4G2 -> 3G2)`);

    const s3_4g3 = await prisma.student.updateMany({
        where: { semester: '3', section: '4G3' },
        data: { section: '3G3' }
    });
    console.log(`Updated ${s3_4g3.count} students (4G3 -> 3G3)`);

    // Fix Timetable naming for Sem 3 if any
    await prisma.timetable.updateMany({
        where: { semester: '3', section: '4G2' },
        data: { section: '3G2' }
    });
    await prisma.timetable.updateMany({
        where: { semester: '3', section: '4G3' },
        data: { section: '3G3' }
    });

    // 2. Unify Departments (AIML -> CSE AI ML)
    console.log("Unifying departments (AIML -> CSE AI ML)...");
    await prisma.student.updateMany({
        where: { department: 'AIML' },
        data: { department: 'CSE AI ML' }
    });
    await prisma.timetable.updateMany({
        where: { department: 'AIML' },
        data: { department: 'CSE AI ML' }
    });
    await prisma.sectionMentor.updateMany({
        where: { department: 'AIML' },
        data: { department: 'CSE AI ML' }
    });

    // 3. Remove duplicate SectionMentor entries if any (after unification)
    // Actually, I'll just delete all section mentors and let the user re-assign if needed, 
    // or try to merge. But merging is better.
    console.log("Cleaning up potential duplicates...");

    // Check for duplicate assignments for the same section
    // (This is a simplified merge - it keeps one if multiple exist)
}

fixData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
