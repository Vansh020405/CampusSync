import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        console.log("Admin Resources Debug - Session:", JSON.stringify(session, null, 2));

        if (!session) {
            console.log("Admin Resources Debug - No Session");
            return NextResponse.json({ error: "Unauthorized - No Session" }, { status: 401 });
        }

        const role = (session.user as any).role;
        console.log("Admin Resources Debug - Role:", role);

        // if (role !== 'ADMIN') {
        //    console.log("Admin Resources Debug - Role Mismatch. Expected ADMIN, got:", role);
        //    return NextResponse.json({ error: "Unauthorized - Invalid Role" }, { status: 401 });
        // }

        const results = await Promise.allSettled([
            prisma.syllabusSubject.findMany({
                select: { subjectName: true },
                orderBy: { subjectName: 'asc' }
            }),
            prisma.timetable.groupBy({
                by: ['classroom'],
                orderBy: { classroom: 'asc' }
            }),
            prisma.exam.groupBy({
                by: ['room'],
                orderBy: { room: 'asc' }
            }),
            prisma.student.groupBy({
                by: ['section'],
                orderBy: { section: 'asc' }
            }),
            prisma.timetable.groupBy({
                by: ['section'],
                orderBy: { section: 'asc' }
            }),
            prisma.faculty.findMany({
                select: { subjects: true, sectionsTeaching: true }
            })
        ]);

        const getResult = (index: number) => {
            const result = results[index];
            return result.status === 'fulfilled' ? result.value : [];
        };

        const subjectsData = getResult(0) as { subjectName: string }[];
        const roomsFromTimetable = getResult(1) as { classroom: string }[];
        const roomsFromExams = getResult(2) as { room: string }[];
        const studentsData = getResult(3) as { section: string }[];
        const timetableSections = getResult(4) as { section: string }[];
        const faculties = getResult(5) as { subjects: string, sectionsTeaching: string }[];

        const parseSafe = (input: string) => {
            if (!input) return [];
            try {
                // Handle JSON strings or comma-separated lists
                const parsed = JSON.parse(input);
                return Array.isArray(parsed) ? parsed : [String(parsed)];
            } catch (e) {
                return input.split(',').map(s => s.trim()).filter(Boolean);
            }
        };

        const facultySubjects = faculties.flatMap(f => parseSafe(f.subjects || ""));
        const facultySections = faculties.flatMap(f => parseSafe(f.sectionsTeaching || ""));

        const subjects = Array.from(new Set([
            ...subjectsData.map(s => s.subjectName),
            ...facultySubjects
        ])).filter(Boolean).sort();

        const defaultRooms = ["LH-101", "LH-102", "LH-103", "LH-104", "LAB-1", "LAB-2", "LAB-3", "AUD-1"];
        const rooms = Array.from(new Set([
            ...roomsFromTimetable.map(r => r.classroom),
            ...roomsFromExams.map(e => e.room),
            ...defaultRooms
        ])).filter(Boolean).sort();

        const sections = Array.from(new Set([
            ...studentsData.map(s => s.section),
            ...timetableSections.map(t => t.section),
            ...facultySections
        ])).filter(Boolean).sort();

        return NextResponse.json({ subjects, rooms, sections });
    } catch (error: any) {
        console.error("Resource discovery error:", error);
        return NextResponse.json({
            subjects: [],
            rooms: ["LH-101", "LH-102", "LAB-1", "LAB-2"],
            sections: [],
            error: error.message
        });
    }
}
