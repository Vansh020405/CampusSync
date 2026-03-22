import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const facultyId = (session.user as any).id;

        const mentoredSections = await prisma.sectionMentor.findMany({
            where: { facultyId }
        });

        if (mentoredSections.length === 0) {
            return NextResponse.json([]);
        }

        // OR query for all sections mentored by this faculty
        const students = await prisma.student.findMany({
            where: {
                OR: mentoredSections.map(sec => ({
                    section: sec.section,
                    semester: sec.semester,
                    department: sec.department,
                    batch: sec.batch
                }))
            },
            select: {
                id: true,
                name: true,
                rollNo: true,
                section: true,
                semester: true,
                batch: true,
                department: true,
                email: true
            },
            orderBy: [
                { section: 'asc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Fetch mentored students error:", error);
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}
