'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, BookOpen, GraduationCap, Loader2, Info, User, LayoutGrid, Activity, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
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

const formatTimeLabel = (range: string) => {
    return range.split(' - ').map(t => {
        let [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
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

export default function FacultySchedulePage() {
    const { data: session } = useSession();
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
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

    const getEntryForSlot = (day: string, periodId: number) => {
        const period = PERIODS.find(p => p.id === periodId);
        if (!period) return undefined;

        const normalizeTime = (timeStr: string) => {
            if (!timeStr) return "";
            const [time, ampm] = timeStr.trim().split(/\s+/);
            const [hStr, mStr] = time.split(':');
            let h = parseInt(hStr);
            if (ampm === 'PM' && h < 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
        };

        const targetTime24 = normalizeTime(period.time.split(' - ')[0]);

        return timetable.find(c => {
            if (!c.day || !c.startTime) return false;
            return c.day.trim().toUpperCase() === day.trim().toUpperCase() &&
                normalizeTime(c.startTime) === targetTime24;
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-background">
                <div className="space-y-4 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 dark:bg-indigo-600 flex items-center justify-center animate-spin mx-auto shadow-2xl">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.3em] font-mono  animate-pulse">Establishing Mission Link....</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-40 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-6 min-h-screen bg-white dark:bg-background font-sans transition-colors">
            {/* Extremely Compact Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-border pb-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2 mb-1 opacity-60">
                        <Activity className="h-4 w-4 text-slate-900 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground font-mono ">Sector Operations</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none">Mission Grid</h1>
                    <p className="text-[10px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest mt-1">
                        Tactical Teaching Deployment â€¢ <span className="text-slate-900 dark:text-indigo-400 font-black ">SEM 4 LIVE</span>
                    </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-200 dark:border-border text-slate-400 dark:text-muted-foreground text-[9px] font-black uppercase tracking-widest  flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        Live Roster Sync
                    </Badge>
                </div>
            </div>

            {/* Mobile Day Selector - Ultra Compact */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 no-scrollbar">
                <div className="flex gap-2 min-w-max pb-2">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border  transition-all active:scale-95 shadow-sm",
                                selectedDay === day
                                    ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-xl shadow-indigo-500/20 scale-105"
                                    : "bg-white dark:bg-card text-slate-400 dark:text-muted-foreground border-slate-100 dark:border-border hover:bg-slate-50 dark:hover:bg-muted"
                            )}
                        >
                            {day.substring(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop View: Full Grid Refined */}
            <div className="hidden md:block overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-border">
                <div className="min-w-[1200px] space-y-4">
                    <div className="grid grid-cols-8 gap-4 mb-2">
                        <div className="bg-slate-50 dark:bg-muted/50 rounded-2xl p-4 flex items-center justify-center border border-slate-100 dark:border-border shadow-inner">
                            <LayoutGrid className="h-5 w-5 text-slate-300 dark:text-muted-foreground/30" />
                        </div>
                        {PERIODS.map(p => (
                            <div key={p.id} className="bg-white dark:bg-card rounded-2xl p-4 border border-slate-100 dark:border-border shadow-lg shadow-slate-200/50 dark:shadow-black/20 flex flex-col items-center justify-center transition-all group hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-slate-900/5 dark:bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
                                <span className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.25em]  relative z-10">Phase {p.id}</span>
                                <span className="text-[10px] font-black text-slate-900 dark:text-foreground whitespace-nowrap mt-1  tracking-tight relative z-10">{formatTimeLabel(p.time)}</span>
                            </div>
                        ))}
                    </div>                    {DAYS.map(day => (
                        <div key={day} className="grid grid-cols-8 gap-4 min-h-[90px]">
                            <div className={cn(
                                "rounded-[1.5rem] p-2 flex items-center justify-center shadow-xl transition-all relative overflow-hidden group",
                                day === selectedDay 
                                    ? "bg-slate-900 dark:bg-indigo-600 scale-[1.01] z-10 shadow-indigo-500/20 border-0" 
                                    : "bg-slate-50 dark:bg-muted/30 opacity-40 border border-slate-100 dark:border-border/50"
                            )}>
                                {day === selectedDay && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                )}
                                <span className={cn(
                                    "font-black tracking-[0.3em] text-[11px] rotate-[-90deg] uppercase transition-all",
                                    day === selectedDay ? "text-white scale-110" : "text-slate-400 dark:text-muted-foreground"
                                )}>
                                    {day.substring(0, 3)}
                                </span>
                            </div>

                            {PERIODS.map(period => {
                                const entry = getEntryForSlot(day, period.id);
                                if (period.id === 5) { // Lunch
                                    return (
                                        <div key={`${day}-${period.id}`} className="bg-slate-50 dark:bg-muted/10 border-2 border-dashed border-slate-100 dark:border-border/30 rounded-[1.5rem] flex flex-col items-center justify-center opacity-30 group relative overflow-hidden transition-all hover:opacity-100 hover:border-indigo-500/30">
                                            <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:scale-150 transition-transform duration-700" />
                                            <span className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.4em] rotate-[-90deg] relative z-10">R_PHASE</span>
                                        </div>
                                    );
                                }

                                if (entry) {
                                    const color = getColorForSubject(entry.subject);
                                    return (
                                        <div
                                            key={`${day}-${period.id}`}
                                            className={cn(
                                                "rounded-[1.5rem] p-3.5 shadow-lg border transition-all hover:scale-[1.03] active:scale-95 group relative overflow-hidden cursor-pointer",
                                                color === 'blue' ? "bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" :
                                                    color === 'emerald' ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" :
                                                        color === 'rose' ? "bg-rose-50/50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" :
                                                            color === 'orange' ? "bg-orange-50/50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" :
                                                                color === 'indigo' ? "bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" :
                                                                    color === 'purple' ? "bg-purple-50/50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20" :
                                                                        "bg-slate-50/50 dark:bg-muted/50 border-slate-100 dark:border-border"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 dark:bg-white/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                                            
                                            <div className="h-full flex flex-col justify-between relative z-10">
                                                <div>
                                                    <h3 className={cn(
                                                        "font-black text-[10px] tracking-tighter leading-tight uppercase line-clamp-2",
                                                        color === 'blue' ? "text-blue-700 dark:text-blue-400" :
                                                        color === 'emerald' ? "text-emerald-700 dark:text-emerald-400" :
                                                        color === 'rose' ? "text-rose-700 dark:text-rose-400" :
                                                        color === 'orange' ? "text-orange-700 dark:text-orange-400" :
                                                        color === 'indigo' ? "text-indigo-700 dark:text-indigo-400" :
                                                        color === 'purple' ? "text-purple-700 dark:text-purple-400" :
                                                        "text-slate-700 dark:text-foreground"
                                                    )}>
                                                        {entry.subject}
                                                    </h3>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <Badge className="bg-slate-900 dark:bg-white/10 text-white dark:text-foreground border-none text-[7px] font-black px-1.5 h-3.5 uppercase tracking-widest shadow-lg shadow-black/10">
                                                            S_{entry.section || 'NA'}
                                                        </Badge>
                                                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <MapPin className="h-2 w-2" />
                                                            <span className="text-[7px] font-black uppercase tracking-widest">{entry.classroom || 'HQ'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-10 transition-all group-hover:rotate-12 group-hover:scale-150">
                                                <GraduationCap className="h-10 w-10" />
                                            </div>
                                        </div>
                                    );
                                }

                                return <div key={`${day}-${period.id}`} className="bg-slate-50/20 dark:bg-muted/5 border border-slate-50 dark:border-border/30 rounded-[1.5rem] flex items-center justify-center group hover:bg-slate-50 dark:hover:bg-muted/10 transition-colors">
                                    <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-border group-hover:scale-150 transition-all" />
                                </div>;
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View: Vertical Timeline Refined */}
            <div className="md:hidden space-y-4">
                {PERIODS.map(p => {
                    const entry = getEntryForSlot(selectedDay, p.id);
                    if (p.id === 5) {
                        return (
                            <div key={p.id} className="flex gap-4 items-center px-6 py-6 opacity-40 border-2 border-dashed border-slate-100 dark:border-border/40 rounded-[2.5rem] bg-slate-50/50 dark:bg-muted/10 ">
                                <div className="w-14 text-center">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 font-mono">13:00_P</span>
                                </div>
                                <div className="flex-1 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-muted-foreground/40">Rest Protocol</span>
                                </div>
                            </div>
                        );
                    }

                    if (entry) {
                        const color = getColorForSubject(entry.subject);
                        return (
                            <div key={p.id} className="flex gap-4 group">
                                <div className="w-16 pt-5 flex flex-col items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-black text-slate-900 dark:text-foreground font-mono ">{formatTimeLabel(p.time).split(' - ')[0]}</span>
                                    <div className="w-px flex-1 bg-slate-100 dark:bg-border my-1 shadow-[0_0_8px_rgba(0,0,0,0.05)]" />
                                    <span className="text-[9px] font-black text-slate-300 dark:text-muted-foreground/30 font-mono ">{formatTimeLabel(p.time).split(' - ')[1]}</span>
                                </div>
                                <div className={cn(
                                    "flex-1 rounded-[2.5rem] p-6 shadow-2xl border-2 relative overflow-hidden transition-all active:scale-95 ",
                                    color === 'blue' ? "bg-blue-50/30 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" :
                                        color === 'emerald' ? "bg-emerald-50/30 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" :
                                            color === 'rose' ? "bg-rose-50/30 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20" :
                                                color === 'orange' ? "bg-orange-50/30 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" :
                                                    color === 'indigo' ? "bg-indigo-50/30 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" :
                                                        color === 'purple' ? "bg-purple-50/30 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20" :
                                                            "bg-slate-50 dark:bg-muted border-slate-100 dark:border-border"
                                )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 dark:bg-white/5 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="max-w-[70%] text-left">
                                            <h3 className={cn(
                                                "font-black text-lg tracking-tighter leading-none mb-3 uppercase ",
                                                color === 'blue' ? "text-blue-700 dark:text-blue-400" :
                                                color === 'emerald' ? "text-emerald-700 dark:text-emerald-400" :
                                                color === 'rose' ? "text-rose-700 dark:text-rose-400" :
                                                "text-slate-900 dark:text-foreground"
                                            )}>{entry.subject}</h3>
                                            <Badge className="bg-slate-900 dark:bg-white/10 text-white dark:text-foreground border-none text-[9px] px-2 h-5 mb-2 uppercase tracking-widest  shadow-lg">
                                                SEC_{entry.section || 'NA'}
                                            </Badge>
                                        </div>
                                        <Badge variant="outline" className="bg-white/50 dark:bg-white/5 border-transparent text-[8px] font-black rounded-lg uppercase tracking-widest  h-6 px-2">
                                            PHASE_{p.id}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-current/10 relative z-10">
                                        <div className="flex items-center gap-2 opacity-60">
                                            <MapPin className="h-3 w-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest ">{entry.classroom || 'HQ_TERMINAL'}</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-white/20 dark:bg-white/5 flex items-center justify-center">
                                            <ChevronRight className="h-4 w-4 opacity-40" />
                                        </div>
                                    </div>
                                    <BookOpen className="absolute -bottom-2 -right-2 opacity-[0.03] h-16 w-16" />
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={p.id} className="flex gap-4 group ">
                            <div className="w-16 pt-5 flex flex-col items-center shrink-0 opacity-20">
                                <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter">{formatTimeLabel(p.time).split(' - ')[0]}</span>
                            </div>
                            <div className="flex-1 h-14 border-2 border-dashed border-slate-50 dark:border-border/30 bg-slate-50/20 dark:bg-muted/5 rounded-[1.5rem] flex items-center px-6 transition-all hover:bg-slate-50 dark:hover:bg-muted/10 hover:border-indigo-500/20">
                                <span className="text-[9px] font-black text-slate-200 dark:text-muted-foreground/20 uppercase tracking-[0.3em] ">Channel Idle</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Insight Card - Clean Empty State */}
            {timetable.length === 0 && (
                <div className="py-24 text-center bg-white dark:bg-card/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-border shadow-2xl transition-all mx-auto max-w-2xl px-8">
                    <div className="h-20 w-20 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                        <Info className="h-10 w-10 text-slate-200 dark:text-muted-foreground/20 relative z-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">Operational Silence</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 mt-3 uppercase tracking-[0.3em]  max-w-sm mx-auto leading-relaxed px-4">No deployment coordinates assigned to your profile in the current synchronization buffer.</p>
                </div>
            )}
        </div>
    );
}
