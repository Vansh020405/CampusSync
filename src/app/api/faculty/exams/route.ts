import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "FACULTY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const facultyDept = (session.user as any).department;

        // Fetch all exams in the faculty's department
        const exams = await prisma.exam.findMany({
            where: {
                department: { contains: facultyDept || '', mode: 'insensitive' }
            },
            orderBy: { date: 'asc' }
        });

        return NextResponse.json(exams);

    } catch (error) {
        console.error("FACULTY_EXAMS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
