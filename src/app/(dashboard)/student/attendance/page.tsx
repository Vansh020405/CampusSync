'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, AlertCircle, ChevronRight } from "lucide-react";
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
        <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-in fade-in duration-500">
            <div className="px-1 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Journal</h1>
                    <p className="text-xs text-slate-500 font-medium">Section AIML 4G2 • Spring 2026</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setIsLoading(true);
                        fetchAttendance();
                    }}
                    className={cn(
                        "rounded-full hover:bg-slate-100 transition-all active:scale-90",
                        isLoading && "animate-spin opacity-50"
                    )}
                    disabled={isLoading}
                >
                    <Clock className="h-5 w-5 text-slate-400" />
                </Button>
            </div>

            <div className="space-y-2">
                {subjects.map((subject) => {
                    const isExpanded = expandedSubject === subject.name;
                    const subjectRecords = allRecords.filter(r => r.subject === subject.name);

                    return (
                        <Card
                            key={subject.name}
                            className={cn(
                                "border-none shadow-sm bg-white rounded-2xl overflow-hidden transition-all duration-300",
                                isExpanded ? "ring-1 ring-slate-200" : "active:scale-[0.98]"
                            )}
                        >
                            <CardContent
                                className="p-0 cursor-pointer"
                                onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                            >
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            subject.percentage < 75 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                                        )}>
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 leading-none mb-1">
                                                {subject.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {subject.attended}/{subject.total} Classes
                                                </span>
                                                {subject.percentage < 75 && (
                                                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 uppercase tracking-tighter">
                                                        <AlertCircle className="h-2.5 w-2.5" /> Low
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-sm font-black",
                                                subject.percentage >= 85 ? "text-slate-900" :
                                                    subject.percentage >= 75 ? "text-slate-700" : "text-red-600"
                                            )}>
                                                {subject.percentage.toFixed(0)}%
                                            </div>
                                            <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-700",
                                                        subject.percentage >= 85 ? "bg-emerald-500" :
                                                            subject.percentage >= 75 ? "bg-blue-500" : "bg-red-500"
                                                    )}
                                                    style={{ width: `${subject.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 text-slate-300 transition-transform duration-300",
                                            isExpanded && "rotate-90"
                                        )} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2 pt-2 border-t border-slate-50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Historical Logs</p>
                                            {subjectRecords.map((record, idx) => (
                                                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-slate-50/50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            record.status === 'PRESENT' ? "bg-emerald-500" : "bg-red-500"
                                                        )} />
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-700">
                                                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                            <p className="text-[9px] text-slate-400 font-medium">
                                                                {(() => {
                                                                    if (record.period) {
                                                                        const d = new Date(record.date);
                                                                        d.setHours(9 + (record.period - 1), 0, 0);
                                                                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                                    }
                                                                    return new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                                })()} • Prof. {record.faculty?.name || "Faculty"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={cn(
                                                        "text-[9px] font-black uppercase tracking-tighter px-2 h-5 flex items-center border-none",
                                                        record.status === 'PRESENT' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {record.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>

                                        {subject.percentage < 75 && (
                                            <div className="mt-4 p-3 bg-red-50/50 rounded-xl flex items-center gap-3 text-[10px] text-red-600 font-bold border border-red-100/50">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                <span>Recovery Plan: Attend next {Math.ceil((0.75 * subject.total - subject.attended) / 0.25)} sessions to hit 75%.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div >

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Quick Note</p>
                    <p className="text-xs font-medium mt-1">Check faculty page for makeup sessions.</p>
                </div>
                <Badge className="bg-white/10 hover:bg-white/20 border-white/10 text-[10px] font-bold">
                    REFRESHED
                </Badge>
            </div>
        </div >
    );
}
