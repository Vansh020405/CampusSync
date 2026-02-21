'use client';

import { useState } from 'react';
import { useStore } from "@/lib/store";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search, MapPin, Clock, Building2, Briefcase,
    DollarSign, ArrowRight, Sparkles, X, Calendar,
    Video, CheckCircle2, CircleDashed, FileText, ChevronRight, Play, Activity, Target
} from 'lucide-react';
import { cn } from "@/lib/utils";

const INTERNSHIP_STATS = [
    { label: 'Applications', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interviews', value: '3', icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Assessments', value: '5', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Offers', value: '1', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const UPCOMING_INTERVIEWS = [
    { id: 1, company: 'Microsoft', role: 'Software Engineer Intern', type: 'Technical Round 1', date: 'Tomorrow, 10:00 AM', platform: 'Microsoft Teams', color: 'bg-blue-500', logo: 'MI' },
    { id: 2, company: 'Google', role: 'SWE Intern 2026', type: 'Online Assessment', date: 'Oct 25, 2:00 PM', platform: 'HackerRank', color: 'bg-emerald-500', logo: 'GO' }
];

const ACTIVE_APPLICATIONS = [
    { id: 1, company: 'Microsoft', role: 'Software Engineer Intern', currentStage: 3, status: 'Interview', updated: '2 hrs ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: false },
    { id: 2, company: 'Google', role: 'SWE Intern 2026', currentStage: 2, status: 'Assessment', updated: '1 day ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: false },
    { id: 3, company: 'Amazon', role: 'SDE Intern', currentStage: 1, status: 'Applied', updated: '1 week ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: false },
    { id: 4, company: 'DeShaw', role: 'SDE Intern', currentStage: 2, status: 'Rejected', updated: '2 weeks ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: true }
];

export default function InternshipDashboard() {
    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-700">
            {/* Premium Header with Dynamic Mesh Gradient */}
            <div className="relative -mx-3 -mt-3 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[3rem] shadow-2xl shadow-indigo-500/20 mb-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,#4338ca_0,transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative px-6 py-12 md:px-10 md:py-20 lg:py-24">
                    <div className="max-w-4xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em]">
                                Live Career Intelligence
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05]">
                            Your Career <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Command Center</span>
                        </h1>
                        <p className="text-slate-300 font-bold text-base md:text-lg max-w-xl opacity-80 leading-relaxed">
                            Data-driven insights for your internship journey. Track Every Application, Master Every Interview.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-2 space-y-10">
                {/* FLOATING STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-20 relative z-20">
                    {INTERNSHIP_STATS.map((stat) => (
                        <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-2xl rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black border-slate-100 text-slate-400 bg-slate-50/50">
                                        +2 New
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* UPCOMING INTERVIEWS SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                                <Calendar className="h-6 w-6 text-indigo-600" /> Action Required
                            </h2>
                            <p className="text-sm font-bold text-slate-400 ml-8">Immediate focus for the next 48 hours</p>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl">View Calendar <ChevronRight className="ml-1 h-3 w-3" /></Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {UPCOMING_INTERVIEWS.map((interview: any) => (
                            <div key={interview.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/60 relative overflow-hidden group hover:border-indigo-100 transition-all duration-500">
                                <div className={`absolute top-0 right-0 w-40 h-40 ${interview.color} opacity-5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-10 transition-opacity`}></div>

                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                                            {interview.logo}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-slate-950 truncate leading-tight tracking-tight">{interview.company}</h3>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1.5 flex items-center gap-2">
                                                <Briefcase className="h-3 w-3" /> {interview.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 backdrop-blur-sm rounded-3xl p-5 flex items-center justify-between border border-slate-100 relative z-10 group-hover:bg-white group-hover:border-indigo-50 transition-colors">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em]">{interview.type}</p>
                                        <div className="flex items-center gap-3 text-slate-700 font-black text-sm">
                                            <Clock className="h-4 w-4 text-slate-400" /> {interview.date}
                                        </div>
                                    </div>
                                    <Button className="h-12 px-6 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                                        <Video className="h-4 w-4 mr-2" /> Launch
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* APPLICATION STATUS TRACKER */}
                <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                                <Activity className="h-6 w-6 text-emerald-600" /> Pipeline Status
                            </h2>
                            <p className="text-sm font-bold text-slate-400 ml-8">Monitoring 12 active applications</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {ACTIVE_APPLICATIONS.map((app: any, idx: number) => {
                            return (
                                <div key={idx} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/40 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-slate-200 transition-all duration-300 group hover:-translate-x-1 outline outline-2 outline-transparent hover:outline-slate-50">
                                    <div className="flex items-center gap-5 w-full lg:w-1/3">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-800 border border-slate-100 shrink-0 shadow-inner group-hover:bg-white transition-colors">
                                            {app.company.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-lg text-slate-950 truncate leading-tight tracking-tight">{app.company}</h4>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate flex items-center gap-2">
                                                <Target className="h-3 w-3" /> {app.role}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Container */}
                                    <div className="w-full lg:w-3/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-2 w-2 rounded-full", app.rejected ? "bg-rose-500" : "bg-emerald-500 animate-pulse")}></div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                                    app.rejected ? "text-rose-500" : "text-emerald-600"
                                                )}>{app.status}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Updated {app.updated}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 w-full relative">
                                            {app.stages.map((stage: string, sIdx: number) => {
                                                const isCompleted = sIdx < app.currentStage - 1;
                                                const isCurrent = sIdx === app.currentStage - 1;
                                                const isRejected = app.rejected && isCurrent;

                                                return (
                                                    <div key={stage} className="flex-1 group/stage">
                                                        <div className={cn(
                                                            "h-2.5 rounded-full overflow-hidden transition-all duration-700 relative",
                                                            isCompleted ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                                                                isRejected ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" :
                                                                    isCurrent ? "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]" : "bg-slate-100"
                                                        )}>
                                                            {isCurrent && !isRejected && (
                                                                <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }}></div>
                                                            )}
                                                        </div>
                                                        <p className={cn(
                                                            "text-[8px] font-black uppercase tracking-widest text-center mt-3 transition-opacity duration-300",
                                                            (isCompleted || isCurrent) ? "text-slate-600 opacity-100" : "text-slate-200 opacity-0 group-hover/stage:opacity-100"
                                                        )}>{stage}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
