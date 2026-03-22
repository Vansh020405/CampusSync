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
                return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
            case 'COMPLETED':
                return "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
            default:
                return "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30"
        }
    }

    const openSeatingPlan = (exam: ExamSeating) => {
        setSelectedExam(exam)
        setIsModalOpen(true)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0A0A] pb-24">
            <header className="px-4 py-6 md:px-12 md:pt-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                            <Monitor className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase  mt-0.5">Examination</h1>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60 ">Evaluation Hub â€¢ Sync Active</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-card p-2 pr-6 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none transition-transform hover:scale-110">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Exams</p>
                            <p className="text-lg font-black text-slate-900 dark:text-foreground leading-none">{exams.length}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Loading Exams...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-3xl p-12 text-center shadow-sm dark:shadow-none">
                        <div className="h-20 w-20 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-muted-foreground/30">
                            <Calendar className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-foreground uppercase  tracking-tight mb-2">Void Assessment Cache</h3>
                        <p className="text-slate-500 dark:text-muted-foreground max-w-sm mx-auto text-[10px] leading-relaxed uppercase tracking-tight font-medium opacity-70">
                            No active examination protocols detected for your current sector.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {exams.map((exam, index) => {
                            const status = getStatus(exam.date)
                            return (
                                <motion.div
                                    key={exam.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="group bg-white dark:bg-card border-0 dark:border dark:border-border rounded-2xl p-5 shadow-sm dark:shadow-none hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:bg-muted/50 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="relative space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "px-5 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.15em]",
                                                getStatusStyles(status)
                                            )}>
                                                {status}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-muted rounded-xl border border-slate-100 dark:border-border">
                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                                <span className="text-[9px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-wider">
                                                    {exam.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 uppercase tracking-tighter">
                                                {exam.subject}
                                            </h3>
                                            <div className="flex items-center gap-3 text-slate-400 dark:text-muted-foreground group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                                                <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                                <span className="text-xs font-black uppercase tracking-widest">
                                                    {new Date(exam.date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 dark:border-border/50">
                                            <div className="space-y-1.5">
                                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]">Time</p>
                                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                    <Clock className="h-4 w-4 text-indigo-500/50" />
                                                    <span className="text-sm font-black ">{exam.startTime}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 text-right">
                                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]">Duration</p>
                                                <div className="flex items-center gap-2 justify-end text-slate-700 dark:text-slate-200 font-black">
                                                    <span className="text-sm">{exam.duration}</span>
                                                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-slate-50 dark:bg-muted rounded-2xl flex items-center justify-center text-slate-400 dark:text-muted-foreground group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all duration-300 shadow-inner">
                                                    <MapPin className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-0.5">Information</p>
                                                    <p className="text-xs font-black text-slate-900 dark:text-foreground uppercase tracking-tight">
                                                        {exam.room} <span className="text-indigo-300 dark:text-indigo-500 mx-1">/</span> {exam.hall || 'MAIN'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-0.5">Room</p>
                                                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 leading-none tracking-tighter ">{exam.seatNo}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openSeatingPlan(exam)}
                                            className="w-full py-4 bg-slate-900 dark:bg-muted dark:hover:bg-primary dark:hover:text-white text-white dark:text-foreground rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden relative shadow-xl shadow-slate-200 dark:shadow-none"
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                expand seating plan
                                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
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
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative w-full max-w-lg bg-white dark:bg-card border-0 dark:border dark:border-border rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="p-8 md:p-12">
                                <header className="flex items-center justify-between mb-10">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em]">Institutional Asset #104</p>
                                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-foreground uppercase  tracking-tighter leading-none">
                                            Venue <span className="text-indigo-600 dark:text-indigo-400 not-">Intel</span>
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="h-14 w-14 bg-slate-50 dark:bg-muted rounded-[2rem] flex items-center justify-center text-slate-400 dark:text-muted-foreground hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-all active:scale-90"
                                    >
                                        <AlertCircle className="h-7 w-7" />
                                    </button>
                                </header>

                                <div className="space-y-6 md:space-y-8">
                                    <div className="bg-slate-50 dark:bg-muted/50 rounded-[3rem] p-6 md:p-8 grid grid-cols-2 gap-8 shadow-inner">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white dark:bg-card rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">Block</p>
                                                    <p className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">{selectedExam.block || 'INT'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white dark:bg-card rounded-2xl shadow-sm flex items-center justify-center text-indigo-500">
                                                    <Layers className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">Floor</p>
                                                    <p className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">{selectedExam.floor || 'G'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white dark:bg-card rounded-2xl shadow-sm flex items-center justify-center text-emerald-500">
                                                    <MapPin className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">Sector</p>
                                                    <p className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">{selectedExam.room}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-white dark:bg-card rounded-2xl shadow-sm flex items-center justify-center text-amber-500">
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-0.5 opacity-60">Position</p>
                                                    <p className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">{selectedExam.seatNo}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-600 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                                        <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                                        <div className="relative flex items-center justify-between">
                                            <div className="space-y-2">
                                                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight leading-none ">{selectedExam.subject}</h4>
                                                <p className="text-[9px] md:text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em] opacity-80">Verification Secured</p>
                                            </div>
                                            <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-white/50" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full mt-10 py-5 bg-slate-900 dark:bg-primary text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:translate-y-px transition-all duration-300"
                                >
                                    AUTHORIZE DISMISSAL
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
