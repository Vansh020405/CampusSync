import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const sectionsData = await prisma.student.groupBy({
            by: ['section'],
            orderBy: {
                section: 'asc'
            }
        });

        const sections = sectionsData.map(s => s.section);
        return NextResponse.json(sections);
    } catch (error) {
        console.error("Fetch sections error:", error);
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }
}
