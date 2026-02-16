import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, rollNo, section, department, semester, email } = await req.json();
        const userId = (session.user as any).id;

        if (!userId) {
            return NextResponse.json({ error: "User ID not found" }, { status: 400 });
        }

        const updatedStudent = await prisma.student.update({
            where: { id: userId },
            data: {
                name,
                rollNo,
                section,
                department,
                semester,
                email
            }
        });

        return NextResponse.json({
            message: "Profile updated successfully",
            user: updatedStudent
        }, { status: 200 });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
