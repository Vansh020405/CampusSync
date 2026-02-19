const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const [
            subjectsData,
            roomsFromTimetable,
            roomsFromExams,
            studentsData,
            timetableSections,
            faculties
        ] = await Promise.all([
            prisma.syllabusSubject.findMany({
                select: { subjectName: true },
                orderBy: { subjectName: 'asc' }
            }),
            prisma.timetable.groupBy({
                by: ['classroom'],
                orderBy: { classroom: 'asc' }
            }),
            prisma.exam.groupBy({
                by: ['room'],
                orderBy: { room: 'asc' }
            }),
            prisma.student.groupBy({
                by: ['section'],
                orderBy: { section: 'asc' }
            }),
            prisma.timetable.groupBy({
                by: ['section'],
                orderBy: { section: 'asc' }
            }),
            prisma.faculty.findMany({
                select: { subjects: true, sectionsTeaching: true }
            })
        ]);

        const parseSafe = (input) => {
            if (!input) return [];
            try {
                const parsed = JSON.parse(input);
                return Array.isArray(parsed) ? parsed : [String(parsed)];
            } catch (e) {
                return input.split(',').map(s => s.trim()).filter(Boolean);
            }
        };

        const facultySubjects = faculties.flatMap(f => parseSafe(f.subjects));
        const facultySections = faculties.flatMap(f => parseSafe(f.sectionsTeaching));

        const subjects = Array.from(new Set([
            ...subjectsData.map(s => s.subjectName),
            ...facultySubjects
        ])).filter(Boolean).sort();

        const defaultRooms = ["LH-101", "LH-102", "LH-103", "LAB-1", "LAB-2", "LAB-3", "AUD-1"];
        const rooms = Array.from(new Set([
            ...roomsFromTimetable.map(r => r.classroom),
            ...roomsFromExams.map(e => e.room),
            ...defaultRooms
        ])).filter(Boolean).sort();

        const sections = Array.from(new Set([
            ...studentsData.map(s => s.section),
            ...timetableSections.map(t => t.section),
            ...facultySections
        ])).filter(Boolean).sort();

        console.log(JSON.stringify({ subjects, rooms, sections }, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
