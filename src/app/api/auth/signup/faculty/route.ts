import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, facultyId, email, department, subjects, sectionsTeaching, cabinLocation, password } = await req.json();

        if (!name || !facultyId || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingFaculty = await prisma.faculty.findUnique({
            where: { facultyId }
        });

        if (existingFaculty) {
            return NextResponse.json({ error: "Faculty with this ID already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const normalizeDept = (dept: string) => {
            const d = dept.toUpperCase().replace(/\s+/g, '').trim();
            if (d === 'AIML' || d === 'CSEAIML' || d === 'CSE-AIML') return 'CSE AI ML';
            return dept;
        };

        const deptArray = Array.isArray(department) ? department : [department].filter(Boolean);
        const normalizedDepts = deptArray.map((d: string) => normalizeDept(d));

        const faculty = await prisma.faculty.create({
            data: {
                name,
                facultyId,
                department: JSON.stringify(normalizedDepts),
                subjects: JSON.stringify(subjects || []),
                sectionsTeaching: JSON.stringify(sectionsTeaching || []),
                cabinLocation,
                email,
                password: hashedPassword
            }
        });

        return NextResponse.json({ message: "Faculty created successfully", faculty: { id: faculty.id, name: faculty.name } }, { status: 201 });
    } catch (error) {
        console.error("Faculty Signup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
