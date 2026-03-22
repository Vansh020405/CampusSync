import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const facultyId = (session.user as any).id;

        const mentoredSections = await prisma.sectionMentor.findMany({
            where: {
                facultyId: facultyId
            }
        });

        return NextResponse.json(mentoredSections);
    } catch (error) {
        console.error("Fetch mentored sections error:", error);
        return NextResponse.json({ error: "Failed to fetch mentored sections" }, { status: 500 });
    }
}
