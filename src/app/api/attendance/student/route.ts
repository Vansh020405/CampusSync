import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const rollNo = searchParams.get('rollNo');

        if (!rollNo) {
            return NextResponse.json({ error: "Roll number is required" }, { status: 400 });
        }

        // 1. Find the student
        const student = await (prisma as any).student.findUnique({
            where: { rollNo: rollNo }
        });

        if (!student) {
            return NextResponse.json({ error: `Student with rollNo ${rollNo} not found` }, { status: 404 });
        }

        // 2. Fetch all attendance records
        const attendanceRecords = await (prisma as any).studentAttendance.findMany({
            where: { studentId: student.id },
            include: {
                faculty: {
                    select: { name: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        // 3. Aggregate stats by subject
        const subjects: Record<string, { present: number, total: number }> = {};

        attendanceRecords.forEach((record: any) => {
            if (!subjects[record.subject]) {
                subjects[record.subject] = { present: 0, total: 0 };
            }
            subjects[record.subject].total += 1;
            if (record.status === 'PRESENT') {
                subjects[record.subject].present += 1;
            }
        });

        const stats = Object.entries(subjects).map(([name, data]) => ({
            subject: name,
            percentage: Math.round((data.present / data.total) * 100),
            totalClasses: data.total
        }));

        return NextResponse.json({
            records: attendanceRecords,
            stats: stats
        });
    } catch (error) {
        console.error("Fetch student attendance error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
