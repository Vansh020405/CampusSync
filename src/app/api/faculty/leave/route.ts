
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

        const leaves = await prisma.facultyLeave.findMany({
            where: { facultyId },
            orderBy: { appliedAt: 'desc' }
        });

        const approvedCount = leaves.filter(l => l.status === 'APPROVED').length;
        const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

        return NextResponse.json({
            leaves,
            approvedCount,
            pendingCount,
            totalCount: leaves.length
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const facultyId = (session.user as any).id;
        const { fromDate, toDate, reason } = await req.json();

        if (!fromDate || !toDate || !reason) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const leave = await prisma.facultyLeave.create({
            data: {
                facultyId,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                reason,
                status: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, leave });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
