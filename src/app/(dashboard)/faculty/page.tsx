'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BookOpen, FileText, LayoutGrid, Clock, MapPin, Calendar,
    Plus, FileUp, Activity, Palmtree, AlertCircle, ShieldCheck, Fingerprint,
    Users, TrendingUp, ChevronRight, Send, GraduationCap, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRealtime } from "@/hooks/useRealtime";
import { useToast } from "@/components/ui/use-toast";

export default function FacultyDashboardPage() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const facultyId = (session?.user as any)?.id;
    const facultyName = session?.user?.name || "Faculty Member";
    const facultyDeptRaw = (session?.user as any)?.department;
    const facultyIdDisplay = (session?.user as any)?.facultyId || "FAC-000";

    const facultyDepts = facultyDeptRaw
        ? (facultyDeptRaw.startsWith('[') ? JSON.parse(facultyDeptRaw) : [facultyDeptRaw])
        : ["Academic Department"];
    const facultySubjectsString = (session?.user as any)?.subjects;
    const facultySubjects = facultySubjectsString
        ? (facultySubjectsString.startsWith('[') ? JSON.parse(facultySubjectsString) : facultySubjectsString.split(','))
        : [];

    const [broadcastSection, setBroadcastSection] = useState("4G2");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
    const [examDatesheet, setExamDatesheet] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Leave State
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
    const [leaveData, setLeaveData] = useState({
        fromDate: "",
        toDate: "",
        reason: ""
    });
    const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
    const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
    const [leaveStats, setLeaveStats] = useState({
        approvedCount: 0,
        pendingCount: 0,
        totalCount: 0
    });
    const [mentoredSections, setMentoredSections] = useState<any[]>([]);

    const { broadcast } = useRealtime();

    const fetchLeaveStats = async () => {
        if (!facultyId) return;
        try {
            const res = await fetch("/api/faculty/leave");
            const data = await res.json();
            if (!data.error) {
                setLeaveStats({
                    approvedCount: data.approvedCount || 0,
                    pendingCount: data.pendingCount || 0,
                    totalCount: data.totalCount || 0
                });
                setRecentLeaves(data.leaves || []);
            }
        } catch (e) {
            console.error("Failed to fetch leave stats");
        }
    };

    const handleLeaveSubmit = async () => {
        if (!leaveData.fromDate || !leaveData.toDate || !leaveData.reason) {
            toast({
                title: "Invalid Input",
                description: "Please fill all required fields.",
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
                    description: "Your leave request has been submitted for review.",
                });
                setIsLeaveDialogOpen(false);
                setLeaveData({ fromDate: "", toDate: "", reason: "" });
                fetchLeaveStats();
            }
        } catch (e) {
            toast({
                title: "Internal Error",
                description: "Failed to transmit leave request.",
                variant: "destructive"
            });
        } finally {
            setIsSubmittingLeave(false);
        }
    };

    useEffect(() => {
        fetchLeaveStats();
    }, [facultyId]);

    const handleSendBroadcast = async () => {
        if (!broadcastMessage.trim()) return;
        setIsSent(true);

        try {
            await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: facultyId,
                    section: broadcastSection,
                    message: broadcastMessage
                })
            });

            broadcast({
                type: 'NEW_BROADCAST',
                data: {
                    id: Date.now().toString(),
                    senderName: facultyName,
                    section: broadcastSection,
                    message: broadcastMessage,
                    timestamp: new Date()
                }
            });
        } catch (err) {
            console.error("Broadcast failed:", err);
        } finally {
            setTimeout(() => {
                setIsSent(false);
                setBroadcastMessage("");
            }, 3000);
        }
    };

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!facultyId) return;
            try {
                const today = new Date();
                const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                const res = await fetch(`/api/timetable?facultyId=${facultyId}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    const timeToMinutes = (timeStr: string) => {
                        if (!timeStr) return 0;
                        const [time, ampm] = timeStr.trim().split(/\s+/);
                        let [hours, minutes] = time.split(':').map(Number);
                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;
                        return hours * 60 + (minutes || 0);
                    };

                    const sorted = data
                        .filter(t => t.day === dayName)
                        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
                    setTodaySchedule(sorted);
                }
            } catch (err) {
                console.error("Failed to fetch faculty timetable:", err);
            } finally {
                setIsLoading(false);
            }
        };
        const fetchExams = async () => {
            try {
                const res = await fetch("/api/faculty/exams");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setExamDatesheet(data);
                }
            } catch (err) {
                console.error("Failed to fetch exam datesheet:", err);
            }
        };

        const fetchMentoredSections = async () => {
            try {
                const res = await fetch("/api/faculty/mentored-sections");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMentoredSections(data);
                }
            } catch (err) {
                console.error("Failed to fetch mentored sections:", err);
            }
        };

        fetchTimetable();
        fetchExams();
        fetchMentoredSections();
    }, [facultyId]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-40 px-4 md:px-8 py-6 md:py-10 bg-white dark:bg-background min-h-screen font-sans transition-colors animate-in fade-in duration-500">
            {/* Minimal Faculty Hub Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 dark:border-border/50 pb-8 md:pb-12 gap-8 md:gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="space-y-6 relative z-10 w-full">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]  opacity-70">Faculty Intelligence HQ</p>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-foreground tracking-tighter leading-none uppercase ">
                            {facultyName}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-muted/50 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                            <Fingerprint className="h-4 w-4 text-slate-400 dark:text-muted-foreground/40" />
                            <p className="text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.2em] ">
                                {facultyIdDisplay}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {facultyDepts.map((d: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/20">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.2em] ">
                                        {d}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-4 relative z-10">
                    <div className="h-14 w-14 md:h-20 md:w-20 bg-slate-900 dark:bg-card rounded-[2rem] flex items-center justify-center text-white dark:text-foreground shadow-2xl transition-all duration-500 hover:rotate-6 hover:scale-110 active:scale-95 group">
                        <Users className="h-7 w-7 md:h-10 md:w-10 group-hover:scale-110 transition-transform" />
                    </div>
                    {facultySubjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-start md:justify-end max-w-[280px]">
                            {facultySubjects.map((s: string, i: number) => (
                                <Badge key={i} className="text-[8px] font-black uppercase text-slate-500 dark:text-muted-foreground/60 border-slate-100 dark:border-border/50 bg-slate-50/50 dark:bg-muted/30 px-3 py-1 rounded-lg tracking-widest  shadow-sm hover:bg-white dark:hover:bg-muted transition-colors">
                                    {s.trim()}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tactical Grid: Sessions and Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                
                {/* Left Column: Sessions */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between px-2 opacity-60">
                        <h2 className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 ">
                            <div className="h-4 w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
                            Session Deployment Roster
                        </h2>
                        <Badge className="bg-slate-900 dark:bg-card text-white dark:text-muted-foreground border-none font-black text-[9px] tracking-widest px-3 py-1 rounded-xl ">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                        </Badge>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-slate-50 dark:bg-muted/50 rounded-[2rem] border border-slate-100 dark:border-border animate-pulse" />
                            ))}
                        </div>
                    ) : todaySchedule.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {todaySchedule.map((cls) => (
                                <div key={cls.id} className="group flex items-center justify-between p-5 bg-white dark:bg-card border border-slate-100 dark:border-border rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all hover:-translate-y-1.5 active:scale-[0.98] cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                                    <div className="flex items-center gap-5 relative z-10 w-full">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6 group-hover:scale-110 transition-all shadow-inner">
                                            <GraduationCap className="h-7 w-7 stroke-[1.5px]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-black text-slate-900 dark:text-foreground tracking-tighter leading-tight uppercase  group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                {cls.subject}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.2em] ">
                                                <Badge className="bg-slate-100 dark:bg-muted dark:text-foreground text-slate-600 border-none font-black text-[8px] px-2 py-0.5 rounded-lg leading-none">SEC {cls.section}</Badge>
                                                <div className="flex items-center gap-1.5 px-1 py-0.5">
                                                    <Clock className="h-3 w-3 text-emerald-500" />
                                                    <span>{cls.startTime} - {cls.endTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest ">{cls.classroom}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-white dark:bg-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-border shadow-2xl transition-all">
                            <div className="h-20 w-20 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Calendar className="h-10 w-10 text-slate-200 dark:text-muted-foreground/20" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">Operational Silence</h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 mt-2 uppercase tracking-[0.3em] ">No active session deployments detected for today.</p>
                        </div>
                    )}
                </div>

                {/* Global Transmission Center */}
                <div className="lg:col-span-12 space-y-6 pt-4 border-t border-slate-100 dark:border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2  opacity-60">
                                <div className="h-4 w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                                Broadcast Command Center
                            </h2>
                            <p className="text-[9px] font-black text-slate-300 dark:text-muted-foreground/20 uppercase tracking-[0.2em] ">Deploy Global Transmissions to Student Hubs</p>
                        </div>
                        <div className="flex gap-2 bg-slate-50 dark:bg-muted/30 p-1.5 rounded-2xl border border-slate-100 dark:border-border/50 shadow-inner">
                            {["4G2", "4G3", "ALL"].map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => setBroadcastSection(sec)}
                                    className={cn(
                                        "px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-[11px] font-black transition-all border uppercase tracking-widest ",
                                        broadcastSection === sec
                                            ? "bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20 scale-105"
                                            : "bg-transparent text-slate-400 dark:text-muted-foreground border-transparent hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-muted"
                                    )}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative group overflow-hidden bg-white dark:bg-card rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-6 border border-slate-100 dark:border-border transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-2xl shadow-slate-200/50 dark:shadow-black/40">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 transition-all duration-1000 group-focus-within:bg-indigo-500/10" />
                        <Textarea
                            placeholder={`Broadcast transmission payload to Sector ${broadcastSection}...`}
                            className="min-h-[160px] md:min-h-[220px] bg-transparent border-none focus-visible:ring-0 text-lg md:text-xl font-black uppercase tracking-tighter placeholder:text-slate-200 dark:placeholder:text-muted-foreground/20 resize-none p-6 md:p-8 leading-tight text-slate-900 dark:text-foreground  scrollbar-none shadow-none"
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-4 relative z-10 px-4 pb-4">
                            <div className="flex items-center gap-3 opacity-40 group-focus-within:opacity-100 transition-opacity">
                                <Activity className="h-4 w-4 text-indigo-500 animate-pulse" />
                                <span className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Comm Signal: STABLE</span>
                            </div>
                            <Button
                                className={cn(
                                    "rounded-2xl font-black text-[11px] md:text-[12px] tracking-[0.25em] uppercase h-14 md:h-16 px-10 md:px-14 shadow-2xl transition-all hover:scale-105 active:scale-95  overflow-hidden relative",
                                    isSent ? "bg-emerald-600 text-white shadow-emerald-500/30" : "bg-slate-900 dark:bg-indigo-600 text-white dark:text-black hover:bg-black dark:hover:bg-indigo-500 shadow-indigo-500/20"
                                )}
                                disabled={!broadcastMessage.trim() || isSent}
                                onClick={handleSendBroadcast}
                            >
                                <div className="absolute inset-0 bg-white/10 skew-x-12 translate-x-12 group-hover:translate-x-0 transition-transform duration-700" />
                                <div className="flex items-center relative z-10">
                                    {isSent ? <ShieldCheck className="h-5 w-5 mr-3" /> : <Send className="h-5 w-5 mr-3" />}
                                    {isSent ? "Deployed" : "Transmission Start"}
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Footer / Stats */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-6 bg-slate-50 dark:bg-muted/30 rounded-[2rem] border border-slate-100 dark:border-border shadow-inner group hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]  mb-1 relative z-10 opacity-60">Auth System</p>
                    <div className="flex items-end justify-between relative z-10">
                        <TrendingUp className="h-6 w-6 text-indigo-500" />
                        <span className="text-2xl font-black text-slate-900 dark:text-foreground  tracking-tighter">99.8%</span>
                    </div>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-muted/30 rounded-[2rem] border border-slate-100 dark:border-border shadow-inner group hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]  mb-1 relative z-10 opacity-60">Attendance Link</p>
                    <div className="flex items-end justify-between relative z-10">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        <span className="text-2xl font-black text-slate-900 dark:text-foreground  tracking-tighter">LIVE</span>
                    </div>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-muted/30 rounded-[2rem] border border-slate-100 dark:border-border shadow-inner group hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-default relative overflow-hidden col-span-2 md:col-span-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em]  mb-1 relative z-10 opacity-60">Mission Pending</p>
                    <div className="flex items-end justify-between relative z-10">
                        <AlertCircle className="h-6 w-6 text-rose-500" />
                        <span className="text-2xl font-black text-slate-900 dark:text-foreground  tracking-tighter uppercase">{leaveStats.pendingCount} TRANSMISSIONS</span>
                    </div>
               </div>
            </div>
        </div>
    );
}
