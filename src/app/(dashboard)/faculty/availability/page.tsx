'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar, Clock, MapPin, BookOpen, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

// Java Faculty Timetable based on the images for Sumit
const JAVA_TIMETABLE = [
    // Monday
    { day: "MONDAY", period: 1, time: "09:00-10:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "MONDAY", period: 2, time: "10:00-11:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "MONDAY", period: 3, time: "11:00-12:00", subject: "Java Lab", class: "4G2", room: "MB LH-303" },
    { day: "MONDAY", period: 4, time: "12:00-13:00", subject: "Java Lab", class: "4G2", room: "MB LH-303" },
    { day: "MONDAY", period: 6, time: "14:00-15:00", subject: "Java", class: "4G3", room: "MB LH-401" },
    { day: "MONDAY", period: 7, time: "15:00-16:00", subject: "Java", class: "4G3", room: "MB LH-401" },

    // Tuesday
    { day: "TUESDAY", period: 1, time: "09:00-10:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "TUESDAY", period: 2, time: "10:00-11:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "TUESDAY", period: 6, time: "14:00-15:00", subject: "Java Lab", class: "4G3", room: "MB LH-401" },
    { day: "TUESDAY", period: 7, time: "15:00-16:00", subject: "Java Lab", class: "4G3", room: "MB LH-401" },

    // Wednesday
    { day: "WEDNESDAY", period: 3, time: "11:00-12:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "WEDNESDAY", period: 4, time: "12:00-13:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "WEDNESDAY", period: 6, time: "14:00-15:00", subject: "Java", class: "4G3", room: "MB LH-401" },
    { day: "WEDNESDAY", period: 7, time: "15:00-16:00", subject: "Java", class: "4G3", room: "MB LH-401" },

    // Thursday
    { day: "THURSDAY", period: 3, time: "11:00-12:00", subject: "Java", class: "4G3", room: "MB LH-401" },
    { day: "THURSDAY", period: 4, time: "12:00-13:00", subject: "Java", class: "4G3", room: "MB LH-401" },
    { day: "THURSDAY", period: 6, time: "14:00-15:00", subject: "Java", class: "4G2", room: "MB LH-303" },
    { day: "THURSDAY", period: 7, time: "15:00-16:00", subject: "Java", class: "4G2", room: "MB LH-303" },

    // Friday
    { day: "FRIDAY", period: 1, time: "09:00-10:00", subject: "Java", class: "4G3", room: "MB LH-401" },
    { day: "FRIDAY", period: 2, time: "10:00-11:00", subject: "Java", class: "4G3", room: "MB LH-401" },
];

const MY_CLASSES = JAVA_TIMETABLE;

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
    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const todayClasses = MY_CLASSES.filter(c => c.day === currentDay);

    const getClassForSlot = (day: string, period: number) => {
        return MY_CLASSES.find(c => c.day === day && c.period === period);
    };

    const isPast = (timeSlot: string) => {
        const timeParts = timeSlot.split('-');
        if (timeParts.length < 2) return false;
        const [hours, minutes] = timeParts[1].split(':').map(Number);
        const slotEndMinutes = hours * 60 + minutes;
        return slotEndMinutes < currentTime;
    };

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
                            <p className="text-emerald-100 text-sm">Java Faculty - Weekly Timetable</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <Calendar className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-xs mb-1">Total Classes</p>
                            <p className="text-2xl font-bold text-white">{MY_CLASSES.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-xs mb-1">Today</p>
                            <p className="text-2xl font-bold text-white">{todayClasses.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-xs mb-1">Classes</p>
                            <p className="text-2xl font-bold text-white">4G2 & 4G3</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Weekly Timetable */}
            <Card className="overflow-hidden border-2 border-slate-100">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        Full Weekly Timetable
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[850px] p-4">
                            {/* Header */}
                            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-3">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Day</div>
                                {PERIODS.map(period => (
                                    <div key={period.num} className="text-center">
                                        <div className="text-xs font-bold text-slate-700">Period {period.num}</div>
                                        <div className="text-[10px] text-slate-500 font-medium">{period.time}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Timetable Grid */}
                            {DAYS.map(day => (
                                <div key={day} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
                                    <div className={cn(
                                        "flex items-center justify-start pl-3 text-xs font-bold rounded-xl",
                                        day === currentDay ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                    )}>
                                        {day}
                                    </div>

                                    {PERIODS.map(period => {
                                        if (period.num === 5) {
                                            return (
                                                <div key={`${day}-${period.num}`} className="flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">Lunch</span>
                                                </div>
                                            );
                                        }

                                        const classData = getClassForSlot(day, period.num);

                                        return (
                                            <div
                                                key={`${day}-${period.num}`}
                                                className={cn(
                                                    "min-h-[85px] rounded-xl border-2 p-2.5 transition-all flex flex-col justify-between",
                                                    classData
                                                        ? "bg-white border-emerald-200 shadow-[0_2px_4px_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:shadow-md cursor-default"
                                                        : "bg-slate-50/30 border-slate-100"
                                                )}
                                            >
                                                {classData ? (
                                                    <>
                                                        <div>
                                                            <p className="text-[11px] font-black text-emerald-900 leading-tight mb-1">
                                                                {classData.subject}
                                                            </p>
                                                            <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0 min-h-0 h-4 font-bold border-0">
                                                                {classData.class}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <MapPin className="h-3 w-3 text-emerald-500" />
                                                            <span className="text-[10px] text-slate-600 font-medium truncate">
                                                                {classData.room}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card className="bg-slate-900 border-0">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-6 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-md bg-white border-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]"></div>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Java Lecture</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5">4G2 / 4G3</Badge>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Section</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-md bg-slate-800 border-2 border-slate-700"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empty Slot</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
