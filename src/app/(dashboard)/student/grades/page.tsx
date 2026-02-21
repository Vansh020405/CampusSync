'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GraduationCap,
    TrendingUp,
    BookOpen,
    Award,
    Filter,
    Download,
    ChevronRight,
    Search,
    CreditCard,
    FileText,
    Percent
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useSession } from 'next-auth/react'

export interface RiskScore {
    subjectName: string;
    riskScore: number;
    riskCategory: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    recommendations: string;
    attendance?: number;
    requiredMarks?: string;
    requiredAttendance?: string;
    priority?: number;
}

interface Grade {
    id: string
    semester: string
    subjectName: string
    subjectCode: string
    internalMarks: number
    externalMarks: number
    totalMarks: number
    grade: string
    credits: number
    st1Marks?: number
    st1Total?: number
    st2Marks?: number
    st2Total?: number
    endTermMarks?: number
    endTermTotal?: number
}

const gradePoints: Record<string, number> = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'P': 4,
    'F': 0
}

const MOCK_GRADES: Grade[] = [
    { id: '1', semester: '1', subjectName: 'Engineering Mathematics-I', subjectCode: 'MA101', internalMarks: 34, externalMarks: 58, totalMarks: 92, grade: 'O', credits: 4, st1Marks: 28, st1Total: 30, st2Marks: 27, st2Total: 30, endTermMarks: 47, endTermTotal: 50 },
    { id: '2', semester: '1', subjectName: 'Applied Physics', subjectCode: 'PH101', internalMarks: 32, externalMarks: 52, totalMarks: 84, grade: 'A+', credits: 4, st1Marks: 25, st1Total: 30, st2Marks: 26, st2Total: 30, endTermMarks: 42, endTermTotal: 50 },
    { id: '3', semester: '1', subjectName: 'C Programming', subjectCode: 'CS101', internalMarks: 28, externalMarks: 45, totalMarks: 73, grade: 'A', credits: 3, st1Marks: 22, st1Total: 30, st2Marks: 24, st2Total: 30, endTermMarks: 38, endTermTotal: 50 },
    { id: '4', semester: '1', subjectName: 'Engineering Graphics', subjectCode: 'ME101', internalMarks: 25, externalMarks: 40, totalMarks: 65, grade: 'B+', credits: 2, st1Marks: 20, st1Total: 30, st2Marks: 21, st2Total: 30, endTermMarks: 34, endTermTotal: 50 },
    { id: '5', semester: '1', subjectName: 'English Communication', subjectCode: 'HS101', internalMarks: 35, externalMarks: 50, totalMarks: 85, grade: 'A+', credits: 2, st1Marks: 28, st1Total: 30, st2Marks: 28, st2Total: 30, endTermMarks: 45, endTermTotal: 50 },

    { id: '6', semester: '2', subjectName: 'Engineering Mathematics-II', subjectCode: 'MA102', internalMarks: 36, externalMarks: 55, totalMarks: 91, grade: 'O', credits: 4, st1Marks: 29, st1Total: 30, st2Marks: 29, st2Total: 30, endTermMarks: 48, endTermTotal: 50 },
    { id: '7', semester: '2', subjectName: 'Data Structures', subjectCode: 'CS102', internalMarks: 33, externalMarks: 58, totalMarks: 91, grade: 'O', credits: 4, st1Marks: 28, st1Total: 30, st2Marks: 28, st2Total: 30, endTermMarks: 49, endTermTotal: 50 },
    { id: '8', semester: '2', subjectName: 'Digital Logic Design', subjectCode: 'EC102', internalMarks: 31, externalMarks: 48, totalMarks: 79, grade: 'A', credits: 3, st1Marks: 24, st1Total: 30, st2Marks: 25, st2Total: 30, endTermMarks: 40, endTermTotal: 50 },
    { id: '9', semester: '2', subjectName: 'Environment Studies', subjectCode: 'ES102', internalMarks: 29, externalMarks: 42, totalMarks: 71, grade: 'A', credits: 2, st1Marks: 22, st1Total: 30, st2Marks: 23, st2Total: 30, endTermMarks: 36, endTermTotal: 50 },
    { id: '10', semester: '2', subjectName: 'Workshop Practice', subjectCode: 'ME102', internalMarks: 38, externalMarks: 50, totalMarks: 88, grade: 'A+', credits: 2, st1Marks: 29, st1Total: 30, st2Marks: 30, st2Total: 30, endTermMarks: 46, endTermTotal: 50 },

    { id: '11', semester: '3', subjectName: 'Discrete Mathematics', subjectCode: 'CS201', internalMarks: 35, externalMarks: 60, totalMarks: 95, grade: 'O', credits: 4, st1Marks: 29, st1Total: 30, st2Marks: 30, st2Total: 30, endTermMarks: 50, endTermTotal: 50 },
    { id: '12', semester: '3', subjectName: 'Operating Systems', subjectCode: 'CS202', internalMarks: 32, externalMarks: 54, totalMarks: 86, grade: 'A+', credits: 4, st1Marks: 26, st1Total: 30, st2Marks: 27, st2Total: 30, endTermMarks: 44, endTermTotal: 50 },
    { id: '13', semester: '3', subjectName: 'Computer Networks', subjectCode: 'CS203', internalMarks: 30, externalMarks: 52, totalMarks: 82, grade: 'A+', credits: 3, st1Marks: 24, st1Total: 30, st2Marks: 25, st2Total: 30, endTermMarks: 42, endTermTotal: 50 },
    { id: '14', semester: '3', subjectName: 'Software Engineering', subjectCode: 'CS204', internalMarks: 28, externalMarks: 49, totalMarks: 77, grade: 'A', credits: 3, st1Marks: 22, st1Total: 30, st2Marks: 24, st2Total: 30, endTermMarks: 39, endTermTotal: 50 },
    { id: '15', semester: '3', subjectName: 'Human Values & Ethics', subjectCode: 'HS201', internalMarks: 38, externalMarks: 55, totalMarks: 93, grade: 'O', credits: 2, st1Marks: 29, st1Total: 30, st2Marks: 30, st2Total: 30, endTermMarks: 48, endTermTotal: 50 }
]

