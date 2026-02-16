'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const PERIODS = [
    { id: 1, time: "9:00 - 10:00" },
    { id: 2, time: "10:00 - 11:00" },
    { id: 3, time: "11:00 - 12:00" },
    { id: 4, time: "12:00 - 13:00" },
    { id: 5, time: "13:00 - 14:00" }, // Lunch
    { id: 6, time: "14:00 - 15:00" },
    { id: 7, time: "15:00 - 16:00" },
];

import { STUDENT_TIMETABLE_4G2 as STUDENT_TIMETABLE } from "@/lib/store";

export default function StudentClassesPage() {
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section - Compact */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Calendar className="h-20 w-20 rotate-12" />
                </div>
                <div className="relative z-10">
                    <Badge className="bg-blue-50 text-blue-600 border-blue-100 mb-2 px-3 py-0.5 rounded-full font-bold text-[10px]">
                        AY 2025-26 • SEM 4
                    </Badge>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Section AIML 4G2
                    </h1>
                    <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" /> MB LH-303
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
                    {/* Desktop Header Row */}
                    <div className="grid grid-cols-8 gap-3 mb-6">
                        <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        {PERIODS.map(p => (
                            <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.id}</span>
                                <span className="text-xs font-bold text-slate-700">{p.time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Day Rows */}
                    {DAYS.map(day => (
                        <div key={day} className="grid grid-cols-8 gap-2 min-h-[120px]">
                            <div className="bg-slate-800 rounded-2xl p-4 flex items-center justify-center shadow-lg">
                                <span className="text-white font-black tracking-tighter text-lg rotate-[-90deg]">
                                    {day.substring(0, 3)}
                                </span>
                            </div>

                            {Array.from({ length: 7 }, (_, i) => i + 1).map(periodNum => {
                                const entry = STUDENT_TIMETABLE.find(t => t.day === day && t.period === periodNum);
                                const isCoveredByPreviousSpan = STUDENT_TIMETABLE.some(t =>
                                    t.day === day &&
                                    t.period < periodNum &&
                                    t.span &&
                                    t.period + t.span > periodNum
                                );

                                if (isCoveredByPreviousSpan) return null;

                                if (entry?.isLunch) {
                                    return (
                                        <div key={`${day}-${periodNum}`} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center opacity-60">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest rotate-[-90deg]">Lunch Phase</span>
                                        </div>
                                    );
                                }

                                if (entry) {
                                    return (
                                        <div
                                            key={`${day}-${periodNum}`}
                                            className={cn(
                                                "rounded-2xl p-4 shadow-sm border-2 transition-all hover:scale-[1.02] group relative overflow-hidden",
                                                entry.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-700" :
                                                    entry.color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                                        entry.color === 'rose' ? "bg-rose-50 border-rose-100 text-rose-700" :
                                                            entry.color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-700" :
                                                                entry.color === 'indigo' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                                                                    entry.color === 'purple' ? "bg-purple-50 border-purple-100 text-purple-700" :
                                                                        "bg-slate-50 border-slate-100 text-slate-700",
                                                entry.span && entry.span === 2 ? "col-span-2" : "col-span-1"
                                            )}
                                        >
                                            <div className="h-full flex flex-col justify-between relative z-10">
                                                <div>
                                                    <h3 className="font-black text-base tracking-tight leading-none">
                                                        {entry.subject}
                                                    </h3>
                                                    <div className="flex items-center gap-1 mt-2 opacity-70">
                                                        <User className="h-2.5 w-2.5" />
                                                        <span className="text-[9px] font-black uppercase tracking-tight truncate">{entry.faculty}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2 opacity-70">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    <span className="text-[9px] font-black uppercase tracking-tight">{entry.room}</span>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 opacity-5">
                                                <GraduationCap className="h-10 w-10" />
                                            </div>
                                        </div>
                                    );
                                }

                                return <div key={`${day}-${periodNum}`} className="bg-slate-50/50 border border-slate-50 rounded-2xl flex items-center justify-center opacity-30" />;
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View: Vertical Timeline */}
            <div className="md:hidden space-y-3">
                {PERIODS.map(p => {
                    const entry = STUDENT_TIMETABLE.find(t => t.day === selectedDay && t.period === p.id);
                    const isCovered = STUDENT_TIMETABLE.some(t =>
                        t.day === selectedDay &&
                        t.period < p.id &&
                        t.span &&
                        t.period + t.span > p.id
                    );

                    if (isCovered) return null;

                    if (entry?.isLunch) {
                        return (
                            <div key={p.id} className="flex gap-4 items-center px-2 py-4 opacity-50 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                <div className="w-12 text-center">
                                    <span className="text-[10px] font-black text-slate-400">13:00</span>
                                </div>
                                <div className="flex-1 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lunch Break</span>
                                </div>
                            </div>
                        );
                    }

                    if (entry) {
                        return (
                            <div key={p.id} className="flex gap-3">
                                <div className="w-12 pt-4 flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-black text-slate-800">{p.time.split(' - ')[0]}</span>
                                    <div className="w-px flex-1 bg-slate-200 my-1" />
                                    <span className="text-[10px] font-bold text-slate-400">{p.time.split(' - ')[1]}</span>
                                </div>
                                <div className={cn(
                                    "flex-1 rounded-[1.5rem] p-4 shadow-sm border-2 relative overflow-hidden",
                                    entry.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-700" :
                                        entry.color === 'emerald' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                                            entry.color === 'rose' ? "bg-rose-50 border-rose-100 text-rose-700" :
                                                entry.color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-700" :
                                                    entry.color === 'indigo' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                                                        entry.color === 'purple' ? "bg-purple-50 border-purple-100 text-purple-700" :
                                                            "bg-slate-50 border-slate-100 text-slate-700"
                                )}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-black text-lg tracking-tight leading-none mb-2">{entry.subject}</h3>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 flex items-center gap-1">
                                                <User className="h-3 w-3" /> {entry.faculty}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-white/50 border-transparent text-[8px] font-black rounded-lg">
                                            {entry.span && entry.span > 1 ? "DOUBLE" : "PERIOD"}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-current/5">
                                        <MapPin className="h-3 w-3 opacity-60" />
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{entry.room}</span>
                                    </div>
                                    <GraduationCap className="absolute -bottom-2 -right-2 opacity-5 h-12 w-12" />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={p.id} className="flex gap-3">
                            <div className="w-12 pt-4 flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-200">{p.time.split(' - ')[0]}</span>
                            </div>
                            <div className="flex-1 h-14 border border-slate-50 bg-slate-50/20 rounded-2xl flex items-center px-4">
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Free Period</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Insight Card */}
            <Card className="border-none shadow-lg bg-indigo-600 rounded-[2rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <GraduationCap className="h-20 w-20" />
                </div>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-white">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Sync Alert</p>
                            <h3 className="text-sm font-black tracking-tight">Next Class starts at 09:00 AM Monday</h3>
                        </div>
                        <ChevronRight className="ml-auto h-5 w-5 opacity-50" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
