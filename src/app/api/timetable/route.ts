import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const role = session.user.role;
        const section = searchParams.get('section');
        const facultyId = searchParams.get('facultyId');

        let timetable: any[] = [];

        if (role === 'STUDENT' && section) {
            timetable = await prisma.timetable.findMany({
                where: { section },
                include: { faculty: true },
                orderBy: { startTime: 'asc' }
            });
        } else if (role === 'FACULTY' && (session.user as any).id) {
            timetable = await prisma.timetable.findMany({
                where: { facultyId: (session.user as any).id },
                orderBy: { startTime: 'asc' }
            });
        }

        return NextResponse.json(timetable);
    } catch (error) {
        console.error("Error fetching timetable:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
