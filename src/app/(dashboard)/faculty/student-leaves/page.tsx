'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, User, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FacultyStudentLeavesPage() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const res = await fetch('/api/faculty/student-leaves');
            if (res.ok) {
                const data = await res.json();
                setLeaves(data);
            }
        } catch (error) {
            console.error("Failed to fetch leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
        setProcessing(leaveId);
        try {
            const res = await fetch('/api/faculty/student-leaves', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leaveId, status })
            });

            if (res.ok) {
                toast.success(`Leave request ${status.toLowerCase()} successfully`);
                fetchLeaves();
            } else {
                toast.error("Failed to process leave request");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-white dark:bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
    const pastLeaves = leaves.filter(l => l.status !== 'PENDING');

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 pb-32 bg-white dark:bg-background min-h-screen font-sans transition-colors duration-500">
            <header className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-border pb-4 transition-all">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100 dark:border-orange-500/20 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-foreground uppercase  leading-none mt-1">Leave Requests</h1>
                        <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60  mt-1">Operational Absence Processing Hub</p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-muted-foreground mb-4 opacity-70 ">Critical Review â€¢ {pendingLeaves.length} Active</h2>
                    {pendingLeaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-card rounded-[2.5rem] border border-slate-100 dark:border-border border-dashed transition-all">
                            <Check className="h-10 w-10 text-slate-100 dark:text-muted-foreground opacity-30 mb-4" />
                            <p className="text-[10px] font-black text-slate-300 dark:text-muted-foreground uppercase tracking-widest">No Pending Clearances</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingLeaves.map((leave) => (
                                <Card key={leave.id} className="border-none shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all bg-white dark:bg-card">
                                    <div className="h-1 w-full bg-orange-400 dark:bg-orange-500 animate-pulse" />
                                    <CardContent className="p-5 flex flex-col md:flex-row gap-5 justify-between md:items-center">
                                        <div className="flex gap-4 min-w-0">
                                            <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-500/20">
                                                <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-base font-black text-slate-900 dark:text-foreground uppercase  tracking-tight truncate">{leave.student.name}</h3>
                                                <div className="flex gap-2 items-center mt-1 text-[9px] font-black uppercase tracking-widest  opacity-70">
                                                    <span className="bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground px-2 py-0.5 rounded-full">{leave.student.rollNo}</span>
                                                    <span className="text-slate-400 truncate">{leave.student.department} | {leave.student.section}</span>
                                                </div>
                                                <div className="mt-3 bg-slate-50 dark:bg-muted/30 p-4 rounded-2xl border border-slate-100 dark:border-border space-y-3 transition-all">
                                                    <p className="text-[11px] font-black text-slate-700 dark:text-muted-foreground leading-relaxed  opacity-80 decoration-slate-300 dark:decoration-slate-700 underline underline-offset-4 decoration-dashed">"{leave.reason}"</p>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-widest ">
                                                            <Calendar className="h-3 w-3 opacity-60" />
                                                            {new Date(leave.fromDate).toLocaleDateString()} â€” {new Date(leave.toDate).toLocaleDateString()}
                                                        </div>
                                                        {leave.documentUrl && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-700 transition-all  rounded-xl"
                                                                onClick={() => {
                                                                    const a = document.createElement('a');
                                                                    a.href = leave.documentUrl;
                                                                    a.download = `Medical_Doc_${leave.student.rollNo}`;
                                                                    a.click();
                                                                }}
                                                            >
                                                                Document Verification
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-3 shrink-0">
                                            <Button
                                                onClick={() => handleAction(leave.id, 'APPROVED')}
                                                disabled={processing === leave.id}
                                                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20 rounded-2xl h-11 w-full md:w-32 font-black tracking-widest text-[10px] uppercase  transition-all"
                                            >
                                                {processing === leave.id ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <> <Check className="h-4 w-4 mr-2" /> Approve </>}
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(leave.id, 'REJECTED')}
                                                disabled={processing === leave.id}
                                                variant="outline"
                                                className="border-rose-100 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl h-11 w-full md:w-32 font-black tracking-widest text-[10px] uppercase  transition-all"
                                            >
                                                <X className="h-4 w-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {pastLeaves.length > 0 && (
                    <section className="pt-8 border-t border-slate-100 dark:border-border border-dashed">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-muted-foreground mb-4 opacity-70 ">Transmission History â€¢ Log</h2>
                        <div className="space-y-2">
                            {pastLeaves.map(leave => (
                                <div key={leave.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-muted flex items-center justify-center border border-slate-100 dark:border-border shrink-0">
                                            <User className="h-4 w-4 text-slate-400 dark:text-muted-foreground opacity-50" />
                                        </div>
                                        <div className="min-w-0 truncate">
                                            <p className="text-sm font-black text-slate-800 dark:text-foreground  tracking-tight">{leave.student.name} <span className="font-bold text-slate-400 dark:text-muted-foreground opacity-50">({leave.student.rollNo})</span></p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground mt-0.5 opacity-60">
                                                {new Date(leave.fromDate).toLocaleDateString()} â€” {new Date(leave.toDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {leave.documentUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 px-2 text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground bg-white dark:bg-muted border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-card transition-all  opacity-60 hover:opacity-100 rounded-lg"
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = leave.documentUrl;
                                                    a.download = `Medical_Doc_${leave.student.rollNo}`;
                                                    a.click();
                                                }}
                                            >
                                                Verify
                                            </Button>
                                        )}
                                        <Badge className={cn(
                                            "border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest  rounded-lg",
                                            leave.status === 'APPROVED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                        )}>
                                            {leave.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
