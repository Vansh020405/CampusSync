import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { announcementId, studentId } = await req.json();

        if (!announcementId || !studentId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const ack = await (prisma as any).announcementAcknowledgement.upsert({
            where: {
                announcementId_studentId: {
                    announcementId,
                    studentId
                }
            },
            update: {},
            create: {
                announcementId,
                studentId
            }
        });

        return NextResponse.json(ack);
    } catch (error) {
        console.error("Acknowledgement error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
