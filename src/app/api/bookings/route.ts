
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'STUDENT') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { facultyId, message, agenda, agendaType } = body;

        if (!facultyId || !message) {
            return NextResponse.json({ error: "Faculty ID and message are required" }, { status: 400 });
        }

        const studentId = (session.user as any).id;

        const booking = await prisma.booking.create({
            data: {
                studentId,
                facultyId,
                agenda: agenda || 'Message',
                agendaType: agendaType || 'DOUBT',
                status: 'PENDING',
                notes: message
            }
        });

        return NextResponse.json({ success: true, id: booking.id });
    } catch (error) {
        console.error("Create booking error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        let bookings: any[];

        if (role === 'STUDENT') {
            bookings = await prisma.booking.findMany({
                where: { studentId: userId },
                include: {
                    faculty: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Faculty view
            bookings = await prisma.booking.findMany({
                where: { facultyId: userId },
                include: {
                    student: {
                        select: {
                            name: true,
                            rollNo: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        const mapped = bookings.map(b => ({
            ...b,
            message: b.notes || b.message || "No protocol content",
            studentName: b.student?.name || "Student",
            studentRollNo: b.student?.rollNo || "N/A"
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
