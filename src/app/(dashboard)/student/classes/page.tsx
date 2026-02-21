'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, GraduationCap, ChevronRight, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const PERIODS = [
    { id: 1, time: "09:00 - 10:00" },
    { id: 2, time: "10:00 - 11:00" },
    { id: 3, time: "11:00 - 12:00" },
    { id: 4, time: "12:00 - 13:00" },
    { id: 5, time: "13:00 - 14:00" }, // Lunch
    { id: 6, time: "14:00 - 15:00" },
    { id: 7, time: "15:00 - 16:00" },
];

const formatDisplayTime = (timeRange: string) => {
    return timeRange.split(' - ').map(t => {
        const [hStr, mStr] = t.split(':');
        const h = parseInt(hStr);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH.toString().padStart(2, '0')}:${mStr} ${ampm}`;
    }).join(' - ');
};

const getColorForSubject = (subject?: string) => {
    if (!subject) return 'slate';
    const s = subject.toLowerCase();
    if (s.includes('java')) return 'blue';
    if (s.includes('dbms')) return 'emerald';
    if (s.includes('os') || s.includes('operating')) return 'rose';
    if (s.includes('math')) return 'orange';
    if (s.includes('cn') || s.includes('network')) return 'indigo';
    if (s.includes('ai') || s.includes('intelligence')) return 'purple';
    return 'slate';
};

export default function StudentClassesPage() {
    const { data: session } = useSession();
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [timetable, setTimetable] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const section = (session?.user as any)?.section || "4G2";

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!section) return;
            try {
                const res = await fetch(`/api/timetable?section=${section}`);
                if (res.ok) {
                    const data = await res.json();
                    setTimetable(data);
                }
            } catch (error) {
                console.error("Failed to fetch student timetable:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimetable();
    }, [section]);

    const getEntryForSlot = (day: string, periodId: number) => {
        const period = PERIODS.find(p => p.id === periodId);
        if (!period) return undefined;

        const normalizeTime = (timeStr: string) => {
            if (!timeStr) return "";
            // Handle "09:00 AM" or "14:00"
            const [time, ampm] = timeStr.trim().split(/\s+/);
            const [hStr, mStr] = time.split(':');
            let h = parseInt(hStr);
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
        };

        const targetTime24 = normalizeTime(period.time.split(' - ')[0]);

        return timetable.find(c => {
            if (c.day.toUpperCase() !== day.toUpperCase()) return false;
            return normalizeTime(c.startTime) === targetTime24;
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Calendar className="h-20 w-20 rotate-12" />
                </div>
                <div className="relative z-10">
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 mb-2 px-3 py-0.5 rounded-full font-bold text-[10px]">
                        AY 2025-26 • SEM 4
                    </Badge>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        CSE AI ML {section}
                    </h1>
                    <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" /> Chitkara University
                    </p>
                </div>
            </div>

            {/* Mobile Day Selector */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 no-scrollbar">
                <div className="flex gap-2 min-w-max pb-2">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200", // Accessibility
                                selectedDay === day
                                    ? "bg-slate-800 text-white border-slate-800 shadow-md scale-105"
                                    : "bg-white text-slate-500 border-slate-100"
                            )}
                        >
                            {day.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop View: Full Grid */}
            <div className="hidden md:block overflow-x-auto pb-4 -mx-4 px-4">
                <div className="min-w-[1000px] space-y-4">
                    <div className="grid grid-cols-8 gap-3 mb-6">
                        <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        {PERIODS.map(p => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">P{p.id}</span>
                                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">{formatDisplayTime(p.time)}</span>
                            </div>
                        ))}
                    </div>

                    {DAYS.map(day => (
                        <div key={day} className="grid grid-cols-8 gap-2 min-h-[120px]">
                            <div className={cn(
                                "rounded-2xl p-4 flex items-center justify-center shadow-lg transition-all",
                                day === selectedDay ? "bg-blue-600 scale-105 z-10" : "bg-slate-800"
                            )}>
                                <span className="text-white font-black tracking-tighter text-lg rotate-[-90deg]">
                                    {day.substring(0, 3)}
                                </span>
                            </div>

                            {PERIODS.map(period => {
                                const entry = getEntryForSlot(day, period.id);
                                if (period.id === 5) { // Lunch
                                    return (
                                        <div key={`${day}-${period.id}`} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center opacity-60">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest rotate-[-90deg]">Lunch Phase</span>
                                        </div>
                                    );
                                }

                                if (entry) {
                                    const color = getColorForSubject(entry.subject);
                                    return (
                                        <div
                                            key={`${day}-${period.id}`}
                                            className={cn(
                                                "rounded-2xl p-4 shadow-sm border-2 transition-all hover:scale-[1.02] group relative overflow-hidden",
                                                color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-700" :
                                                    color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                                        color === 'rose' ? "bg-rose-50 border-rose-100 text-rose-700" :
                                                            color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-700" :
                                                                color === 'indigo' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                                                                    color === 'purple' ? "bg-purple-50 border-purple-100 text-purple-700" :
                                                                        "bg-slate-50 border-slate-100 text-slate-700"
                                            )}
                                        >
                                            <div className="h-full flex flex-col justify-between relative z-10">
                                                <div>
                                                    <h3 className="font-black text-[13px] tracking-tight leading-tight group-hover:underline">
                                                        {entry.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-1 mt-2 opacity-70">
                                                        <User className="h-2.5 w-2.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-tight truncate">{entry.faculty?.name || 'TBA'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2 opacity-70">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    <span className="text-[9px] font-black uppercase tracking-tight">{entry.classroom || 'TBA'}</span>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 opacity-5">
                                                <GraduationCap className="h-10 w-10" />
                                            </div>
                                        </div>
                                    );
                                }

                                return <div key={`${day}-${period.id}`} className="bg-slate-50/50 border border-slate-50 rounded-2xl flex items-center justify-center opacity-30">
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                </div>;
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View: Vertical Timeline */}
            <div className="md:hidden space-y-3">
                {PERIODS.map(p => {
                    const entry = getEntryForSlot(selectedDay, p.id);
                    const formattedTime = formatDisplayTime(p.time);
                    const [start, end] = formattedTime.split(' - ');

                    if (p.id === 5) {
                        return (
                            <div key={p.id} className="flex gap-4 items-center px-2 py-4 opacity-50 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                <div className="w-16 text-center">
                                    <span className="text-[10px] font-black text-slate-400">13:00</span>
                                </div>
                                <div className="flex-1 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lunch Break</span>
                                </div>
                            </div>
                        );
                    }

                    if (entry) {
                        const color = getColorForSubject(entry.subject);
                        return (
                            <div key={p.id} className="flex gap-3">
                                <div className="w-16 pt-4 flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-black text-slate-800">{start}</span>
                                    <div className="w-px flex-1 bg-slate-200 my-1" />
                                    <span className="text-[10px] font-bold text-slate-400">{end}</span>
                                </div>
                                <div className={cn(
                                    "flex-1 rounded-[1.5rem] p-4 shadow-sm border-2 relative overflow-hidden",
                                    color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-700" :
                                        color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                            color === 'rose' ? "bg-rose-50 border-rose-100 text-rose-700" :
                                                color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-700" :
                                                    color === 'indigo' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                                                        color === 'purple' ? "bg-purple-50 border-purple-100 text-purple-700" :
                                                            "bg-slate-50 border-slate-100 text-slate-700"
                                )}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-black text-lg tracking-tight leading-none mb-2">{entry.subject}</h3>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 flex items-center gap-1">
                                                <User className="h-3 w-3" /> {entry.faculty?.name || 'TBA'}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-white/50 border-transparent text-[8px] font-black rounded-lg">
                                            PERIOD {p.id}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-current/5">
                                        <MapPin className="h-3 w-3 opacity-60" />
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{entry.classroom || 'TBA'}</span>
                                    </div>
                                    <GraduationCap className="absolute -bottom-2 -right-2 opacity-5 h-12 w-12" />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={p.id} className="flex gap-3">
                            <div className="w-16 pt-4 flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-200">{start}</span>
                            </div>
                            <div className="flex-1 h-14 border border-slate-50 bg-slate-50/20 rounded-2xl flex items-center px-4">
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Free Period</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Insight Card */}
            {timetable.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <Info className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No matrix entries found for Section {section}</p>
                </div>
            )}
        </div>
    );
}
