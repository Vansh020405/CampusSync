
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, slotTime, slotDate, location, replyMessage } = body;

        // Fetch current booking to verify ownership and get existing notes
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { student: true }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking session not found" }, { status: 404 });
        }

        // Verify that the faculty modifying this is the one assigned
        if (booking.facultyId !== (session.user as any).id) {
            return NextResponse.json({ error: "Unauthorized access to this protocol" }, { status: 403 });
        }

        // Handle Reply Message Logic
        let finalReply = replyMessage;
        if (status === 'REJECTED' && !finalReply) {
            finalReply = "Faculty currently not available for this time slot.";
        }

        const currentNotes = booking.notes || "";
        const updatedNotes = finalReply
            ? `${currentNotes}\n\n[FACULTY RESPONSE]: ${finalReply}`
            : currentNotes;

        // Standardize the update payload
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status,
                slotTime: status === 'APPROVED' ? slotTime : null,
                slotDate: status === 'APPROVED' && slotDate ? new Date(slotDate) : null,
                location: status === 'APPROVED' ? location : null,
                notes: updatedNotes,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: "Protocol updated successfully",
            status: updatedBooking.status
        });
    } catch (error: any) {
        console.error("Update protocol error:", error);
        return NextResponse.json({
            error: "Internal Server Error in Protocol Handshake",
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const userId = (session.user as any).id;
        const role = (session.user as any).role;

        // Fetch booking to verify ownership
        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking session not found" }, { status: 404 });
        }

        // Only allow deletion if the user is the student who created it or the faculty assigned to it
        const isOwner = role === 'STUDENT' ? booking.studentId === userId : booking.facultyId === userId;

        if (!isOwner) {
            return NextResponse.json({ error: "Unauthorized access to this protocol" }, { status: 403 });
        }

        await prisma.booking.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: "Protocol purged from system" });
    } catch (error: any) {
        console.error("Purge protocol error:", error);
        return NextResponse.json({
            error: "Failed to purge protocol record",
            details: error.message
        }, { status: 500 });
    }
}
