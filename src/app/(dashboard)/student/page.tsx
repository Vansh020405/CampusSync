'use client'

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
    Briefcase, Users, FileText, BarChart, BookOpen,
    GraduationCap, Search, CheckCircle2, LayoutDashboard,
    Clock, Calendar, UserCheck, TrendingUp, Award, Target,
    Zap, ArrowRight, Sparkles, Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export default function StudentDashboard() {
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const studentData = {
        name: session?.user?.name || "Student",
        rollNo: (session?.user as any)?.rollNo || "23-4G2-01",
        section: (session?.user as any)?.section || "4G2",
        branch: "Computer Science",
        year: "3"
    };

    // Stats data
    const stats = [
        { label: "Attendance", value: "85%", icon: CheckCircle2, color: "from-emerald-500 to-teal-600", bgColor: "bg-emerald-50", textColor: "text-emerald-700" },
        { label: "CGPA", value: "8.5", icon: Award, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-50", textColor: "text-violet-700" },
        { label: "Applications", value: "12", icon: Target, color: "from-blue-500 to-cyan-600", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    ]

    const quickActions = [
        { href: "/student/internships", label: "Internships", icon: Briefcase, gradient: "from-blue-500 to-cyan-500", description: "Browse opportunities" },
        { href: "/student/faculty", label: "Faculty", icon: Users, gradient: "from-green-500 to-emerald-500", description: "Book appointments" },
        { href: "/student/classes", label: "Classes", icon: GraduationCap, gradient: "from-purple-500 to-pink-500", description: "View timetable" },
        { href: "/student/attendance", label: "Attendance", icon: Clock, gradient: "from-orange-500 to-red-500", description: "Track records" },
        { href: "/student/syllabus", label: "Syllabus", icon: BookOpen, gradient: "from-indigo-500 to-blue-500", description: "Course content" },
        { href: "/student/resume", label: "Resume", icon: FileText, gradient: "from-pink-500 to-rose-500", description: "Build your CV" },
    ]

    return (
        <div className="min-h-screen pb-24 space-y-6">
            {/* Hero Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 shadow-2xl">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>

                <div className="relative z-10 space-y-6">
                    {/* Top Row: Greeting & Profile */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                                <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Welcome Back</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2 truncate">
                                Hey, {studentData.name.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-sm md:text-base text-white/90 font-semibold">
                                {studentData.rollNo} • Section {studentData.section}
                            </p>
                        </div>
                        <Link href="/student/profile">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all cursor-pointer shadow-lg flex-shrink-0">
                                <UserCheck className="h-6 w-6 md:h-7 md:w-7 text-white" />
                            </div>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <div
                                    key={stat.label}
                                    className={cn(
                                        "bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4 transition-all hover:bg-white/20 hover:scale-105",
                                        mounted && "animate-in slide-in-from-bottom-4 fade-in duration-500",
                                    )}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn("p-1.5 md:p-2 rounded-lg bg-white/20")}>
                                            <Icon className="h-3 w-3 md:h-4 md:w-4 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xl md:text-2xl font-black text-white mb-0.5">{stat.value}</p>
                                    <p className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-wide">{stat.label}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Branch & Year Info */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2">
                            <p className="text-xs font-bold text-white">
                                🎓 {studentData.branch}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2">
                            <p className="text-xs font-bold text-white">
                                📚 Year {studentData.year}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Zap className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                            Quick Actions
                        </h2>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">Access your tools instantly</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                            <Link
                                key={action.href}
                                href={action.href}
                                className={cn(
                                    "group transition-all active:scale-95",
                                    mounted && "animate-in slide-in-from-bottom-4 fade-in duration-500"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white h-full">
                                    {/* Gradient Background on Hover */}
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                                        action.gradient
                                    )}></div>

                                    <CardContent className="p-4 md:p-5 flex flex-col h-full">
                                        {/* Icon */}
                                        <div className={cn(
                                            "mb-3 md:mb-4 p-3 md:p-4 rounded-2xl bg-gradient-to-br shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 self-start",
                                            action.gradient
                                        )}>
                                            <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 className="font-black text-sm md:text-base text-slate-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                                                {action.label}
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                                                {action.description}
                                            </p>
                                        </div>

                                        {/* Arrow Icon */}
                                        <div className="mt-3 flex items-center justify-end">
                                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-slate-50 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 flex items-center justify-center transition-all duration-300">
                                                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Recent Activity / Notifications Placeholder */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Recent Updates
                    </h2>
                </div>
                <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base font-bold text-slate-900">You're all caught up!</p>
                                <p className="text-xs md:text-sm text-slate-600">No new notifications at the moment</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
