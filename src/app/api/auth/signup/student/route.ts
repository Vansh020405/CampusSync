import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, rollNo, section, batch, department, semester, email, password } = await req.json();

        if (!name || !rollNo || !section || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if roll number already exists
        const existingStudent = await prisma.student.findUnique({
            where: { rollNo }
        });

        if (existingStudent) {
            return NextResponse.json({ error: "Student with this Roll Number already exists" }, { status: 400 });
        }

        // Check if email already exists (only if email is provided)
        if (email) {
            const existingEmail = await prisma.student.findFirst({
                where: { email }
            });

            if (existingEmail) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const normalizeDept = (dept: string) => {
            const d = dept.toUpperCase().replace(/\s+/g, '').trim();
            if (d === 'AIML' || d === 'CSEAIML' || d === 'CSE-AIML') return 'CSE AI ML';
            return dept;
        };

        const student = await prisma.student.create({
            data: {
                name,
                rollNo,
                section,
                batch: batch || "Morning",
                department: normalizeDept(department || "Computer Science"),
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
