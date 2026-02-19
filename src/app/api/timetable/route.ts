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
                include: {
                    faculty: {
                        select: { name: true }
                    }
                },
                orderBy: { day: 'asc' }
            });
        } else if ((role === 'FACULTY' || role === 'ADMIN') && (facultyId || (session.user as any).id)) {
            const targetId = role === 'ADMIN' ? facultyId : (session.user as any).id;
            timetable = await prisma.timetable.findMany({
                where: { facultyId: targetId },
                include: {
                    faculty: {
                        select: { name: true }
                    }
                },
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
            const isFacultyMode = viewMode === 'faculty';

            if (isFacultyMode) {
                console.log(`[Matrix Sync] Clearing faculty ${targetId}`);
                await tx.timetable.deleteMany({ where: { facultyId: targetId } });

                // Verify Faculty Existence once
                const facultyExists = await tx.faculty.findUnique({ where: { id: targetId } });
                if (!facultyExists) {
                    throw new Error(`Faculty Identity ${targetId} not verified in system core.`);
                }
            } else {
                console.log(`[Matrix Sync] Clearing section ${targetId}`);
                await tx.timetable.deleteMany({ where: { section: targetId } });
            }

            if (!timetable || timetable.length === 0) return;

            // Prepare for bulk insert
            const formatTime = (time: string) => {
                const parts = time.split(':');
                if (parts.length < 2) return time;
                let h = parseInt(parts[0]);
                const m = parseInt(parts[1]);
                const hh = h % 12 || 12;
                const ampm = h < 12 ? 'AM' : 'PM';
                return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
            };

            const dataToInsert = timetable.map((slot: any) => {
                const parts = slot.time.split(' - ');
                const [start, end] = parts;
                const fId = isFacultyMode ? targetId : (slot.facultyId || null);

                return {
                    day: slot.day,
                    startTime: formatTime(start),
                    endTime: formatTime(end),
                    subject: slot.subject || "No Subject",
                    classroom: slot.classroom || slot.room || "TBA",
                    section: slot.section || (viewMode === 'student' ? targetId : "TBA"),
                    facultyId: fId,
                    department: "CSE",
                    semester: "4",
                    floor: "1"
                };
            }).filter((s: any) => s.facultyId);

            // Use createMany for high performance (supported by Postgres/MySQL/MongoDB)
            // If using SQLite, createMany is supported since Prisma 4.x
            await tx.timetable.createMany({
                data: dataToInsert
            });

            console.log(`[Matrix Sync] Reconstruction complete: Generated ${dataToInsert.length} entries for ${targetId}`);
        }, {
            timeout: 15000 // 15s absolute timeout for large matrices
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
