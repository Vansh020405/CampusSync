import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const id = params.id;

        const updatedExam = await prisma.exam.update({
            where: { id },
            data: {
                ...body,
                date: body.date ? new Date(body.date) : undefined
            }
        });

        return NextResponse.json(updatedExam);
    } catch (error) {
        console.error("ADMIN_EXAM_PATCH_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = params.id;

        await prisma.exam.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Exam deleted successfully" });
    } catch (error) {
        console.error("ADMIN_EXAM_DELETE_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
