import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const facultyId = (session.user as any).id;

        const exams = await prisma.exam.findMany({
            where: {
                invigilatorId: facultyId
            },
            orderBy: {
                date: 'asc'
            }
        });

        return NextResponse.json(exams);
    } catch (error) {
        console.error("FACULTY_EXAMS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
