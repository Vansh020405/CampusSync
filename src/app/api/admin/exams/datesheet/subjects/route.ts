import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const department = searchParams.get("department");
        const semester = searchParams.get("semester");

        if (!department || !semester) {
            return NextResponse.json({ error: "Missing department or semester" }, { status: 400 });
        }

        // Try to fetch from Timetable first (mapped to semester)
        const timetableSubjects = await prisma.timetable.findMany({
            where: {
                department: { contains: department, mode: 'insensitive' },
                semester: semester.toString()
            },
            select: { subject: true },
            distinct: ['subject']
        });

        if (timetableSubjects.length > 0) {
            return NextResponse.json(timetableSubjects.map(s => s.subject));
        }

        // Fallback to SyllabusSubject if Timetable is empty for this combination
        // Note: SyllabusSubject doesn't have semester in current schema, 
        // but we can filter by department
        const syllabusSubjects = await prisma.syllabusSubject.findMany({
            where: {
                department: { contains: department, mode: 'insensitive' }
            },
            select: { subjectName: true }
        });

        return NextResponse.json(syllabusSubjects.map(s => s.subjectName));

    } catch (error) {
        console.error("DATESHEET_SUBJECTS_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
