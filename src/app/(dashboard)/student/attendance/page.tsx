'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, AlertCircle, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRealtime } from "@/hooks/useRealtime";

export default function StudentAttendancePage() {
    const { data: session } = useSession();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [allRecords, setAllRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    const rollNo = (session?.user as any)?.rollNo || "23-4G2-01";

    const fetchAttendance = async () => {
        if (!rollNo) return;
        try {
            const res = await fetch(`/api/attendance/student?rollNo=${rollNo}`);
            const data = await res.json();
            if (data.records) setAllRecords(data.records);
            if (data.stats) {
                setSubjects(data.stats.map((s: any) => ({
                    name: s.subject,
                    attended: Math.round((s.percentage / 100) * s.totalClasses),
                    total: s.totalClasses,
                    percentage: s.percentage
                })));
            }
        } catch (err) {
            console.error("Failed to fetch attendance:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [rollNo]);

    useRealtime((event) => {
        if (event.type === 'ATTENDANCE_UPDATE') {
            if (event.data.studentId === (session?.user as any)?.id) {
                fetchAttendance();
            }
        }
    });

    if (isLoading) {
        return <div className="p-8 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Ledger...</div>;
    }

    if (subjects.length === 0) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                    <Clock className="h-8 w-8 text-slate-300" />
                </div>
                <h2 className="text-xl font-black text-slate-900">No Attendance History</h2>
                <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto">Your institutional digital ledger is currently empty. Check back after your first session.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 font-sans">
            {/* Journal Header */}
            <div className="px-1 py-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{(session?.user as any)?.name}</h1>
                    <p className="text-[13px] text-slate-400 font-medium mt-1">Section {(session?.user as any)?.section || '4G2'} • Institutional Ledger</p>
                </div>
                <div className="pt-2">
                    <Clock className="h-6 w-6 text-slate-300 stroke-[1.5px]" />
                </div>
            </div>

            {/* Global AI Protocol Briefing */}
            {subjects.some(s => s.percentage < 75) && (
                <div className="mx-1 p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -m-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Sparkles className="h-5 w-5 text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">System Status • Restricted</p>
                                <h2 className="text-xl font-black tracking-tight">Recovery Protocol Active</h2>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-indigo-50 leading-relaxed opacity-90">
                            Our analysis indicates <span className="bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">{subjects.filter(s => s.percentage < 75).length} subjects</span> are currently below the 75% threshold. Expand subjects below to view specific recovery trajectories.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {subjects.map((subject) => {
                    const isExpanded = expandedSubject === subject.name;
                    const subjectRecords = allRecords.filter(r => r.subject === subject.name);
                    const shortName = subject.name.split(' ')[0];

                    return (
                        <Card
                            key={subject.name}
                            className={cn(
                                "border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-white rounded-[2rem] overflow-hidden transition-all duration-300",
                                isExpanded ? "ring-1 ring-slate-100" : ""
                            )}
                        >
                            <CardContent
                                className="p-0 cursor-pointer"
                                onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                            >
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                                            <BookOpen className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                                {shortName}
                                            </h3>
                                            <p className="text-[13px] font-medium text-slate-400 mt-0.5">
                                                {subject.attended}/{subject.total} Classes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-xl font-bold text-slate-900 leading-none mb-2">
                                                {subject.percentage.toFixed(0)}%
                                            </div>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        subject.percentage >= 75 ? "bg-[#0D9488]" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${subject.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <ChevronRight className={cn(
                                                "h-5 w-5 text-slate-200 transition-transform duration-300",
                                                isExpanded && "rotate-90 text-slate-400"
                                            )} />
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-400">
                                        {/* AI Recovery Insight */}
                                        {subject.percentage < 75 && (
                                            <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-4 ring-1 ring-indigo-500/10">
                                                <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                                                    <Sparkles className="h-5 w-5 animate-pulse" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none">AI Insight • Protocol 75</p>
                                                    <p className="text-[13px] font-bold text-indigo-900 leading-tight">
                                                        Attend the next <span className="text-xl font-black">{Math.ceil((0.75 * subject.total - subject.attended) / 0.25)}</span> classes consecutively to reach the 75% threshold.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3 pt-2 border-t border-slate-50">
                                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.15em] mb-4">Historical Logs</p>
                                            <div className="space-y-4">
                                                {subjectRecords.map((record, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "h-2 w-2 rounded-full",
                                                                record.status === 'PRESENT' ? "bg-[#0D9488]" : "bg-red-500"
                                                            )} />
                                                            <div>
                                                                <p className="text-[13px] font-bold text-slate-700">
                                                                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-none">
                                                                    Prof. {record.faculty?.name || "Faculty"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className={cn(
                                                            "text-[10px] font-bold px-3 py-1 rounded-full border-none shadow-none",
                                                            record.status === 'PRESENT' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                        )}>
                                                            {record.status}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Note Card */}
            <div className="mt-8 p-8 bg-[#111827] rounded-[2.5rem] text-white overflow-hidden relative shadow-xl">
                <div className="flex items-start justify-between relative z-10 transition-all">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">Quick Note</p>
                        <p className="text-[15px] font-medium mt-2 leading-relaxed text-slate-100 max-w-[240px]">
                            Check faculty page for makeup sessions.
                        </p>
                    </div>
                    <Badge className="bg-slate-800 text-slate-400 border-none px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider hover:bg-slate-800">
                        REFRESHED
                    </Badge>
                </div>
            </div>
        </div>
    );
}
