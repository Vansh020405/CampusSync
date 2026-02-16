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

        if ((role === 'STUDENT' || role === 'ADMIN') && section) {
            timetable = await prisma.timetable.findMany({
                where: { section },
                orderBy: { day: 'asc' }
            });
        } else if ((role === 'FACULTY' || role === 'ADMIN') && (facultyId || (session.user as any).id)) {
            const targetId = role === 'ADMIN' ? facultyId : (session.user as any).id;
            timetable = await prisma.timetable.findMany({
                where: { facultyId: targetId },
                orderBy: { day: 'asc' }
            });
        }

        return NextResponse.json(timetable);
    } catch (error) {
        console.error("Error fetching timetable:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        console.log("Timetable Authorization Audit:", {
            active: !!session,
            identity: user?.name || user?.username || 'Unknown',
            role: user?.role
        });

        // Strict Admin Gate: Allow if role is 'ADMIN' or if identity is 'admin'
        const isAuthorized = session && (user?.role === 'ADMIN' || user?.username === 'admin');

        if (!isAuthorized) {
            return NextResponse.json({
                error: "Unauthorized: Administrator Access Required",
                details: "Your session does not carry the necessary level of authority. Please exit and re-authenticate."
            }, { status: 401 });
        }

        const { timetable, viewMode, targetId } = await req.json();
        console.log("Timetable Deployment Payload:", { viewMode, targetId, slotCount: timetable?.length });

        if (!timetable || !viewMode || !targetId) {
            console.error("Missing fields:", { timetable: !!timetable, viewMode, targetId });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Transactions: Clear old and insert new
        await prisma.$transaction(async (tx) => {
            if (viewMode === 'student') {
                console.log("Cleaning section matrix for:", targetId);
                await tx.timetable.deleteMany({
                    where: { section: targetId }
                });
            } else {
                console.log("Cleaning faculty matrix for:", targetId);
                await tx.timetable.deleteMany({
                    where: { facultyId: targetId }
                });
            }

            // Create new slots
            let createdCount = 0;
            for (const slot of timetable) {
                const parts = slot.time.split(' - ');
                const [start, end] = parts;
                if (!start || !end) continue;

                // Institutional Format: 12-hour AM/PM
                const formatTime = (time: string) => {
                    const h = parseInt(time.split(':')[0]);
                    if (h >= 9 && h <= 11) return `${time} AM`;
                    return `${time} PM`; // 12:00, 01:00 etc
                };

                const fId = viewMode === 'faculty' ? targetId : (slot.facultyId || null);
                if (!fId) continue;

                const facultyExists = await tx.faculty.findUnique({ where: { id: fId } });
                if (!facultyExists) {
                    throw new Error(`Faculty Identity ${fId} not verified in system core.`);
                }

                await tx.timetable.create({
                    data: {
                        day: slot.day,
                        startTime: formatTime(start),
                        endTime: formatTime(end),
                        subject: slot.subject || "No Subject",
                        classroom: slot.room || "TBA",
                        section: slot.section || (viewMode === 'student' ? targetId : "TBA"),
                        facultyId: fId,
                        department: "CSE",
                        semester: "4",
                        floor: "1"
                    }
                });
                createdCount++;
            }
            console.log(`Successfully deployed ${createdCount} slots for ${targetId}`);
        });

        return NextResponse.json({ success: true, message: "Matrix Synchronized with Foundation" });
    } catch (error: any) {
        console.error("Timetable Sync Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}
