import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const studentId = session.user.id;

        // Fetch student profile to get group details
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { department: true, semester: true, section: true }
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // Logic to determine batch type (Morning: 1-5, Evening: 6-10)
        const sectionMatch = student.section?.match(/(\d+)G(\d+)/i);
        const sectionNum = sectionMatch ? parseInt(sectionMatch[2]) : 0;
        const studentBatchType = sectionNum >= 1 && sectionNum <= 5 ? "Morning Batch" :
            sectionNum >= 6 && sectionNum <= 10 ? "Evening Batch" : null;

        // Fetch all exams for this student's group
        const exams = await prisma.exam.findMany({
            where: {
                department: { contains: student.department || '', mode: 'insensitive' },
                semester: student.semester.toString(),
                OR: [
                    { section: { contains: student.section || '', mode: 'insensitive' } },
                    { section: studentBatchType }, // Match "Morning Batch" or "Evening Batch"
                    { section: null },
                    { section: "" }
                ]
            },
            include: {
                seating: {
                    where: { studentId: studentId }
                }
            },
            orderBy: { date: 'asc' }
        });

        const formattedExams = exams.map((exam: any) => {
            const seating = exam.seating?.[0];
            return {
                id: exam.id,
                subject: exam.subject,
                date: exam.date,
                startTime: exam.startTime,
                endTime: exam.endTime,
                duration: exam.duration || "3 Hours",
                type: exam.type,
                room: exam.room,
                hall: exam.hall || "N/A",
                block: exam.block || "N/A",
                floor: exam.floor || "N/A",
                seatNo: seating ? seating.seatNo : "TBD"
            };
        });

        return NextResponse.json(formattedExams);

    } catch (error) {
        console.error("EXAMS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
