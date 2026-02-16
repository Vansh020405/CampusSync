
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Use standard Prisma findMany for reliability and type safety
        const faculty = await prisma.faculty.findMany({
            select: {
                id: true,
                name: true,
                facultyId: true,
                department: true,
                subjects: true,
                sectionsTeaching: true,
                cabinLocation: true,
                email: true,
                status: true
            },
            orderBy: {
                name: 'asc'
            }
        });

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
