'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import {
    Calendar, Clock, MapPin, BookOpen, Users, Loader2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const PERIODS = [
    { num: 1, time: "09:00-10:00" },
    { num: 2, time: "10:00-11:00" },
    { num: 3, time: "11:00-12:00" },
    { num: 4, time: "12:00-13:00" },
    { num: 5, time: "13:00-14:00" }, // Lunch Break
    { num: 6, time: "14:00-15:00" },
    { num: 7, time: "15:00-16:00" },
];

export default function FacultySchedulePage() {
    const { data: session } = useSession();
    const [timetable, setTimetable] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const facultyId = (session?.user as any)?.id;

    useEffect(() => {
        const fetchTimetable = async () => {
            if (!facultyId) return;
            try {
                const res = await fetch(`/api/timetable?facultyId=${facultyId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTimetable(data);
                }
            } catch (error) {
                console.error("Error fetching timetable:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimetable();
    }, [facultyId]);

    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const todayClasses = timetable.filter(c => c.day === currentDay);

    const getClassForSlot = (day: string, periodNum: number) => {
        const period = PERIODS.find(p => p.num === periodNum);
        if (!period) return undefined;

        const [h, m] = period.time.split('-')[0].split(':').map(Number);
        const displayH = h > 12 ? h - 12 : h;
        const timeBase = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const amPm = (h >= 9 && h <= 11) ? 'AM' : 'PM';
        const formattedStart = `${timeBase} ${amPm}`;

        return timetable.find(c => {
            if (c.day !== day) return false;
            return c.startTime === formattedStart || c.startTime === timeBase;
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">My Schedule</h1>
                            <p className="text-emerald-100 text-sm font-black uppercase tracking-widest">Digital Timetable Console</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <Calendar className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] font-bold uppercase mb-1">Weekly Loads</p>
                            <p className="text-2xl font-black text-white">{timetable.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] font-bold uppercase mb-1">Today Sessions</p>
                            <p className="text-2xl font-black text-white">{todayClasses.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] font-bold uppercase mb-1">Status</p>
                            <p className="text-xs font-black text-white uppercase mt-1">
                                {timetable.length > 0 ? "Configured" : "Fresh Start"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {timetable.length === 0 && (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[2rem]">
                    <CardContent className="p-12 text-center space-y-4">
                        <div className="h-16 w-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mx-auto">
                            <AlertCircle className="h-8 w-8 text-slate-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Empty Timetable Node</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 max-w-[200px] mx-auto uppercase leading-relaxed tracking-tighter">
                                No classes have been assigned to your profile yet.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Weekly Timetable */}
            <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-5">
                    <CardTitle className="text-sm font-black flex items-center gap-3 text-slate-800 uppercase tracking-tighter">
                        <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                        </div>
                        Weekly Transmission Ledger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[850px] p-6">
                            {/* Header */}
                            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-3 mb-6">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 flex items-center">Timeline</div>
                                {PERIODS.map(period => (
                                    <div key={period.num} className="text-center bg-slate-50 rounded-xl py-2 border border-slate-100">
                                        <div className="text-[10px] font-black text-slate-800 uppercase">P{period.num}</div>
                                        <div className="text-[9px] text-slate-400 font-bold tabular-nums">{period.time}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Timetable Grid */}
                            {DAYS.map(day => (
                                <div key={day} className="grid grid-cols-[100px_repeat(7,1fr)] gap-3 mb-3">
                                    <div className={cn(
                                        "flex items-center justify-start pl-4 text-[10px] font-black rounded-2xl uppercase tracking-widest transition-all",
                                        day === currentDay ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-100"
                                    )}>
                                        {day.substring(0, 3)}
                                    </div>

                                    {PERIODS.map(period => {
                                        if (period.num === 5) {
                                            return (
                                                <div key={`${day}-${period.num}`} className="flex items-center justify-center bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                                                    <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 opacity-50">Interval</span>
                                                </div>
                                            );
                                        }

                                        const classData = getClassForSlot(day, period.num);

                                        return (
                                            <div
                                                key={`${day}-${period.num}`}
                                                className={cn(
                                                    "min-h-[100px] rounded-2xl border-2 p-3 transition-all flex flex-col justify-between group",
                                                    classData
                                                        ? "bg-white border-emerald-100 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 cursor-default"
                                                        : "bg-slate-50/10 border-slate-50 opacity-40 hover:opacity-100 transition-opacity"
                                                )}
                                            >
                                                {classData ? (
                                                    <>
                                                        <div className="space-y-1.5">
                                                            <p className="text-[10px] font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-emerald-700 transition-colors">
                                                                {classData.subject}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                <Badge className="bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0 min-h-0 h-4 font-black border-none uppercase">
                                                                    {classData.section}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50 mt-auto">
                                                            <MapPin className="h-2.5 w-2.5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                                            <span className="text-[9px] text-slate-400 font-bold truncate uppercase tracking-tighter">
                                                                {classData.classroom || 'TBA'}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
