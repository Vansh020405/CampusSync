'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BookOpen, CheckCircle2, Clock, MoreHorizontal, Calendar,
    ChevronRight, BarChart3, List, MessageSquare, Info, Zap, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { BrandLogo } from "@/components/brand/Logo";
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import loadingAnimation from "../../../../../public/loading.json";

export default function StudentSyllabusPage() {
    const { toast } = useToast();
    const [syllabusData, setSyllabusData] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const res = await fetch('/api/student/syllabus');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSyllabusData(data);
                    if (data.length > 0) setSelectedSubject(data[0]);
                }
            } catch (error) {
                console.error("Failed to load syllabus");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSyllabus();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 pb-32">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Academic Status</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Syllabus Sync</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Real-time <span className="text-emerald-500">Curriculum Sync</span> with Faculty</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                    <List className="h-7 w-7 text-slate-900" />
                </div>
            </div>

            {/* Premium Subject Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                {syllabusData.map(subject => (
                    <button
                        key={subject.subjectName}
                        onClick={() => setSelectedSubject(subject)}
                        className={cn(
                            "group flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                            selectedSubject?.subjectName === subject.subjectName
                                ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-105"
                                : "bg-white border-white text-slate-400 hover:border-slate-100 hover:text-slate-600 shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                            selectedSubject?.subjectName === subject.subjectName ? "bg-white/10" : "bg-slate-50"
                        )}>
                            <BookOpen className="h-3 w-3" />
                        </div>
                        {subject.subjectName}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
                    <div className="w-64 h-64 md:w-80 md:h-80">
                        <Lottie
                            animationData={loadingAnimation}
                            loop={true}
                        />
                    </div>
                    <div className="mt-4 space-y-2 text-center">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] animate-pulse">Syncing Curriculum</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Connecting to institutional node...</p>
                    </div>
                </div>
            ) : selectedSubject ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Left Panel: Stats & Context */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-baseline justify-between">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedSubject.percentage}%</h2>
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Complete</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${selectedSubject.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-5 rounded-3xl bg-slate-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Topics</p>
                                            <p className="text-lg font-black text-slate-900">{selectedSubject.totalTopics}</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                            <BarChart3 className="h-4 w-4 text-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-slate-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                                            <p className="text-lg font-black text-slate-900">{selectedSubject.totalTopics - selectedSubject.completedTopics}</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                            <Zap className="h-4 w-4 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                            <User className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty Authority</p>
                                            <p className="text-xs font-bold text-slate-900">{selectedSubject.lastFaculty}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Latest Topic completed</p>
                                        <p className="text-xs font-bold text-slate-800 leading-tight">
                                            {selectedSubject.lastLecture}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Content Timeline */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Clock className="h-4 w-4 text-indigo-500" />
                                Ongoing topics
                            </h3>
                            <Badge className="bg-white text-slate-400 border-slate-100 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 shadow-sm">
                                {selectedSubject.topics.length} Topics
                            </Badge>
                        </div>

                        <div className="space-y-4 relative">
                            {selectedSubject.topics.map((topic: any, idx: number) => (
                                <div key={topic.id} className="group">
                                    <div className={cn(
                                        "p-6 rounded-[2rem] border transition-all duration-300",
                                        topic.status === 'COMPLETED'
                                            ? "bg-white border-emerald-100 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-50"
                                            : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                                    )}>
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex items-start gap-5">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all group-hover:rotate-6",
                                                    topic.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    {topic.status === 'COMPLETED' ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-xs font-black">{idx + 1}</span>}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className={cn(
                                                            "font-black text-base tracking-tight",
                                                            topic.status === 'COMPLETED' ? "text-slate-900" : "text-slate-500"
                                                        )}>
                                                            {topic.title}
                                                        </h4>
                                                        {topic.status === 'COMPLETED' && (
                                                            <Badge className="bg-emerald-100 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                                                                Completed IN class
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {topic.notes && (
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 mt-3 relative overflow-hidden group/note">
                                                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover/note:opacity-100 transition-opacity">
                                                                <MessageSquare className="h-3 w-3 text-slate-400" />
                                                            </div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Faculty Remark</p>
                                                            <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                                                "{topic.notes}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end shrink-0 pt-1">
                                                {topic.completedDate ? (
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completion Date</p>
                                                        <p className="text-[11px] font-black text-slate-900 uppercase">
                                                            {new Date(topic.completedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-40">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in duration-700">
                    <Info className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Data Found</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">No curriculum data detected for your current credentials.</p>
                </div>
            )}
        </div>
    );
}