export default function StudentGradesPage() {
    const [grades, setGrades] = useState<Grade[]>([])
    const [riskScores, setRiskScores] = useState<RiskScore[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSemester, setSelectedSemester] = useState<string>('all')
    const [error, setError] = useState<string | null>(null)
    const { data: session } = useSession()

    const downloadMarksheet = (sem?: string) => {
        const doc = new jsPDF()
        const studentInfo = session?.user as any
        const date = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })

        const gradesToProcess = sem && sem !== 'all'
            ? grades.filter(g => g.semester === sem)
            : grades

        const currentSemesters = Array.from(new Set(gradesToProcess.map(g => g.semester))).sort()

        // --- PDF Generation Logic ---

        // Page border
        doc.setDrawColor(226, 232, 240)
        doc.rect(5, 5, 200, 287)

        // University Header
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(24)
        doc.setTextColor(15, 23, 42)
        doc.text('CHITKARA UNIVERSITY', 105, 25, { align: 'center' })

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text('NH-64, Chandigarh-Patiala National Highway, Punjab 140401', 105, 31, { align: 'center' })
        doc.text('OFFICE OF THE CONTROLLER OF EXAMINATIONS', 105, 36, { align: 'center' })

        doc.setDrawColor(15, 23, 42)
        doc.setLineWidth(0.5)
        doc.line(15, 42, 195, 42)

        // Marksheet Title
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        const title = sem && sem !== 'all' ? `SEMESTER ${sem} GRADE SHEET` : 'OFFICIAL ACADEMIC TRANSCRIPT'
        doc.text(title, 105, 52, { align: 'center' })

        // Student Details Grid
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('STUDENT NAME:', 20, 65)
        doc.text('ROLL NUMBER:', 20, 72)
        doc.text('DEPARTMENT:', 20, 79)

        doc.text('ACADEMIC YEAR:', 120, 65)
        doc.text('SECTION:', 120, 72)
        doc.text('DATE OF ISSUE:', 120, 79)

        doc.setFont('helvetica', 'normal')
        doc.text(studentInfo?.name || 'N/A', 60, 65)
        doc.text(studentInfo?.rollNo || 'N/A', 60, 72)
        doc.text(studentInfo?.department || 'Computer Science Engineering', 60, 79)

        doc.text('2025-2026', 160, 65)
        doc.text(studentInfo?.section || 'N/A', 160, 72)
        doc.text(date, 160, 79)

        let currentY = 90

        currentSemesters.forEach((s, index) => {
            const semData = gradesToProcess.filter(g => g.semester === s)

            if (index > 0) {
                // Check if we need a new page or just some space
                if (currentY > 200) {
                    doc.addPage()
                    currentY = 20
                } else {
                    currentY += 10
                }
            }

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(12)
            doc.text(`SEMESTER ${s} PERFORMANCE`, 20, currentY)
            currentY += 5

            autoTable(doc, {
                startY: currentY,
                head: [['Subject Code', 'Subject Name', 'Credits', 'Int', 'Ext', 'Total', 'Grade']],
                body: semData.map(g => [
                    g.subjectCode,
                    g.subjectName,
                    g.credits,
                    g.internalMarks,
                    g.externalMarks,
                    g.totalMarks,
                    g.grade
                ]),
                theme: 'grid',
                headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
                bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 20, right: 20 },
                didDrawPage: (data) => {
                    currentY = data.cursor ? data.cursor.y : currentY
                }
            })

            currentY += 10
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(`Semester ${s} SGPA: ${calculateSGPA(semData)}`, 150, currentY)
            currentY += 5
        })

        // Final Summary
        if (currentY > 240) {
            doc.addPage()
            currentY = 30
        } else {
            currentY += 15
        }

        doc.setDrawColor(226, 232, 240)
        doc.line(20, currentY, 190, currentY)
        currentY += 10

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('FINAL PERFORMANCE SUMMARY', 20, currentY)

        currentY += 10
        doc.setFontSize(10)
        doc.text(`Total Credits Earned: ${calculateTotalCredits()}`, 20, currentY)
        doc.text(`Cumulative GPA (CGPA): ${calculateCGPA()}`, 130, currentY)

        // Signatures
        currentY = 260
        doc.setDrawColor(15, 23, 42)
        doc.line(20, currentY, 70, currentY)
        doc.line(140, currentY, 190, currentY)

        doc.setFontSize(8)
        doc.text('Registrar / Controller Signature', 25, currentY + 5)
        doc.text('Student Signature', 155, currentY + 5)

        // Footer Disclaimer
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184)
        doc.text('This is a computer-generated document and does not require a physical signature if verified online.', 105, 280, { align: 'center' })

        const fileName = sem && sem !== 'all'
            ? `Marksheet_Sem${sem}_${studentInfo?.rollNo || 'Student'}.pdf`
            : `Transcript_${studentInfo?.rollNo || 'Student'}.pdf`

        doc.save(fileName)
    }

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const res = await fetch('/api/student/grades')
                if (res.ok) {
                    const data = await res.json()
                    if (data && data.grades) {
                        setGrades(data.grades)
                        const scores = data.riskScores || [];
                        setRiskScores(scores);

                        // If student is in a new semester (e.g. 4) but table is empty, 
                        // we might want to default the view to that semester.
                        // However, 'all' is safer for now.

                        // Backlog Warning Trigger
                        const highRiskSubjects = scores.filter((s: any) => s.riskCategory === 'High Risk');
                        if (highRiskSubjects.length > 0) {
                            setTimeout(() => {
                                toast.error("BACKLOG WARNING", {
                                    description: `You are trending toward backlogs in ${highRiskSubjects.length} subject(s). Check the Risk Engine for priority actions.`,
                                    duration: 8000,
                                });
                            }, 1000);
                        }
                    } else if (Array.isArray(data)) {
                        setGrades(data)
                    }
                }
            } catch (err) {
                console.log('Error fetching grades:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchGrades()
    }, [])

    const semesters = Array.from(new Set(grades.map(g => g.semester))).sort()

    const calculateSGPA = (semesterGrades: Grade[]) => {
        if (semesterGrades.length === 0) return 0

        // Only include subjects where all marks are uploaded
        const validGrades = semesterGrades.filter(g =>
            g.st1Marks !== null && g.st1Total !== null &&
            g.st2Marks !== null && g.st2Total !== null &&
            g.endTermMarks !== null && g.endTermTotal !== null
        )

        if (validGrades.length === 0) return '-'

        const totalPoints = validGrades.reduce((acc, curr) => acc + (gradePoints[curr.grade] || 0) * curr.credits, 0)
        const totalCredits = validGrades.reduce((acc, curr) => acc + curr.credits, 0)
        return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2)
    }

    const calculateCGPA = () => {
        if (grades.length === 0) return 0

        // Only include subjects where all marks are uploaded
        const validGrades = grades.filter(g =>
            g.st1Marks !== null && g.st1Total !== null &&
            g.st2Marks !== null && g.st2Total !== null &&
            g.endTermMarks !== null && g.endTermTotal !== null
        )

        if (validGrades.length === 0) return '-'

        const totalPoints = validGrades.reduce((acc, curr) => acc + (gradePoints[curr.grade] || 0) * curr.credits, 0)
        const totalCredits = validGrades.reduce((acc, curr) => acc + curr.credits, 0)
        return totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2)
    }

    const calculateTotalCredits = () => {
        // Only count credits for subjects where all marks are uploaded
        const validGrades = grades.filter(g =>
            g.st1Marks !== null && g.st1Total !== null &&
            g.st2Marks !== null && g.st2Total !== null &&
            g.endTermMarks !== null && g.endTermTotal !== null
        )
        return validGrades.reduce((acc, curr) => acc + curr.credits, 0)
    }

    const getComponentPercentage = (marks?: number, total?: number) => {
        if (marks === undefined || total === undefined || marks === null || total === null) return '-';
        if (total === 0) return '-';
        return ((marks / total) * 100).toFixed(1) + '%';
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'O':
            case 'A+': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
            case 'A':
            case 'B+': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'B': return 'bg-amber-50 text-amber-600 border-amber-100'
            default: return 'bg-rose-50 text-rose-600 border-rose-100'
        }
    }

    const filteredGrades = selectedSemester === 'all'
        ? grades
        : grades.filter(g => g.semester === selectedSemester)

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                        Analyzing Records...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header section with Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <GraduationCap className="h-8 w-8 text-emerald-600" />
                        ACADEMIC PERFORMANCE
                    </h1>
                    <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px] ml-1">
                        Results and Grade Analytics
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => downloadMarksheet(selectedSemester)}
                        className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        {selectedSemester === 'all' ? 'TRANSCRIPT' : 'DOWNLOAD PDF'}
                    </button>
                    <button className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100" onClick={() => toast("Redirecting to Exam Strategy Builder (Beta)...")}>
                        <FileText className="h-4 w-4" />
                        BUILD STRATEGY
                    </button>
                    <button className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100">
                        <TrendingUp className="h-4 w-4" />
                        PROJECTION
                    </button>
                </div>
            </div>

            {/* Performance Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4"
            >
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5">
                    <div className="h-16 w-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <Award className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cumulative GPA</p>
                        <h2 className="text-4xl font-black text-slate-900 leading-none">{calculateCGPA()}</h2>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase mt-1 inline-block">Current Standing</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5">
                    <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <TrendingUp className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest SGPA</p>
                        <h2 className="text-4xl font-black text-slate-900 leading-none">
                            {semesters.length > 0 ? calculateSGPA(grades.filter(g => g.semester === semesters[semesters.length - 1])) : '0.0'}
                        </h2>
                        <span className="text-[10px] text-blue-600 font-bold uppercase mt-1 inline-block">Semester {semesters[semesters.length - 1] || 'N/A'}</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits Earned</p>
                        <h2 className="text-4xl font-black text-slate-900 leading-none">{calculateTotalCredits()}</h2>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase mt-1 inline-block">Standing: Excellent</span>
                    </div>
                </div>
            </motion.div>

            {/* Removed Backlog Prevention Engine Section */}



            {/* Filter Controls */}
            <div className="flex items-center justify-between px-6">
                <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedSemester('all')}
                        className={cn(
                            "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            selectedSemester === 'all'
                                ? "bg-slate-900 text-white shadow-xl scale-105"
                                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        All Terms
                    </button>
                    {semesters.map(sem => (
                        <button
                            key={sem}
                            onClick={() => setSelectedSemester(sem)}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                selectedSemester === sem
                                    ? "bg-emerald-600 text-white shadow-xl scale-105"
                                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            Semester {sem}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grades Display */}
            <div className="px-4 space-y-8">
                {error ? (
                    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] text-center">
                        <p className="text-rose-600 font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {(selectedSemester === 'all' ? semesters : [selectedSemester]).map(sem => {
                            const semGrades = grades.filter(g => g.semester === sem)
                            if (semGrades.length === 0) return null

                            return (
                                <motion.div
                                    key={sem}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                                                S{sem}
                                            </div>
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                                                Semester {sem} Results
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SGPA:</span>
                                                <span className="text-sm font-black text-emerald-600 leading-none">{calculateSGPA(semGrades)}</span>
                                            </div>
                                            <button
                                                onClick={() => downloadMarksheet(sem)}
                                                className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center gap-2"
                                                title="Download Semester Marksheet"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                <span className="text-[10px] font-bold uppercase">PDF</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject Detail</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Credits</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">ST1</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">ST2</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">EndTerm</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Total</th>
                                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {semGrades.map((grade, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                                            <td className="px-6 py-5">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                                                                        {grade.subjectName}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                                        ID: {grade.subjectCode}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className="text-xs font-black text-slate-600">{grade.credits}</span>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-xs font-bold text-slate-500">{grade.st1Marks ?? '-'} <span className="text-[10px] text-slate-400">/ {grade.st1Total ?? '-'}</span></span>
                                                                    {grade.st1Marks != null && grade.st1Total != null && (
                                                                        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-1 rounded mt-0.5">{getComponentPercentage(grade.st1Marks, grade.st1Total)}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-xs font-bold text-slate-500">{grade.st2Marks ?? '-'} <span className="text-[10px] text-slate-400">/ {grade.st2Total ?? '-'}</span></span>
                                                                    {grade.st2Marks != null && grade.st2Total != null && (
                                                                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-1 rounded mt-0.5">{getComponentPercentage(grade.st2Marks, grade.st2Total)}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-xs font-bold text-slate-500">{grade.endTermMarks ?? '-'} <span className="text-[10px] text-slate-400">/ {grade.endTermTotal ?? '-'}</span></span>
                                                                    {grade.endTermMarks != null && grade.endTermTotal != null && (
                                                                        <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1 rounded mt-0.5">{getComponentPercentage(grade.endTermMarks, grade.endTermTotal)}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <div className="inline-flex flex-col items-center">
                                                                    <span className="text-sm font-black text-slate-800">{grade.totalMarks}</span>
                                                                    <div className="w-8 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                                        <div className="h-full bg-emerald-500" style={{ width: `${grade.totalMarks}%` }} />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className={cn(
                                                                    "px-3 py-1 rounded-lg text-[10px] font-black border tracking-wider",
                                                                    getGradeColor(grade.grade)
                                                                )}>
                                                                    {grade.grade}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Action Accents */}
            <div className="p-12 text-center space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Official Academic Disclaimer</p>
                <div className="max-w-2xl mx-auto h-px bg-slate-100" />
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed max-w-lg mx-auto uppercase tracking-widest">
                    This performance summary is for reference only and does not constitute an official university transcript.
                    Please contact the registrar for verified documentation.
                </p>
            </div>
        </div>
    )
}
