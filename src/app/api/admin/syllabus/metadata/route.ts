
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const students = await (prisma.student as any).findMany({
            select: { department: true },
            distinct: ['department']
        });

        const departments = students
            .map((s: any) => s.department)
            .filter(Boolean)
            .sort();

        // Include some defaults in case no students are registered yet
        const defaultDepts = ["CSE", "ECE", "ME", "CE"];
        const finalDepartments = Array.from(new Set([...defaultDepts, ...departments]));

        return NextResponse.json({ departments: finalDepartments });
    } catch (error) {
        console.error("Metadata fetch error:", error);
        return NextResponse.json({ departments: ["CSE", "ECE", "ME", "CE"] });
    }
}
