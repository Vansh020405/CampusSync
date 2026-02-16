
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

        const parseSafe = (input: string) => {
            if (!input) return [];
            try {
                const parsed = JSON.parse(input);
                return Array.isArray(parsed) ? parsed : [String(parsed)];
            } catch (e) {
                return input.split(',').map(s => s.trim()).filter(Boolean);
            }
        };

        const subjects = parseSafe(faculty.subjects);
        const sections = parseSafe(faculty.sectionsTeaching);

        return NextResponse.json({ subjects, sections });
    } catch (error) {
        console.error("Courses fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }
}
