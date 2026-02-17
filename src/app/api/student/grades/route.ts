import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const studentId = session.user.id;

        const grades = await prisma.grade.findMany({
            where: { studentId: studentId },
            orderBy: [{ semester: 'asc' }, { subjectCode: 'asc' }]
        });

        return NextResponse.json(grades);

    } catch (error) {
        console.error("GRADES_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
