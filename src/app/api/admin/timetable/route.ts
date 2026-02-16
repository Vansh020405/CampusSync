import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Ensure only admin can create timetables
        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { department, section, semester, entries } = body;

        if (!department || !section || !semester || !entries) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Clear existing timetable for this specific section
            await tx.timetable.deleteMany({
                where: {
                    department,
                    section,
                    semester
                }
            });

            // 2. Insert new entries
            if (entries.length > 0) {
                // Map frontend time slot format to DB model
                const dbEntries = entries.map((entry: any) => ({
                    department,
                    section,
                    semester,
                    subject: entry.subject,
                    facultyId: entry.facultyId,
                    classroom: entry.room,
                    floor: entry.floor || "1st", // Default if missing
                    day: entry.day,
                    startTime: entry.time.split(" - ")[0], // "09:00"
                    endTime: entry.time.split(" - ")[1],   // "10:00"
                }));

                await tx.timetable.createMany({
                    data: dbEntries
                });
            }
        });

        return NextResponse.json({ message: "Timetable updated successfully" });

    } catch (error) {
        console.error("Error saving timetable:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
