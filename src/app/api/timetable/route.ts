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
            if (viewMode === 'student') {
                console.log(`[Matrix Sync] Clearing section ${targetId}`);
                const deleted = await tx.timetable.deleteMany({
                    where: { section: targetId }
                });
                console.log(`[Matrix Sync] Purged ${deleted.count} legacy entries for section ${targetId}`);
            } else {
                console.log(`[Matrix Sync] Clearing faculty ${targetId}`);
                const deleted = await tx.timetable.deleteMany({
                    where: { facultyId: targetId }
                });
                console.log(`[Matrix Sync] Purged ${deleted.count} legacy entries for faculty ${targetId}`);
            }

            // If empty array, we just stop here (successful clear)
            if (!timetable || timetable.length === 0) {
                console.log(`[Matrix Sync] Deployment complete: Matrix cleared for ${targetId}`);
                return;
            }

            // Create new slots
            let createdCount = 0;
            for (const slot of timetable) {
                const parts = slot.time.split(' - ');
                const [start, end] = parts;
                if (!start || !end) continue;

                // Institutional Format: Proper 12-hour AM/PM
                const formatTime = (time: string) => {
                    const [hStr, mStr] = time.split(':');
                    const h = parseInt(hStr);
                    const m = parseInt(mStr);
                    const hh = h % 12 || 12;
                    const ampm = h < 12 ? 'AM' : 'PM';
                    return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                };

                const fId = viewMode === 'faculty' ? targetId : (slot.facultyId || null);
                if (!fId) {
                    console.warn(`[Matrix Sync] Skipping slot: Missing faculty identity for section ${slot.section}`);
                    continue;
                }

                // Verify Faculty Existence
                const facultyExists = await tx.faculty.findUnique({ where: { id: fId } });
                if (!facultyExists) {
                    console.error(`[Matrix Sync] Identity Breach: ${fId} not verified.`);
                    throw new Error(`Faculty Identity ${fId} not verified in system core.`);
                }

                await tx.timetable.create({
                    data: {
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
                    }
                });
                createdCount++;
            }
            console.log(`[Matrix Sync] Reconstruction complete: Generated ${createdCount} valid entries for ${targetId}`);
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
