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

        // Fetch exams assigned to this student
        let examSeatings = []
        try {
            examSeatings = await prisma.examSeating.findMany({
                where: { studentId: studentId },
                include: { exam: true },
                orderBy: { exam: { date: 'asc' } }
            });
        } catch (dbError: any) {
            console.warn("DB_ACCESS_ERROR: Tables might not exist yet.", dbError.message);
            return NextResponse.json([]); // Return empty list instead of crashing
        }

        const formattedExams = examSeatings.map((seating: any) => ({
            id: seating.exam.id,
            subject: seating.exam.subject,
            date: seating.exam.date,
            startTime: seating.exam.startTime,
            endTime: seating.exam.endTime,
            duration: seating.exam.duration,
            type: seating.exam.type,
            room: seating.exam.room,
            hall: seating.exam.hall,
            block: seating.exam.block,
            floor: seating.exam.floor,
            seatNo: seating.seatNo
        }));

        return NextResponse.json(formattedExams);

    } catch (error) {
        console.error("EXAMS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
