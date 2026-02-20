import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch all mentor assignments
export async function GET() {
    try {
        const assignments = await prisma.sectionMentor.findMany({
            include: {
                faculty: {
                    select: {
                        id: true,
                        name: true,
                        facultyId: true
                    }
                }
            }
        });

        return NextResponse.json(assignments);
    } catch (error) {
        console.error("Fetch mentor assignments error:", error);
        return NextResponse.json({ error: "Failed to fetch mentor assignments" }, { status: 500 });
    }
}

// POST: Upsert a mentor assignment
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, department, semester, section, batch, facultyId } = body;

        if (!department || !semester || !section || !batch || !facultyId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const assignment = await prisma.sectionMentor.upsert({
            where: {
                department_semester_section_batch: {
                    department,
                    semester,
                    section,
                    batch
                }
            },
            update: {
                facultyId
            },
            create: {
                department,
                semester,
                section,
                batch,
                facultyId
            }
        });

        return NextResponse.json(assignment);
    } catch (error) {
        console.error("Save mentor assignment error:", error);
        return NextResponse.json({ error: "Failed to save mentor assignment" }, { status: 500 });
    }
}
