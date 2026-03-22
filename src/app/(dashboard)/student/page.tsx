'use client'

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
    Briefcase, Users, FileText, BarChart, BookOpen,
    GraduationCap, Search, LayoutDashboard,
    Clock, UserCheck, Megaphone, Bell, CheckCircle2
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
        { href: "/student/internships", label: "Internships", icon: Briefcase, color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10" },
        { href: "/student/faculty", label: "Faculty", icon: Users, color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10" },
        { href: "/student/resume", label: "Resume", icon: FileText, color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10" },
        { href: "/student/skills", label: "Skill Gap", icon: BarChart, color: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10" },
        { href: "/student/syllabus", label: "Syllabus", icon: BookOpen, color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10" },
        { href: "/student/classes", label: "Classes", icon: GraduationCap, color: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/10" },
        { href: "/student/attendance", label: "Attendance", icon: Clock, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10" },
        { href: "/student/research", label: "Research", icon: Search, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10" },
    ]

    const handleAcknowledge = async (announcementId: string) => {
        try {
            await fetch('/api/admin/broadcast/acknowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    announcementId,
                    studentId: session?.user?.id
                })
            });
            // Refresh announcements to show updated state
            const res = await fetch(`/api/admin/broadcast?department=${studentData.department}&semester=${studentData.year}&batch=${studentData.batch}&studentId=${session?.user?.id}`);
            const data = await res.json();
            if (Array.isArray(data)) setAnnouncements(data);
        } catch (e) {
            console.error("Failed to acknowledge:", e);
        }
    };

    return (
        <div className="space-y-4 pb-20 animate-in fade-in zoom-in duration-500">
            {/* ... Premium Header ... */}
            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 dark:from-card dark:via-card dark:to-card dark:border dark:border-border p-4 md:p-6 shadow-xl shadow-blue-500/10 dark:shadow-none">
                <div className="absolute top-0 right-0 -m-4 h-32 w-32 rounded-full bg-white/10 blur-2xl dark:hidden"></div>
                <div className="relative z-10 flex flex-col gap-3 md:gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase ">
                                Hello, {studentData.name.split(' ')[0]}!
                            </h1>
                            <p className="text-blue-100 text-[9px] md:text-sm font-black opacity-80 uppercase tracking-widest mt-0.5">
                                {studentData.rollNo} â€¢ Section {studentData.section}
                            </p>
                        </div>
                        <Link href="/student/profile">
                            <div className="h-9 w-9 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer group">
                                <UserCheck className="h-4 w-4 md:h-8 md:w-8 text-white group-hover:scale-110 transition-transform" />
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-0">
                            <p className="text-[8px] md:text-[9px] font-black text-blue-100/60 uppercase tracking-widest">Branch</p>
                            <p className="text-[12px] md:text-lg font-black text-white uppercase tracking-tight leading-none">{studentData.branch.split(' ')[0]}</p>
                        </div>
                        <div className="flex flex-col gap-0">
                            <p className="text-[8px] md:text-[9px] font-black text-blue-100/60 uppercase tracking-widest">Year</p>
                            <p className="text-[12px] md:text-lg font-black text-white uppercase tracking-tight leading-none">{studentData.year}rd Phase</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notice Board */}
            {announcements.length > 0 && (
                <div className="space-y-4 pt-2 px-1">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-black text-slate-800 dark:text-foreground flex items-center gap-2 uppercase tracking-tight">
                            <Megaphone className="h-5 w-5 text-rose-600 dark:text-primary" />
                            Notice Board
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {announcements.map((ann, idx) => {
                            const isAcknowledged = ann.acknowledgements && ann.acknowledgements.length > 0;

                            return (
                                <Card key={ann.id} className={cn(
                                    "border-none dark:border dark:border-border shadow-sm dark:shadow-none rounded-2xl overflow-hidden transition-all relative",
                                    isAcknowledged ? "opacity-60 bg-white dark:bg-card" : idx === 0 ? "bg-slate-900 dark:bg-secondary text-white dark:text-foreground shadow-xl shadow-slate-200 dark:shadow-black/10" : "bg-white dark:bg-card"
                                )}>
                                    {!isAcknowledged && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                        </div>
                                    )}
                                    <CardContent className="p-4 flex flex-col gap-3">
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center",
                                                idx === 0 && !isAcknowledged ? "bg-white/10 dark:bg-card" : "bg-slate-50 dark:bg-card dark:border dark:border-border"
                                            )}>
                                                <Bell className={cn("h-4 w-4", idx === 0 && !isAcknowledged ? "text-emerald-400" : "text-slate-400")} />
                                            </div>
                                            <div className="space-y-0.5 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className={cn("text-[8px] font-black uppercase tracking-widest opacity-60")}>
                                                        {new Date(ann.createdAt).toLocaleDateString()} â€¢ {ann.senderId === 'admin' ? 'SYSTEM CORE' : 'FACULTY'}
                                                    </p>
                                                </div>
                                                <p className="text-xs md:text-sm font-bold leading-tight dark:text-foreground">{ann.content}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            {isAcknowledged ? (
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest">
                                                    <CheckCircle2 className="h-3 w-3" /> Received & Authorized
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAcknowledge(ann.id)}
                                                    className={cn(
                                                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                                                        idx === 0
                                                            ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 dark:shadow-none dark:bg-primary dark:hover:bg-primary/80 dark:text-primary-foreground"
                                                            : "bg-slate-900 text-white dark:bg-card dark:border dark:border-border dark:text-foreground dark:hover:bg-secondary"
                                                    )}
                                                >
                                                    Acknowledge Access
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions Grid */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-black text-slate-800 dark:text-foreground flex items-center gap-2 uppercase tracking-tight">
                        <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-primary" />
                        Academic Terminal
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <Link key={tab.href} href={tab.href} className="group transition-all active:scale-95">
                                <Card className="p-0 border-none dark:border dark:border-border shadow-md dark:shadow-none bg-white dark:bg-card rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/20 transition-shadow">
                                    <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                                        <div className={cn(
                                            "rounded-[1.25rem] p-3 md:p-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm",
                                            tab.color
                                        )}>
                                            <Icon className="h-5 w-5 md:h-7 md:w-7" />
                                        </div>
                                        <div className="text-center">
                                            <span className="font-black text-[10px] md:text-xs text-slate-800 dark:text-foreground uppercase tracking-tight">{tab.label}</span>
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
