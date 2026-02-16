
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'FACULTY') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const faculty = await prisma.faculty.findUnique({
            where: { id: session.user.id }
        });

        if (!faculty) {
            return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
        }

        // Parse JSON subjects/sections
        const subjects = JSON.parse(faculty.subjects || "[]");
        const sections = JSON.parse(faculty.sectionsTeaching || "[]");

        return NextResponse.json({ subjects, sections });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}
