
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

        const safeParse = (val: any) => {
            if (!val) return [];
            if (typeof val !== 'string') return val;
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                // If it's a comma separated string, split it, otherwise return as single-item array
                return val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
            }
        };

        const mapped = faculty.map(f => ({
            id: f.id,
            facultyId: f.facultyId,
            name: f.name,
            department: f.department,
            email: f.email,
            cabin: f.cabinLocation,
            status: (f.status || 'AVAILABLE').toUpperCase(),
            subjects: safeParse(f.subjects),
            sections: safeParse(f.sectionsTeaching),
            isAvailable: (f.status || 'AVAILABLE').toUpperCase() === 'AVAILABLE'
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Fetch faculty error:", error);
        return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
    }
}
