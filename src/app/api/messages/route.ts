import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { senderId, section, message } = await req.json();

        if (!senderId || !section || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newMessage = await (prisma as any).message.create({
            data: {
                senderId: senderId,
                receiverSection: section,
                message: message,
            },
            include: {
                sender: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (!section) {
        return NextResponse.json({ error: "Section is required" }, { status: 400 });
    }

    try {
        const messages = await (prisma as any).message.findMany({
            where: { receiverSection: section },
            include: {
                sender: {
                    select: { name: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json({ error: "Fetch messages error" }, { status: 500 });
    }
}
