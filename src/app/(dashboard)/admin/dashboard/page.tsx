'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Briefcase, Users, BarChart2, CalendarDays,
    Megaphone, GraduationCap, ChevronRight,
    Activity, Shield, Globe, FileText, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
    const { data: session } = useSession();
    const [counts, setCounts] = useState({ students: 0, faculty: 0 });
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
    const [availableSections, setAvailableSections] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [broadcastFilters, setBroadcastFilters] = useState({
        department: "ALL",
        semester: "ALL",
        batch: "ALL"
    });

    const fetchCounts = async () => {
        try {
            const [stdRes, facRes] = await Promise.all([
                fetch('/api/admin/students/list'),
                fetch('/api/faculty/list')
            ]);
            const stds = await stdRes.json();
            const facs = await facRes.json();

            // Extract unique departments and sections
            const depts = new Set<string>(["CSE", "ECE", "ME", "CSE AI ML"]); // Include defaults and user requested
            const sects = new Set<string>();

            if (Array.isArray(stds)) {
                stds.forEach((s: any) => {
                    if (s.department) depts.add(s.department);
                    if (s.section) sects.add(s.section);
                });
            }

            if (Array.isArray(facs)) {
                facs.forEach((f: any) => {
                    if (f.departments && Array.isArray(f.departments)) {
                        f.departments.forEach((d: string) => depts.add(d));
                    }
                });
            }

            setCounts({
                students: Array.isArray(stds) ? stds.length : 0,
                faculty: Array.isArray(facs) ? facs.length : 0
            });
            setAvailableDepartments(Array.from(depts).filter(Boolean).sort());
            setAvailableSections(Array.from(sects).filter(Boolean).sort());
        } catch (e) {
            console.error("Dashboard stats error:", e);
        }
    };

    useEffect(() => {
        fetchCounts();
    }, []);

    const handleBroadcast = async () => {
        if (!message.trim()) return;
        setIsSending(true);
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    filters: broadcastFilters,
                    senderId: session?.user?.id || 'admin'
                })
            });
            if (res.ok) {
                setMessage("");
                // Success feedback could be added here
            }
        } catch (e) {
            console.error("Broadcast failed:", e);
        } finally {
            setIsSending(false);
        }
    };

    const tiles = [
        {
            href: "/admin/timetable",
            label: "Timetables",
            description: "Build, deploy and manage academic schedules",
            icon: CalendarDays,
            stats: "128 Slots",
            color: "bg-indigo-50 text-indigo-500"
        },
        {
            href: "/admin/faculty",
            label: "Faculty Details",
            description: "Manage institutional human resources and profiles",
            icon: Users,
            stats: `${counts.faculty} Active`,
            color: "bg-emerald-50 text-emerald-500"
        },
        {
            href: "/admin/students",
            label: "Student Details",
            description: "Global student data registry and monitoring",
            icon: GraduationCap,
            stats: `${counts.students} Enrolled`,
            color: "bg-blue-50 text-blue-500"
        },
        {
            href: "/admin/syllabus",
            label: "Syllabus Master",
            description: "Manage curriculum, allots subjects and exam mapping",
            icon: BookOpen,
            stats: "Authorized",
            color: "bg-purple-50 text-purple-600"
        },
        {
            href: "/admin/exams",
            label: "Exam Planner",
            description: "Coordinate examination schedules and invigilation",
            icon: FileText,
            stats: "Pending",
            color: "bg-rose-50 text-rose-500"
        },
        {
            href: "/admin/internships",
            label: "Job & Internship Allocation",
            description: "Corporate sync and student placement management",
            icon: Briefcase,
            stats: "12 New",
            color: "bg-amber-50 text-amber-500"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 py-12 bg-white min-h-screen font-sans">
            {/* Minimal Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-[#020617] tracking-tighter">
                        Admin Hub
                    </h1>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">
                        {session?.user?.name?.toUpperCase() || "ADMINISTRATOR"} <span className="mx-1 text-slate-300">•</span> LEVEL 4 AUTHORIZED
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
                        <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1.5">
                            <Activity className="h-4 w-4" /> Operational Matrix
                        </p>
                    </div>
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-sm overflow-hidden">
                        <Globe className="h-6 w-6" />
                    </div>
                </div>
            </div>



            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                {tiles.map((tile) => {
                    const Icon = tile.icon;
                    return (
                        <Link key={tile.href} href={tile.href} className="group cursor-pointer">
                            <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] h-full flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-300", tile.color)}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-200">
                                        {tile.stats}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight uppercase group-hover:text-indigo-600 transition-colors">
                                        {tile.label}
                                    </h3>
                                    <p className="text-slate-600 text-xs font-semibold mt-1 leading-relaxed">
                                        {tile.description}
                                    </p>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-900 transition-all" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Broadcast Terminal */}
            <div className="px-4">
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Network Broadcast Terminal</span>
                                </div>
                                <h2 className="text-3xl font-extrabold uppercase tracking-tighter">Central Announcement Dispatch</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                    <Megaphone className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Department</label>
                                <select
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={broadcastFilters.department}
                                    onChange={(e) => setBroadcastFilters({ ...broadcastFilters, department: e.target.value })}
                                >
                                    <option className="bg-slate-900" value="ALL">All Departments</option>
                                    {availableDepartments.map(dept => (
                                        <option key={dept} className="bg-slate-900" value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Semester</label>
                                <select
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={broadcastFilters.semester}
                                    onChange={(e) => setBroadcastFilters({ ...broadcastFilters, semester: e.target.value })}
                                >
                                    <option className="bg-slate-900" value="ALL">All Semesters</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <option key={s} className="bg-slate-900" value={s.toString()}>Semester {s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Batch</label>
                                <select
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={broadcastFilters.batch}
                                    onChange={(e) => setBroadcastFilters({ ...broadcastFilters, batch: e.target.value })}
                                >
                                    <option className="bg-slate-900" value="ALL">All Batches</option>
                                    <option className="bg-slate-900" value="Morning">Morning Batch</option>
                                    <option className="bg-slate-900" value="Evening">Evening Batch</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <textarea
                                    placeholder="Draft institutional directive or global announcement..."
                                    className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-medium placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none leading-relaxed"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="absolute bottom-6 right-6 flex items-center gap-4">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
                                        {message.length} Characters
                                    </p>
                                    <button
                                        onClick={handleBroadcast}
                                        disabled={isSending || !message.trim()}
                                        className={cn(
                                            "h-12 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2",
                                            isSending ? "bg-slate-700 text-slate-400" : "bg-white text-slate-900 hover:bg-emerald-500 hover:text-white"
                                        )}
                                    >
                                        <Megaphone className="h-4 w-4" />
                                        {isSending ? "Transmitting..." : "Execute Broadcast"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-12 opacity-40">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center justify-center gap-3">
                    <Shield className="h-3 w-3" /> CampusSync Admin Core v4.0 • Verified Access
                </p>
            </div>
        </div>
    );
}

