import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { department, semester, section, batch, exams } = body;

        if (!exams || !Array.isArray(exams)) {
            return NextResponse.json({ error: "Invalid exams data" }, { status: 400 });
        }

        // Create an array of operations for the transaction
        const operations = [
            // Delete existing exams for this specific group to avoid duplicates on re-deployment
            prisma.exam.deleteMany({
                where: {
                    department: department,
                    semester: semester.toString(),
                    section: section || batch
                }
            }),
            // Create the new exams
            ...exams.map((exam: any) => {
                const examName = `${exam.type} - ${department} Sem ${semester}`;
                return prisma.exam.create({
                    data: {
                        name: examName,
                        subject: exam.subject,
                        department,
                        semester: semester.toString(),
                        section: section || batch,
                        date: new Date(exam.date),
                        startTime: exam.startTime,
                        endTime: exam.endTime,
                        type: exam.type,
                        duration: exam.duration || "3 Hours",
                        room: exam.room || "TBD",
                        block: exam.block || "TBD"
                    }
                });
            })
        ];

        const result = await prisma.$transaction(operations);
        const createdCount = result.length - 1; // Subtract 1 for the deleteMany operation

        return NextResponse.json({
            message: `Successfully saved ${result.length} exam schedules`,
            count: result.length
        });

    } catch (error) {
        console.error("DATESHEET_SAVE_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
