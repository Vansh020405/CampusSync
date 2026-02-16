'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BookOpen, CheckCircle2, Circle, Clock, MoreHorizontal, Calendar,
    ChevronRight, BarChart3, List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'IN_PROGRESS': return "bg-amber-50 text-amber-700 border-amber-200";
            default: return "bg-slate-50 text-slate-500 border-slate-200";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans pb-32">

            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Hub</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">COURSE TRACKING</span>
                    </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                    <List className="h-6 w-6 text-slate-800" />
                </div>
            </div>

            {/* Subject Navigation (Pills) */}
            <div className="mb-8">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {syllabusData.map(subject => (
                        <button
                            key={subject.subjectName}
                            onClick={() => setSelectedSubject(subject)}
                            className={cn(
                                "flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                selectedSubject?.subjectName === subject.subjectName
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105"
                                    : "bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600 shadow-sm"
                            )}
                        >
                            {subject.subjectName.split(' ').map((w: string) => w[0]).join('')} {/* Initials for mobile */}
                            <span className="hidden md:inline ml-1">- {subject.subjectName}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Subject Detail View */}
            {selectedSubject ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex flex-col justify-between h-32 md:h-40">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Completion</span>
                                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <span className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tighter">{selectedSubject.percentage}%</span>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${selectedSubject.percentage}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex flex-col justify-between h-32 md:h-40">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Remaining</span>
                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <BookOpen className="h-4 w-4 text-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <span className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tighter">{selectedSubject.totalTopics - selectedSubject.completedTopics}</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Topics Left</p>
                            </div>
                        </div>
                    </div>

                    {/* Last Lecture Section */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] md:text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">Latest Update</span>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mt-2 line-clamp-1">{selectedSubject.lastLecture}</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1">Updated by {selectedSubject.lastFaculty}</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                            <Clock className="h-6 w-6 text-slate-300" />
                        </div>
                    </div>

                    {/* Timeline List */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Timeline</h3>
                            <span className="text-xs font-bold text-slate-300">{selectedSubject.topics.length} TOPICS</span>
                        </div>

                        <div className="space-y-3 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100 z-0 hidden md:block" />

                            {selectedSubject.topics.map((topic: any, idx: number) => (
                                <div key={topic.id} className="relative z-10 group">
                                    <div className="flex items-stretch gap-4">
                                        {/* Status Icon Column */}
                                        <div className="hidden md:flex flex-col items-center">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full border-4 border-slate-50 flex items-center justify-center bg-white shadow-sm transition-colors",
                                                topic.status === 'COMPLETED' ? "bg-emerald-500 border-emerald-100" :
                                                    topic.status === 'IN_PROGRESS' ? "bg-amber-400 border-amber-100" : "bg-white border-slate-100"
                                            )}>
                                                {topic.status === 'COMPLETED' && <CheckCircle2 className="h-4 w-4 text-white" />}
                                                {topic.status !== 'COMPLETED' && <span className="text-[10px] font-bold text-slate-300">{idx + 1}</span>}
                                            </div>
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-50 hover:shadow-md hover:border-slate-100 transition-all cursor-default">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="md:hidden text-[10px] font-bold text-slate-300 bg-slate-50 px-1.5 rounded">#{idx + 1}</span>
                                                        {topic.status === 'COMPLETED' && (
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide">Completed</span>
                                                        )}
                                                        {topic.status === 'IN_PROGRESS' && (
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wide">In Progress</span>
                                                        )}
                                                    </div>
                                                    <h4 className={cn("font-bold text-sm md:text-base", topic.status === 'COMPLETED' ? "text-slate-800" : "text-slate-400")}>{topic.title}</h4>
                                                </div>

                                                {topic.completedDate && (
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden sm:block">
                                                        {new Date(topic.completedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Progress Bar for In-Progress */}
                                            {topic.status === 'IN_PROGRESS' && (
                                                <div className="mt-4 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 w-1/2 rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold">No courses found</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs">It looks like you aren't enrolled in any courses with a syllabus yet.</p>
                </div>
            )}
        </div>
    );
}
