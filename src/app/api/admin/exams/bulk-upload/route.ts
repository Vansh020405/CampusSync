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
        const { exams } = body; // Array of exam objects

        if (!Array.isArray(exams)) {
            return NextResponse.json({ error: "Invalid data format. Expected an array of exams." }, { status: 400 });
        }

        const createdExams = await prisma.exam.createMany({
            data: exams.map((exam: any) => ({
                name: exam.name || "Examination",
                subject: exam.subject,
                date: new Date(exam.date),
                startTime: exam.startTime,
                endTime: exam.endTime,
                duration: exam.duration,
                type: exam.type,
                room: exam.room,
                hall: exam.hall,
                block: exam.block,
                floor: exam.floor
            }))
        });

        return NextResponse.json({ message: `Successfully uploaded ${createdExams.count} exams` });

    } catch (error) {
        console.error("ADMIN_BULK_UPLOAD_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
