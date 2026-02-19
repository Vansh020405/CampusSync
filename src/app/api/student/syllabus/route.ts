
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
        const student = await (prisma.student as any).findUnique({
            where: { id: (session.user as any).id }
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const section = (student.section || "").trim();

        const assignments = await (prisma.subjectAssignment as any).findMany({
            where: {
                department: student.department,
                semester: student.semester.toString(),
                OR: [
                    { batch: student.batch },
                    { batch: 'Both' }
                ]
            },
            include: {
                subject: {
                    include: {
                        topics: {
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        }) || [];

        const syllabusProgress = [];

        for (const assignment of assignments) {
            const syllabus = assignment.subject;
            if (!syllabus) continue;

            // Fetch progress strictly for this section
            const progress = await (prisma.topicProgress as any).findMany({
                where: {
                    section: section,
                    topicId: { in: syllabus.topics.map((t: any) => t.id) }
                },
                include: { faculty: true }
            }) || [];

            const completed = syllabus.topics.filter((t: any) =>
                progress.some((p: any) => p.topicId === t.id && p.status === 'COMPLETED')
            );

            // Group topics by examType
            const examMapping: Record<string, any[]> = {};
            syllabus.topics.forEach((t: any) => {
                const type = t.examType || 'End Term';
                if (!examMapping[type]) examMapping[type] = [];

                const p = progress.find((pg: any) => pg.topicId === t.id);
                examMapping[type].push({
                    id: t.id,
                    title: t.title,
                    status: p ? p.status : 'NOT_STARTED',
                    completedDate: p ? p.completedDate : null,
                    notes: p ? p.notes : null,
                    examType: type
                });
            });

            syllabusProgress.push({
                subjectName: syllabus.subjectName,
                subjectCode: syllabus.subjectCode,
                totalTopics: syllabus.topics.length,
                completedTopics: completed.length,
                percentage: Math.round((completed.length / syllabus.topics.length) * 100) || 0,
                examMapping,
                topics: syllabus.topics.map((t: any) => {
                    const p = progress.find((pg: any) => pg.topicId === t.id);
                    return {
                        id: t.id,
                        title: t.title,
                        status: p ? p.status : 'NOT_STARTED',
                        completedDate: p ? p.completedDate : null,
                        notes: p ? p.notes : null,
                        examType: t.examType
                    };
                })
            });
        }

        return NextResponse.json(syllabusProgress);
    } catch (error) {
        console.error("Student syllabus error:", error);
        return NextResponse.json([]);
    }
}
