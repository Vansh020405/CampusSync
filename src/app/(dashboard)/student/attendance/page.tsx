'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, AlertCircle, ChevronRight, Sparkles, Calendar, Loader2, CheckCircle, XCircle, Palmtree, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRealtime } from "@/hooks/useRealtime";
import { toast } from "sonner";

export default function StudentAttendancePage() {
    const { data: session } = useSession();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [allRecords, setAllRecords] = useState<any[]>([]);
    const [riskScores, setRiskScores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    // Leave State
    const [leaves, setLeaves] = useState<any[]>([]);
    const [leaveForm, setLeaveForm] = useState({ fromDate: '', toDate: '', reason: '', documentUrl: '' });
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const rollNo = (session?.user as any)?.rollNo || "23-4G2-01";

    const fetchAttendance = async () => {
        if (!rollNo) return;
        try {
            const res = await fetch(`/api/attendance/student?rollNo=${rollNo}`);
            const data = await res.json();
            if (data.records) setAllRecords(data.records);
            if (data.riskScores) setRiskScores(data.riskScores);
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

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/student/leave');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error("Failed to fetch leaves:", error);
        }
    };

    useEffect(() => {
        fetchAttendance();
        fetchLeaves();
    }, [rollNo]);

    useRealtime((event) => {
        if (event.type === 'ATTENDANCE_UPDATE') {
            if (event.data.studentId === (session?.user as any)?.id) {
                fetchAttendance();
            }
        }
    });

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmittingLeave(true);
        try {
            const res = await fetch('/api/student/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leaveForm)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Leave application submitted successfully");
                setLeaveForm({ fromDate: '', toDate: '', reason: '', documentUrl: '' });
                fetchLeaves();
            } else {
                toast.error(data.error || "Failed to submit leave application");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setLeaveForm(prev => ({ ...prev, documentUrl: content }));
            setIsUploading(false);
            toast.success("Medical document attached successfully");
        };
        reader.onerror = () => {
            setIsUploading(false);
            toast.error("Failed to read document");
        };
        reader.readAsDataURL(file);
    };

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
        <div className="max-w-2xl mx-auto space-y-4 pb-24 animate-in fade-in duration-500 font-sans px-2">
            {/* Journal Header */}
            <div className="px-1 py-4 md:py-6 flex items-start justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase">{(session?.user as any)?.name}</h1>
                    <p className="text-[10px] md:text-xs text-slate-400 dark:text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">Section {(session?.user as any)?.section || '4G2'} â€¢ Attendence Portal</p>
                </div>
                <div className="pt-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-slate-300 dark:text-muted-foreground/30" />
                </div>
            </div>

            {/* Global AI Protocol Briefing */}
            {subjects.some(s => s.percentage < 75) && (
                <div className="p-4 md:p-5 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -m-8 h-20 w-20 md:h-24 md:w-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-2.5">
                            <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-black text-indigo-100 uppercase tracking-[0.2em]">System Status â€¢ Restricted</p>
                                <h2 className="text-base md:text-lg font-black tracking-tight">Recovery Protocol Active</h2>
                            </div>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-indigo-50 leading-relaxed opacity-90">
                            Our analysis indicates <span className="bg-white/20 px-1.5 py-0.5 rounded-lg border border-white/20">{subjects.filter(s => s.percentage < 75).length} subjects</span> are currently below the 75% threshold.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-3 md:space-y-4">
                {subjects.map((subject) => {
                    const isExpanded = expandedSubject === subject.name;
                    const subjectRecords = allRecords.filter(r => r.subject === subject.name);
                    const shortName = subject.name.split(' ')[0];

                    return (
                        <Card
                            key={subject.name}
                            className={cn(
                                "border-0 dark:border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-300",
                                isExpanded ? "scale-[1.01]" : ""
                            )}
                        >
                            <CardContent
                                className="p-0 cursor-pointer"
                                onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                            >
                                <div className="p-3.5 md:p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 md:gap-3">
                                        <div className="h-9 w-9 md:h-11 md:w-11 bg-slate-50 dark:bg-muted rounded-lg md:rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-border">
                                            <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-slate-400 dark:text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-foreground tracking-tight uppercase">
                                                {shortName}
                                            </h3>
                                            <p className="text-[10px] md:text-[12px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest mt-0">
                                                {subject.attended}/{subject.total} Sessions
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-xl font-bold text-slate-900 dark:text-foreground leading-none mb-2">
                                                {subject.percentage.toFixed(0)}%
                                            </div>
                                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
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
                                        {(() => {
                                            const risk = riskScores.find(rs => rs.subjectName === subject.name);
                                            const bunkCount = Math.floor(subject.attended / 0.75 - subject.total);
                                            
                                            const insight = risk?.requiredAttendance || (
                                                subject.percentage < 75 
                                                    ? `Attend next ${Math.ceil((0.75 * subject.total - subject.attended) / 0.25)} classes to hit 75%` 
                                                    : (bunkCount > 0 
                                                        ? `Strategic Margin: You can safely skip the next ${bunkCount} sessions without dropping below 75% threshold.` 
                                                        : `Critical Stability: Attendance is at the limit. Any omission will lead to a shortfall.`)
                                            );
 
                                            return (
                                                <div className={cn(
                                                    "mb-6 p-4 rounded-2xl flex items-start gap-4 ring-1",
                                                    subject.percentage < 75
                                                        ? "bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 ring-indigo-500/10"
                                                        : "bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-100/50 dark:border-emerald-500/20 ring-emerald-500/10"
                                                )}>
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg dark:shadow-none",
                                                        subject.percentage < 75
                                                            ? "bg-indigo-500 text-white shadow-indigo-200"
                                                            : "bg-emerald-500 text-white shadow-emerald-200"
                                                    )}>
                                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className={cn(
                                                            "text-[10px] font-black uppercase tracking-[0.2em] leading-none",
                                                            subject.percentage < 75 ? "text-indigo-400 dark:text-indigo-300" : "text-emerald-500 dark:text-emerald-400"
                                                        )}>
                                                            Intelligence â€¢ {subject.percentage < 75 ? "Recovery Plan" : "Safety Margin"}
                                                        </p>
                                                        <p className={cn(
                                                            "text-[13px] font-bold leading-tight",
                                                            subject.percentage < 75 ? "text-indigo-900 dark:text-indigo-100" : "text-emerald-900 dark:text-emerald-100"
                                                        )}>
                                                            {insight}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="space-y-3 pt-2 border-t border-slate-50 dark:border-border">
                                            <p className="text-[11px] font-bold text-slate-300 dark:text-muted-foreground uppercase tracking-[0.15em] mb-4">Historical Logs</p>
                                            <div className="space-y-4">
                                                {subjectRecords.map((record, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "h-2 w-2 rounded-full",
                                                                record.status === 'PRESENT' ? "bg-[#0D9488]" : "bg-red-500"
                                                            )} />
                                                            <div>
                                                                <p className="text-[13px] font-bold text-slate-700 dark:text-foreground">
                                                                    {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium mt-0.5 leading-none">
                                                                    Prof. {record.faculty?.name || "Faculty"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className={cn(
                                                            "text-[10px] font-bold px-3 py-1 rounded-full border-none shadow-none",
                                                            record.status === 'PRESENT' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
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

            {/* Leave Application & History Section */}
            <div className="space-y-6 pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-foreground tracking-tight flex items-center gap-2">
                            <Palmtree className="h-5 w-5 text-amber-500" /> Digital Absence Ledger
                        </h2>
                        <p className="text-[13px] text-slate-400 dark:text-muted-foreground font-medium mt-1">Formalize your absence through institutional channels</p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-slate-900 dark:bg-card border border-slate-100 dark:border-border text-white dark:text-foreground hover:bg-slate-800 dark:hover:bg-secondary px-6 font-black text-[10px] uppercase tracking-widest h-12 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all active:scale-95 flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Apply for Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[92%] max-w-md bg-white dark:bg-[#151515] border-0 rounded-[2.5rem] p-0 shadow-2xl overflow-hidden focus:outline-none">
                            <DialogHeader className="p-7 md:p-10 bg-slate-50 dark:bg-white/5 border-0">
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none">
                                        <Palmtree className="h-6 w-6" />
                                    </div>
                                    Leave Application
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleApplyLeave} className="p-7 md:p-10 space-y-7">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ml-1">Commencement</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-slate-100 dark:bg-white/5 border-0 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-foreground outline-none focus:ring-0 focus:bg-slate-200 dark:focus:bg-white/10 transition-all"
                                            value={leaveForm.fromDate}
                                            onChange={(e) => setLeaveForm(prev => ({ ...prev, fromDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ml-1">Resumption</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-slate-100 dark:bg-white/5 border-0 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-foreground outline-none focus:ring-0 focus:bg-slate-200 dark:focus:bg-white/10 transition-all"
                                            value={leaveForm.toDate}
                                            onChange={(e) => setLeaveForm(prev => ({ ...prev, toDate: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ml-1">Primary Justification</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="State the nature of your absence..."
                                        className="w-full bg-slate-100 dark:bg-white/5 border-0 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-foreground outline-none focus:ring-0 focus:bg-slate-200 dark:focus:bg-white/10 transition-all resize-none"
                                        value={leaveForm.reason}
                                        onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ml-1 flex items-center justify-between">
                                        <span>Supporting Evidence</span>
                                        {leaveForm.documentUrl && <span className="text-emerald-500 flex items-center gap-1 font-black underline underline-offset-4 decoration-2">Verified</span>}
                                    </label>
                                    <div className="relative group/upload">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={isUploading}
                                        />
                                        <div className={cn(
                                            "w-full bg-slate-100 dark:bg-white/5 border-0 rounded-2xl px-4 py-4 text-xs font-black text-slate-400 dark:text-muted-foreground flex items-center justify-center gap-3 transition-all group-hover/upload:bg-slate-200 dark:group-hover/upload:bg-white/10",
                                            isUploading && "opacity-50"
                                        )}>
                                            {isUploading ? (
                                                <><Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Processing...</>
                                            ) : leaveForm.documentUrl ? (
                                                <><CheckCircle className="h-4 w-4 text-emerald-500" /> File Attached</>
                                            ) : (
                                                <><Plus className="h-4 w-4" /> Upload Document</>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmittingLeave}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 font-black tracking-[0.2em] uppercase text-xs shadow-xl shadow-amber-200 dark:shadow-none transition-all active:scale-[0.98] mt-4"
                                >
                                    {isSubmittingLeave ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Request"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {leaves.length > 0 ? (
                    <div className="bg-white dark:bg-card rounded-[3rem] border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                        <div className="p-8 md:p-10 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-muted-foreground mb-8">Historical Context</h3>
                            <div className="grid gap-5">
                                {leaves.map((leave, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 md:p-8 bg-slate-50/50 dark:bg-secondary/20 rounded-[2.5rem] border-0 group hover:bg-white dark:hover:bg-card transition-all duration-500">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 dark:text-foreground uppercase tracking-wider">
                                                    {new Date(leave.fromDate).toLocaleDateString()} â€” {new Date(leave.toDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-[13px] font-medium text-slate-500 dark:text-muted-foreground  truncate max-w-[280px]">"{leave.reason}"</p>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-border">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-muted-foreground">Authorized By</p>
                                                <p className="text-[11px] font-bold text-slate-600 dark:text-foreground">{leave.faculty?.name || 'Mentor'}</p>
                                            </div>
                                            <Badge className={cn(
                                                "border-none shadow-none text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl",
                                                leave.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                                                    leave.status === 'REJECTED' ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
                                                        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                            )}>
                                                {leave.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-border bg-slate-50/50 dark:bg-card/50">
                        <Palmtree className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Leave Records</h3>
                        <p className="text-[11px] text-slate-300 mt-1">Your absence ledger is currently empty.</p>
                    </div>
                )}
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
