import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            select: {
                id: true,
                name: true,
                rollNo: true,
                section: true,
                batch: true,
                department: true,
                email: true,
                semester: true,
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error("Fetch students list error:", error);
        return NextResponse.json({ error: "Failed to fetch student list" }, { status: 500 });
    }
}
