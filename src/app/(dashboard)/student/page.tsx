'use client'

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
    Briefcase, Users, FileText, BarChart, BookOpen,
    GraduationCap, Search, LayoutDashboard,
    Clock, UserCheck, Megaphone, Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function StudentDashboard() {
    const { data: session } = useSession()

    const studentData = {
        name: session?.user?.name || "Student",
        rollNo: (session?.user as any)?.rollNo || "23-4G2-01",
        section: (session?.user as any)?.section || "4G2",
        batch: (session?.user as any)?.batch || "Morning",
        branch: (session?.user as any)?.department || "Computer Science",
        year: (session?.user as any)?.semester || "3",
        department: (session?.user as any)?.department || "CSE"
    };

    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch(`/api/admin/broadcast?department=${studentData.department}&semester=${studentData.year}&batch=${studentData.batch}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAnnouncements(data);
                }
            } catch (e) {
                console.error("Failed to fetch announcements:", e);
            }
        };
        if (session) fetchAnnouncements();
    }, [session]);

    const tabs = [
        { href: "/student/internships", label: "Internships", icon: Briefcase, color: "text-blue-600 bg-blue-100" },
        { href: "/student/faculty", label: "Faculty", icon: Users, color: "text-green-600 bg-green-100" },
        { href: "/student/resume", label: "Resume", icon: FileText, color: "text-purple-600 bg-purple-100" },
        { href: "/student/skills", label: "Skill Gap", icon: BarChart, color: "text-orange-600 bg-orange-100" },
        { href: "/student/syllabus", label: "Syllabus", icon: BookOpen, color: "text-rose-600 bg-rose-100" },
        { href: "/student/classes", label: "Classes", icon: GraduationCap, color: "text-teal-600 bg-teal-100" },
        { href: "/student/attendance", label: "Attendance", icon: Clock, color: "text-emerald-600 bg-emerald-100" },
        { href: "/student/research", label: "Research", icon: Search, color: "text-indigo-600 bg-indigo-100" },
    ]

    return (
        <div className="space-y-6 pb-20 animate-in fade-in zoom-in duration-500">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 shadow-xl shadow-blue-500/20">
                <div className="absolute top-0 right-0 -m-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter">
                                Hello, {studentData.name.split(' ')[0]}!
                            </h1>
                            <p className="text-blue-100 text-sm font-bold opacity-80 uppercase tracking-widest mt-1">
                                {studentData.rollNo} • Section {studentData.section}
                            </p>
                        </div>
                        <Link href="/student/profile">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer group">
                                <UserCheck className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Branch</p>
                            <p className="text-lg font-black text-white">{studentData.branch}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Academic Year</p>
                            <p className="text-lg font-black text-white">{studentData.year}rd Year</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Notice Board */}
            {announcements.length > 0 && (
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                            <Megaphone className="h-5 w-5 text-rose-600" />
                            Notice Board
                        </h2>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg animate-pulse">
                            {announcements.length} NEW
                        </span>
                    </div>
                    <div className="space-y-3">
                        {announcements.map((ann, idx) => (
                            <Card key={ann.id} className={cn(
                                "border-none shadow-sm rounded-2xl overflow-hidden transition-all",
                                idx === 0 ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                            )}>
                                <CardContent className="p-5 flex gap-4">
                                    <div className={cn(
                                        "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                                        idx === 0 ? "bg-white/10" : "bg-slate-50"
                                    )}>
                                        <Bell className={cn("h-5 w-5", idx === 0 ? "text-emerald-400" : "text-slate-400")} />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-60")}>
                                                Institutional Directive • {new Date(ann.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">{ann.content}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions Grid */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight">
                        <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                        Academic Terminal
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <Link key={tab.href} href={tab.href} className="group transition-all active:scale-95">
                                <Card className="p-0 border-none shadow-md bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                                    <CardContent className="flex flex-col items-center justify-center p-5 gap-3">
                                        <div className={cn(
                                            "rounded-2xl p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                                            tab.color
                                        )}>
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <div className="text-center">
                                            <span className="font-black text-xs text-slate-800 uppercase tracking-tighter">{tab.label}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
