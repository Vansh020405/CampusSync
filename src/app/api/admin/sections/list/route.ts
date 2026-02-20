import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Fetch unique combinations from Student table
        const students = await prisma.student.findMany({
            select: {
                department: true,
                semester: true,
                section: true,
                batch: true
            },
            distinct: ['department', 'semester', 'section', 'batch']
        });

        // Also check Timetable table in case some sections don't have students yet but exist in schedule
        const timetableSections = await prisma.timetable.findMany({
            select: {
                department: true,
                semester: true,
                section: true,
                batch: true
            },
            distinct: ['department', 'semester', 'section', 'batch']
        });

        // Also check SectionMentor table to ensure assigned sections show up even without students
        const mentorSections = await prisma.sectionMentor.findMany({
            select: {
                department: true,
                semester: true,
                section: true,
                batch: true
            },
            distinct: ['department', 'semester', 'section', 'batch']
        });

        // Combine and deduplicate
        const allSections = [
            ...students.map(s => ({
                department: s.department.toUpperCase().trim(),
                semester: s.semester,
                section: s.section.toUpperCase().trim(),
                batch: s.batch ? (s.batch.charAt(0).toUpperCase() + s.batch.slice(1).toLowerCase().trim()) : "Morning"
            })),
            ...timetableSections.map(t => ({
                department: t.department.toUpperCase().trim(),
                semester: t.semester,
                section: t.section.toUpperCase().trim(),
                batch: t.batch ? (t.batch.charAt(0).toUpperCase() + t.batch.slice(1).toLowerCase().trim()) : "Morning"
            })),
            ...mentorSections.map(m => ({
                department: m.department.toUpperCase().trim(),
                semester: m.semester,
                section: m.section.toUpperCase().trim(),
                batch: m.batch ? (m.batch.charAt(0).toUpperCase() + m.batch.slice(1).toLowerCase().trim()) : "Morning"
            }))
        ];
        const uniqueSections = Array.from(new Set(allSections.map(s => JSON.stringify({
            department: s.department,
            semester: s.semester,
            section: s.section,
            batch: s.batch
        }))))
            .map(s => JSON.parse(s))
            .sort((a, b) => {
                const deptComp = a.department.localeCompare(b.department);
                if (deptComp !== 0) return deptComp;

                // Sort semester numerically
                const semA = parseInt(a.semester) || 0;
                const semB = parseInt(b.semester) || 0;
                if (semA !== semB) return semA - semB;

                const batchComp = a.batch.localeCompare(b.batch);
                if (batchComp !== 0) return batchComp;
                return a.section.localeCompare(b.section);
            });

        return NextResponse.json(uniqueSections);
    } catch (error) {
        console.error("Fetch sections error:", error);
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }
}
