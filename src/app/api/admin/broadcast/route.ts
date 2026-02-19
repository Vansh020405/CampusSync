import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { message, filters, senderId } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const announcement = await (prisma as any).announcement.create({
            data: {
                content: message,
                department: filters.department || "ALL",
                semester: filters.semester || "ALL",
                batch: filters.batch || "ALL",
                senderId: senderId || "admin"
            }
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Admin broadcast error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || "ALL";
    const semester = searchParams.get('semester') || "ALL";
    const batch = searchParams.get('batch') || "ALL";

    const studentId = searchParams.get('studentId');

    try {
        const announcements = await (prisma as any).announcement.findMany({
            where: {
                OR: [
                    { department: "ALL" },
                    { department: department }
                ],
                AND: [
                    {
                        OR: [
                            { semester: "ALL" },
                            { semester: semester }
                        ]
                    },
                    {
                        OR: [
                            { batch: "ALL" },
                            { batch: batch }
                        ]
                    }
                ]
            },
            include: {
                _count: {
                    select: { acknowledgements: true }
                },
                acknowledgements: studentId ? {
                    where: { studentId: studentId }
                } : false
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json(announcements);
    } catch (error) {
        console.error("Fetch announcements error:", error);
        return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}
