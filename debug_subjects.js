const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking SyllabusSubjects...");
    const syllabusSubjects = await prisma.syllabusSubject.findMany();
    console.log(`Found ${syllabusSubjects.length} syllabus subjects:`, syllabusSubjects.map(s => s.subjectName));

    console.log("\nChecking Faculty Subjects...");
    const faculty = await prisma.faculty.findMany({
        select: { name: true, subjects: true }
    });

    // Parse faculty subjects (handling JSON string or array)
    const facultySubjects = faculty.flatMap(f => {
        if (!f.subjects) return [];
        try {
            const parsed = JSON.parse(f.subjects);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return f.subjects.split(',').map(s => s.trim());
        }
    });

    console.log(`Found ${faculty.length} faculty members.`);
    console.log(`Extracted faculty subjects:`, [...new Set(facultySubjects)]);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
