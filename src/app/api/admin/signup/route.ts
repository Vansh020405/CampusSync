import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, password, name } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (existingAdmin) {
            return NextResponse.json({ error: "Admin with this username already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                name
            }
        });

        return NextResponse.json({
            message: "Admin created successfully",
            admin: { id: admin.id, username: admin.username }
        }, { status: 201 });
    } catch (error) {
        console.error("Admin Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
