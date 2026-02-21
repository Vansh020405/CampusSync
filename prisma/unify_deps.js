const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function unifyDepartments() {
    const targets = ['AIML', 'CSEAIML', 'CSE-AIML', 'AI ML'];
    const canonical = 'CSE AI ML';

    console.log(`Unifying ${targets.join(', ')} to ${canonical}...`);

    for (const target of targets) {
        console.log(`\nProcessing target: '${target}'`);

        // 1. Students - simple update
        const s = await prisma.student.updateMany({
            where: { department: { equals: target, mode: 'insensitive' } },
            data: { department: canonical }
        });
        if (s.count > 0) console.log(`  Students: Updated ${s.count}`);

        // 2. Timetable - simple update (assuming no unique constraints hit)
        const t = await prisma.timetable.updateMany({
            where: { department: { equals: target, mode: 'insensitive' } },
            data: { department: canonical }
        });
        if (t.count > 0) console.log(`  Timetables: Updated ${t.count}`);

        // 3. Faculty - simple update
        const f = await prisma.faculty.updateMany({
            where: { department: { equals: target, mode: 'insensitive' } },
            data: { department: canonical }
        });
        if (f.count > 0) console.log(`  Faculty: Updated ${f.count}`);

        // 4. SectionMentor - Robust update to avoid P2002
        console.log(`  Checking SectionMentor conflicts for '${target}'...`);
        const targetMentors = await prisma.sectionMentor.findMany({
            where: { department: { equals: target, mode: 'insensitive' } }
        });

        for (const tm of targetMentors) {
            // Check if canonical already exists
            const conflict = await prisma.sectionMentor.findUnique({
                where: {
                    department_semester_section_batch: {
                        department: canonical,
                        semester: tm.semester,
                        section: tm.section,
                        batch: tm.batch
                    }
                }
            });

            if (conflict) {
                console.log(`    Conflict for Section ${tm.section} Sem ${tm.semester} (${tm.batch}). Deleting duplicate '${target}' entry.`);
                await prisma.sectionMentor.delete({ where: { id: tm.id } });
            } else {
                console.log(`    Renaming Section ${tm.section} Sem ${tm.semester} (${tm.batch}) to '${canonical}'.`);
                await prisma.sectionMentor.update({
                    where: { id: tm.id },
                    data: { department: canonical }
                });
            }
        }
    }

    console.log("\nUnification complete.");
}

unifyDepartments()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
