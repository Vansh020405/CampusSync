
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STUDENT') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const student = await prisma.student.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const section = student.section.trim();

        // Fetch subjects from Timetable for this student's section
        // We relax the filter to only section because department/semester names might have inconsistencies (e.g. "CSE" vs "Computer Science")
        const timetableEntries = await prisma.timetable.findMany({
            where: {
                section: section
            },
            select: { subject: true },
            distinct: ['subject']
        });
        const subjects = timetableEntries.map(t => t.subject.trim());

        console.log(`[SyllabusAPI] Student: ${student.name}, Section: "${section}", Subjects in Timetable: [${subjects.join(', ')}]`);

        const syllabusProgress = [];
        const seenSyllabusIds = new Set<string>();

        for (const subject of subjects) {
            // Try to find the SyllabusSubject - case insensitive-ish or just try direct first
            let syllabus = await prisma.syllabusSubject.findUnique({
                where: { subjectName: subject },
                include: { topics: { orderBy: { order: 'asc' } } }
            });

            // Fallback: If not found, try a case-insensitive search or alias
            if (!syllabus) {
                const allSyllabus = await prisma.syllabusSubject.findMany({
                    include: { topics: { orderBy: { order: 'asc' } } }
                });
                syllabus = allSyllabus.find(s =>
                    s.subjectName.toLowerCase() === subject.toLowerCase() ||
                    s.subjectName.toLowerCase().includes(subject.toLowerCase()) ||
                    subject.toLowerCase().includes(s.subjectName.toLowerCase())
                ) || null;
            }

            if (!syllabus) {
                console.log(`[SyllabusAPI] No SyllabusSubject found for name: "${subject}"`);
                continue;
            }

            if (seenSyllabusIds.has(syllabus.id)) {
                console.log(`[SyllabusAPI] Skipping duplicate syllabus matching for: "${subject}" (already added via another entry)`);
                continue;
            }
            seenSyllabusIds.add(syllabus.id);

            // Fetch progress strictly for this section
            const progress = await prisma.topicProgress.findMany({
                where: {
                    section: section,
                    topicId: { in: syllabus.topics.map((t: any) => t.id) }
                },
                orderBy: { updatedAt: 'desc' },
                include: { faculty: true }
            });

            console.log(`[SyllabusAPI] Subject "${subject}" matched with "${syllabus.subjectName}": ${syllabus.topics.length} topics, ${progress.length} progress records found.`);

            const targetProgress = progress;

            const completed = syllabus.topics.filter((t: any) => targetProgress.some((p: any) => p.topicId === t.id && p.status === 'COMPLETED'));
            const lastUpdate = targetProgress[0] as any;

            syllabusProgress.push({
                subjectName: syllabus.subjectName,
                totalTopics: syllabus.topics.length,
                completedTopics: completed.length,
                percentage: Math.round((completed.length / syllabus.topics.length) * 100),
                lastLecture: lastUpdate ? `Topic: ${syllabus.topics.find((t: any) => t.id === lastUpdate.topicId)?.title}` : "Not Started",
                lastFaculty: lastUpdate ? lastUpdate.faculty.name : "N/A",
                topics: syllabus.topics.map((t: any) => {
                    const p = targetProgress.find((pg: any) => pg.topicId === t.id);
                    return {
                        id: t.id,
                        title: t.title,
                        status: p ? p.status : 'NOT_STARTED',
                        completedDate: p ? p.completedDate : null,
                        completedLectures: p ? p.completedLectures : 0,
                        notes: p ? p.notes : null,
                    };
                })
            });
        }

        return NextResponse.json(syllabusProgress);
    } catch (error) {
        console.error("Student syllabus error:", error);
        return NextResponse.json({ error: "Failed to fetch student syllabus" }, { status: 500 });
    }
}
