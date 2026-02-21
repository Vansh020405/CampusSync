import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ section: string }> }
) {
    try {
        const { section } = await params;
        const { searchParams } = new URL(req.url);
        const subject = searchParams.get('subject');

        if (!section) {
            return NextResponse.json({ error: "Section is required" }, { status: 400 });
        }

        const students = await (prisma as any).student.findMany({
            where: { section: section },
            select: {
                id: true,
                name: true,
                rollNo: true,
            },
            orderBy: { name: 'asc' }
        });

        // Fetch attendance records for these students
        const studentIds = students.map((s: any) => s.id);

        let attendanceFilter: any = { studentId: { in: studentIds } };
        if (subject) {
            attendanceFilter.subject = subject;
        }

        const attendanceRecords = await (prisma as any).studentAttendance.findMany({
            where: attendanceFilter
        });

        // Calculate attendance percentage for each student
        const studentsWithStats = students.map((student: any) => {
            const studentRecords = attendanceRecords.filter((r: any) => r.studentId === student.id);
            const totalClasses = studentRecords.length;
            const presentClasses = studentRecords.filter((r: any) => r.status === 'PRESENT').length;

            return {
                ...student,
                attendance: totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0
            };
        });

        return NextResponse.json(studentsWithStats);
    } catch (error) {
        console.error("Fetch students error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
