'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Users, TrendingUp, ChevronRight, Send, CheckCircle2,
    BookOpen, FileText, LayoutGrid, Clock, MapPin, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRealtime } from "@/hooks/useRealtime";

export default function FacultyDashboardPage() {
    const { data: session } = useSession();
    const facultyId = (session?.user as any)?.id || "1";
    const facultyName = session?.user?.name || "Faculty Member";

    const [broadcastSection, setBroadcastSection] = useState("4G2");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const fetchTimetable = async () => {
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
                            Dept. of Computer Science
                        </p>
                    </div>
                </div>
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                    <Users className="h-7 w-7" />
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
        </div>
    );
}
