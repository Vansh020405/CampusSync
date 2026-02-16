
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";


export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status, slotTime, slotDate, location, replyMessage } = body;
        const { id } = params;

        // Fetch current message to append reply
        const bookings = await prisma.$queryRaw`SELECT * FROM Booking WHERE id = ${id}`;
        const booking = (bookings as any[])[0];

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const currentMessage = booking.notes || "";
        const updatedMessage = replyMessage
            ? `${currentMessage}\n\n-- FACULTY REPLY --\n${replyMessage}`
            : currentMessage;

        // Parse date if present
        const parsedDate = slotDate ? new Date(slotDate) : null;

        // Execute update
        const affected = await prisma.$executeRaw`
            UPDATE Booking
            SET status = ${status},
                slotTime = ${slotTime},
                slotDate = ${parsedDate},
                location = ${location},
                notes = ${updatedMessage},
                updatedAt = ${new Date()}
            WHERE id = ${id} AND facultyId = ${(session.user as any).id}
        `;

        // Check if any row was actually updated
        // Note: prisma.$executeRaw returns a number (or object with count depending on driver)
        // safe check:
        if (Number(affected) === 0) {
            return NextResponse.json({ error: "Update failed or permission denied" }, { status: 403 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update booking error:", error);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }
}

