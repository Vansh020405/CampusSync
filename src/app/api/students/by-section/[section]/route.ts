import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { section: string } }
) {
    try {
        const { section } = params;

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
        const attendanceRecords = await (prisma as any).studentAttendance.findMany({
            where: {
                studentId: { in: studentIds },
                subject: "Java" // For now, scoping to Java as per faculty view
            }
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
