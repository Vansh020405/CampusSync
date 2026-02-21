'use client';

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, FileText } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const ACTIVE_APPLICATIONS = [
    { id: 1, company: 'Microsoft', role: 'Software Engineer Intern', currentStage: 3, status: 'Interview', updated: '2 hrs ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: false },
    { id: 2, company: 'Google', role: 'SWE Intern 2026', currentStage: 2, status: 'Assessment', updated: '1 day ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: false },
    { id: 3, company: 'Amazon', role: 'SDE Intern', currentStage: 1, status: 'Applied', updated: '1 week ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: false },
    { id: 4, company: 'DeShaw', role: 'SDE Intern', currentStage: 2, status: 'Rejected', updated: '2 weeks ago', stages: ['Applied', 'Assessment', 'Interview', 'Offer'], rejected: true }
];

export default function ApplicationsPage() {
    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-700">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/student/internships">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl border-slate-200">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                            <Briefcase className="h-7 w-7 text-indigo-500" />
                            Active Applications
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Pipeline tracking</p>
                    </div>
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {ACTIVE_APPLICATIONS.map((app) => (
                    <div key={app.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-100 transition-colors group">
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                            <div className="h-14 w-14 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center font-black text-xl text-slate-800 border border-slate-200/50 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                {app.company.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-lg text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                                    {app.company}
                                </h4>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">
                                    {app.role}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-full md:w-1/2 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white group-hover:border-indigo-50 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    app.rejected
                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}>{app.status}</span>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                    {app.updated}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 w-full relative">
                                {app.stages.map((stage, sIdx) => {
                                    const isCompleted = sIdx < app.currentStage - 1;
                                    const isCurrent = sIdx === app.currentStage - 1;
                                    const isRejected = app.rejected && isCurrent;

                                    return (
                                        <div key={stage} className="flex-1 space-y-2 group/stage">
                                            <div className={cn(
                                                "h-2.5 rounded-full overflow-hidden transition-all duration-500",
                                                isCompleted ? "bg-emerald-500 shadow-lg shadow-emerald-200" :
                                                    isRejected ? "bg-rose-500 shadow-lg shadow-rose-200" :
                                                        isCurrent ? "bg-indigo-500 w-full shadow-lg shadow-indigo-200" : "bg-slate-200"
                                            )}></div>
                                            <p className={cn(
                                                "text-[8px] font-black uppercase tracking-widest text-center transition-colors",
                                                (isCompleted || isCurrent) ? "text-slate-700" : "text-slate-300"
                                            )}>{stage}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {ACTIVE_APPLICATIONS.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <FileText className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Active Applications</h3>
                        <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs mx-auto">Start applying to internships to see your pipeline here.</p>
                        <Link href="/student/internships">
                            <Button className="mt-8 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                                Browse Opportunities
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
