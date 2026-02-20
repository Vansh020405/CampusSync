import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const student = await prisma.student.findUnique({
            where: { id: (session.user as any).id }
        });

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const body = await request.json();
        const { fromDate, toDate, reason, documentUrl } = body;

        if (!fromDate || !toDate || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find the mentor for the student's section using case-insensitive search
        const mentor = await prisma.sectionMentor.findFirst({
            where: {
                department: { equals: student.department.trim(), mode: 'insensitive' },
                section: { equals: student.section.trim(), mode: 'insensitive' },
                batch: { equals: student.batch.trim(), mode: 'insensitive' },
                semester: { equals: student.semester.trim(), mode: 'insensitive' }
            }
        });

        if (!mentor) {
            return NextResponse.json({ error: "No mentor assigned to your section." }, { status: 400 });
        }

        const leave = await prisma.studentLeave.create({
            data: {
                studentId: student.id,
                facultyId: mentor.facultyId,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                reason,
                documentUrl: documentUrl || null,
                status: 'PENDING'
            }
        });

        return NextResponse.json(leave);
    } catch (error) {
        console.error("Apply student leave error:", error);
        return NextResponse.json({ error: "Failed to apply for leave" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'STUDENT') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const studentId = (session.user as any).id;

        const leaves = await prisma.studentLeave.findMany({
            where: { studentId },
            orderBy: { appliedAt: 'desc' },
            include: {
                faculty: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(leaves);
    } catch (error) {
        console.error("Fetch student leaves error:", error);
        return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
    }
}
