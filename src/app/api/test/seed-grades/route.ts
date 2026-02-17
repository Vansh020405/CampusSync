import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const students = await prisma.student.findMany();
        if (students.length === 0) {
            return NextResponse.json({ error: "No students found to seed grades" });
        }

        // Sample grades for different semesters
        const subjectsTemplate = [
            // Semester 1
            { semester: "1", subjectName: "Engineering Mathematics-I", subjectCode: "MA101", credits: 4 },
            { semester: "1", subjectName: "Applied Physics", subjectCode: "PH101", credits: 4 },
            { semester: "1", subjectName: "C Programming", subjectCode: "CS101", credits: 3 },
            { semester: "1", subjectName: "Engineering Graphics", subjectCode: "ME101", credits: 2 },
            { semester: "1", subjectName: "English Communication", subjectCode: "HS101", credits: 2 },

            // Semester 2
            { semester: "2", subjectName: "Engineering Mathematics-II", subjectCode: "MA102", credits: 4 },
            { semester: "2", subjectName: "Data Structures", subjectCode: "CS102", credits: 4 },
            { semester: "2", subjectName: "Digital Logic Design", subjectCode: "EC102", credits: 3 },
            { semester: "2", subjectName: "Environment Studies", subjectCode: "ES102", credits: 2 },
            { semester: "2", subjectName: "Workshop Practice", subjectCode: "ME102", credits: 2 },

            // Semester 3
            { semester: "3", subjectName: "Discrete Mathematics", subjectCode: "CS201", credits: 4 },
            { semester: "3", subjectName: "Operating Systems", subjectCode: "CS202", credits: 4 },
            { semester: "3", subjectName: "Computer Networks", subjectCode: "CS203", credits: 3 },
            { semester: "3", subjectName: "Software Engineering", subjectCode: "CS204", credits: 3 },
            { semester: "3", subjectName: "Human Values & Ethics", subjectCode: "HS201", credits: 2 },
        ];

        const grades_list = ["O", "A+", "A", "B+", "B", "C", "P"];

        for (const student of students) {
            // Delete existing grades for this student to avoid duplicates during re-seeding
            await prisma.grade.deleteMany({ where: { studentId: student.id } });

            for (const sub of subjectsTemplate) {
                const totalMarks = Math.floor(Math.random() * 40) + 60; // 60-100
                const internalMarks = Math.floor(Math.random() * 15) + 25; // 25-40
                const externalMarks = totalMarks - internalMarks;

                let grade = "B";
                if (totalMarks >= 90) grade = "O";
                else if (totalMarks >= 80) grade = "A+";
                else if (totalMarks >= 70) grade = "A";
                else if (totalMarks >= 60) grade = "B+";
                else if (totalMarks >= 50) grade = "B";
                else grade = "C";

                await prisma.grade.create({
                    data: {
                        studentId: student.id,
                        semester: sub.semester,
                        subjectName: sub.subjectName,
                        subjectCode: sub.subjectCode,
                        credits: sub.credits,
                        internalMarks: internalMarks,
                        externalMarks: externalMarks,
                        totalMarks: totalMarks,
                        grade: grade
                    }
                });
            }
        }

        return NextResponse.json({ message: "Grades seeded successfully for all students" });
    } catch (error) {
        console.error("SEED_GRADES_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
