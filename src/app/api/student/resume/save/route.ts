import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const studentId = (session.user as any).id;
        const { score, text } = await req.json();

        // Update the database with parsed resume components
        await prisma.student.update({
            where: { id: studentId },
            data: {
                resumeScore: score,
                resumeText: text,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save resume data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
