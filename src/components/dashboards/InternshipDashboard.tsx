'use client';

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Briefcase, Clock, TrendingUp, Bell, Calendar,
    ArrowRight, Sparkles, CheckCircle2, XCircle, AlertCircle,
    Building2, MapPin, Zap, Target, Award, Rocket
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function InternshipDashboard() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const userName = session?.user?.name?.split(' ')[0] || 'User';

    // Data mocks
    const interviews = [
        { id: 1, company: "TechCorp", role: "SDE Intern", date: "Tomorrow", time: "10:00 AM", type: "Technical", platform: "Google Meet" },
        { id: 2, company: "FinTech Pro", role: "Analyst", date: "Feb 18", time: "02:00 PM", type: "HR Round", platform: "Zoom" }
    ];

    const appliedInternships = [
        { id: 1, company: "TechCorp", role: "SDE Intern", appliedDate: "Feb 10", status: "interview", logo: "TC", color: "from-blue-500 to-indigo-600" },
        { id: 2, company: "DataWise", role: "Data Science", appliedDate: "Feb 8", status: "under_review", logo: "DW", color: "from-purple-500 to-pink-600" },
        { id: 3, company: "CloudTech", role: "Backend Dev", appliedDate: "Feb 5", status: "applied", logo: "CT", color: "from-emerald-500 to-teal-600" },
        { id: 4, company: "StartUp Inc", role: "React Dev", appliedDate: "Feb 2", status: "rejected", logo: "SI", color: "from-rose-500 to-red-600" },
    ];

    const updates = [
        { id: 1, title: "New Opening: Product Design at Adobe", desc: "Applications open until Feb 20.", time: "2h ago", icon: Sparkles, gradient: "from-amber-500 to-orange-600" },
        { id: 2, title: "DataWise Application Viewed", desc: "Your application was viewed by the recruiter.", time: "5h ago", icon: Rocket, gradient: "from-blue-500 to-indigo-600" },
        { id: 3, title: "Result Declared: Amazon SDE", desc: "Shortlist for the coding round released.", time: "Yesterday", icon: Award, gradient: "from-purple-500 to-fuchsia-600" }
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
        <div className="w-full max-w-4xl mx-auto pb-32 px-4 md:px-8 py-6 md:py-10 space-y-8 animate-in fade-in duration-700">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700 p-8 shadow-2xl shadow-indigo-500/20">
                <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-[80px]"></div>
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Career Hub</h1>
                            <p className="text-indigo-100/80 font-bold text-xs uppercase tracking-widest">Next-Gen Placement Portal</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg group">
                            <Briefcase className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center hover:bg-white/20 transition-all cursor-default group">
                            <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform">{appliedInternships.length}</p>
                            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-80 mt-1">Applied</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center hover:bg-white/20 transition-all cursor-default group">
                            <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform">{interviews.length}</p>
                            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-80 mt-1">Interviews</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-center hover:bg-white/20 transition-all cursor-default group">
                            <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform">05</p>
                            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest opacity-80 mt-1">Shortlist</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interviews Timeline */}
            {interviews.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Zap className="h-4 w-4 text-indigo-500" />
                            Live Interviews
                        </h2>
                    </div>
                    <div className="grid gap-4">
                        {interviews.map((interview, idx) => (
                            <Card key={interview.id}
                                className={cn(
                                    "border-0 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group",
                                    mounted && "animate-in slide-in-from-bottom-4 duration-500"
                                )}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-50 h-14 w-14 rounded-2xl flex flex-col items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <span className="text-[9px] font-black uppercase opacity-60">FEB</span>
                                            <span className="text-xl font-black leading-none">{idx === 0 ? "17" : "18"}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 tracking-tight">{interview.company}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{interview.type} • {interview.time}</p>
                                        </div>
                                    </div>
                                    <Button className="rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 px-6 font-bold text-xs h-10 shadow-lg shadow-slate-200">
                                        Join Session
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Applications Carousel */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-fuchsia-500" />
                        Application Status
                    </h2>
                    <Link href="/student/internships" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Full Trace →</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
                    {appliedInternships.map((app) => {
                        const config = getStatusConfig(app.status);
                        return (
                            <div key={app.id} className="min-w-[280px] group">
                                <Card className="border-0 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-lg rotate-3 group-hover:rotate-6 transition-transform",
                                            app.color
                                        )}>
                                            {app.logo}
                                        </div>
                                        <Badge className={cn("border-0 rounded-full font-black text-[9px] uppercase tracking-widest px-3 py-1", config.color)}>
                                            {config.label}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800 tracking-tight mb-1">{app.company}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{app.role}</p>
                                        <div className="mt-6 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            <span>Trace: {app.appliedDate}</span>
                                            <ArrowRight className="h-3 w-3 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Updates & Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Tactical Updates
                    </h2>
                    <div className="space-y-4">
                        {updates.map(update => (
                            <div key={update.id} className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shrink-0 bg-gradient-to-br shadow-md", update.gradient)}>
                                    <update.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-slate-800 tracking-tight">{update.title}</h4>
                                    <p className="text-[11px] font-bold text-slate-500 line-clamp-1">{update.desc}</p>
                                </div>
                                <div className="text-[9px] font-black text-slate-300 uppercase shrink-0">{update.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-emerald-500" />
                        Critical Deadlines
                    </h2>
                    <div className="space-y-3">
                        {["Google", "Microsoft", "Uber"].map((company, idx) => (
                            <Card key={company} className="border-0 rounded-[1.75rem] p-4 flex items-center justify-between shadow-sm border border-slate-50 hover:border-indigo-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-slate-800 tracking-tight">{company}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Closing Soon</p>
                                    </div>
                                </div>
                                <div className="text-center px-4 py-2 rounded-2xl bg-slate-50 group-hover:bg-rose-50 transition-colors">
                                    <span className={cn("block text-xl font-black leading-none", idx === 0 ? "text-rose-500" : "text-slate-800")}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-[8px] font-black uppercase text-slate-400">Days</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
