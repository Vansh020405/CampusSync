
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
        const subjects = await prisma.syllabusSubject.findMany({
            include: {
                topics: {
                    orderBy: { order: 'asc' }
                },
                assignments: true
            }
        });
        return NextResponse.json(subjects);
    } catch (error) {
        console.error("Internal API Error [GET /api/admin/syllabus]:", error);
        // Return empty array to prevent UI .map() crash, but log the error
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
        console.log("POST /api/admin/syllabus body:", JSON.stringify(body, null, 2));
        const { id, subjectName, subjectCode, department, topics } = body;

        if (!subjectName || !Array.isArray(topics)) {
            return NextResponse.json({ error: "Invalid payload: subjectName and topics array required" }, { status: 400 });
        }

        let subject;
        if (id) {
            // Update
            console.log("Updating subject ID:", id);
            subject = await prisma.syllabusSubject.update({
                where: { id },
                data: {
                    subjectName,
                    subjectCode: subjectCode || null,
                    department,
                    topics: {
                        deleteMany: {},
                        create: topics.map((t: any, index: number) => ({
                            title: t.title,
                            totalLectures: Number(t.totalLectures) || 1,
                            order: index + 1,
                            examType: t.examType || null
                        }))
                    }
                },
                include: { topics: true }
            });
        } else {
            // Create
            console.log("Creating new subject:", subjectName);
            subject = await prisma.syllabusSubject.create({
                data: {
                    subjectName,
                    subjectCode: subjectCode || null,
                    department,
                    topics: {
                        create: topics.map((t: any, index: number) => ({
                            title: t.title,
                            totalLectures: Number(t.totalLectures) || 1,
                            order: index + 1,
                            examType: t.examType || null
                        }))
                    }
                },
                include: { topics: true }
            });
        }

        return NextResponse.json(subject);
    } catch (error: any) {
        console.error("Error managing subject:", error);

        // Handle unique constraint (P2002) specifically
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: "Conflict",
                details: "A subject with this name already exists. Please edit the existing subject or use a different name."
            }, { status: 409 });
        }

        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}
