import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const section = searchParams.get('section');
        const semester = searchParams.get('semester');
        const department = searchParams.get('department');
        const batch = searchParams.get('batch');

        if (!section || !semester || !department) {
            return NextResponse.json({ error: "Insufficient parameters" }, { status: 400 });
        }

        // Verify if the faculty is indeed the mentor for this section
        const mentorAssignment = await prisma.sectionMentor.findFirst({
            where: {
                facultyId: (session.user as any).id,
                section,
                semester,
                department,
                batch: batch || 'Morning'
            }
        });

        if (!mentorAssignment) {
            return NextResponse.json({ error: "You are not the assigned mentor for this section" }, { status: 403 });
        }

        // Fetch students in this section
        const students = await prisma.student.findMany({
            where: { section, semester, department, batch: batch || 'Morning' },
            select: {
                id: true,
                name: true,
                rollNo: true,
                grades: {
                    select: {
                        subjectName: true,
                        st1Marks: true,
                        st1Total: true,
                        st2Marks: true,
                        st2Total: true,
                        endTermMarks: true,
                        endTermTotal: true,
                        grade: true,
                        totalMarks: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Mentor fetch grades error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
