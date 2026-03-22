import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { facultyId, subject, date, periods, attendance } = await req.json();

        if (!facultyId || !subject || !date || !periods || !Array.isArray(periods) || !attendance) {
            return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
        }

        const attendancePromises = periods.flatMap(period =>
            Object.entries(attendance).map(([studentId, status]) => {
                return (prisma as any).studentAttendance.create({
                    data: {
                        studentId: studentId,
                        facultyId: facultyId,
                        subject: subject,
                        date: new Date(date),
                        period: period,
                        status: status,
                    }
                });
            })
        );

        await Promise.all(attendancePromises);

        return NextResponse.json({ message: "Attendance marked successfully" });
    } catch (error) {
        console.error("Mark attendance error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
