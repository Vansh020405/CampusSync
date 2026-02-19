import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, username, password, position, department, subjects } = await req.json();

        if (!username || !password || !name) {
            return NextResponse.json({ error: "Missing identity tokens" }, { status: 400 });
        }

        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (existingAdmin) {
            return NextResponse.json({ error: "Administrator identity already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                name,
                username,
                password: hashedPassword,
                position,
                department,
                subjects: subjects ? (Array.isArray(subjects) ? JSON.stringify(subjects) : subjects) : null
            }
        });

        return NextResponse.json({ message: "Admin protocol established", admin: { id: admin.id, name: admin.name } }, { status: 201 });
    } catch (error) {
        console.error("Admin Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
