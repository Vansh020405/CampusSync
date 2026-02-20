'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, User, Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
    const pastLeaves = leaves.filter(l => l.status !== 'PENDING');

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 pb-20 bg-slate-50 min-h-screen">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Leaves</h1>
                <p className="text-sm font-medium text-slate-500">Manage and process absence requests</p>
            </header>

            <div className="space-y-6">
                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Pending Review ({pendingLeaves.length})</h2>
                    {pendingLeaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <Check className="h-8 w-8 text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Pending Requests</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingLeaves.map((leave) => (
                                <Card key={leave.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-1.5 w-full bg-amber-400" />
                                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 justify-between md:items-center">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                                                <User className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">{leave.student.name}</h3>
                                                <div className="flex gap-2 items-center mt-1 text-[10px] font-black uppercase tracking-widest">
                                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{leave.student.rollNo}</span>
                                                    <span className="text-slate-400">{leave.student.department} | {leave.student.section}</span>
                                                </div>
                                                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <p className="text-xs font-medium text-slate-700 leading-relaxed italic">"{leave.reason}"</p>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-3 shrink-0">
                                            <Button
                                                onClick={() => handleAction(leave.id, 'APPROVED')}
                                                disabled={processing === leave.id}
                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-none shadow-none rounded-xl h-10 w-full md:w-32 font-bold tracking-widest text-[10px]"
                                            >
                                                {processing === leave.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <> <Check className="h-4 w-4 mr-2" /> Approve </>}
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(leave.id, 'REJECTED')}
                                                disabled={processing === leave.id}
                                                variant="outline"
                                                className="border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl h-10 w-full md:w-32 font-bold tracking-widest text-[10px]"
                                            >
                                                <X className="h-4 w-4 mr-2" /> Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {pastLeaves.length > 0 && (
                    <div className="pt-8">
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Processed Leaves</h2>
                        <div className="space-y-3">
                            {pastLeaves.map(leave => (
                                <div key={leave.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{leave.student.name} <span className="font-medium text-slate-400">({leave.student.rollNo})</span></p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                                {new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={
                                        leave.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-none" : "bg-rose-50 text-rose-600 border-none"
                                    }>
                                        {leave.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
