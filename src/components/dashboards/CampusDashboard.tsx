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
            const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
            const currentDay = days[new Date().getDay()];
            const res = await fetch(`/api/timetable?section=${studentData.section}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                // Filter for current day precisely
                const dayClasses = data.filter((t: any) => t.day.trim().toUpperCase() === currentDay);
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
        <div className="max-w-2xl mx-auto pb-32 px-8 py-16 bg-white min-h-screen font-light">
            {/* Elegant Minimal Header */}
            <div className="mb-16">
                <h1 className="text-4xl font-normal text-slate-800 tracking-tight mb-2">
                    Journal
                </h1>
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </span>
                    <div className="h-[1px] w-6 bg-slate-100" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
                        Series {studentData.section}
                    </span>
                </div>
            </div>

            {/* Attendance Status - Subtle Integrated Design */}
            {parseFloat(overallAttendance) < 75 && (
                <div className="mb-12">
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Alert</p>
                                <p className="text-[13px] text-slate-600 font-medium">Attendance at {overallAttendance}%</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-[11px] font-medium text-indigo-500 uppercase tracking-wider hover:bg-transparent px-0">
                            Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Timeline - Pure Minimalist List */}
            <div className="space-y-8 mb-20">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h2 className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.3em]">Timeline</h2>
                    {todayClasses.length > 0 && (
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                            {todayClasses.length} sessions
                        </span>
                    )}
                </div>

                {timetableLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-slate-50/50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : todayClasses.length > 0 ? (
                    <div className="space-y-1">
                        {todayClasses.map((cls) => (
                            <div key={cls.id} className="group flex items-center justify-between py-5 border-b border-slate-50 hover:border-slate-100 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                                        <BookOpen className="h-5 w-5 stroke-[1.5px]" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-medium text-slate-800 tracking-tight mb-1">
                                            {cls.subject}
                                        </h3>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <span className="text-[11px] font-normal tracking-wide">{cls.time}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[11px] font-normal tracking-wide">Room {cls.room}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full flex items-center justify-center border border-transparent group-hover:border-slate-50 group-hover:bg-slate-50/50 transition-all">
                                    <ChevronRight className="h-4 w-4 text-slate-300 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-[11px] font-medium text-slate-300 uppercase tracking-widest">No active sessions for today</p>
                    </div>
                )}
            </div>

            {/* Broadcast Hub - Aesthetic Footer Note */}
            <div className="pt-12 border-t border-slate-50">
                <div className="flex items-start justify-between gap-12">
                    <div className="max-w-xs">
                        <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.2em] mb-4">Verification Note</p>
                        <p className="text-[14px] text-slate-500 leading-relaxed font-normal">
                            {liveMessage ? liveMessage.message : "System operational. All faculty transmissions are verified and linked to your current series."}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                                {liveMessage?.time || "Protocol Idle"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
        </div >
    );
}
