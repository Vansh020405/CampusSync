'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar, CheckCircle2, XCircle, Clock,
    User, ChevronLeft, Filter, Search, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useToast } from "@/components/ui/use-toast";

export default function AdminFacultyLeavesPage() {
    const { toast } = useToast();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

    const fetchLeaves = async () => {
        try {
            const res = await fetch("/api/faculty/leave");
            const data = await res.json();
            if (data.leaves) {
                setLeaves(data.leaves);
            }
        } catch (e) {
            console.error("Failed to fetch leaves");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch("/api/faculty/leave", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                toast({
                    title: `Application ${status.toLowerCase()}`,
                    description: `The leave request has been marked as ${status.toLowerCase()}.`,
                });
                fetchLeaves();
            }
        } catch (e) {
            toast({
                title: "Action failed",
                description: "Critical error in updating leave status.",
                variant: "destructive"
            });
        }
    };

    const filteredLeaves = leaves.filter(l =>
        filter === 'ALL' ? true : l.status === filter
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-32 px-6 py-12 bg-white min-h-screen font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors mb-2 group"
                    >
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Admin Hub
                    </Link>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        Teacher Leave Desk
                    </h1>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matrix Overview */}
            <div className="grid grid-cols-1 gap-4 px-2">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-40 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                    ))
                ) : filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                        <div
                            key={leave.id}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                        >
                            <div className="flex items-start gap-6">
                                <div className="h-16 w-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-lg font-black uppercase shadow-inner shrink-0">
                                    {leave.faculty.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                                            {leave.faculty.name}
                                        </h3>
                                        <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-400 px-2 py-0">
                                            #{leave.faculty.facultyId}
                                        </Badge>
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            leave.status === 'PENDING' ? "bg-amber-100 text-amber-700" :
                                                leave.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                                                    "bg-rose-100 text-rose-700"
                                        )}>
                                            {leave.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            {leave.faculty.department}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <p className="text-sm font-medium text-slate-700">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 block mb-1">Reason:</span>
                                            {leave.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {leave.status === 'PENDING' && (
                                <div className="flex flex-col sm:flex-row gap-3 min-w-[200px]">
                                    <Button
                                        onClick={() => handleAction(leave.id, 'APPROVED')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-2xl px-8 shadow-lg shadow-emerald-100 transition-all"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(leave.id, 'REJECTED')}
                                        variant="outline"
                                        className="border-rose-200 text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-[0.2em] h-12 rounded-2xl px-8 transition-all"
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-32 text-center space-y-4 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Search className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No Leave Applications to review</p>
                    </div>
                )}
            </div>
        </div>
    );
}
