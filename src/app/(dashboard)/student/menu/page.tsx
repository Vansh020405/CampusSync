'use client'

import Link from "next/link"
import {
    Users,
    Briefcase,
    FileText,
    Search,
    CheckCircle,
    User,
    Settings,
    Bell,
    Shield,
    Globe,
    MessageSquare,
    HelpCircle,
    LayoutGrid,
    Award,
    Map,
    CalendarDays,
    Trophy,
    GraduationCap
} from "lucide-react"
import { motion } from "framer-motion"

export default function StudentMenuPage() {
    const menuGroups = [
        {
            title: "Academic & Campus",
            items: [
                { href: "/student/faculty", label: "Faculty", icon: Users, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
                { href: "/student/syllabus", label: "Syllabus", icon: LayoutGrid, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
                { href: "/student/attendance", label: "Attendance", icon: CheckCircle, color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" },
                { href: "/student/classes", label: "Classes", icon: GraduationCap, color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
            ]
        },
        {
            title: "Campus Utilities",
            items: [
                { href: "/student/grades", label: "Grades", icon: Award, color: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
                { href: "/student/map", label: "College Map", icon: Map, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
                { href: "/student/exams", label: "Exam Planner", icon: CalendarDays, color: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" },
                { href: "/student/achievements", label: "Achievements", icon: Trophy, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400" },
            ]
        },
        {
            title: "Personal & Support",
            items: [
                { href: "/student/profile", label: "Profile", icon: User, color: "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400" },
                { href: "/student/settings", label: "Settings", icon: Settings, color: "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400" },
                { href: "/student/notifications", label: "Alerts", icon: Bell, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400" },
                { href: "/student/help", label: "Help", icon: HelpCircle, color: "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400" },
            ]
        }
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="max-w-md mx-auto space-y-6 pb-24 pt-4 px-4 text-center">
            <header className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20 mb-2">
                    <LayoutGrid className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">System Matrix</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-foreground uppercase  mt-1">Applications</h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60">Authorized Protocol Access</p>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6 pt-2"
            >
                {menuGroups.map((group, gIdx) => (
                    <section key={gIdx} className="space-y-3">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground opacity-50 text-left pl-1">
                            {group.title}
                        </h2>
                        <div className="grid grid-cols-4 gap-3">
                            {group.items.map((item, iIdx) => {
                                const Icon = item.icon
                                return (
                                    <motion.div key={iIdx} variants={itemAnim}>
                                        <Link
                                            href={item.href}
                                            className="flex flex-col items-center gap-1.5 group"
                                        >
                                            <div className={`${item.color} w-full aspect-square rounded-2xl flex items-center justify-center shadow-sm dark:shadow-none border border-slate-100 dark:border-border/50 group-active:scale-95 transition-all duration-200`}>
                                                <Icon className="w-5 h-5 stroke-[2.5]" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 dark:text-foreground/70 text-center truncate w-full px-0.5 uppercase tracking-tighter">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </section>
                ))}
            </motion.div>

            {/* Bottom Accent */}
            <div className="flex justify-center pt-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-muted/50 rounded-full border border-slate-200/50 dark:border-border">
                    <Shield className="h-3 w-3 text-slate-400 dark:text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground">Secure Institutional Access</span>
                </div>
            </div>
        </div>
    )
}
