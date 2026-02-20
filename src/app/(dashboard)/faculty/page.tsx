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
    Users, TrendingUp, ChevronRight, Send
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
                    approvedCount: data.approvedCount,
                    pendingCount: data.pendingCount,
                    totalCount: data.totalCount
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
                // For faculty, we want all classes they are assigned to
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
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 pb-20 px-4 md:px-6 py-6 md:py-10 bg-white min-h-screen font-sans">
            {/* Minimal Faculty Hub Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-50 pb-6 md:pb-10 gap-4 md:gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1">Institutional Profile</p>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                            {facultyName}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200/50">
                            <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                {facultyIdDisplay}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {facultyDepts.map((d: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                                        {d}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {mentoredSections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {mentoredSections.map((ms: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-xl border border-teal-100/50">
                                        <Users className="h-3.5 w-3.5 text-teal-600" />
                                        <p className="text-[10px] font-black text-teal-700 uppercase tracking-widest">
                                            Mentor: {ms.department} - {ms.section} ({ms.batch})
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-slate-50 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300">
                        <Users className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    {facultySubjects.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-start md:justify-end max-w-[240px]">
                            {facultySubjects.map((s: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[8px] font-black uppercase text-slate-400 border-slate-100 bg-white px-2 py-0.5 shadow-sm">
                                    {s.trim()}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>




            {/* Upcoming Sessions Tiles */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Upcoming Sessions</h2>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-100 text-slate-400">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : todaySchedule.length > 0 ? (
                    <div className="space-y-3">
                        {todaySchedule.map((cls) => (
                            <div key={cls.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-slate-50 rounded-2xl md:rounded-3xl shadow-sm hover:border-emerald-100 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-all shadow-sm">
                                        <BookOpen className="h-6 w-6 stroke-[1.5px]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight">
                                            {cls.subject}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>Section {cls.section}</span>
                                            <span className="text-slate-200">|</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{cls.startTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[8px] md:text-[9px] uppercase tracking-[0.1em] px-2 md:px-3 py-0.5 md:py-1 rounded-lg">
                                        {cls.classroom}
                                    </Badge>
                                    <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">{cls.endTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 md:py-20 text-center bg-slate-50 rounded-3xl md:rounded-[2.5rem] border border-dashed border-slate-200">
                        <Calendar className="h-8 md:h-10 w-8 md:w-10 text-slate-200 mx-auto mb-3 md:mb-4" />
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">No sessions today</p>
                    </div>
                )}
            </div>





            {/* Broadcast Center Section */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Broadcast</h2>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl md:rounded-2xl">
                        {["4G2", "4G3"].map((sec) => (
                            <button
                                key={sec}
                                onClick={() => setBroadcastSection(sec)}
                                className={cn(
                                    "px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black transition-all border uppercase tracking-widest",
                                    broadcastSection === sec
                                        ? "bg-white text-slate-900 border-white shadow-sm"
                                        : "bg-transparent text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative bg-[#F8FAFC] rounded-3xl md:rounded-[2.5rem] p-3 md:p-4 border border-slate-100 group transition-all focus-within:ring-2 focus-within:ring-slate-100">
                    <Textarea
                        placeholder={`Announce to Section ${broadcastSection}...`}
                        className="min-h-[120px] md:min-h-[160px] bg-transparent border-none focus-visible:ring-0 text-sm md:text-[15px] font-medium placeholder:text-slate-300 resize-none p-4 md:p-6 leading-relaxed"
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                        <Button
                            className={cn(
                                "rounded-xl md:rounded-2xl font-bold text-[10px] md:text-[11px] tracking-widest uppercase h-10 md:h-12 px-5 md:px-8 shadow-xl transition-all",
                                isSent ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-black"
                            )}
                            disabled={!broadcastMessage.trim() || isSent}
                            onClick={handleSendBroadcast}
                        >
                            <Send className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2 md:mr-3" />
                            {isSent ? "Sent" : "Transmit"}
                        </Button>
                    </div>
                </div>
            </div>


        </div>
    );
}
