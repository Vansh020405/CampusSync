
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fixing data for Student and Faculty portals...");

        // 1. Find PROBABILITY subject
        const probability = await prisma.syllabusSubject.findUnique({
            where: { subjectName: "PROBABILITY" }
        });

        if (!probability) {
            console.error("Subject PROBABILITY not found in registry.");
            return;
        }

        // 2. Allot to "Computer Science" (where 6 students are)
        console.log("Allotting PROBABILITY to Computer Science...");
        await prisma.subjectAssignment.upsert({
            where: {
                subjectId_department_semester_batch: {
                    subjectId: probability.id,
                    department: "Computer Science",
                    semester: "4",
                    batch: "Morning"
                }
            },
            update: {},
            create: {
                subjectId: probability.id,
                department: "Computer Science",
                semester: "4",
                batch: "Morning"
            }
        });

        // 3. Allot to "CSE AI ML" (where 5 students are)
        console.log("Allotting PROBABILITY to CSE AI ML...");
        await prisma.subjectAssignment.upsert({
            where: {
                subjectId_department_semester_batch: {
                    subjectId: probability.id,
                    department: "CSE AI ML",
                    semester: "4",
                    batch: "Morning"
                }
            },
            update: {},
            create: {
                subjectId: probability.id,
                department: "CSE AI ML",
                semester: "4",
                batch: "Morning"
            }
        });

        // 4. Create/Update Faculty for Probability
        console.log("Updating faculty 'Abha Sukheja' to teach PROBABILITY...");
        await prisma.faculty.update({
            where: { facultyId: "FAC-ABHA-02" },
            data: {
                subjects: JSON.stringify(["PROBABILITY"]),
                sectionsTeaching: JSON.stringify(["4G2"])
            }
        });

        console.log("Data synchronization complete.");
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
