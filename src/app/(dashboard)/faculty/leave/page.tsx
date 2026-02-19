'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Calendar, Clock, CheckCircle2, XCircle, Plus,
    Palmtree, AlertCircle, FileText, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function FacultyLeavePage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const facultyId = (session?.user as any)?.id;

    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [leaveData, setLeaveData] = useState({
        fromDate: "",
        toDate: "",
        reason: ""
    });
    const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
    const [stats, setStats] = useState({
        approved: 0,
        pending: 0,
        total: 0
    });

    const fetchLeaves = async () => {
        if (!facultyId) return;
        try {
            const res = await fetch("/api/faculty/leave");
            const data = await res.json();
            if (!data.error) {
                setStats({
                    approved: data.approvedCount || 0,
                    pending: data.pendingCount || 0,
                    total: data.totalCount || 0
                });
                setRecentLeaves(data.leaves || []);
            }
        } catch (e) {
            console.error("Failed to fetch leaves");
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [facultyId]);

    const handleLeaveSubmit = async () => {
        if (!leaveData.fromDate || !leaveData.toDate || !leaveData.reason) {
            toast({
                title: "Incomplete details",
                description: "Please provide all required information.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmittingLeave(true);
        try {
            const res = await fetch("/api/faculty/leave", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(leaveData)
            });
            const data = await res.json();
            if (data.success) {
                toast({
                    title: "Application Dispatched",
                    description: "Your leave request is now under review.",
                });
                setIsLeaveDialogOpen(false);
                setLeaveData({ fromDate: "", toDate: "", reason: "" });
                fetchLeaves();
            }
        } catch (e) {
            toast({
                title: "Transmission failed",
                description: "Critical error in application submission.",
                variant: "destructive"
            });
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-100 icon-emerald-500";
            case "REJECTED": return "bg-rose-50 text-rose-700 border-rose-100 icon-rose-500";
            default: return "bg-amber-50 text-amber-700 border-amber-100 icon-amber-500";
        }
    };

    const [selectedDetailLeave, setSelectedDetailLeave] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelLeave = async (id: string) => {
        setIsCancelling(true);
        try {
            const res = await fetch(`/api/faculty/leave?id=${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                toast({
                    title: "Application Retracted",
                    description: "Your leave request has been cancelled successfully.",
                });
                setSelectedDetailLeave(null);
                fetchLeaves();
            }
        } catch (e) {
            toast({
                title: "Cancellation failed",
                description: "Could not retract the application at this time.",
                variant: "destructive"
            });
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-32 pt-6 px-4 font-sans">
            {/* Minimal Clean Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance & Leaves</h1>
                <p className="text-sm font-medium text-slate-500">Manage your institutional absence records</p>
            </div>

            {/* Action Tiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Apply New Leave Tile */}
                <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[2rem] text-white hover:bg-black transition-all group shadow-xl text-center">
                            <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 transition-all">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight">Apply for Leave</span>
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mt-2">New Application</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight">Leave Application</DialogTitle>
                            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Official Absence Request
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-2xl border-slate-100 font-bold text-sm bg-slate-50"
                                        value={leaveData.fromDate}
                                        onChange={(e) => setLeaveData({ ...leaveData, fromDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-2xl border-slate-100 font-bold text-sm bg-slate-50"
                                        value={leaveData.toDate}
                                        onChange={(e) => setLeaveData({ ...leaveData, toDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Absence</Label>
                                <Textarea
                                    placeholder="Briefly explain the reason..."
                                    className="rounded-2xl border-slate-100 min-h-[120px] font-bold text-sm bg-slate-50 focus-visible:ring-slate-200"
                                    value={leaveData.reason}
                                    onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                                onClick={handleLeaveSubmit}
                                disabled={isSubmittingLeave}
                            >
                                {isSubmittingLeave ? "Transmitting..." : "Submit Application"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Summary Stat Tile */}
                <div className="bg-emerald-50 rounded-[2rem] p-8 flex flex-col justify-between border border-emerald-100">
                    <div className="flex justify-between items-start">
                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                            <Palmtree className="h-6 w-6" />
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px]">VERIFIED</Badge>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-[10px] font-black text-emerald-900/40 uppercase tracking-widest mb-1">Approved Leaves</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-emerald-700">{stats.approved}</span>
                            <span className="text-xs font-bold text-emerald-600/60 uppercase">Days Consumed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History as Column of Tiles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Absence History</h2>
                    <span className="text-[10px] font-bold text-slate-300">{recentLeaves.length} Records</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {recentLeaves.length > 0 ? (
                        recentLeaves.map((leave) => {
                            const theme = getStatusTheme(leave.status);
                            return (
                                <button
                                    key={leave.id}
                                    onClick={() => setSelectedDetailLeave(leave)}
                                    className={cn(
                                        "group p-5 rounded-3xl border bg-white shadow-sm flex items-center justify-between hover:border-slate-300 transition-all text-left",
                                        leave.status === "PENDING" ? "border-amber-100" : "border-slate-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                                            theme.split(' ')[0],
                                            theme.split(' ')[2]
                                        )}>
                                            <Calendar className={cn("h-6 w-6", theme.split(' ')[3].replace('icon-', 'text-'))} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-slate-900 tracking-tight">{leave.reason}</h4>
                                                <Badge className={cn("text-[8px] font-black px-1.5 py-0 rounded-md", theme.split(' ')[0], theme.split(' ')[1])}>
                                                    {leave.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                <span className="mx-1 opacity-30">→</span>
                                                {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-slate-400 transition-all" />
                                </button>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No records found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Leave Detail Modal */}
            <Dialog open={!!selectedDetailLeave} onOpenChange={() => setSelectedDetailLeave(null)}>
                <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-none shadow-2xl">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                                selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status).split(' ')[0] : "bg-slate-100"
                            )}>
                                <Clock className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black tracking-tight">Application Review</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Reference ID: {selectedDetailLeave?.id?.slice(-8).toUpperCase()}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                <Badge className={cn(
                                    "font-black text-[10px] tracking-widest",
                                    selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status) : ""
                                )}>
                                    {selectedDetailLeave?.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</span>
                                <span className="text-xs font-bold text-slate-700">
                                    {selectedDetailLeave && new Date(selectedDetailLeave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    <span className="mx-2 opacity-30">to</span>
                                    {selectedDetailLeave && new Date(selectedDetailLeave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason Submitted</span>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                    {selectedDetailLeave?.reason}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedDetailLeave?.status === "PENDING" && (
                            <Button
                                variant="destructive"
                                className="w-full h-12 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-100"
                                onClick={() => handleCancelLeave(selectedDetailLeave.id)}
                                disabled={isCancelling}
                            >
                                {isCancelling ? "Processing..." : "Withdraw Application"}
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            className="w-full h-12 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] bg-slate-100 hover:bg-slate-200 text-slate-600"
                            onClick={() => setSelectedDetailLeave(null)}
                        >
                            Close Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bottom Insight */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700 mb-1">Institutional Policy</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                            Requests are processed within 24-48 hours. Please ensure backup arrangements are documented for your active sessions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
