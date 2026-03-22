import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const facultyId = (session.user as any).id;
        const body = await request.json();
        const { grades } = body;

        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            return NextResponse.json({ error: "No grades provided" }, { status: 400 });
        }

        // Create a new GradeVersion
        const versionId = `V-${Date.now()}`;
        const newVersion = await (prisma as any).gradeVersion.create({
            data: {
                versionId,
                facultyId
            }
        });

        // Insert / Update each grade and risk score
        const processes = grades.map(async (row) => {
            // Find student by RollNumber - Handle case sensitivity and whitespace
            const rawRoll = row.RollNumber?.toString().trim();
            const student = await prisma.student.findUnique({
                where: { rollNo: rawRoll }
            });

            if (!student) {
                console.warn(`[GRADES_DEPLOY] Student with RollNumber ${rawRoll} not found. Skipping.`);
                return null;
            }

            const pFloat = (val: any) => val ? parseFloat(val) : null;

            const st1M = pFloat(row.ST1Marks);
            const st1T = pFloat(row.ST1TotalMarks);
            const st2M = pFloat(row.ST2Marks);
            const st2T = pFloat(row.ST2TotalMarks);
            const etM = pFloat(row.EndTermMarks);
            const etT = pFloat(row.EndTermTotalMarks);

            const internalM = Math.round((st1M || 0) + (st2M || 0));
            const externalM = Math.round(etM || 0);
            const totalM = internalM + externalM;

            // Upsert Grade in schema
            await (prisma as any).grade.upsert({
                where: {
                    studentId_subjectName: {
                        studentId: student.id,
                        subjectName: row.Subject
                    }
                },
                update: {
                    st1Marks: st1M,
                    st1Total: st1T,
                    st2Marks: st2M,
                    st2Total: st2T,
                    endTermMarks: etM,
                    endTermTotal: etT,
                    internalMarks: internalM,
                    externalMarks: externalM,
                    totalMarks: totalM,
                    grade: row.Grade || "-",
                    credits: parseInt(row.Credits) || 3,
                    versionId: newVersion.id
                },
                create: {
                    studentId: student.id,
                    semester: student.semester || "1",
                    subjectName: row.Subject,
                    subjectCode: "DEPTSUBJ",
                    st1Marks: st1M,
                    st1Total: st1T,
                    st2Marks: st2M,
                    st2Total: st2T,
                    endTermMarks: etM,
                    endTermTotal: etT,
                    internalMarks: internalM,
                    externalMarks: externalM,
                    totalMarks: totalM,
                    grade: row.Grade || "-",
                    credits: parseInt(row.Credits) || 3,
                    versionId: newVersion.id
                }
            });

            // Advanced Backlog Prevention Engine
            let totalObtained = 0;
            let totalMax = 0;
            let componentCount = 0;

            if (st1M != null && st1T != null) { totalObtained += st1M; totalMax += st1T; componentCount++; }
            if (st2M != null && st2T != null) { totalObtained += st2M; totalMax += st2T; componentCount++; }
            if (etM != null && etT != null) { totalObtained += etM; totalMax += etT; componentCount++; }

            const academicWeight = 0.7;
            const attendanceWeight = 0.3;

            let academicPerf = totalMax > 0 ? (totalObtained / totalMax) : 0.75;

            // Fetch current attendance
            const attendanceAgg = await prisma.studentAttendance.aggregate({
                where: { studentId: student.id, subject: row.Subject },
                _count: { status: true }
            });
            const attendancePresent = await prisma.studentAttendance.count({
                where: { studentId: student.id, subject: row.Subject, status: 'PRESENT' }
            });

            let attendancePerc = attendanceAgg._count.status > 0 ? (attendancePresent / attendanceAgg._count.status) * 100 : 100;
            let attendanceScore = attendancePerc / 100;

            // Calculate overall risk (0 = Safe, 1 = Max Risk)
            // Risk = (1 - Weighted Score)
            let weightedScore = (academicPerf * academicWeight) + (attendanceScore * attendanceWeight);
            let finalRiskScore = Math.min(100, Math.max(0, (1 - weightedScore) * 100));

            // Determine Trend based on latest component
            let trend = "STABLE";
            if (componentCount > 1 && st2M != null && st2T != null && st1M != null && st1T != null) {
                const st2Ratio = st2T > 0 ? st2M / st2T : 0;
                const st1Ratio = st1T > 0 ? st1M / st1T : 0;
                if (st2Ratio < st1Ratio) trend = "UP";
                else if (st2Ratio > st1Ratio) trend = "DOWN";
            }

            let riskCategory = "Safe";
            if (finalRiskScore > 70) riskCategory = "High Risk";
            else if (finalRiskScore > 40) riskCategory = "Moderate";

            // Intelligent Recommendations & Next Target
            const totalClasses = attendanceAgg._count.status;
            const attendedClasses = attendancePresent;
            let reqAtt = "Maintain >75% attendance";

            if (totalClasses > 0) {
                const classesNeeded = Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25);
                if (classesNeeded > 0) {
                    reqAtt = `Attend next ${classesNeeded} classes to hit 75%`;
                } else {
                    const canSkip = Math.floor(attendedClasses - (0.75 * totalClasses));
                    reqAtt = canSkip > 0 ? `Safe: Can skip ${canSkip} classes max` : "Attendance is currently Safe";
                }
            }

            // Target Marks Scenarios based on current performance
            let reqMarks = "9.0 GPA: 85% | 8.0 GPA: 70% | 7.0 GPA: 55%";
            if (academicPerf < 0.6) {
                reqMarks = "9.0 GPA: 95% | 8.0 GPA: 85% | 7.0 GPA: 75%";
            } else if (academicPerf > 0.85) {
                reqMarks = "9.0 GPA: 70% | 8.0 GPA: 55% | 7.0 GPA: 45%";
            }

            let priority = Math.floor(finalRiskScore / 10);

            let recommendations = academicPerf < 0.5 ? "Focus on remedial sessions for core concepts." : "Performance is stable, focus on consistency.";
            if (attendancePerc < 75) recommendations += " Attendance is critically low.";

            // Upsert RiskScore
            await (prisma as any).riskScore.upsert({
                where: {
                    studentId_subjectName: {
                        studentId: student.id,
                        subjectName: row.Subject
                    }
                },
                update: {
                    riskScore: finalRiskScore,
                    riskCategory,
                    trend,
                    attendance: attendancePerc,
                    requiredMarks: reqMarks,
                    requiredAttendance: reqAtt,
                    priority,
                    recommendations
                },
                create: {
                    studentId: student.id,
                    subjectName: row.Subject,
                    riskScore: finalRiskScore,
                    riskCategory,
                    trend,
                    attendance: attendancePerc,
                    requiredMarks: reqMarks,
                    requiredAttendance: reqAtt,
                    priority,
                    recommendations
                }
            });

            return true;
        });

        await Promise.all(processes);

        return NextResponse.json({ success: true, versionId });
    } catch (error) {
        console.error("Grades deployment error:", error);
        return NextResponse.json({ error: "Failed to deploy grades" }, { status: 500 });
    }
}
