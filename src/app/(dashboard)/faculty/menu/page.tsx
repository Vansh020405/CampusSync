'use client'

import Link from "next/link"
import {
    Users,
    CheckCircle,
    User,
    Settings,
    Bell,
    HelpCircle,
    LayoutGrid,
    Calendar,
    BookOpen,
    Clock,
    Palmtree,
    Activity,
    Fingerprint,
    Shield
} from "lucide-react"
import { motion } from "framer-motion"

export default function FacultyMenuPage() {
    const menuGroups = [
        {
            title: "Academic & Schedule",
            items: [
                { href: "/faculty/leave", label: "My Attendance", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
                { href: "/faculty/student-leaves", label: "Student Leaves", icon: Palmtree, color: "bg-amber-50 text-amber-600" },
                { href: "/faculty/attendance", label: "Mark Students", icon: Users, color: "bg-cyan-50 text-cyan-600" },
                { href: "/faculty/availability", label: "Schedule", icon: Calendar, color: "bg-blue-50 text-blue-600" },
                { href: "/faculty/syllabus", label: "Syllabus", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
            ]
        },
        {
            title: "Performance & Data",
            items: [
                { href: "/faculty/analytics", label: "Analytics", icon: Activity, color: "bg-rose-50 text-rose-600" },
                { href: "/faculty/students", label: "My Students", icon: Users, color: "bg-cyan-50 text-cyan-600" },
                { href: "/faculty/exams", label: "Examinations", icon: Fingerprint, color: "bg-indigo-50 text-indigo-600" },
                { href: "/faculty/grades", label: "Grades System", icon: LayoutGrid, color: "bg-fuchsia-50 text-fuchsia-600" },
            ]
        },
        {
            title: "Account & Support",
            items: [
                { href: "/faculty/profile", label: "Profile", icon: User, color: "bg-slate-100 text-slate-600" },
                { href: "/faculty/settings", label: "Settings", icon: Settings, color: "bg-slate-100 text-slate-600" },
                { href: "/faculty/help", label: "Support", icon: HelpCircle, color: "bg-slate-100 text-slate-600" },
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
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Faculty Hub</h1>
                <p className="text-sm font-medium text-slate-500">Institutional Tools & Portal</p>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {menuGroups.map((group, gIdx) => (
                    <section key={gIdx} className="px-4 space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
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
                                            <div className={`${item.color} w-full aspect-square rounded-[1.75rem] flex items-center justify-center shadow-sm border border-slate-100/50 group-active:scale-95 transition-all duration-200`}>
                                                <Icon className="w-6 h-6 stroke-[2.25]" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 text-center truncate w-full px-1">
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
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Institutional Access Verified</span>
                </div>
            </div>
        </div>
    )
}
