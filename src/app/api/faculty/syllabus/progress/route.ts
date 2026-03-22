
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'FACULTY') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId, section, status, notes, completedLectures } = await req.json();

    if (!topicId || !section || !status) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        const updateData: any = {
            status,
            completedLectures,
            notes
        };

        if (status === 'COMPLETED') {
            updateData.completedDate = new Date();
        }

        const progress = await prisma.topicProgress.upsert({
            where: {
                topicId_facultyId_section: {
                    topicId,
                    facultyId: (session.user as any).id,
                    section
                }
            },
            update: updateData,
            create: {
                topicId,
                facultyId: (session.user as any).id,
                section,
                ...updateData
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Update syllabus error:", error);
        return NextResponse.json({ error: "Failed to update syllabus" }, { status: 500 });
    }
}
