'use client'

import Link from "next/link"
import {
    Users,
    CheckCircle,
    User,
    Settings,
    HelpCircle,
    LayoutGrid,
    Calendar,
    BookOpen,
    Clock,
    Palmtree,
    Activity,
    Fingerprint,
    Shield,
    FileText,
    Zap,
    Cpu,
    LucideIcon
} from "lucide-react"
import { motion } from "framer-motion"

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    color: string;
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

export default function FacultyMenuPage() {
    const menuGroups: MenuGroup[] = [
        {
            title: "Sector Operations",
            items: [
                { href: "/faculty/leave", label: "Absence Hub", icon: Palmtree, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
                { href: "/faculty/student-leaves", label: "Cadet Leaves", icon: FileText, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
                { href: "/faculty/attendance", label: "Roster Sync", icon: CheckCircle, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400" },
                { href: "/faculty/availability", label: "Mission Grid", icon: Calendar, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
                { href: "/faculty/syllabus", label: "Blueprint", icon: BookOpen, color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
                { href: "/faculty/students", label: "Unit Ledger", icon: Users, color: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" },
                { href: "/faculty/exams", label: "Evaluation", icon: Fingerprint, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" },
                { href: "/faculty/grades", label: "Matrix Scores", icon: LayoutGrid, color: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400" },
            ]
        },
        {
            title: "Internal Systems",
            items: [
                { href: "/faculty/profile", label: "Identity Hub", icon: User, color: "bg-slate-100 text-slate-600 dark:bg-muted dark:text-white" },
                { href: "/faculty/settings", label: "Base Config", icon: Settings, color: "bg-slate-100 text-slate-600 dark:bg-muted dark:text-white" },
                { href: "/faculty/help", label: "Direct Sync", icon: HelpCircle, color: "bg-slate-100 text-slate-600 dark:bg-muted dark:text-white" },
            ]
        }
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04
            }
        }
    }

    const itemAnim = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        show: { opacity: 1, scale: 1, y: 0 }
    }

    return (
        <div className="max-w-md mx-auto space-y-10 pb-40 pt-10 min-h-screen bg-white dark:bg-background font-sans transition-colors animate-in fade-in duration-500">
            <header className="px-8 flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-1">
                    <div className="flex items-center gap-2 mb-1 px-0.5">
                        <Zap className="h-4 w-4 text-slate-900 dark:text-indigo-400 fill-slate-900/10" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ">System Primary</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-foreground uppercase  leading-none">Command Hub</h1>
                </div>
                <div className="h-14 w-14 rounded-[2rem] bg-slate-900 dark:bg-card text-white dark:text-foreground flex items-center justify-center shadow-2xl relative z-10 group hover:rotate-6 transition-transform">
                    <Cpu className="h-7 w-7 group-hover:scale-110 transition-transform" />
                </div>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-10 px-6"
            >
                {menuGroups.map((group, gIdx) => ( group.items.length > 0 && (
                    <section key={gIdx} className="space-y-5">
                        <div className="flex items-center gap-3 px-2 opacity-60">
                            <div className="h-4 w-1 bg-slate-900 dark:bg-indigo-500 rounded-full" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground ">
                                {group.title}
                            </h2>
                        </div>
                        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
                            {group.items.map((item, iIdx) => {
                                const Icon = item.icon
                                return (
                                    <motion.div key={iIdx} variants={itemAnim}>
                                        <Link
                                            href={item.href}
                                            className="flex flex-col items-center gap-3 group"
                                        >
                                            <div className={`${item.color} w-full aspect-square rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-black/20 border-2 border-transparent group-hover:border-current group-hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden`}>
                                                <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                                                <Icon className="w-8 h-8 md:w-10 md:h-10 stroke-[2] group-hover:rotate-12 transition-transform" />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 dark:text-muted-foreground text-center truncate w-full px-1 uppercase tracking-tight  opacity-60 group-hover:opacity-100 transition-opacity">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </section>
                )))}
            </motion.div>

            {/* Bottom Status Hub */}
            <div className="flex justify-center pt-4 px-8">
                <div className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-slate-50 dark:bg-muted/30 border border-slate-100 dark:border-border/50 rounded-[2.5rem] shadow-inner">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ">Link Status: SECURE</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                         <Activity className="h-3 w-3 text-indigo-500" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ">24ms LINK</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
