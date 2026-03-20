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
        <div className="max-w-md mx-auto space-y-8 pb-12 pt-4">
            <header className="px-4">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-foreground">Apps</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Explore all features</p>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {menuGroups.map((group, gIdx) => (
                    <section key={gIdx} className="px-4 space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ml-1">
                            {group.title}
                        </h2>
                        <div className="grid grid-cols-4 gap-3">
                            {group.items.map((item, iIdx) => {
                                const Icon = item.icon
                                return (
                                    <motion.div key={iIdx} variants={itemAnim}>
                                        <Link
                                            href={item.href}
                                            className="flex flex-col items-center gap-2 group"
                                        >
                                            <div className={`${item.color} w-full aspect-square rounded-[1.75rem] flex items-center justify-center shadow-sm dark:shadow-none border border-slate-100 dark:border-border/50 group-active:scale-95 transition-all duration-200`}>
                                                <Icon className="w-6 h-6 stroke-[2.25]" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-foreground/80 text-center truncate w-full px-1">
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
