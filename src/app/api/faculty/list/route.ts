
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Use queryRaw to bypass potentially stale Prisma client definitions
        // Fetch specific fields including the new 'status' and 'email'
        const faculty: any[] = await prisma.$queryRaw`
            SELECT id, name, "facultyId", department, subjects, "sectionsTeaching", "cabinLocation", email, status 
            FROM Faculty
            ORDER BY name ASC
        `;

        const mapped = faculty.map(f => ({
            id: f.id,
            facultyId: f.facultyId,
            name: f.name,
            department: f.department,
            email: f.email,
            cabin: f.cabinLocation,
            status: f.status || 'AVAILABLE',
            subjects: f.subjects ? (typeof f.subjects === 'string' ? JSON.parse(f.subjects) : f.subjects) : [],
            sections: f.sectionsTeaching ? (typeof f.sectionsTeaching === 'string' ? JSON.parse(f.sectionsTeaching) : f.sectionsTeaching) : [],
            isAvailable: f.status === 'AVAILABLE'
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Fetch faculty error:", error);
        return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
    }
}
