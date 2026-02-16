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
    BookOpen, CheckCircle2, ChevronRight, BarChart3, User, Calendar
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
    const [lecturesDone, setLecturesDone] = useState(0);
    const [notes, setNotes] = useState("");

    // Fetch Initial Data (Courses assigned to faculty)
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/faculty/syllabus/courses');
                const data = await res.json();
                if (data.subjects) setCourses(data.subjects);
                if (data.sections) setSections(data.sections);
                // Pre-select if only one
                if (data.subjects?.length > 0) setSelectedCourse(data.subjects[0]);
                if (data.sections?.length > 0) setSelectedSection(data.sections[0]);
            } catch (error) {
                console.error("Failed to load courses");
            }
        };
        fetchCourses();
    }, []);

    // Fetch Topics when Course/Section changes
    useEffect(() => {
        if (!selectedCourse || !selectedSection) return;

        const fetchTopics = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/faculty/syllabus/topics?subject=${encodeURIComponent(selectedCourse)}&section=${encodeURIComponent(selectedSection)}`);
                const data = await res.json();
                if (data.topics) setTopics(data.topics);
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load syllabus topics.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();
    }, [selectedCourse, selectedSection]);

    const openTopicModal = (topic: any) => {
        setSelectedTopic(topic);
        setLecturesDone(topic.completedLectures || 0);
        setNotes(topic.notes || "");
        setIsModalOpen(true);
    };

    const handleToggleTopic = async (topic: any) => {
        const newStatus = topic.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
        const newLectures = newStatus === 'COMPLETED' ? topic.totalLectures : 0;

        // Optimistic update
        setTopics(prev => prev.map(t =>
            t.id === topic.id ? {
                ...t,
                status: newStatus,
                completedLectures: newLectures,
                completedDate: newStatus === 'COMPLETED' ? new Date().toISOString() : null
            } : t
        ));

        try {
            await fetch('/api/faculty/syllabus/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: topic.id,
                    section: selectedSection,
                    status: newStatus,
                    completedLectures: newLectures,
                    notes: topic.notes // Keep existing notes if any
                })
            });

            if (newStatus === 'COMPLETED') {
                toast({
                    title: "Topic Completed",
                    description: `Marked "${topic.title}" as done.`,
                    className: "bg-emerald-50 border-emerald-200 text-emerald-800"
                });
            }
        } catch (e) {
            // Revert on failure
            toast({ title: "Error", description: "Failed to update", variant: "destructive" });
        }
    };

    const calculateProgress = () => {
        if (topics.length === 0) return 0;
        const completed = topics.filter(t => t.status === 'COMPLETED').length;
        return Math.round((completed / topics.length) * 100);
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 space-y-8 font-sans pb-32">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Faculty Hub</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-medium rounded-md px-2 py-0.5 text-[10px] tracking-wider uppercase">
                            Syllabus & Lecture Tracking
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm bg-slate-50 rounded-2xl p-2">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Total Topics</p>
                        <div className="flex items-baseline justify-between">
                            <span className="text-4xl font-extrabold text-slate-900">{topics.length}</span>
                            <Badge className="bg-white text-slate-600 shadow-sm border-0">Total</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-slate-50 rounded-2xl p-2">
                    <CardContent className="p-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Course Progress</p>
                        <div className="flex items-baseline justify-between">
                            <span className="text-4xl font-extrabold text-emerald-600">{calculateProgress()}%</span>
                            <BarChart3 className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Broadcast Center / Controls */}
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Course Selection</p>
                <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 rounded-2xl p-2">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger className="h-12 bg-slate-50 border-0 text-slate-900 rounded-xl px-4 font-medium focus:ring-0">
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className="h-12 bg-slate-900 text-white border-0 rounded-xl px-4 font-bold focus:ring-0 shadow-lg shadow-slate-200">
                                    <SelectValue placeholder="Sec" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Topic List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topics List</p>
                    <span className="text-xs text-slate-400">Click to toggle completion</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {isLoading ? (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium animate-pulse">Loading curriculum...</div>
                    ) : topics.length > 0 ? (
                        topics.map((topic, index) => (
                            <div
                                key={topic.id}
                                onClick={() => handleToggleTopic(topic)}
                                className={cn(
                                    "group relative flex flex-col justify-between p-4 rounded-xl border shadow-sm transition-all cursor-pointer h-32 hover:scale-[1.02]",
                                    topic.status === 'COMPLETED'
                                        ? "bg-emerald-500 border-emerald-600 shadow-emerald-200"
                                        : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-xs font-bold px-2 py-1 rounded-md",
                                        topic.status === 'COMPLETED' ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        #{index + 1}
                                    </span>
                                    {topic.status === 'COMPLETED' && (
                                        <CheckCircle2 className="h-5 w-5 text-white animate-in zoom-in spin-in-90 duration-300" />
                                    )}
                                </div>

                                <div>
                                    <h3 className={cn(
                                        "font-bold text-sm leading-tight line-clamp-2",
                                        topic.status === 'COMPLETED' ? "text-white" : "text-slate-700"
                                    )}>
                                        {topic.title}
                                    </h3>
                                    <p className={cn(
                                        "text-[10px] uppercase tracking-wide mt-2 font-medium",
                                        topic.status === 'COMPLETED' ? "text-emerald-100" : "text-slate-400"
                                    )}>
                                        {topic.totalLectures} Lectures
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-slate-400">Select a course to view topics.</div>
                    )}
                </div>
            </div>

            {/* Hidden Modal Code (Removed from view) */}
        </div>
    );
}
