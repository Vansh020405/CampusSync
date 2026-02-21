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
            {/* Premium Gradient Header */}
            <div className="relative -mx-3 -mt-3 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] shadow-xl shadow-indigo-500/10 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-700"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative px-5 py-8 md:px-10 md:py-16 pb-0">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-fuchsia-300 animate-pulse"></span>
                                    Career Command Center
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
                                    Placement <br className="sm:hidden" /> Tracker
                                </h1>
                                <p className="text-indigo-100/90 font-bold text-sm md:text-base max-w-lg leading-relaxed">
                                    Manage your interviews, track application statuses, and explore new on-campus opportunities.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="px-2 space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                {/* UPCOMING INTERVIEWS SECTION */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-500" /> Upcoming Action Items
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {UPCOMING_INTERVIEWS.map(interview => (
                            <div key={interview.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-indigo-100 transition-colors">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${interview.color} opacity-5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2`}></div>

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-[1rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-800 shadow-inner">
                                            {interview.logo}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 truncate leading-tight">{interview.company}</h3>
                                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">{interview.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 relative z-10">
                                    <div>
                                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{interview.type}</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                            <Clock className="h-4 w-4 text-slate-400" /> {interview.date}
                                        </div>
                                    </div>
                                    <Button className="h-10 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                                        <Video className="h-4 w-4 mr-2" /> Join
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* APPLICATION STATUS TRACKER */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-500" /> Active Applications
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {ACTIVE_APPLICATIONS.map((app, idx) => {
                            return (
                                <div key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-200 transition-colors group">
                                    <div className="flex items-center gap-4 w-full md:w-1/3">
                                        <div className="h-12 w-12 rounded-[1rem] bg-slate-50 flex items-center justify-center font-black text-slate-800 border border-slate-100 shrink-0">
                                            {app.company.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate leading-tight">{app.company}</h4>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{app.role}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar Container */}
                                    <div className="w-full md:w-1/2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                app.rejected ? "text-rose-500" : "text-emerald-600"
                                            )}>{app.status}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{app.updated}</span>
                                        </div>
                                        <div className="flex items-center gap-1 w-full relative">
                                            {app.stages.map((stage, sIdx) => {
                                                const isCompleted = sIdx < app.currentStage - 1;
                                                const isCurrent = sIdx === app.currentStage - 1;
                                                const isRejected = app.rejected && isCurrent;

                                                return (
                                                    <div key={stage} className="flex-1 space-y-2 group/stage">
                                                        <div className={cn(
                                                            "h-2 rounded-full overflow-hidden transition-all duration-500",
                                                            isCompleted ? "bg-emerald-500" :
                                                                isRejected ? "bg-rose-500" :
                                                                    isCurrent ? "bg-indigo-500 w-full" : "bg-slate-100"
                                                        )}></div>
                                                        <p className={cn(
                                                            "text-[8px] font-black uppercase tracking-widest text-center opacity-0 md:opacity-100",
                                                            (isCompleted || isCurrent) ? "text-slate-600" : "text-slate-300"
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
