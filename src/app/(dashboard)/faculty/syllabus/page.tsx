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

    // Grouping topics into "Parts" for the requested look (chunks of 3-4)
    const groupedTopics = [];
    let currentPart = [];
    for (let i = 0; i < topics.length; i++) {
        currentPart.push(topics[i]);
        if (currentPart.length === 3 || i === topics.length - 1) {
            groupedTopics.push([...currentPart]);
            currentPart = [];
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8 pb-32">
            {/* Command Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Mission Progress</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curriculum Control</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tracking <span className="text-indigo-600">{calculateProgress()}%</span> Operational Efficiency</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-full sm:w-64 h-12 bg-white border-slate-200 text-slate-900 rounded-xl px-4 font-bold focus:ring-0 shadow-sm">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {courses.map(c => <SelectItem key={c} value={c} className="font-bold text-xs">{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                            <SelectTrigger className="w-full sm:w-32 h-12 bg-slate-900 text-white border-0 rounded-xl px-4 font-black focus:ring-0 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
                                <SelectValue placeholder="Node" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-800 bg-slate-900 text-white shadow-xl">
                                {sections.map(s => <SelectItem key={s} value={s} className="font-black text-xs hover:bg-white/10">{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Part-based Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isLoading ? (
                    <div className="col-span-full py-32 text-center space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 animate-pulse mx-auto" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing with blockchain...</p>
                    </div>
                ) : groupedTopics.length > 0 ? (
                    groupedTopics.map((partTopics, pIdx) => (
                        <Card key={pIdx} className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden group">
                            <div className="bg-slate-900 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-[10px]">
                                        {pIdx + 1}
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Module Part {pIdx + 1}</span>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[9px] uppercase tracking-widest">
                                    {partTopics.filter((t: any) => t.status === 'COMPLETED').length}/{partTopics.length} Done
                                </Badge>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                {partTopics.map((topic: any, tIdx: number) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => {
                                            setSelectedTopic(topic);
                                            setNotes(topic.notes || "");
                                            setIsModalOpen(true);
                                        }}
                                        className={cn(
                                            "relative p-5 rounded-2xl border transition-all cursor-pointer group/item flex items-center justify-between hover:scale-[1.01]",
                                            topic.status === 'COMPLETED'
                                                ? "bg-slate-50/50 border-emerald-100 text-slate-900"
                                                : "bg-white border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                                topic.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                {topic.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={cn(
                                                    "font-black text-[13px] leading-tight transition-colors truncate",
                                                    topic.status === 'COMPLETED' ? "text-slate-900" : "text-slate-600"
                                                )}>
                                                    {topic.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Node {pIdx * 3 + tIdx + 1}</span>
                                                    {topic.notes && (
                                                        <Badge variant="outline" className="h-4 border-slate-100 text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                            Remark Added
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover/item:translate-x-1 transition-transform shrink-0" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-sm">
                        <Info className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Offline</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">Initialize curriculum node to start tracking.</p>
                    </div>
                )}
            </div>

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
