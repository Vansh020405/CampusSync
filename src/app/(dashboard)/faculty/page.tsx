'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Users, TrendingUp, ChevronRight, Send, CheckCircle2,
    BookOpen, FileText, LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useRealtime } from "@/hooks/useRealtime";

export default function FacultyDashboardPage() {
    const { data: session } = useSession();
    const facultyId = (session?.user as any)?.id || "1";
    const facultyName = session?.user?.name || "Faculty Member";

    const [broadcastSection, setBroadcastSection] = useState("4G2");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isSent, setIsSent] = useState(false);

    const { broadcast } = useRealtime();
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

    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const today = new Date();
                const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                const res = await fetch(`/api/timetable`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTodaySchedule(data.filter(t => t.day === dayName));
                }
            } catch (err) {
                console.error("Failed to fetch faculty timetable:", err);
            }
        };
        fetchTimetable();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-32 px-4 py-12 bg-white min-h-screen font-sans">
            {/* Minimal Faculty Hub Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-[#020617] tracking-tighter">
                        Faculty Hub
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {session?.user?.name?.toUpperCase() || "PROF. SUMIT SHARMA"} <span className="mx-1">•</span> DEPT. OF CSE
                    </p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                    <Users className="h-6 w-6" />
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-slate-100 shadow-sm bg-[#F8FAFC] rounded-[2rem] p-6 flex flex-col justify-between h-36">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Classes</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                            {todaySchedule.filter(s => !s.isFree).length}
                        </h3>
                    </div>
                    <div className="flex justify-end">
                        <Badge variant="secondary" className="bg-white text-slate-400 font-bold text-[8px] px-3 py-1 rounded-full border border-slate-100">
                            TODAY
                        </Badge>
                    </div>
                </Card>
                <Card className="border border-slate-100 shadow-sm bg-[#F8FAFC] rounded-[2rem] p-6 flex flex-col justify-between h-36">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Attendance</p>
                    <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">91.7%</h3>
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                </Card>
            </div>

            {/* Broadcast Center Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast Center</h2>
                    <div className="flex gap-2">
                        {["402", "4G3"].map((sec) => (
                            <button
                                key={sec}
                                onClick={() => setBroadcastSection(sec)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[9px] font-black transition-all border uppercase tracking-widest h-8",
                                    broadcastSection === sec
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-300 border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {sec}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative bg-[#F8FAFC] rounded-[2rem] p-2 border border-slate-100 group">
                    <Textarea
                        placeholder={`Write a message to Section ${broadcastSection}...`}
                        className="min-h-[140px] bg-transparent border-none focus-visible:ring-0 text-sm font-medium placeholder:text-slate-300 resize-none p-4"
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4">
                        <Button
                            className={cn(
                                "rounded-xl font-bold text-[10px] tracking-widest uppercase h-9 px-5 shadow-sm",
                                isSent ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-black"
                            )}
                            disabled={!broadcastMessage.trim() || isSent}
                            onClick={handleSendBroadcast}
                        >
                            <Send className="h-3 w-3 mr-2" />
                            {isSent ? "Sent" : "Broadcast"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Action Center Section */}
            <div className="space-y-6">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Center</h2>
                <div className="grid grid-cols-1 gap-4">
                    <Link href="/faculty/syllabus">
                        <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between group cursor-pointer hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">Syllabus Tracker</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Update course progress</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                        </div>
                    </Link>

                    <Link href="/faculty/leave">
                        <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between group cursor-pointer hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">Leave Portal</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">3 days remaining</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                        </div>
                    </Link>

                    <Link href="/faculty/attendance">
                        <div className="p-4 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-between group cursor-pointer hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                                    <LayoutGrid className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">Attendance Manager</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Mark daily presence</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-200 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    );
}

