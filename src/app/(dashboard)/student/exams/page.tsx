'use client'

import React, { useEffect, useState } from 'react'
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronRight,
    Search,
    BadgeCheck,
    AlertCircle,
    CheckCircle2,
    Building2,
    Layers,
    Monitor,
    LayoutDashboard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface ExamSeating {
    id: string
    subject: string
    date: string
    startTime: string
    endTime: string
    duration: string
    type: string
    room: string
    hall: string | null
    block: string | null
    floor: string | null
    seatNo: string
}

export default function StudentExamsPage() {
    const { data: session } = useSession()
    const [exams, setExams] = useState<ExamSeating[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedExam, setSelectedExam] = useState<ExamSeating | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await fetch('/api/student/exams')
                if (response.ok) {
                    const data = await response.json()
                    setExams(data)
                }
            } catch (error) {
                console.error("Failed to fetch exams:", error)
            } finally {
                setLoading(false)
            }
        }

        if (session) {
            fetchExams()
        }
    }, [session])

    const getStatus = (dateStr: string) => {
        const examDate = new Date(dateStr)
        const today = new Date()

        // Reset time for comparison
        examDate.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        if (examDate.getTime() === today.getTime()) return 'TODAY'
        if (examDate < today) return 'COMPLETED'
        return 'UPCOMING'
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'TODAY':
                return "bg-amber-100 text-amber-700 border-amber-200"
            case 'COMPLETED':
                return "bg-emerald-100 text-emerald-700 border-emerald-200"
            default:
                return "bg-indigo-100 text-indigo-700 border-indigo-200"
        }
    }

    const openSeatingPlan = (exam: ExamSeating) => {
        setSelectedExam(exam)
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <header className="px-6 py-8 md:px-12 md:pt-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                            <Monitor className="h-3 w-3" /> Examination Hub
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">
                            Exam <span className="text-indigo-600 not-italic">Schedule</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg">
                            Track your upcoming examinations, venue details, and seating arrangements in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Exams</p>
                            <p className="text-lg font-black text-slate-900 leading-none">{exams.length}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Exam Assets...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-sm">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Calendar className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Exams Found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm">
                            There are currently no examinations scheduled for your section. Check back later for updates.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map((exam, index) => {
                            const status = getStatus(exam.date)
                            return (
                                <motion.div
                                    key={exam.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white border border-slate-100 rounded-[1.5rem] p-4 md:p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Glass Decor */}
                                    <div className="absolute -right-8 -top-8 h-24 w-24 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors" />

                                    <div className="relative space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest",
                                                getStatusStyles(status)
                                            )}>
                                                {status}
                                            </div>
                                            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {exam.type}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 uppercase tracking-tight">
                                                {exam.subject}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                                <span className="text-xs font-bold uppercase tracking-tight">
                                                    {new Date(exam.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-50">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold">{exam.startTime}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <BadgeCheck className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold">{exam.duration}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Venue</p>
                                                    <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                                                        {exam.room} <span className="text-indigo-200 mx-1">/</span> {exam.hall || 'Main'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seat</p>
                                                <p className="text-lg font-black text-indigo-600 leading-none">{exam.seatNo}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openSeatingPlan(exam)}
                                            className="w-full py-3 md:py-4 bg-slate-50 hover:bg-slate-900 text-slate-500 hover:text-white rounded-xl md:rounded-[1.25rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                        >
                                            View Seating Plan
                                            <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Seating Plan Modal */}
            <AnimatePresence>
                {isModalOpen && selectedExam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 md:p-10">
                                <header className="flex items-center justify-between mb-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Seating Asset #104</p>
                                        <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                                            Venue <span className="text-indigo-600 not-italic">Intelligence</span>
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <AlertCircle className="h-6 w-6" />
                                    </button>
                                </header>

                                <div className="space-y-4 md:space-y-6">
                                    <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] p-4 md:p-6 grid grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Block</p>
                                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{selectedExam.block || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                                                    <Layers className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Floor</p>
                                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{selectedExam.floor || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room #</p>
                                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{selectedExam.room}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Position</p>
                                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Seat {selectedExam.seatNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-600 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        <div className="relative flex items-center justify-between">
                                            <div>
                                                <h4 className="text-base md:text-lg font-black uppercase tracking-tight leading-none mb-1">{selectedExam.subject}</h4>
                                                <p className="text-[8px] md:text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Final Verification Complete</p>
                                            </div>
                                            <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-white opacity-40" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full mt-6 md:mt-10 py-4 md:py-5 bg-slate-900 text-white rounded-2xl md:rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:scale-[0.98] transition-all"
                                >
                                    Dismiss Portal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
