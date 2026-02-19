
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const assignments = await (prisma.subjectAssignment as any).findMany({
            include: {
                subject: {
                    select: {
                        subjectName: true,
                        subjectCode: true
                    }
                }
            }
        });
        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Internal API Error [GET /api/admin/syllabus/assign]:", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { subjectId, department, semester, batch } = body;

        // Create or update assignment
        const assignment = await prisma.subjectAssignment.upsert({
            where: {
                subjectId_department_semester_batch: {
                    subjectId,
                    department,
                    semester,
                    batch
                }
            },
            update: {},
            create: {
                subjectId,
                department,
                semester,
                batch
            }
        });

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Error creating assignment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await prisma.subjectAssignment.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
    }
}
