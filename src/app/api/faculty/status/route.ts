
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const facultyId = (session.user as any).id;
        const result: any[] = await prisma.$queryRaw`SELECT status FROM Faculty WHERE id = ${facultyId}`;
        return NextResponse.json({ status: result[0]?.status || 'AVAILABLE' });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { status } = await req.json();
        const facultyId = (session.user as any).id;

        await prisma.$executeRaw`UPDATE Faculty SET status = ${status} WHERE id = ${facultyId}`;

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
