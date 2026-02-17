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
        const { examId, studentIds, prefix = "S-" } = body;

        if (!examId) {
            return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
        }

        // If no studentIds provided, find students based on some criteria (e.g., all available students)
        // For this implementation, we expect studentIds to be passed from the frontend selection

        const studentsToAssign = studentIds || (await prisma.student.findMany({ select: { id: true } })).map(s => s.id);

        const allocations = [];
        for (let i = 0; i < studentsToAssign.length; i++) {
            const studentId = studentsToAssign[i];
            const seatNo = `${prefix}${i + 1}`;

            allocations.push(
                prisma.examSeating.upsert({
                    where: {
                        examId_studentId: {
                            examId,
                            studentId
                        }
                    },
                    update: { seatNo },
                    create: {
                        examId,
                        studentId,
                        seatNo
                    }
                })
            );
        }

        await prisma.$transaction(allocations);

        return NextResponse.json({ message: `Successfully allocated seats for ${studentsToAssign.length} students` });

    } catch (error) {
        console.error("ADMIN_SEAT_ALLOCATION_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
