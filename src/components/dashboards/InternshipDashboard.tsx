'use client';

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Briefcase, Clock, TrendingUp, Bell, Calendar,
    ArrowRight, Sparkles, CheckCircle2, XCircle, AlertCircle,
    Building2, MapPin
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function InternshipDashboard() {
    const { data: session } = useSession();
    const userName = session?.user?.name?.split(' ')[0] || 'User';

    // 1. Upcoming Interviews Data
    const interviews = [
        {
            id: 1,
            company: "TechCorp",
            role: "SDE Intern",
            date: "Tomorrow",
            time: "10:00 AM",
            type: "Technical Round",
            platform: "Google Meet"
        },
        {
            id: 2,
            company: "FinTech Pro",
            role: "Analyst",
            date: "Feb 18",
            time: "02:00 PM",
            type: "HR Round",
            platform: "Zoom"
        }
    ];

    // 2. Applied Internships Data
    const appliedInternships = [
        {
            id: 1,
            company: "TechCorp",
            role: "SDE Intern",
            appliedDate: "Feb 10",
            status: "interview",
            logo: "TC",
            color: "from-blue-500 to-indigo-600"
        },
        {
            id: 2,
            company: "DataWise",
            role: "Data Science",
            appliedDate: "Feb 8",
            status: "under_review",
            logo: "DW",
            color: "from-purple-500 to-pink-600"
        },
        {
            id: 3,
            company: "CloudTech",
            role: "Backend Dev",
            appliedDate: "Feb 5",
            status: "applied",
            logo: "CT",
            color: "from-emerald-500 to-teal-600"
        },
        {
            id: 4,
            company: "StartUp Inc",
            role: "React Dev",
            appliedDate: "Feb 2",
            status: "rejected",
            logo: "SI",
            color: "from-rose-500 to-red-600"
        },
    ];

    // 3. Recent Updates / New Openings
    const updates = [
        {
            id: 1,
            type: "new",
            title: "New Opening: Product Design at Adobe",
            desc: "Applications open until Feb 20. Portfolio required.",
            time: "2 hours ago",
            icon: Sparkles,
            color: "text-amber-500 bg-amber-50"
        },
        {
            id: 2,
            type: "update",
            title: "DataWise Application Viewed",
            desc: "Your application for Data Science Intern was viewed by the recruiter.",
            time: "5 hours ago",
            icon: CheckCircle2,
            color: "text-blue-500 bg-blue-50"
        },
        {
            id: 3,
            type: "alert",
            title: "Result Declared: Amazon SDE",
            desc: "The shortlist for the coding round has been released. Check your mail.",
            time: "Yesterday",
            icon: Bell,
            color: "text-purple-500 bg-purple-50"
        }
    ];

    // 4. Upcoming Deadlines
    const deadlines = [
        { id: 1, company: "Google", role: "STEP Intern", daysLeft: 1, urgent: true },
        { id: 2, company: "Microsoft", role: "SWE Intern", daysLeft: 3, urgent: false },
        { id: 3, company: "Uber", role: "Data Analyst", daysLeft: 4, urgent: false },
    ];

    const getStatusConfig = (status: string) => {
        const configs = {
            applied: { label: "Applied", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
            under_review: { label: "Reviewing", color: "bg-amber-100 text-amber-700", icon: Clock },
            interview: { label: "Interview", color: "bg-purple-100 text-purple-700", icon: Calendar },
            selected: { label: "Selected", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
            rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
        };
        return configs[status as keyof typeof configs] || configs.applied;
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2.5rem] shadow-xl shadow-indigo-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700"></div>
                <div className="relative px-6 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Internship Hub
                            </h1>
                            <p className="text-indigo-100 font-medium text-sm mt-1">Track applications & ace interviews</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-white">{appliedInternships.length}</p>
                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Applied</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-white">{interviews.length}</p>
                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Interviews</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-white">5</p>
                            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Shortlists</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Upcoming Interviews Section */}
            {interviews.length > 0 && (
                <div className="space-y-4 px-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Upcoming Interviews
                        </h2>
                    </div>
                    <div className="grid gap-3">
                        {interviews.map(interview => (
                            <div key={interview.id} className="bg-white border-l-4 border-l-purple-500 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-50 h-12 w-12 rounded-xl flex flex-col items-center justify-center text-purple-700 shrink-0">
                                        <span className="text-[10px] font-black uppercase text-purple-400">Feb</span>
                                        <span className="text-lg font-black leading-none">{interview.date === "Tomorrow" ? new Date().getDate() + 1 : interview.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{interview.company}</h3>
                                        <p className="text-xs font-medium text-slate-500">{interview.type} • {interview.time}</p>
                                    </div>
                                </div>
                                <Button size="sm" className="bg-slate-900 text-white text-xs font-bold rounded-lg h-8">
                                    Join
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Applications Carousel */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Applications</h2>
                    <Link href="/student/internships" className="text-xs font-bold text-indigo-600">See All</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                    {appliedInternships.map((app) => {
                        const config = getStatusConfig(app.status);
                        const Icon = config.icon;
                        return (
                            <div key={app.id} className="min-w-[260px] bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white font-black text-xs`}>
                                        {app.logo}
                                    </div>
                                    <Badge className={`${config.color} border-none font-bold text-[10px]`}>
                                        {config.label}
                                    </Badge>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">{app.company}</h3>
                                    <p className="text-xs font-medium text-slate-500">{app.role}</p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">Applied: {app.appliedDate}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Recent Updates & 4. Deadlines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1">
                {/* Updates */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Activity</h2>
                    <div className="space-y-3">
                        {updates.map(update => (
                            <div key={update.id} className="flex gap-4 items-start bg-slate-50 p-3 rounded-xl">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${update.color}`}>
                                    <update.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">{update.title}</h4>
                                    <p className="text-xs text-slate-500 leading-snug mt-1">{update.desc}</p>
                                    <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-wide">{update.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deadlines */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Deadlines Closing</h2>
                    <div className="grid gap-3">
                        {deadlines.map(deadline => (
                            <div key={deadline.id} className="group bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-indigo-100 transition-all">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-slate-800">{deadline.company}</h4>
                                        {deadline.urgent && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                                    </div>
                                    <p className="text-xs text-slate-500">{deadline.role}</p>
                                </div>
                                <div className="text-center bg-slate-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                    <span className={`block text-lg font-black leading-none ${deadline.urgent ? 'text-rose-500' : 'text-slate-700'}`}>
                                        {deadline.daysLeft}
                                    </span>
                                    <span className="text-[8px] font-black uppercase text-slate-400">Days</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
