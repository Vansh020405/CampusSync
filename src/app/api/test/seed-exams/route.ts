import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const students = await prisma.student.findMany();
        if (students.length === 0) {
            return NextResponse.json({ error: "No students found to seed exams" });
        }

        const examsData = [
            {
                subject: "Computer Networks",
                date: new Date("2026-03-15T09:00:00Z"),
                startTime: "09:30 AM",
                endTime: "12:30 PM",
                duration: "3 Hours",
                type: "End-Sem",
                room: "A-301",
                hall: "Hall 1",
                block: "Block A",
                floor: "3rd Floor",
            },
            {
                subject: "Operating Systems",
                date: new Date("2026-03-18T14:00:00Z"),
                startTime: "02:00 PM",
                endTime: "05:00 PM",
                duration: "3 Hours",
                type: "End-Sem",
                room: "B-205",
                hall: "Hall 2",
                block: "Block B",
                floor: "2nd Floor",
            },
            {
                subject: "Database Management Systems",
                date: new Date("2026-02-17T10:00:00Z"), // Today
                startTime: "10:00 AM",
                endTime: "12:00 PM",
                duration: "2 Hours",
                type: "Mid-Sem",
                room: "C-102",
                hall: "Main Gallery",
                block: "Block C",
                floor: "1st Floor",
            },
            {
                subject: "Web Technologies Practical",
                date: new Date("2026-02-10T09:00:00Z"), // Completed
                startTime: "09:00 AM",
                endTime: "01:00 PM",
                duration: "4 Hours",
                type: "Practical",
                room: "Lab 5",
                hall: "IT Lab Complex",
                block: "Lab Block",
                floor: "Ground Floor",
            }
        ];

        for (const examData of examsData) {
            const exam = await prisma.exam.create({
                data: examData
            });

            // Assign to all students for demo
            for (const student of students) {
                await prisma.examSeating.create({
                    data: {
                        examId: exam.id,
                        studentId: student.id,
                        seatNo: `S-${Math.floor(Math.random() * 50) + 1}`
                    }
                });
            }
        }

        return NextResponse.json({ message: "Exams seeded successfully" });
    } catch (error) {
        console.error("SEED_EXAMS_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
