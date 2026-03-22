import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const exams = await prisma.exam.findMany({
            orderBy: { date: 'asc' },
            include: {
                invigilator: {
                    select: { name: true, facultyId: true }
                },
                _count: {
                    select: { seating: true }
                }
            }
        });

        return NextResponse.json(exams);
    } catch (error) {
        console.error("ADMIN_EXAMS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, subject, date, startTime, endTime, duration, type, room, hall, block, floor, invigilatorId } = body;

        const exam = await prisma.exam.create({
            data: {
                name,
                subject,
                date: new Date(date),
                startTime,
                endTime,
                duration,
                type,
                room,
                hall,
                block,
                floor,
                invigilatorId: invigilatorId || null
            }
        });

        return NextResponse.json(exam);
    } catch (error) {
        console.error("ADMIN_EXAM_CREATE_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

