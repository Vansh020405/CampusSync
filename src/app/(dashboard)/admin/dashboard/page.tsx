'use client';

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Briefcase, Users, BarChart2, CalendarDays,
    Megaphone, GraduationCap, ChevronRight,
    Activity, Shield, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
    const { data: session } = useSession();

    const tiles = [
        {
            href: "/admin/timetable",
            label: "Timetable Architecture",
            description: "Build and deploy academic schedules",
            icon: CalendarDays,
            stats: "128 Slots",
            color: "bg-indigo-50 text-indigo-500"
        },
        {
            href: "/admin/faculty",
            label: "Faculty Directory",
            description: "Manage institutional human resources",
            icon: Users,
            stats: "84 Active",
            color: "bg-emerald-50 text-emerald-500"
        },
        {
            href: "/admin/students",
            label: "Student Registry",
            description: "Global student data management",
            icon: GraduationCap,
            stats: "1,240 Enrolled",
            color: "bg-blue-50 text-blue-500"
        },
        {
            href: "/admin/internships",
            label: "Placement Hub",
            description: "Corporate sync and internship posts",
            icon: Briefcase,
            stats: "12 New",
            color: "bg-amber-50 text-amber-500"
        },
        {
            href: "/admin/analytics",
            label: "System Intelligence",
            description: "Platform utilization and growth data",
            icon: BarChart2,
            stats: "+14.2% Growth",
            color: "bg-rose-50 text-rose-500"
        },
        {
            href: "/admin/notices",
            label: "Command Center",
            description: "Broadcast institutional announcements",
            icon: Megaphone,
            stats: "Active",
            color: "bg-purple-50 text-purple-500"
        },
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

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
                <div className="p-6 bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Traffic</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">842</h3>
                        <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold text-[10px]">+12%</div>
                    </div>
                </div>
                <div className="p-6 bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Server Load</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">24%</h3>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
                <div className="p-6 bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Rate</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">99.9%</h3>
                        <Shield className="h-4 w-4 text-indigo-500" />
                    </div>
                </div>
                <div className="p-6 bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Nodes</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">12</h3>
                        <div className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold text-[10px]">Stable</div>
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
                <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden border border-slate-800">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold uppercase tracking-tighter">System Notification Hub</h2>
                            <p className="text-slate-400 text-xs font-medium max-w-sm">
                                Execute network-wide broadcasts and institutional announcements from the central command.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="h-11 px-8 rounded-2xl bg-white text-slate-900 font-extrabold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm">
                                New Broadcast
                            </button>
                            <Link href="/admin/signup">
                                <button className="h-11 px-8 rounded-2xl bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95 border border-slate-700">
                                    Provision New Admin
                                </button>
                            </Link>
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

