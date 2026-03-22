'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BookOpen, CheckCircle2, Clock, MoreHorizontal, Calendar,
    ChevronRight, BarChart3, List, MessageSquare, Info, Zap, User,
    Layers, Download, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import loadingAnimation from "../../../../../public/loading.json";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
                toast({ title: "Sync Error", description: "Failed to connect to curriculum node", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSyllabus();
    }, []);

    const downloadSyllabus = () => {
        if (!selectedSubject) return;

        const doc = new jsPDF() as any;

        // Header
        doc.setFontSize(22);
        doc.text("Academic Curriculum Sync", 14, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Subject: ${selectedSubject.subjectName} (${selectedSubject.subjectCode || 'N/A'})`, 14, 30);
        doc.text(`Completion: ${selectedSubject.percentage}%`, 14, 37);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 44);

        const tableData = selectedSubject.topics.map((t: any, i: number) => [
            i + 1,
            t.title,
            t.examType || "End Term",
            t.status === 'COMPLETED' ? "Completed" : "In Progress",
            t.completedDate ? new Date(t.completedDate).toLocaleDateString() : "-"
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['#', 'Topic Title', 'Exam milestone', 'Status', 'Completion Date']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42] },
            styles: { fontSize: 9, cellPadding: 4 },
        });

        doc.save(`${selectedSubject.subjectName}_Syllabus.pdf`);
        toast({ title: "Download Started", description: "Your syllabus is being prepared for printing" });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-background p-4 md:p-6 space-y-4 pb-40">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground/60 font-mono">Curriculum Node</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase ">Curriculum Matrix</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={downloadSyllabus}
                        disabled={!selectedSubject}
                        className="bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted/50 text-slate-900 dark:text-foreground border border-slate-200 dark:border-border rounded-xl px-4 h-10 gap-2 shadow-sm dark:shadow-none font-black uppercase tracking-widest text-[9px]"
                    >
                        <Download className="h-3 w-3" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Premium Subject Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide -mx-2 px-2">
                {syllabusData.map(subject => (
                    <button
                        key={subject.subjectName}
                        onClick={() => setSelectedSubject(subject)}
                        className={cn(
                            "group flex items-center gap-2 px-3.5 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                            selectedSubject?.subjectName === subject.subjectName
                                ? "bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary text-white dark:text-primary-foreground shadow-lg dark:shadow-none scale-[1.03]"
                                : "bg-white dark:bg-card border-white dark:border-border text-slate-400 dark:text-muted-foreground hover:border-slate-100 dark:hover:border-primary/50"
                        )}
                    >
                        <BookOpen className="h-3 w-3" />
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
                        <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-[0.3em] animate-pulse">Syncing Curriculum</h3>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60">Connecting to institutional node...</p>
                    </div>
                </div>
            ) : selectedSubject ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Left Panel: Stats & Context */}
                    <div className="lg:col-span-3 space-y-3">
                        <Card className="border-none shadow-sm dark:shadow-none rounded-[2rem] bg-white dark:bg-card overflow-hidden ring-1 ring-slate-100 dark:ring-border">
                            <CardContent className="p-5 md:p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-baseline justify-between">
                                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tighter ">{selectedSubject.percentage}%</h2>
                                        <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest">Complete</span>
                                    </div>
                                    <div className="h-1.5 md:h-2 w-full bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${selectedSubject.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-muted/30 border border-slate-100 dark:border-border flex items-center justify-between">
                                        <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">Nodes</p>
                                        <p className="text-xs font-black text-slate-900 dark:text-foreground">{selectedSubject.totalTopics}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 dark:border-border">
                                    <h4 className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-3">Milestones</h4>
                                    <div className="space-y-1">
                                        {Object.entries(selectedSubject.examMapping || {})
                                            .sort(([a], [b]) => {
                                                const priority: Record<string, number> = { "ST1": 1, "ST2": 2, "ST3": 3 };
                                                return (priority[a] || 99) - (priority[b] || 99) || a.localeCompare(b);
                                            })
                                            .map(([exam, topics]: [any, any]) => (
                                                <div key={exam} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-muted/30 border border-slate-50 dark:border-border/50">
                                                    <span className="text-[7.5px] md:text-[8px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest">{exam}</span>
                                                    <Badge className="bg-white dark:bg-card text-slate-400 dark:text-muted-foreground border-slate-100 dark:border-border text-[7px] md:text-[8px] font-black px-1.5 h-3.5 shadow-none">{topics.length}</Badge>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Content Timeline */}
                    <div className="lg:col-span-9 space-y-6">
                        {Object.entries(selectedSubject.examMapping || {})
                            .sort(([a], [b]) => {
                                const priority: Record<string, number> = { "ST1": 1, "ST2": 2, "ST3": 3 };
                                return (priority[a] || 99) - (priority[b] || 99) || a.localeCompare(b);
                            })
                            .map(([exam, topics]: [any, any]) => (
                                <div key={exam} className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-[9px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-indigo-500" />
                                            {exam}
                                        </h3>
                                        <div className="h-px flex-1 bg-slate-100 dark:bg-border" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {topics.map((topic: any, idx: number) => (
                                            <div key={topic.id} className="group">
                                                <div className={cn(
                                                    "p-3 md:p-4 rounded-2xl border transition-all duration-300",
                                                    topic.status === 'COMPLETED'
                                                        ? "bg-white dark:bg-card border-emerald-50 dark:border-emerald-500/10 shadow-sm dark:shadow-none"
                                                        : "bg-white dark:bg-card border-slate-50 dark:border-border hover:border-indigo-50 dark:hover:border-primary/30"
                                                )}>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={cn(
                                                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                                topic.status === 'COMPLETED' ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-muted text-slate-400 dark:text-muted-foreground"
                                                            )}>
                                                                {topic.status === 'COMPLETED' ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className={cn(
                                                                    "font-bold text-xs tracking-tight truncate",
                                                                    topic.status === 'COMPLETED' ? "text-slate-900 dark:text-foreground" : "text-slate-500 dark:text-muted-foreground"
                                                                )}>
                                                                    {topic.title}
                                                                </h4>
                                                                {topic.notes && (
                                                                    <p className="text-[9px] text-slate-400 truncate ">Remark added</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0">
                                                            {topic.completedDate && (
                                                                <p className="text-[8px] font-black text-slate-400 uppercase">
                                                                    {new Date(topic.completedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                <div className="py-32 text-center bg-white dark:bg-card rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-border shadow-sm dark:shadow-none animate-in fade-in zoom-in duration-700">
                    <Info className="h-12 w-12 text-slate-200 dark:text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">No Protocol Found</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-muted-foreground mt-1 uppercase tracking-widest opacity-60">No curriculum data detected for your current credentials.</p>
                </div>
            )}
        </div>
    );
}
