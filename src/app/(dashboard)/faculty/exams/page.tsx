'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar, Clock, MapPin, Building2,
    CheckCircle2, AlertCircle, FileText, ChevronRight,
    Search, User, HardDrive
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
        <div className="max-w-2xl mx-auto space-y-8 pb-32 pt-6 px-4 font-sans">
            {/* Minimal Clean Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-rose-500/20 underline-offset-8">Examination Duties</h1>
                <p className="text-sm font-medium text-slate-500 lowercase tracking-tight">Assigned invigilation slots and room allotments</p>
            </div>

            {/* Quick Stats Tiles */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-rose-50 rounded-[2rem] p-6 border border-rose-100 flex flex-col justify-between">
                    <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-600">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-[10px] font-black text-rose-900/40 uppercase tracking-widest mb-1">Upcoming Duties</h3>
                        <p className="text-3xl font-black text-rose-700">{exams.filter(e => new Date(e.date) >= new Date()).length}</p>
                    </div>
                </div>
                <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 flex flex-col justify-between">
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="mt-4">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Assigned</h3>
                        <p className="text-3xl font-black text-white">{exams.length}</p>
                    </div>
                </div>
            </div>

            {/* Duties List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Duty Schedule</h2>
                    <span className="text-[10px] font-bold text-slate-300">Live Roster</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                        ))
                    ) : exams.length > 0 ? (
                        exams.map((exam) => (
                            <div
                                key={exam.id}
                                className="group p-6 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm flex items-center justify-between hover:border-rose-100 transition-all text-left"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="h-14 w-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-100 group-hover:border-rose-100 group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                        <span className="text-[8px] font-black uppercase tracking-widest mb-0.5">
                                            {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-xl font-black leading-none">
                                            {new Date(exam.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-black text-slate-900 tracking-tight leading-none uppercase">{exam.subject}</h4>
                                            <Badge className="bg-rose-100 text-rose-700 text-[8px] font-black px-1.5 py-0 rounded-md">
                                                {exam.type}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col gap-1.5 mt-3">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-slate-300" />
                                                    {exam.startTime} - {exam.endTime}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-300" />
                                                    Room {exam.room}
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                                <Building2 className="h-3 w-3" />
                                                {exam.hall || "Examination Hall"} {exam.floor && `• Floor ${exam.floor}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-rose-400 transition-all" />
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                            <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No Exam Duties Allotted</p>
                            <p className="text-[9px] font-bold text-slate-300 mt-2">Check back once the datesheet is finalized</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Policy Reminder */}
            <div className="p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-white/90">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white shrink-0">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-1 text-white">Duty Protocol</p>
                        <ul className="space-y-1.5">
                            <li className="text-[9px] font-bold text-white/50 leading-relaxed uppercase tracking-tight">
                                • Reporting time is 30 minutes prior to scheduled start
                            </li>
                            <li className="text-[9px] font-bold text-white/50 leading-relaxed uppercase tracking-tight">
                                • Collect attendance sheets from controller desk (Room 102)
                            </li>
                            <li className="text-[9px] font-bold text-white/50 leading-relaxed uppercase tracking-tight">
                                • Mobile phones prohibited inside examination premises
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
