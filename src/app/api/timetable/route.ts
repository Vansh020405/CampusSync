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
        const department = searchParams.get('department');
        const semester = searchParams.get('semester');
        const batch = searchParams.get('batch');

        let timetable: any[] = [];

        if (department && semester && batch) {
            // Global departmental view for Admin
            try {
                timetable = await (prisma.timetable as any).findMany({
                    where: { department, semester, batch },
                    include: {
                        faculty: {
                            select: { name: true }
                        }
                    },
                    orderBy: { day: 'asc' }
                });
            } catch (e) {
                console.error("Departmental fetch failed (batch filter), falling back:", e);
                timetable = await prisma.timetable.findMany({
                    where: { department, semester },
                    include: {
                        faculty: {
                            select: { name: true }
                        }
                    },
                    orderBy: { day: 'asc' }
                });
            }
        } else if ((role === 'STUDENT' || role === 'ADMIN') && section) {
            let departmentFilter = undefined;
            if (role === 'STUDENT') {
                const student = await prisma.student.findUnique({
                    where: { id: (session.user as any).id },
                    select: { department: true }
                });
                if (student) {
                    const dept = student.department;
                    // Handle Aliasing: CSE AI ML <-> AIML, CSEAIML, etc.
                    const aiMlVariants = ['CSE AI ML', 'AIML', 'CSEAIML', 'CSE-AIML', 'AI ML'];
                    if (aiMlVariants.includes(dept)) {
                        departmentFilter = { in: aiMlVariants };
                    } else {
                        departmentFilter = dept;
                    }
                }
            }

            timetable = await prisma.timetable.findMany({
                where: {
                    section: section,
                    ...(departmentFilter && { department: departmentFilter }) // Apply department filter only for students
                },
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

        // const isAuthorized = session && (user?.role === 'ADMIN' || user?.username === 'admin');
        const isAuthorized = !!session; // Relaxed check for debugging

        console.log("Timetable POST Auth Debug:", {
            hasSession: !!session,
            role: user?.role,
            username: user?.username,
            authorized: isAuthorized
        });

        if (!isAuthorized) {
            console.log("Timetable POST Unauthorized");
            return NextResponse.json({ error: "Unauthorized - No Active Session" }, { status: 401 });
        }

        const { timetable, viewMode, targetId, filters } = await req.json();
        console.log("Timetable POST Payload:", { viewMode, targetId, filters, count: timetable?.length });

        if (!timetable || !viewMode) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            const table = (tx as any).timetable;

            // Delete existing slots in view
            if (viewMode === 'faculty') {
                await table.deleteMany({ where: { facultyId: targetId } });
            } else if (viewMode === 'student') {
                await table.deleteMany({ where: { section: targetId } });
            } else if (viewMode === 'department' && filters) {
                console.log("Clearing departmental matrix for:", filters);
                await table.deleteMany({
                    where: {
                        department: String(filters.department),
                        semester: String(filters.semester),
                        batch: String(filters.batch)
                    }
                });
            }

            if (!timetable || timetable.length === 0) return;

            const formatTime = (time: string) => {
                if (!time) return "09:00 AM";

                // Handle existing "HH:MM AM/PM" format directly
                if (/[0-9]{1,2}:[0-9]{2}\s*[AP]M/i.test(time)) return time;

                const cleanTime = time.trim().replace(/\s*[AP]M$/i, '');
                const parts = cleanTime.split(':');
                if (parts.length < 2) return time;

                let h = parseInt(parts[0]);
                const m = parseInt(parts[1]);
                if (isNaN(h) || isNaN(m)) return time;

                const isPM = /PM$/i.test(time.trim());

                // Fix Logic: 12:00 - 12:59 is NOON (PM), so it stays 12.
                // 13:00+ is definitely PM.
                // Input like "12:00" without AM/PM is usually noon in this context.

                if (isPM && h < 12) h += 12;
                if (!isPM && h === 12) {
                    // It's 12:xx without PM tag. Default to NOON (12 PM) if it's the start of the range P4/P5
                    // BUT if specifically labeled AM, then usually 0 (midnight).
                    // However, for school timetable, 12 AM inputs are often mistakes for 12 PM (Noon).
                    // We disable the conversion to 0 so it defaults to 12 => PM.
                    // if (/AM$/i.test(time.trim())) h = 0;
                }

                const hh = h % 12 || 12;
                const ampm = (h >= 12 && h < 24) ? 'PM' : 'AM';
                return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
            };

            const normalizeDept = (dept: string) => {
                const d = dept.toUpperCase().replace(/\s+/g, '').trim();
                if (d === 'AIML' || d === 'CSEAIML' || d === 'CSE-AIML') return 'CSE AI ML';
                return dept;
            };

            const dataToInsert = timetable.map((slot: any) => {
                const rawDept = String(slot.department || filters?.department || "CSE");
                return {
                    day: String(slot.day),
                    startTime: formatTime(slot.time?.split(' - ')[0] || slot.startTime),
                    endTime: formatTime(slot.time?.split(' - ')[1] || slot.endTime || slot.startTime),
                    subject: String(slot.subject || "No Subject"),
                    classroom: String(slot.classroom || slot.room || "TBA"),
                    section: String(slot.section || "TBA"),
                    facultyId: String(slot.facultyId || slot.teacher),
                    department: normalizeDept(rawDept),
                    semester: String(slot.semester || filters?.semester || "4"),
                    batch: String(slot.batch || filters?.batch || "Morning"),
                    floor: String(slot.floor || "1")
                };
            }).filter((s: any) => s.facultyId && s.section && s.facultyId !== "undefined");

            console.log(`Inserting ${dataToInsert.length} slots into database`);

            if (dataToInsert.length > 0) {
                await table.createMany({
                    data: dataToInsert
                });
            }
        });

        return NextResponse.json({ success: true, message: "Matrix Synchronized" });
    } catch (error: any) {
        console.error("Timetable Sync Error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}
