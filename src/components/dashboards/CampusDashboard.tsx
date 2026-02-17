'use client';

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    GraduationCap, Clock, AlertTriangle, BookOpen,
    Calendar, MapPin, Users, Bell, ChevronRight, Layout,
    TrendingUp, MessageSquare, Sparkles, MapPinned, Zap, CheckCircle2, Award
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { DEMO_FACULTY } from "@/lib/store";
import { useRealtime } from "@/hooks/useRealtime";
import { useState, useEffect } from "react";

export default function CampusDashboard() {
    const { data: session } = useSession();
    const [liveMessage, setLiveMessage] = useState<{ message: string, time: string, sender: string } | null>(null);
    const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [timetableLoading, setTimetableLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const studentData = {
        name: session?.user?.name || "Student",
        rollNo: (session?.user as any)?.rollNo || "23-4G2-01",
        section: (session?.user as any)?.section || "4G2"
    };

    const fetchStats = async () => {
        if (!studentData.rollNo) return;
        try {
            const res = await fetch(`/api/attendance/student?rollNo=${studentData.rollNo}`);
            const data = await res.json();
            if (data.stats) setAttendanceStats(data.stats);
        } catch (err) {
            console.error("Failed to fetch live stats:", err);
        }
    };

    const fetchMessages = async () => {
        if (!studentData.section) return;
        try {
            const res = await fetch(`/api/messages?section=${studentData.section}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setLiveMessage({
                    message: data[0].message,
                    sender: data[0].sender?.name || "Faculty",
                    time: new Date(data[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    };

    const fetchTimetable = async () => {
        if (!studentData.section) return;
        try {
            const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
            const currentDay = days[new Date().getDay()];
            const res = await fetch(`/api/timetable?section=${studentData.section}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                const dayClasses = data.filter((t: any) => t.day.trim().toUpperCase() === currentDay);
                let filtered = dayClasses;

                if (dayClasses.length === 0 && data.length > 0) {
                    const firstDay = data[0].day;
                    filtered = data.filter((t: any) => t.day === firstDay);
                }

                const timeToMinutes = (timeStr: string) => {
                    if (!timeStr) return 0;
                    const [time, modifier] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (hours === 12) hours = 0;
                    if (modifier === 'PM') hours += 12;
                    return hours * 60 + minutes;
                };

                const now = new Date();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                const mapped = filtered
                    .sort((a: any, b: any) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                    .map((t: any) => {
                        const startMin = timeToMinutes(t.startTime);
                        const endMin = timeToMinutes(t.endTime);

                        let status = "Scheduled";
                        if (currentMinutes > endMin) status = "Completed";
                        else if (currentMinutes >= startMin && currentMinutes <= endMin) status = "Live";

                        return {
                            id: t.id,
                            subject: t.subject,
                            faculty: t.faculty?.name || "Faculty",
                            time: `${t.startTime} - ${t.endTime}`,
                            room: t.classroom,
                            status: status
                        };
                    });

                // Mark the first "Scheduled" class as "Next Up" if no class is "Live"
                const hasLive = mapped.some(c => c.status === "Live");
                if (!hasLive) {
                    const nextUpIdx = mapped.findIndex(c => c.status === "Scheduled");
                    if (nextUpIdx !== -1) mapped[nextUpIdx].status = "Next Up";
                }

                setTodayClasses(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch timetable:", err);
        } finally {
            setTimetableLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchMessages();
        fetchTimetable();
    }, [studentData.rollNo, studentData.section]);

    useRealtime((event) => {
        if (event.type === 'NEW_BROADCAST') {
            if (event.data.section === studentData.section) {
                setLiveMessage({ message: event.data.message, sender: event.data.senderName, time: "Now" });
            }
        }
        if (event.type === 'ATTENDANCE_UPDATE') {
            if (event.data.studentId === (session?.user as any)?.id) {
                fetchStats();
            }
        }
    });

    const overallAttendance = attendanceStats.length > 0
        ? (attendanceStats.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceStats.length).toFixed(1)
        : "88.4";

    return (
        <div className="w-full max-w-4xl mx-auto pb-32 px-4 md:px-8 py-6 md:py-10 space-y-8 animate-in fade-in duration-700">
            {/* Premium Header Card */}
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 p-5 md:p-8 shadow-2xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-white/10 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 -m-8 h-48 w-48 rounded-full bg-black/10 blur-[60px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 md:space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em]">Live</span>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-none mb-2 md:mb-3">
                                {studentData.name}
                            </h1>
                            <div className="flex items-center gap-3 text-emerald-50/80">
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-[11px] font-bold">
                                    {studentData.section}
                                </Badge>
                                <span className="text-[10px] md:text-[11px] font-bold tracking-tight opacity-80">{studentData.rollNo}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Layout className="h-6 w-6 text-emerald-500" />
                            Today's classes
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    {todayClasses.length > 0 && (
                        <Badge variant="outline" className="rounded-full border-slate-100 text-[10px] font-bold p-2 px-4 shadow-sm">
                            {todayClasses.length} Sessions Today
                        </Badge>
                    )}
                </div>

                {timetableLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-slate-100/50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                ) : todayClasses.length > 0 ? (
                    <div className="grid gap-4">
                        {todayClasses.map((cls, idx) => (
                            <div
                                key={cls.id}
                                className={cn(
                                    "relative group transition-all duration-500 hover:scale-[1.02]",
                                    mounted && "animate-in slide-in-from-bottom-4 duration-500",
                                    cls.status === "Completed" && "opacity-60 grayscale-[0.5]"
                                )}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r rounded-[2rem] blur-xl opacity-0 group-hover:opacity-1 transition-opacity",
                                    cls.status === "Live" ? "from-emerald-400 to-teal-400 opacity-20" :
                                        cls.status === "Next Up" ? "from-indigo-400 to-blue-400 opacity-10" : "from-slate-200 to-indigo-100"
                                )}></div>

                                <Card className={cn(
                                    "relative border-0 rounded-[2rem] shadow-sm group-hover:shadow-xl transition-all overflow-hidden",
                                    cls.status === "Live" ? "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10" :
                                        cls.status === "Next Up" ? "ring-2 ring-indigo-500/20" : ""
                                )}>
                                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6",
                                                cls.status === "Live"
                                                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200"
                                                    : cls.status === "Next Up"
                                                        ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200"
                                                        : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                                            )}>
                                                {cls.status === "Completed" ? <CheckCircle2 className="h-7 w-7" /> : <BookOpen className="h-7 w-7" />}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className={cn(
                                                    "text-lg font-black tracking-tight transition-colors",
                                                    cls.status === "Live" ? "text-emerald-600" : "text-slate-800"
                                                )}>
                                                    {cls.subject}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-slate-400 font-bold">
                                                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {cls.time}
                                                    </div>
                                                    <div className="h-1 w-1 rounded-full bg-slate-200 hidden md:block" />
                                                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        Room {cls.room}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                            <div className="flex flex-col md:items-end">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty</p>
                                                <p className="text-xs font-bold text-slate-800">{cls.faculty}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={cn(
                                                    "rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] border-0",
                                                    cls.status === "Live" ? "bg-emerald-500 text-white animate-pulse" :
                                                        cls.status === "Next Up" ? "bg-indigo-500 text-white" :
                                                            cls.status === "Completed" ? "bg-slate-200 text-slate-500" :
                                                                "bg-slate-100 text-slate-500"
                                                )}>
                                                    {cls.status}
                                                </Badge>
                                                <Link href={`/student/classes/${cls.id}`} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card className="border-0 rounded-[2.5rem] bg-slate-50/50 border-dashed border-2 border-slate-200">
                        <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <Sparkles className="h-8 w-8 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Mission Complete</h3>
                                <p className="text-sm font-bold text-slate-400">No active sessions scheduled for today. Enjoy your downtime.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Live Notice / Broadcast Section */}
            {(liveMessage || (parseFloat(overallAttendance) < 75)) && (
                <div className="space-y-2 md:space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                            Alerts
                        </h2>
                    </div>
                    {attendanceStats.some(s => s.percentage < 75) && (
                        <div className="bg-rose-50 border border-rose-100 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 animate-in slide-in-from-top-4 duration-500 shadow-sm">
                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-[1rem] md:rounded-[1.5rem] bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 shrink-0">
                                <AlertTriangle className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-0.5">
                                    <Sparkles className="h-3 w-3 text-rose-400" />
                                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em]">Priority Protocol • AI Analysis</p>
                                </div>
                                <h3 className="text-base md:text-lg font-black text-rose-900 leading-tight">
                                    Attendance Deficit Detected
                                </h3>
                                <p className="text-xs md:text-sm font-bold text-rose-700/80 mt-1">
                                    <span className="text-rose-900">{attendanceStats.filter(s => s.percentage < 75).length} subjects</span> are below 75%.
                                </p>
                            </div>
                            <Link href="/student/attendance" className="w-full md:w-auto">
                                <Button size="sm" className="w-full md:w-auto rounded-xl md:rounded-2xl bg-rose-900 text-white hover:bg-rose-800 px-6 font-black text-[9px] uppercase tracking-widest h-10 md:h-14 shadow-xl shadow-rose-100">
                                    Recovery Strategy
                                </Button>
                            </Link>
                        </div>
                    )}
                    {liveMessage && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                                <Zap className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Live from {liveMessage.sender}</p>
                                <p className="text-xs md:text-sm font-bold text-indigo-900 line-clamp-1 md:line-clamp-2">{liveMessage.message}</p>
                            </div>
                            <div className="text-[9px] font-black text-indigo-300 uppercase shrink-0">{liveMessage.time}</div>
                        </div>
                    )}
                </div>
            )}

            {/* Exam Alert Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-sky-500" />
                        Academic Milestones
                    </h2>
                    <Link href="/student/exams" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                        Schedule
                    </Link>
                </div>
                <div className="bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-sky-50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-sky-100 transition-colors" />
                    <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-[1rem] md:rounded-[1.5rem] bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner shrink-0">
                            <Clock className="h-6 w-6 md:h-8 md:w-8" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-base md:text-lg font-black text-slate-900 leading-tight uppercase">
                                Season of Knowledge
                            </h3>
                            <p className="text-xs md:text-sm font-bold text-slate-500 mt-1">
                                End-Sem exams are approaching.
                            </p>
                        </div>
                        <Link href="/student/exams" className="w-full md:w-auto">
                            <Button size="sm" className="w-full md:w-auto rounded-xl md:rounded-2xl bg-sky-600 text-white hover:bg-sky-700 px-6 font-black text-[9px] uppercase tracking-widest h-10 md:h-14 shadow-xl shadow-sky-100">
                                Open Portal
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>



            {/* Broadcast Hub - Messages from Teachers */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                        Academic Broadcasts
                    </h2>
                </div>

                <Card className="border-0 rounded-[2.5rem] bg-indigo-50/50 border-2 border-dashed border-indigo-100/50 overflow-hidden">
                    <CardContent className="p-8">
                        {liveMessage ? (
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Incoming from {liveMessage.sender}</p>
                                        <Badge className="bg-indigo-100 text-indigo-600 border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1">{liveMessage.time}</Badge>
                                    </div>
                                    <p className="text-xl font-bold text-slate-800 leading-snug">
                                        "{liveMessage.message}"
                                    </p>
                                    <div className="pt-4 flex items-center gap-4">
                                        <Button className="rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 px-6 font-bold text-xs h-10 shadow-lg">Acknowledged</Button>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Verified • End of Transmission</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md">
                                    <Bell className="h-6 w-6 text-slate-300" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Active Broadcasts</h3>
                                    <p className="text-xs font-bold text-slate-400">System is idle. You'll see transmissions from faculty here.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
