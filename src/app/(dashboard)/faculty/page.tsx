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
    Users, TrendingUp, ChevronRight, Send, CheckCircle2,
    BookOpen, FileText, LayoutGrid, Clock, MapPin, Calendar,
    Plus, FileUp, Activity, Palmtree, AlertCircle
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
    const facultyDept = (session?.user as any)?.department || "Academic Department";
    const facultySubjectsString = (session?.user as any)?.subjects;
    const facultySubjects = facultySubjectsString
        ? (facultySubjectsString.startsWith('[') ? JSON.parse(facultySubjectsString) : facultySubjectsString.split(','))
        : [];

    const [broadcastSection, setBroadcastSection] = useState("4G2");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
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
                        const [time, modifier] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        if (hours === 12) hours = 0;
                        if (modifier === 'PM') hours += 12;
                        return hours * 60 + minutes;
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
        fetchTimetable();
    }, [facultyId]);

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 px-6 py-12 bg-white min-h-screen font-sans">
            {/* Minimal Faculty Hub Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Faculty Dashboard
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {facultyName.toUpperCase()}
                        </p>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                            {facultyDept}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                        <Users className="h-7 w-7" />
                    </div>
                    {facultySubjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                            {facultySubjects.map((s: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-[8px] font-black uppercase text-slate-400 border-slate-100 px-1.5 py-0 min-h-0 h-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : todaySchedule.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todaySchedule.map((cls) => (
                            <Card key={cls.id} className="group relative p-[1px] rounded-[2rem] bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50 hover:from-emerald-200 hover:via-teal-100 hover:to-emerald-50 transition-all duration-500 shadow-sm">
                                <CardContent className="bg-white rounded-[1.95rem] p-6 h-full flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all duration-300 shadow-inner">
                                                <BookOpen className="h-6 w-6 stroke-[1.5px]" />
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[9px] uppercase tracking-widest px-3">
                                                Active
                                            </Badge>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                                                {cls.subject}
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Section {cls.section}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-[11px] font-medium">{cls.startTime} - {cls.endTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="text-[11px] font-medium">{cls.classroom}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No scheduled sessions for today</p>
                    </div>
                )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border border-slate-100 shadow-sm bg-[#F8FAFC] rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Daily Sessions</p>
                        <h3 className="text-5xl font-extrabold text-slate-900 tracking-tighter">
                            {todaySchedule.length}
                        </h3>
                    </div>
                    <div className="flex justify-end">
                        <Badge variant="secondary" className="bg-white text-slate-400 font-bold text-[9px] px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            UPDATED
                        </Badge>
                    </div>
                </Card>
                <Card className="border border-slate-100 shadow-sm bg-[#F8FAFC] rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[160px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Faculty Presence</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-5xl font-extrabold text-emerald-600 tracking-tighter">91.7%</h3>
                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Broadcast Center Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Broadcast</h2>
                    <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        {["4G2", "4G3"].map((sec) => (
                            <button
                                key={sec}
                                onClick={() => setBroadcastSection(sec)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest",
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

                <div className="relative bg-[#F8FAFC] rounded-[2.5rem] p-4 border border-slate-100 group transition-all focus-within:ring-2 focus-within:ring-slate-100">
                    <Textarea
                        placeholder={`Announce something to Section ${broadcastSection}...`}
                        className="min-h-[160px] bg-transparent border-none focus-visible:ring-0 text-[15px] font-medium placeholder:text-slate-300 resize-none p-6 leading-relaxed"
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <div className="absolute bottom-6 right-6">
                        <Button
                            className={cn(
                                "rounded-2xl font-bold text-[11px] tracking-widest uppercase h-12 px-8 shadow-xl transition-all",
                                isSent ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-black"
                            )}
                            disabled={!broadcastMessage.trim() || isSent}
                            onClick={handleSendBroadcast}
                        >
                            <Send className="h-4 w-4 mr-3" />
                            {isSent ? "Message Dispatched" : "Transmit Broadcast"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Attendance & Leave Protocol Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Attendance Protocol</h2>
                    <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest px-6 h-10 hover:bg-emerald-700 shadow-lg shadow-emerald-100">
                                <Plus className="h-3 w-3 mr-2" />
                                Request Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] border-slate-100 p-8 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Leave Application</DialogTitle>
                                <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    Official Curriculum Sync Override
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</Label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-2xl border-slate-100 focus:ring-emerald-500 font-bold text-sm"
                                            value={leaveData.fromDate}
                                            onChange={(e) => setLeaveData({ ...leaveData, fromDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</Label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-2xl border-slate-100 focus:ring-emerald-500 font-bold text-sm"
                                            value={leaveData.toDate}
                                            onChange={(e) => setLeaveData({ ...leaveData, toDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Leave</Label>
                                    <Textarea
                                        placeholder="Briefly describe the reason (e.g., Medical, Personal, Seminar)"
                                        className="rounded-2xl border-slate-100 min-h-[100px] font-bold text-sm leading-relaxed"
                                        value={leaveData.reason}
                                        onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                    />
                                </div>
                                <div className="p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 group hover:border-emerald-300 transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                                        <FileUp className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medical / Proof (Optional)</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black disabled:opacity-50"
                                    onClick={handleLeaveSubmit}
                                    disabled={isSubmittingLeave}
                                >
                                    {isSubmittingLeave ? "Transmitting..." : "Submit Application"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none bg-[#F8FAFC] rounded-[2.5rem] shadow-sm overflow-hidden group">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-emerald-500" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leaves Consumed</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-slate-900">{leaveStats.approvedCount}</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Approved</span>
                                </div>
                            </div>
                            <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-emerald-500 group-hover:rotate-12 transition-all">
                                <Palmtree className="h-8 w-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-[#F8FAFC] rounded-[2.5rem] shadow-sm overflow-hidden group">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Pipeline</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-4xl font-black text-slate-900">{leaveStats.pendingCount}</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leaves Awaiting</span>
                                </div>
                            </div>
                            <div className="h-16 w-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-amber-500 group-hover:rotate-12 transition-all">
                                <Clock className="h-8 w-8" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recents Section */}
                {recentLeaves.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recent Logs</h3>
                        <div className="space-y-3">
                            {recentLeaves.map((leave) => (
                                <div key={leave.id} className="flex items-center justify-between p-5 bg-white border border-slate-50 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center",
                                            leave.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{leave.reason}</p>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                                {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        "capitalize font-bold text-[9px] tracking-wider px-3 py-1 rounded-full border-none",
                                        leave.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                    )}>
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
