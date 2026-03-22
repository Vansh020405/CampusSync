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
    ChevronRight, Info, Activity, ShieldCheck
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
                className: "bg-slate-900 dark:bg-card text-white border-slate-700 dark:border-border"
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
        <div className="min-h-screen bg-white dark:bg-background p-3 md:p-4 space-y-4 pb-40 font-sans transition-colors animate-in fade-in duration-500">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-4">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 mb-0.5 opacity-60">
                        <BarChart3 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground font-mono">Operational Progress</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase leading-none">Curriculum</h1>
                    <p className="text-[9px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                        Tracking <span className="text-indigo-600 dark:text-indigo-400 font-black">{calculateProgress()}%</span> System Efficiency
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="w-full sm:w-56">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-full h-9 bg-slate-50 dark:bg-muted border-slate-200 dark:border-border text-slate-900 dark:text-foreground rounded-lg px-3 font-black uppercase tracking-widest text-[9px] focus:ring-0 shadow-sm transition-all">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 dark:border-border shadow-2xl bg-white dark:bg-card">
                                {courses.map(c => <SelectItem key={c} value={c} className="font-black text-[9px] uppercase tracking-widest py-2">{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full sm:w-28">
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger className="w-full h-9 bg-slate-900 dark:bg-indigo-600 text-white border-0 rounded-lg px-3 font-black focus:ring-0 shadow-xl shadow-slate-200 dark:shadow-indigo-500/10 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all text-[9px] uppercase tracking-widest">
                                <SelectValue placeholder="Node" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-800 dark:border-border bg-slate-900 dark:bg-card text-white dark:text-foreground shadow-2xl">
                                {sections.map(s => <SelectItem key={s} value={s} className="font-black text-[9px] uppercase tracking-widest py-2">{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Columnar Syllabus Layout */}
            {isLoading ? (
                <div className="py-24 text-center space-y-3 bg-slate-50/50 dark:bg-muted/10 rounded-[1.5rem] border border-dashed border-slate-200 dark:border-border">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 animate-spin mx-auto flex items-center justify-center">
                        <Activity className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.3em] font-mono animate-pulse">Syncing Payload Link....</p>
                </div>
            ) : topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    {sortedGroups.map((group) => (
                        <div key={group} className="space-y-3">
                            <div className="flex items-center justify-between px-2.5 bg-slate-50 dark:bg-muted/50 py-2 rounded-lg border border-slate-100 dark:border-border">
                                <h2 className="text-[9px] font-black text-slate-900 dark:text-foreground uppercase tracking-[0.15em] flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                    {group}
                                </h2>
                                <Badge className="bg-white dark:bg-card text-slate-600 dark:text-muted-foreground border-none font-black text-[8px] px-1 h-3.5">
                                    {examGroups[group].filter((t: any) => t.status === 'COMPLETED').length}/{examGroups[group].length}
                                </Badge>
                            </div>

                            <div className="space-y-1.5 px-0.5">
                                {examGroups[group].map((topic: any, idx: number) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => {
                                            setSelectedTopic(topic);
                                            setNotes(topic.notes || "");
                                            setIsModalOpen(true);
                                        }}
                                        className={cn(
                                            "group cursor-pointer p-2.5 rounded-xl border transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between gap-3 font-sans",
                                            topic.status === 'COMPLETED'
                                                ? "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                                                : "bg-white dark:bg-card border-slate-100 dark:border-border hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn(
                                                "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:rotate-3",
                                                topic.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-muted text-slate-400 dark:text-muted-foreground opacity-60"
                                            )}>
                                                {topic.status === 'COMPLETED' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={cn(
                                                    "font-black text-[11px] leading-tight line-clamp-2 tracking-tight uppercase",
                                                    topic.status === 'COMPLETED' ? "text-slate-900 dark:text-foreground" : "text-slate-600 dark:text-muted-foreground/80"
                                                )}>
                                                    {topic.title}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                                                    <span className="text-[7px] font-black text-slate-400 dark:text-muted-foreground font-mono uppercase">NODE_{idx + 1}</span>
                                                    {topic.notes && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                                            <span className="text-[7px] font-black text-indigo-500 uppercase">Remark Logged</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {topic.status === 'COMPLETED' && (
                                                <Badge className="bg-emerald-500 text-white dark:text-black border-none text-[7px] font-black h-3.5 px-1 uppercase tracking-widest shadow-lg shadow-emerald-500/20">Final</Badge>
                                            )}
                                            <ChevronRight className="h-3 w-3 text-slate-300 dark:text-muted-foreground group-hover:translate-x-0.5 transition-transform opacity-40" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white dark:bg-card rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-border shadow-xl shadow-slate-200/20 dark:shadow-black/10 mx-auto max-w-xl px-6">
                    <Info className="h-10 w-10 text-slate-200 dark:text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight">Access Point Terminal Inactive</h3>
                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/60 mt-1.5 uppercase tracking-[0.2em] max-w-[320px] mx-auto leading-relaxed">No curriculum data found for the selected node. Please re-synchronize with administrative center.</p>
                </div>
            )}


            {/* Interaction Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-black/50 p-8 bg-white dark:bg-card overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    
                    <DialogHeader className="text-left space-y-5 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-all">
                                <ListChecks className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-400 uppercase tracking-[0.25em]  opacity-80">Synchronization Protocol</p>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase ">{selectedTopic?.title}</DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="text-xs font-black text-slate-500 dark:text-muted-foreground/70 leading-relaxed  border-l-2 border-indigo-500/20 pl-4 py-1">
                            Finalize operational status for this node. Remarks will be broadcasted to the student intelligence hub immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6 relative z-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 opacity-60">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                                <label className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Faculty Briefing Remark</label>
                            </div>
                            <Textarea
                                placeholder="Transmission details, key takeaways, or homework protocol..."
                                className="min-h-[140px] rounded-[1.5rem] border-slate-100 dark:border-border/50 bg-slate-50/50 dark:bg-muted/10 font-black  text-xs p-6 focus:ring-0 resize-none shadow-inner text-slate-900 dark:text-foreground placeholder:text-slate-300 dark:placeholder:text-muted-foreground/30 transition-all focus:border-indigo-500/30"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-muted/30 rounded-2xl border border-slate-100 dark:border-border/40">
                            <Clock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                            <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Timestamp: {new Date().toLocaleDateString()} // STATUS_IDLE</p>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <Button
                            className="flex-1 h-14 bg-slate-900 dark:bg-indigo-600 text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 "
                            onClick={() => handleProgressUpdate(selectedTopic.id, 'COMPLETED', notes)}
                            disabled={updating}
                        >
                            {updating ? "Transmitting..." : "Initialize Completion"}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-14 rounded-2xl border-slate-100 dark:border-border text-slate-400 dark:text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-100 transition-all "
                            onClick={() => handleProgressUpdate(selectedTopic.id, 'NOT_STARTED', "")}
                            disabled={updating}
                        >
                            De-sync Node
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
