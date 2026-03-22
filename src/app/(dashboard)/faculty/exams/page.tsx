'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar, Clock, MapPin, Building2,
    CheckCircle2, AlertCircle, FileText, ChevronRight,
    Search, User, HardDrive, Activity, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function FacultyExamsPage() {
    const { data: session } = useSession();
    const [exams, setExams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchExams = async () => {
        try {
            const res = await fetch("/api/faculty/exams");
            const data = await res.json();
            if (Array.isArray(data)) {
                setExams(data);
            }
        } catch (e) {
            console.error("Failed to fetch exam duties");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchExams();
        }
    }, [session]);

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-40 pt-6 px-4 font-sans animate-in fade-in duration-500 min-h-screen bg-white dark:bg-background transition-colors">
            {/* Minimal Clean Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-border pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                        <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground font-mono ">Control Protocol</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none">Exam Duties</h1>
                    <p className="text-[10px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest mt-1">
                        Live Roster for <span className="text-rose-600 dark:text-rose-400 font-black ">Invigilation Assignments</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-border text-slate-400 dark:text-muted-foreground text-[9px] font-black uppercase tracking-widest  flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        System Sync Active
                    </Badge>
                </div>
            </div>

            {/* Quick Stats Tiles */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-50 dark:bg-rose-500/5 rounded-[2rem] p-6 border border-rose-100 dark:border-rose-500/20 flex flex-col justify-between group overflow-hidden relative transition-all hover:bg-rose-100 dark:hover:bg-rose-500/10 active:scale-95">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="h-10 w-10 bg-white dark:bg-card rounded-xl shadow-lg border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 relative z-10 transition-transform group-hover:rotate-12">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="mt-4 relative z-10">
                        <h3 className="text-[9px] font-black text-rose-900/40 dark:text-rose-400/40 uppercase tracking-widest mb-1 ">Upcoming Assignments</h3>
                        <p className="text-3xl font-black text-rose-700 dark:text-rose-400  tracking-tighter">{exams.filter(e => new Date(e.date) >= new Date()).length}</p>
                    </div>
                </div>
                <div className="bg-slate-900 dark:bg-card rounded-[2rem] p-6 border border-slate-800 dark:border-border flex flex-col justify-between group overflow-hidden relative transition-all hover:bg-slate-800 active:scale-95 shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="h-10 w-10 bg-white/10 dark:bg-muted rounded-xl flex items-center justify-center text-white dark:text-foreground relative z-10 transition-transform group-hover:rotate-12 shadow-inner">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="mt-4 relative z-10">
                        <h3 className="text-[9px] font-black text-white/40 dark:text-muted-foreground/40 uppercase tracking-widest mb-1 ">Total Pipeline</h3>
                        <p className="text-3xl font-black text-white dark:text-foreground  tracking-tighter">{exams.length}</p>
                    </div>
                </div>
            </div>

            {/* Duties List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]  flex items-center gap-2 opacity-60">
                        <div className="h-4 w-1 bg-rose-500 dark:bg-rose-400 rounded-full" />
                        Duty Roster Sequence
                    </h2>
                    <span className="text-[9px] font-black text-slate-300 dark:text-muted-foreground/30 uppercase tracking-widest ">Live Feed</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-[2rem] bg-slate-50 dark:bg-muted/30 animate-pulse border border-slate-100 dark:border-border transition-all" />
                        ))
                    ) : exams.length > 0 ? (
                        exams.map((exam) => (
                            <div
                                key={exam.id}
                                className="group p-5 rounded-[2.2rem] border border-slate-100 dark:border-border bg-white dark:bg-card shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex items-center justify-between hover:border-rose-200 dark:hover:border-rose-500/30 transition-all text-left group hover:-translate-y-1.5 active:scale-95 cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/10 group-hover:bg-rose-500 transition-all" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="h-14 w-14 bg-slate-50 dark:bg-muted/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 dark:text-muted-foreground border border-slate-100 dark:border-border transition-all group-hover:bg-rose-500 dark:group-hover:bg-rose-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 shadow-sm group-hover:shadow-rose-500/20">
                                        <span className="text-[8px] font-black uppercase tracking-widest mb-0.5  opacity-80">
                                            {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-xl font-black leading-none ">
                                            {new Date(exam.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-base font-black text-slate-900 dark:text-foreground tracking-tighter leading-none uppercase  truncate max-w-[200px] group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{exam.subject}</h4>
                                            <Badge className="bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[8px] font-black px-1.5 py-0.5 rounded-lg uppercase  tracking-widest border border-rose-200/50 dark:border-rose-500/20 shadow-sm shrink-0">
                                                {exam.type}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1.5 mt-3">
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest ">
                                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-muted px-2 py-1 rounded-lg">
                                                    <Clock className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                                                    {exam.startTime} - {exam.endTime}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-muted px-2 py-1 rounded-lg">
                                                    <MapPin className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                                                    UNIT {exam.room}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-1 py-0.5 opacity-60">
                                                <Building2 className="h-3 w-3 text-slate-300 dark:text-muted-foreground/30" />
                                                <p className="text-[8px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.2em] ">
                                                    {exam.hall || "CMD HQ"} {exam.floor && `â€¢ LVL ${exam.floor}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-muted group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10 transition-all opacity-40 group-hover:opacity-100 shadow-inner group-hover:scale-110">
                                    <ChevronRight className="h-4 w-4 text-slate-300 dark:text-muted-foreground group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-all" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center bg-white dark:bg-card rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-border shadow-xl shadow-slate-200/10 dark:shadow-black/10 transition-all mx-auto w-full px-8">
                            <div className="h-16 w-16 bg-slate-50 dark:bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <FileText className="h-8 w-8 text-slate-200 dark:text-muted-foreground/20" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">Operational Silence</h3>
                            <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 mt-2 uppercase tracking-[0.3em]  max-w-sm mx-auto leading-relaxed">No invigilation duties detected in synchronization buffer. Check back once schedules are finalized.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Policy Protocol HUD */}
            <div className="p-6 bg-slate-900 dark:bg-card rounded-[2.5rem] border border-slate-800 dark:border-border text-white dark:text-foreground group overflow-hidden relative shadow-2xl transition-all hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 transition-all group-hover:bg-rose-500/10" />
                <div className="flex items-start gap-5 relative z-10">
                    <div className="h-12 w-12 bg-white/10 dark:bg-muted rounded-2xl flex items-center justify-center text-rose-400 dark:text-rose-400 shrink-0 shadow-inner transition-transform group-hover:rotate-12">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-400 dark:text-rose-400 ">Duty Protocol</p>
                            <h4 className="text-sm font-black text-white dark:text-foreground uppercase  tracking-widest">Operational Directives</h4>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                <span className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-tighter ">Reporting Delta: T-minus 30m</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                <span className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-tighter ">Payload Link: CTR Room 102</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                <span className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-tighter ">Comm Signal Interference: 0%</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                <span className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-tighter ">Zone integrity restricted</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
