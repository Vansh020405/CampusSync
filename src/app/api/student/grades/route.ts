import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic"; // Bypass Next.js static caching

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const studentId = session.user.id;

        const grades = await prisma.grade.findMany({
            where: { studentId: studentId },
            orderBy: [{ semester: 'asc' }, { subjectCode: 'asc' }]
        });

        const riskScores = await prisma.riskScore.findMany({
            where: { studentId: studentId }
        });

        // ---------------------------------------------------------
        // DYAMICALLY RECALCULATE RISK SCORE BASED ON LIVE ATTENDANCE
        // ---------------------------------------------------------
        const attendanceRecords = await prisma.studentAttendance.findMany({
            where: { studentId: studentId }
        });

        const subjectAttendance: Record<string, { present: number, total: number }> = {};
        attendanceRecords.forEach((record: any) => {
            if (!subjectAttendance[record.subject]) {
                subjectAttendance[record.subject] = { present: 0, total: 0 };
            }
            subjectAttendance[record.subject].total += 1;
            if (record.status === 'PRESENT') {
                subjectAttendance[record.subject].present += 1;
            }
        });

        const updatedRiskScores = riskScores.map((rs: any) => {
            // Extract 'academicPerf' component algebraically from stored RiskScore
            // Logic: RiskScore = (1 - (academicPerf * 0.7 + attendanceScore * 0.3)) * 100
            // WeightedScore = 1 - (rs.riskScore / 100)
            // academicPerf * 0.7 = WeightedScore - (attendanceScore * 0.3)
            const oldAttendancePerc = rs.attendance ?? 100;
            const oldAttendanceScore = oldAttendancePerc / 100;
            const weightedScore = 1 - (rs.riskScore / 100);
            const academicPerfPart = weightedScore - (oldAttendanceScore * 0.3);
            const academicPerf = Math.min(1, Math.max(0, academicPerfPart / 0.7));

            let reqMarks = rs.requiredMarks;

            // Calculate dynamic marks based on existing grades if available
            const subjectGrade = grades.find(g => g.subjectName === rs.subjectName);
            if (subjectGrade) {
                let currentMarks = 0;
                if (subjectGrade.internalMarks != null) {
                    currentMarks += subjectGrade.internalMarks;
                } else {
                    if (subjectGrade.st1Marks != null) currentMarks += subjectGrade.st1Marks;
                    if (subjectGrade.st2Marks != null) currentMarks += subjectGrade.st2Marks;
                }

                const neededForPass = Math.max(0, 40 - currentMarks);
                const neededForO = Math.max(0, 90 - currentMarks);

                if (subjectGrade.totalMarks != null && subjectGrade.totalMarks > 0) {
                    reqMarks = `Total Score: ${Math.round(subjectGrade.totalMarks)} | Status: ${subjectGrade.totalMarks >= 40 ? 'Passed' : 'Failed'}`;
                } else {
                    reqMarks = `To Pass (>40): ${neededForPass} marks | For 'O' (>90): ${neededForO} marks`;
                }
            } else {
                reqMarks = `To Pass (>40): 40 marks | For 'O' (>90): 90 marks`;
            }

            const attn = subjectAttendance[rs.subjectName];
            let attendancePerc = 0;
            let reqAtt = "No attendance data yet";

            if (attn && attn.total > 0) {
                const totalClasses = attn.total;
                const attendedClasses = attn.present;
                attendancePerc = (attendedClasses / totalClasses) * 100;

                const classesNeeded = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);
                if (classesNeeded > 0) {
                    reqAtt = `Attend next ${classesNeeded} classes to hit 75%`;
                } else {
                    const canSkip = Math.floor(attendedClasses - (0.75 * totalClasses));
                    reqAtt = canSkip > 0 ? `Safe: Can skip ${canSkip} classes max` : "Attendance is currently Safe";
                }
            }

            const newAttendanceScore = attendancePerc / 100;
            let newWeightedScore = (academicPerf * 0.7) + (newAttendanceScore * 0.3);
            let newFinalRiskScore = Math.min(100, Math.max(0, (1 - newWeightedScore) * 100));

            let newRiskCategory = "Safe";
            if (newFinalRiskScore > 70) newRiskCategory = "High Risk";
            else if (newFinalRiskScore > 40) newRiskCategory = "Moderate";

            return {
                ...rs,
                riskScore: newFinalRiskScore,
                riskCategory: newRiskCategory,
                attendance: attendancePerc,
                requiredAttendance: reqAtt,
                requiredMarks: reqMarks
            };
        });

        return NextResponse.json({ grades, riskScores: updatedRiskScores });

    } catch (error) {
        console.error("GRADES_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
