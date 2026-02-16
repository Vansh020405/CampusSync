import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, rollNo, section, department, semester, email, password } = await req.json();

        if (!name || !rollNo || !section || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingStudent = await prisma.student.findUnique({
            where: { rollNo }
        });

        if (existingStudent) {
            return NextResponse.json({ error: "Student with this Roll Number already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await prisma.student.create({
            data: {
                name,
                rollNo,
                section,
                department,
                semester: semester || "1",
                email: email || null,
                password: hashedPassword
            }
        });

        return NextResponse.json({ message: "Student created successfully", student: { id: student.id, name: student.name } }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
