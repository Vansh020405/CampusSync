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
                <div className="flex items-center gap-3">
                    <Link href="/student/internships">
                        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-xl border-slate-200 dark:border-border dark:bg-card">
                            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-600 dark:text-muted-foreground" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-base md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight uppercase">
                            <Briefcase className="h-4 w-4 md:h-7 md:w-7 text-indigo-500" />
                            Active Pipeline
                        </h1>
                        <p className="text-slate-400 dark:text-muted-foreground/60 font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em] mt-0.5">Status Tracking</p>
                    </div>
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {ACTIVE_APPLICATIONS.map((app) => (
                    <div key={app.id} className="bg-white dark:bg-card p-3.5 md:p-5 rounded-[1.25rem] md:rounded-[2rem] border border-slate-100 dark:border-border shadow-sm dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 hover:border-indigo-100 dark:hover:border-primary transition-all group">
                        <div className="flex items-center gap-3 w-full md:w-1/3">
                            <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-muted dark:to-muted/50 flex items-center justify-center font-black text-base md:text-xl text-slate-800 dark:text-foreground border border-slate-200/50 dark:border-border shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                {app.company.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm md:text-lg text-slate-900 dark:text-foreground truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors uppercase tracking-tight">
                                    {app.company}
                                </h4>
                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mt-0.5 truncate opacity-70">
                                    {app.role}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-full md:w-1/2 bg-slate-50/50 dark:bg-muted/10 p-3 rounded-[1rem] md:rounded-3xl border border-slate-100 dark:border-border group-hover:bg-white dark:group-hover:bg-card group-hover:border-indigo-50 dark:group-hover:border-primary/20 transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                    app.rejected
                                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/30"
                                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/30"
                                )}>{app.status}</span>
                                <span className="text-[8px] font-black text-slate-300 dark:text-muted-foreground bg-white dark:bg-muted px-2 py-0.5 rounded-lg border border-slate-100 dark:border-border shadow-sm uppercase tracking-tight">
                                    {app.updated}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 w-full relative">
                                {app.stages.map((stage, sIdx) => {
                                    const isCompleted = sIdx < app.currentStage - 1;
                                    const isCurrent = sIdx === app.currentStage - 1;
                                    const isRejected = app.rejected && isCurrent;

                                    return (
                                        <div key={stage} className="flex-1 space-y-1 group/stage">
                                            <div className={cn(
                                                "h-1 md:h-2 rounded-full overflow-hidden transition-all duration-500",
                                                isCompleted ? "bg-emerald-500 dark:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none" :
                                                    isRejected ? "bg-rose-500 dark:bg-rose-600 shadow-lg shadow-rose-200 dark:shadow-none" :
                                                        isCurrent ? "bg-indigo-500 dark:bg-primary w-full shadow-lg shadow-indigo-200 dark:shadow-none" : "bg-slate-200 dark:bg-muted"
                                            )}></div>
                                            <p className={cn(
                                                "text-[6px] md:text-[8px] font-black uppercase tracking-tight text-center transition-colors truncate mt-1",
                                                (isCompleted || isCurrent) ? "text-slate-600 dark:text-foreground" : "text-slate-200 dark:text-muted-foreground/20"
                                            )}>{stage}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {ACTIVE_APPLICATIONS.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-card rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-border shadow-sm transition-all hover:border-indigo-100 dark:hover:border-primary/50">
                        <div className="h-20 w-20 bg-slate-50 dark:bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <FileText className="h-10 w-10 text-slate-200 dark:text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-foreground uppercase tracking-tight">No Active Applications</h3>
                        <p className="text-slate-400 dark:text-muted-foreground font-bold text-sm mt-2 max-w-xs mx-auto">Start applying to internships to see your pipeline here.</p>
                        <Link href="/student/internships">
                            <Button className="mt-8 rounded-2xl bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground font-black text-xs uppercase tracking-widest px-8 shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
                                Browse Opportunities
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
