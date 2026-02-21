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
            const oldAttendancePerc = rs.attendance ?? 100;
            const oldAttendanceScore = oldAttendancePerc / 100;
            const academicPerfTimesPoint6 = 1 - (rs.riskScore / 100) - (oldAttendanceScore * 0.4);
            const academicPerf = Math.min(1, Math.max(0, academicPerfTimesPoint6 / 0.6));

            // Default fallback calculation for reqMarks for legacy records
            let reqMarks = rs.requiredMarks;
            if (!reqMarks || !reqMarks.includes('|')) {
                reqMarks = "9.0 GPA: 85% | 8.0 GPA: 70% | 7.0 GPA: 55%";
                if (academicPerf < 0.6) {
                    reqMarks = "9.0 GPA: 95% | 8.0 GPA: 85% | 7.0 GPA: 75%";
                } else if (academicPerf > 0.85) {
                    reqMarks = "9.0 GPA: 70% | 8.0 GPA: 55% | 7.0 GPA: 45%";
                }
            }

            const attn = subjectAttendance[rs.subjectName];
            if (attn && attn.total > 0) {
                const totalClasses = attn.total;
                const attendedClasses = attn.present;
                const attendancePerc = (attendedClasses / totalClasses) * 100;
                const newAttendanceScore = attendancePerc / 100;

                let newWeightedScore = academicPerfTimesPoint6 + (newAttendanceScore * 0.4);
                let newFinalRiskScore = Math.min(100, Math.max(0, (1 - newWeightedScore) * 100));

                let newRiskCategory = "Safe";
                if (newFinalRiskScore > 70) newRiskCategory = "High Risk";
                else if (newFinalRiskScore > 40) newRiskCategory = "Moderate";

                let reqAtt = "Maintain >75% attendance";
                const classesNeeded = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);
                if (classesNeeded > 0) {
                    reqAtt = `Attend next ${classesNeeded} classes to hit 75%`;
                } else {
                    const canSkip = Math.floor(attendedClasses - (0.75 * totalClasses));
                    reqAtt = canSkip > 0 ? `Safe: Can skip ${canSkip} classes max` : "Attendance is currently Safe";
                }

                return {
                    ...rs,
                    riskScore: newFinalRiskScore,
                    riskCategory: newRiskCategory,
                    attendance: attendancePerc,
                    requiredAttendance: reqAtt,
                    requiredMarks: reqMarks
                };
            }

            return {
                ...rs,
                requiredMarks: reqMarks
            };
        });

        return NextResponse.json({ grades, riskScores: updatedRiskScores });

    } catch (error) {
        console.error("GRADES_GET_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
