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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen, CheckCircle2, BarChart3, User,
    MessageSquare, Clock, LayoutGrid, ListChecks,
    ChevronRight, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function FacultySyllabusPage() {
    const { toast } = useToast();
    const [courses, setCourses] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);

    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedSection, setSelectedSection] = useState<string>("");

    const [topics, setTopics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Modal State
    const [selectedTopic, setSelectedTopic] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [updating, setUpdating] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/faculty/syllabus/courses');
                const data = await res.json();
                if (data.subjects) setCourses(data.subjects);
                if (data.sections) setSections(data.sections);
                if (data.subjects?.length > 0) setSelectedCourse(data.subjects[0]);
                if (data.sections?.length > 0) setSelectedSection(data.sections[0]);
            } catch (error) {
                console.error("Failed to load courses");
            }
        };
        fetchCourses();
    }, []);

    // Fetch Topics
    useEffect(() => {
        if (!selectedCourse || !selectedSection) return;

        const fetchTopics = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/faculty/syllabus/topics?subject=${encodeURIComponent(selectedCourse)}&section=${encodeURIComponent(selectedSection)}`);
                const data = await res.json();
                if (data.topics) setTopics(data.topics);
            } catch (error) {
                toast({ variant: "destructive", title: "Sync Error", description: "Failed to establish link with syllabus hub." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();
    }, [selectedCourse, selectedSection]);

    const handleProgressUpdate = async (topicId: string, status: string, notes: string) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/faculty/syllabus/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId,
                    section: selectedSection,
                    status,
                    notes,
                    completedLectures: status === 'COMPLETED' ? 1 : 0
                })
            });

            if (!res.ok) throw new Error();

            // Success update local state
            setTopics(prev => prev.map(t =>
                t.id === topicId ? { ...t, status, notes, completedDate: status === 'COMPLETED' ? new Date().toISOString() : null } : t
            ));

            toast({
                title: status === 'COMPLETED' ? "Protocol Completed" : "Progress Logged",
                description: `Syllabus node synchronized for section ${selectedSection}.`,
                className: "bg-slate-900 text-white border-slate-700"
            });
            setIsModalOpen(false);
        } catch (e) {
            toast({ variant: "destructive", title: "Protocol Failure", description: "Terminal synchronization failed." });
        } finally {
            setUpdating(false);
        }
    };

    const calculateProgress = () => {
        if (topics.length === 0) return 0;
        const completed = topics.filter(t => t.status === 'COMPLETED').length;
        return Math.round((completed / topics.length) * 100);
    };

    // Grouping topics by Exam Type
    const examGroups = topics.reduce((acc: Record<string, any[]>, topic) => {
        const group = topic.examType || "Core Subjects";
        if (!acc[group]) acc[group] = [];
        acc[group].push(topic);
        return acc;
    }, {});

    const sortedGroups = Object.keys(examGroups).sort((a, b) => {
        const priority: Record<string, number> = { "ST1": 1, "ST2": 2, "ST3": 3 };
        return (priority[a] || 99) - (priority[b] || 99) || a.localeCompare(b);
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 space-y-6 pb-40 font-sans">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Mission Progress</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tracking <span className="text-indigo-600">{calculateProgress()}%</span> Operational Efficiency</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-full sm:w-56 h-10 bg-white border-slate-200 text-slate-900 rounded-lg px-3 font-bold focus:ring-0 shadow-sm">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {courses.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger className="w-full sm:w-28 h-10 bg-slate-900 text-white border-0 rounded-lg px-3 font-black focus:ring-0 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all text-xs">
                                <SelectValue placeholder="Node" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-800 bg-slate-900 text-white shadow-xl">
                                {sections.map(s => <SelectItem key={s} value={s} className="font-black text-xs hover:bg-white/10">{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Columnar Syllabus Layout */}
            {isLoading ? (
                <div className="py-32 text-center space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 animate-pulse mx-auto" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Payload....</p>
                </div>
            ) : topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {sortedGroups.map((group) => (
                        <div key={group} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                    {group}
                                </h2>
                                <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[9px] px-1.5 h-4">
                                    {examGroups[group].filter((t: any) => t.status === 'COMPLETED').length}/{examGroups[group].length}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {examGroups[group].map((topic: any, idx: number) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => {
                                            setSelectedTopic(topic);
                                            setNotes(topic.notes || "");
                                            setIsModalOpen(true);
                                        }}
                                        className={cn(
                                            "group cursor-pointer p-3 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] flex items-center justify-between gap-3",
                                            topic.status === 'COMPLETED'
                                                ? "bg-emerald-50/30 border-emerald-100"
                                                : "bg-white border-slate-100 hover:border-indigo-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn(
                                                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                                topic.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
                                            )}>
                                                {topic.status === 'COMPLETED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={cn(
                                                    "font-bold text-[11px] leading-tight truncate",
                                                    topic.status === 'COMPLETED' ? "text-slate-900" : "text-slate-600"
                                                )}>
                                                    {topic.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[7px] font-bold text-slate-400 font-mono uppercase">#{idx + 1}</span>
                                                    {topic.notes && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                                            <span className="text-[7px] font-bold text-indigo-400 uppercase">Remark</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {topic.status === 'COMPLETED' && (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[7px] font-black h-4 px-1 uppercase">Done</Badge>
                                            )}
                                            <ChevronRight className="h-3 w-3 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-sm">
                    <Info className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Access Denied</h3>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">No curriculum data found for this node.</p>
                </div>
            )}


            {/* Interaction Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8 bg-white">
                    <DialogHeader className="text-left space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-inner">
                                <ListChecks className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Syllabus Synchronization</p>
                                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">{selectedTopic?.title}</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="text-xs font-bold text-slate-500 leading-relaxed italic">
                            Mark this operational node as completed and synchronize progress with the student hub. Faculty remarks will be broadcasted.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-3 w-3 text-slate-400" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Remarks</label>
                            </div>
                            <Textarea
                                placeholder="Transmission details, homework protocols, or key takeaways..."
                                className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50 font-bold text-xs p-5 focus:ring-0 resize-none shadow-inner"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <Clock className="h-4 w-4 text-emerald-500" />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                            onClick={() => handleProgressUpdate(selectedTopic.id, 'COMPLETED', notes)}
                            disabled={updating}
                        >
                            {updating ? "Syncing..." : "Finalize Protocol"}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-slate-100 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                            onClick={() => handleProgressUpdate(selectedTopic.id, 'NOT_STARTED', "")}
                            disabled={updating}
                        >
                            Reset Node
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
