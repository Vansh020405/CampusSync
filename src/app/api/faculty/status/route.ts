
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const facultyId = (session.user as any).id;
        const faculty = await prisma.faculty.findUnique({
            where: { id: facultyId },
            select: { status: true }
        });
        return NextResponse.json({ status: faculty?.status || 'AVAILABLE' });
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

        await prisma.faculty.update({
            where: { id: facultyId },
            data: { status }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
