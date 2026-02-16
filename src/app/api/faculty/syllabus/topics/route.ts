
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'FACULTY') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const section = searchParams.get('section');

    if (!subject || !section) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        // Find the SyllabusSubject
        const syllabus = await prisma.syllabusSubject.findUnique({
            where: { subjectName: subject },
            include: { topics: { orderBy: { order: 'asc' } } }
        });

        if (!syllabus) {
            return NextResponse.json({ topics: [] }); // No syllabus defined
        }

        // Fetch Progress for these topics
        const progress = await prisma.topicProgress.findMany({
            where: {
                facultyId: (session.user as any).id,
                section: section,
                topicId: { in: syllabus.topics.map((t: any) => t.id) }
            }
        });

        // Map progress to topics
        const topicsWithProgress = syllabus.topics.map((topic: any) => {
            const p = progress.find((pg: any) => pg.topicId === topic.id);
            return {
                ...topic,
                status: p ? p.status : 'NOT_STARTED',
                completedLectures: p ? p.completedLectures : 0,
                completedDate: p ? p.completedDate : null,
                notes: p ? p.notes : null
            };
        });

        return NextResponse.json({
            subjectName: syllabus.subjectName,
            topics: topicsWithProgress
        });

    } catch (error) {
        console.error("Fetch topics error:", error);
        return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
    }
}
