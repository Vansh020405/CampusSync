
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'STUDENT') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { facultyId, message } = body;

        if (!facultyId || !message) {
            return NextResponse.json({ error: "Faculty ID and message are required" }, { status: 400 });
        }

        const studentId = (session.user as any).id;
        const id = crypto.randomUUID();

        // Using raw query to insert into Booking with potentially new schema fields
        // agendaType set to 'DOUBT' as default for message-based bookings
        await prisma.$executeRaw`
            INSERT INTO Booking (id, studentId, facultyId, agenda, agendaType, status, notes, createdAt, updatedAt, slotDate, slotTime, location)
            VALUES (${id}, ${studentId}, ${facultyId}, 'Message', 'DOUBT', 'PENDING', ${message}, datetime('now'), datetime('now'), NULL, NULL, NULL)
        `;

        return NextResponse.json({ success: true, id });
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
            bookings = await prisma.$queryRaw`
                SELECT b.id, b.status, b.notes as message, b.createdAt,
                       f.name as facultyName, f.email as facultyEmail, 
                       b.slotDate, b.slotTime, b.location
                FROM Booking b
                JOIN Faculty f ON b.facultyId = f.id
                WHERE b.studentId = ${userId}
                ORDER BY b.createdAt DESC
            `;
        } else {
            // Faculty view
            bookings = await prisma.$queryRaw`
                SELECT b.id, b.status, b.notes as message, b.createdAt,
                       s.name as studentName, s.rollNo as studentRollNo,
                       b.slotDate, b.slotTime, b.location
                FROM Booking b
                JOIN Student s ON b.studentId = s.id
                WHERE b.facultyId = ${userId}
                ORDER BY b.createdAt DESC
            `;
        }

        const mapped = bookings.map(b => ({
            ...b,
            message: b.message || "No message",
            // Format dates if needed later
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}
