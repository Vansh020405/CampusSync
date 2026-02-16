'use client';

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    GraduationCap, Clock, AlertTriangle, BookOpen,
    Calendar, MapPin, Users, Bell, ChevronRight, Layout,
    TrendingUp, MessageSquare
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
            const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            const res = await fetch(`/api/timetable?section=${studentData.section}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                const dayClasses = data.filter((t: any) => t.day === currentDay);
                let filtered = dayClasses;

                // Fallback: If no classes today, show the first available day's classes
                if (dayClasses.length === 0 && data.length > 0) {
                    const firstDay = data[0].day;
                    filtered = data.filter((t: any) => t.day === firstDay);
                }

                const mapped = filtered.map((t: any, idx: number) => ({
                    id: t.id,
                    subject: t.subject,
                    faculty: t.faculty?.name || "Faculty",
                    time: `${t.startTime} - ${t.endTime}`,
                    room: t.classroom,
                    status: idx === 0 ? "Next" : "Scheduled"
                }));
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
        <div className="max-w-2xl mx-auto space-y-10 pb-32 px-6 py-12 bg-white min-h-screen">
            {/* Minimal Header */}
            <div className="flex items-end justify-between px-1">
                <div className="space-y-0.5">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                        Journal
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Monday • Series 4G2
                    </p>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-100 text-[9px] font-black uppercase tracking-widest px-3 py-1 text-slate-400">
                    Live Session
                </Badge>
            </div>

            {/* Attendance Alerts - Slim Pill */}
            {parseFloat(overallAttendance) < 75 && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-4 flex items-center gap-4 mx-1">
                    <div className="h-10 w-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none mb-1">Status Critical</p>
                        <p className="text-xs font-bold text-rose-900 leading-none">Attendance currently {overallAttendance}%.</p>
                    </div>
                </div>
            )}

            {/* Timetable List - Ultra Minimal */}
            <div className="space-y-4">
                <div className="px-1">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</h2>
                </div>

                {timetableLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-slate-50 rounded-[1.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : todayClasses.length > 0 ? (
                    <div className="space-y-3">
                        {todayClasses.map((cls) => (
                            <div key={cls.id} className="p-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:border-slate-300 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none mb-1">
                                            {cls.subject}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {cls.time} • Room {cls.room}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-900" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-[2rem] border-dashed border-slate-200 border">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active classes found</p>
                    </div>
                )}
            </div>

            {/* Quick Note - Minimal Dark Card */}
            <div className="bg-[#0F172A] rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Note</p>
                    <Badge className="bg-slate-800 text-slate-400 border-none px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                        Sync
                    </Badge>
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    {liveMessage ? liveMessage.message : "Check portal for daily updates and faculty transmissions."}
                </p>
            </div>
        </div>
    );
}
