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
    Palmtree, AlertCircle, FileText, ChevronRight, Activity, ShieldCheck
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
            case "APPROVED": return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 icon-emerald-500 dark:icon-emerald-400";
            case "REJECTED": return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 icon-rose-500 dark:icon-rose-400";
            default: return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 icon-amber-500 dark:icon-amber-400";
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
        <div className="max-w-3xl mx-auto space-y-6 pb-40 pt-6 px-4 font-sans min-h-screen bg-white dark:bg-background transition-colors animate-in fade-in duration-500">
            {/* Minimal Clean Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-border pb-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                        <Activity className="h-4 w-4 text-slate-900 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground font-mono ">Presence Control</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none">Absence Hub</h1>
                    <p className="text-[10px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest mt-1">
                        Managing <span className="text-slate-900 dark:text-indigo-400 font-black ">Operational Integrity Protocols</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-border text-slate-400 dark:text-muted-foreground text-[9px] font-black uppercase tracking-widest  flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Auth Link Latency: 24ms
                    </Badge>
                </div>
            </div>

            {/* Action Tiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Apply New Leave Tile */}
                <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <DialogTrigger asChild>
                        <button className="flex flex-col items-center justify-center p-8 bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] text-white hover:bg-black dark:hover:bg-indigo-500 transition-all group shadow-2xl text-center border-none overflow-hidden relative active:scale-95">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="h-16 w-16 bg-white/20 dark:bg-white/10 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-inner relative z-10">
                                <Plus className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase  relative z-10 leading-none">Initialize Absence</span>
                            <span className="text-[9px] uppercase font-black tracking-[0.3em] opacity-40 mt-3 relative z-10 ">Deploy Transmission Record</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-black/60 bg-white dark:bg-card overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <DialogHeader className="relative z-10 text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                    <Palmtree className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tighter uppercase  dark:text-foreground">Protocol Request</DialogTitle>
                                    <DialogDescription className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.2em] mt-1 ">
                                        Institutional Authorization Link Required
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-6 py-6 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ml-1  opacity-60">Phase Initial</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-2xl border-slate-100 dark:border-border font-black text-sm bg-slate-50 dark:bg-muted/50 uppercase tracking-widest focus-visible:ring-indigo-500/20 "
                                        value={leaveData.fromDate}
                                        onChange={(e) => setLeaveData({ ...leaveData, fromDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ml-1  opacity-60">Phase Terminal</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-2xl border-slate-100 dark:border-border font-black text-sm bg-slate-50 dark:bg-muted/50 uppercase tracking-widest focus-visible:ring-indigo-500/20 "
                                        value={leaveData.toDate}
                                        onChange={(e) => setLeaveData({ ...leaveData, toDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ml-1  opacity-60">Mission Justification</Label>
                                <Textarea
                                    placeholder="Briefly bridge the presence gap explanation..."
                                    className="rounded-[1.5rem] border-slate-100 dark:border-border min-h-[140px] font-black text-sm bg-slate-50 dark:bg-muted/50 focus-visible:ring-indigo-500/20 dark:text-foreground  placeholder:text-slate-300 dark:placeholder:text-muted-foreground/30 uppercase tracking-tight p-6 resize-none shadow-inner"
                                    value={leaveData.reason}
                                    onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="relative z-10 flex-col sm:flex-row gap-3">
                            <Button
                                className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white dark:text-black font-black text-[10px] uppercase tracking-[0.25em] shadow-2xl shadow-indigo-500/20 hover:bg-black dark:hover:bg-indigo-500 transition-all  active:scale-95"
                                onClick={handleLeaveSubmit}
                                disabled={isSubmittingLeave}
                            >
                                {isSubmittingLeave ? "Transmitting..." : "Initialize Protocol Transmission"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Summary Stat Tile */}
                <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-[2.5rem] p-8 flex flex-col justify-between border border-emerald-100 dark:border-emerald-500/20 group relative overflow-hidden transition-all hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 active:scale-95 cursor-default shadow-xl shadow-emerald-500/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-150" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-14 w-14 bg-white dark:bg-card rounded-2xl shadow-lg border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:rotate-12">
                            <Palmtree className="h-7 w-7" />
                        </div>
                        <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-none font-black text-[9px] tracking-[0.2em] uppercase  px-2 py-0.5 rounded-lg">Verified_Slot</Badge>
                    </div>
                    <div className="mt-8 relative z-10">
                        <h3 className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.25em] mb-1 ">Total Gap Authorized</h3>
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter ">{stats.approved}</span>
                            <span className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/30 uppercase tracking-[0.2em] ">Mission Cycles</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* History as Column of Tiles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 opacity-60">
                    <h2 className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 ">
                        <div className="h-4 w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                        Deployment Registry
                    </h2>
                    <span className="text-[9px] font-black text-slate-300 dark:text-muted-foreground/30 uppercase tracking-widest ">{recentLeaves.length} Records Locked</span>
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
                                        "group p-5 rounded-[2.2rem] border bg-white dark:bg-card shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all text-left relative overflow-hidden active:scale-[0.98]",
                                        leave.status === "PENDING" ? "border-amber-100 dark:border-amber-500/20" : "border-slate-50 dark:border-border"
                                    )}
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-900/5 dark:bg-white/5" />
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={cn(
                                            "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-6 group-hover:scale-110",
                                            theme.split(' ')[0],
                                            theme.split(' ')[2] || ""
                                        )}>
                                            <Calendar className={cn("h-7 w-7", theme.split(' ')[3]?.replace('icon-', 'text-'))} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center flex-wrap gap-3">
                                                <h4 className="text-base font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  truncate max-w-[200px] md:max-w-[300px] leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{leave.reason}</h4>
                                                <Badge className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-widest  shadow-sm", theme.split(' ')[0], theme.split(' ')[1])}>
                                                    {leave.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mt-2  opacity-60 flex items-center gap-2">
                                                <div className="h-1 w-1 bg-current rounded-full" />
                                                {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                <span className="mx-1 opacity-40">{" >> "}</span>
                                                {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-muted group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all opacity-40 group-hover:opacity-100 shadow-inner group-hover:scale-110">
                                        <ChevronRight className="h-5 w-5 text-slate-300 dark:text-muted-foreground group-hover:text-indigo-500 transition-all" />
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="py-24 text-center bg-white dark:bg-card rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-border shadow-xl shadow-slate-200/10 dark:shadow-black/10 mx-auto w-full px-8">
                            <div className="h-20 w-20 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative group">
                                <FileText className="h-10 w-10 text-slate-200 dark:text-muted-foreground/20 relative z-10" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">Registry Purged</h3>
                            <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 mt-2 uppercase tracking-[0.3em]  max-w-sm mx-auto leading-relaxed">No departmental leave records detected in primary buffer link. Check archive sectors.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Leave Detail Modal */}
            <Dialog open={!!selectedDetailLeave} onOpenChange={() => setSelectedDetailLeave(null)}>
                <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-black/60 bg-white dark:bg-card overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <DialogHeader className="relative z-10 text-left">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform rotate-6",
                                selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status).split(' ')[0] : "bg-slate-100",
                                selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status).split(' ')[2] : ""
                            )}>
                                <Clock className={cn("h-7 w-7", selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status).split(' ')[3]?.replace('icon-', 'text-') : "text-slate-400")} />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tighter uppercase  leading-none dark:text-foreground">Record Review</DialogTitle>
                                <DialogDescription className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.3em] mt-1 ">
                                    REF_ID: {selectedDetailLeave?.id?.slice(-8).toUpperCase()}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4 relative z-10">
                        <div className="bg-slate-50 dark:bg-muted/30 rounded-[1.5rem] p-6 space-y-4 border border-slate-100 dark:border-border/50 shadow-inner">
                            <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 dark:border-border/50">
                                <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.2em] ">System Status</span>
                                <Badge className={cn(
                                    "font-black text-[9px] tracking-[0.25em] uppercase  px-3 py-1 rounded-lg shadow-sm shrink-0",
                                    selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status).split(' ')[0] : "",
                                    selectedDetailLeave ? getStatusTheme(selectedDetailLeave.status).split(' ')[1] : ""
                                )}>
                                    {selectedDetailLeave?.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center bg-white dark:bg-card p-4 rounded-xl shadow-sm border border-slate-50 dark:border-border/30">
                                <span className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]  flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Temporal Gap
                                </span>
                                <span className="text-[10px] font-black text-slate-700 dark:text-foreground uppercase  tracking-tighter">
                                    {selectedDetailLeave && new Date(selectedDetailLeave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    <span className="mx-2 opacity-20">{" >> "}</span>
                                    {selectedDetailLeave && new Date(selectedDetailLeave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.2em] ml-2  opacity-60">Justification Payload</span>
                            <div className="p-6 bg-slate-50 dark:bg-muted/30 rounded-[1.5rem] border border-slate-100 dark:border-border/50 shadow-inner">
                                <p className="text-sm font-black text-slate-700 dark:text-foreground leading-relaxed  border-l-2 border-indigo-500/20 pl-4 py-1">
                                    "{selectedDetailLeave?.reason}"
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-4 mt-8 relative z-10 flex-col sm:flex-row">
                        {selectedDetailLeave?.status === "PENDING" && (
                            <Button
                                variant="destructive"
                                className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/20 active:scale-95  bg-rose-600 hover:bg-rose-700 text-white border-none"
                                onClick={() => handleCancelLeave(selectedDetailLeave.id)}
                                disabled={isCancelling}
                            >
                                {isCancelling ? "Processing..." : "Abort Transmission"}
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] bg-slate-100 dark:bg-muted hover:bg-slate-200 dark:hover:bg-muted/80 text-slate-600 dark:text-muted-foreground  border-none"
                            onClick={() => setSelectedDetailLeave(null)}
                        >
                            Return to HQ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bottom Insight HUB */}
            <div className="p-8 bg-slate-900 dark:bg-card rounded-[2.5rem] border border-slate-800 dark:border-border text-white dark:text-foreground group overflow-hidden relative shadow-2xl transition-all hover:scale-[1.01]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 transition-all group-hover:bg-indigo-500/10" />
                <div className="flex items-start gap-5 relative z-10">
                    <div className="h-12 w-12 bg-white/10 dark:bg-muted rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 shadow-inner transition-transform group-hover:rotate-12">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1  leading-none">Operational Policy</p>
                        <h4 className="text-sm font-black text-white dark:text-foreground mb-3 uppercase  tracking-tighter leading-none mt-1">Absence Integrity Management</h4>
                        <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 leading-relaxed uppercase tracking-tight ">
                            Requests are processed via the Central Auth Sector within 48 mission cycles. Ensure sector redundancy is established for all active sessions prior to departure. Sync status IDLE.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
