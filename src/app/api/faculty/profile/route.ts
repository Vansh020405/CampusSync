import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { subjects } = body;

        // subjects could be a string or array, normalize to string for DB
        const subjectsString = Array.isArray(subjects)
            ? JSON.stringify(subjects)
            : subjects;

        const updatedFaculty = await prisma.faculty.update({
            where: { id: (session.user as any).id },
            data: {
                subjects: subjectsString
            }
        });

        return NextResponse.json(updatedFaculty);
    } catch (error: any) {
        console.error("Update faculty profile error:", error);
        return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
    }
}
