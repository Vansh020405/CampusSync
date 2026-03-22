'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Upload, Download, FileSpreadsheet, Loader2,
    CheckCircle2, Users, BookOpen, ArrowLeft,
    Search, LayoutGrid, Activity, ShieldCheck,
    ChevronRight, Info, Table as TableIcon
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface GradeRow {
    Sno: string;
    RollNumber: string;
    Name: string;
    Subject: string;
    ST1Marks: string;
    ST1TotalMarks: string;
    ST2Marks: string;
    ST2TotalMarks: string;
    EndTermMarks: string;
    EndTermTotalMarks: string;
    Grade: string;
    Credits: string;
}

export default function FacultyGradesPage() {
    const { data: session } = useSession();
    const facultySubjectsRaw = (session?.user as any)?.subjects;
    let facultySubjects: string[] = [];

    if (Array.isArray(facultySubjectsRaw)) {
        facultySubjects = facultySubjectsRaw;
    } else if (typeof facultySubjectsRaw === 'string') {
        try {
            facultySubjects = facultySubjectsRaw.startsWith('[')
                ? JSON.parse(facultySubjectsRaw)
                : facultySubjectsRaw.split(',').map(s => s.trim());
        } catch (e) {
            facultySubjects = [facultySubjectsRaw];
        }
    }

    const [mentoredSections, setMentoredSections] = useState<any[]>([]);

    useEffect(() => {
        if (session) {
            const raw = (session?.user as any)?.mentoredSections;
            if (raw) {
                try {
                    setMentoredSections(JSON.parse(raw));
                } catch (e) { }
            }

            fetch('/api/faculty/mentored-sections')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setMentoredSections(data);
                    }
                })
                .catch(err => console.error("Failed to fetch mentored sections:", err));
        }
    }, [session]);

    const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'MENTOR'>('SUBJECTS');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<any | null>(null);
    const [sectionGrades, setSectionGrades] = useState<any[]>([]);
    const [loadingSection, setLoadingSection] = useState(false);
    const [mentorSelectedSubject, setMentorSelectedSubject] = useState<string | null>(null);

    const [parsedData, setParsedData] = useState<GradeRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        if (selectedSection) {
            fetchSectionGrades();
        }
    }, [selectedSection]);

    const fetchSectionGrades = async () => {
        setLoadingSection(true);
        try {
            const query = new URLSearchParams({
                section: selectedSection.section,
                semester: selectedSection.semester,
                department: selectedSection.department,
                batch: selectedSection.batch
            }).toString();

            const res = await fetch(`/api/faculty/mentor/section-grades?${query}`);
            if (res.ok) {
                const data = await res.json();
                setSectionGrades(data);
            } else {
                toast.error("Failed to fetch section grades");
            }
        } catch (error) {
            toast.error("Error loading section intelligence");
        } finally {
            setLoadingSection(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as any[];
                const formattedData: GradeRow[] = data.map(row => ({
                    Sno: row['Sno'] || row['S.No'] || '',
                    RollNumber: row['Roll Number'] || row['Roll No'] || row['RollNumber'] || '',
                    Name: row['Name'] || '',
                    Subject: row['Subject'] || '',
                    ST1Marks: row['ST1 Marks'] || '',
                    ST1TotalMarks: row['ST1 Total Marks'] || '',
                    ST2Marks: row['ST2 Marks'] || '',
                    ST2TotalMarks: row['ST2 Total Marks'] || '',
                    EndTermMarks: row['End Term Marks'] || '',
                    EndTermTotalMarks: row['End Term Total Marks'] || '',
                    Grade: row['Grade'] || '',
                    Credits: row['Credits'] || '3'
                }));

                setParsedData(formattedData.filter(d => d.RollNumber && d.Subject));
                setIsParsing(false);
                toast.success(`Successfully parsed ${formattedData.length} records.`);
            },
            error: (error) => {
                toast.error("Failed to parse CSV file.");
                setIsParsing(false);
            }
        });
    };

    const handleDownloadTemplate = () => {
        const subjectName = selectedSubject || "AI & DS";
        const template = [
            "Sno,Roll Number,Name,Subject,ST1 Marks,ST1 Total Marks,ST2 Marks,ST2 Total Marks,End Term Marks,End Term Total Marks,Grade,Credits",
            `1,2410992641,Vansh Bansal,${subjectName},25,30,28,30,45,50,A,4`,
            `2,2410992617,Rahul Sharma,${subjectName},22,30,,,,,,,`
        ].join('\n');

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Grade_Upload_Template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDeploy = async () => {
        if (parsedData.length === 0) return;
        setIsDeploying(true);

        try {
            const res = await fetch('/api/faculty/grades/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grades: parsedData })
            });

            if (!res.ok) throw new Error("Failed to deploy grades.");

            toast.success("Grades deployed successfully to the Academic Intelligence System.");
            setParsedData([]);
        } catch (error) {
            toast.error("Deployment failed. Check server logs.");
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 pb-32 space-y-6 animate-in fade-in duration-500 min-h-screen bg-white dark:bg-background font-sans transition-colors">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-border pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none mt-1">Academic Grading</h1>
                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2 opacity-60">
                        <Activity className="h-3 w-3 text-indigo-500 dark:text-indigo-400" /> Data Management & Intelligence
                    </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-muted p-1 rounded-2xl gap-1 shrink-0">
                    <button
                        onClick={() => { setActiveTab('SUBJECTS'); setSelectedSubject(null); setSelectedSection(null); }}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ",
                            activeTab === 'SUBJECTS' ? "bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-xl" : "text-slate-500 dark:text-muted-foreground hover:bg-white/50 dark:hover:bg-card/50"
                        )}
                    >
                        <BookOpen className="h-3.5 w-3.5" /> Pipeline
                    </button>
                    {mentoredSections.length > 0 && (
                        <button
                            onClick={() => { setActiveTab('MENTOR'); setSelectedSubject(null); setSelectedSection(null); }}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ",
                                activeTab === 'MENTOR' ? "bg-white dark:bg-card text-indigo-600 dark:text-indigo-400 shadow-xl" : "text-slate-500 dark:text-muted-foreground hover:bg-white/50 dark:hover:bg-card/50"
                            )}
                        >
                            <ShieldCheck className="h-3.5 w-3.5" /> Intelligence
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'SUBJECTS' ? (
                !selectedSubject ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 opacity-60">
                            <div className="h-4 w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ">Target Subject Selection</h2>
                        </div>
                        {facultySubjects.length === 0 ? (
                            <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-[2.5rem] overflow-hidden bg-white/50 dark:bg-card/50 backdrop-blur-sm border border-slate-100 dark:border-border transition-all">
                                <CardContent className="p-16 flex flex-col items-center justify-center text-center">
                                    <div className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-muted flex items-center justify-center mb-6">
                                        <BookOpen className="h-8 w-8 text-slate-200 dark:text-muted-foreground opacity-30" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-700 dark:text-muted-foreground uppercase  tracking-tighter">No Subjects Assigned</h3>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest mt-2 max-w-sm">
                                        Data Synchronisation Required
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {facultySubjects.map((sub, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSubject(sub.trim())}
                                        className="text-left w-full group focus:outline-none"
                                    >
                                        <Card className="border-none shadow-lg shadow-slate-200/30 dark:shadow-black/10 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-card hover:-translate-y-1.5 border border-slate-50 dark:border-border/50">
                                            <CardContent className="p-6">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-muted flex items-center justify-center mb-6 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:rotate-12 transition-all duration-500 group-hover:scale-110">
                                                    <BookOpen className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                                                </div>
                                                <h3 className="text-sm font-black text-slate-900 dark:text-foreground line-clamp-2 leading-[1.1] mb-2 uppercase  tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                    {sub.trim()}
                                                </h3>
                                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.15em] opacity-60">
                                                    Deploy Payload
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-5 border-b border-slate-100 dark:border-border pb-4">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted rounded-2xl h-11 w-11 border-slate-200 dark:border-border shadow-sm transition-all hover:scale-105"
                                onClick={() => { setSelectedSubject(null); setParsedData([]); }}
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-muted-foreground" />
                            </Button>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none">{selectedSubject}</h2>
                                <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] mt-1.5 opacity-80">Operational Framework 404</p>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-[2rem] bg-white dark:bg-card border border-slate-50 dark:border-border overflow-hidden p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
                                <div className="space-y-1.5 text-center md:text-left">
                                    <h3 className="text-base font-black text-slate-900 dark:text-foreground uppercase  tracking-tight">Transmission Protocol</h3>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60 leading-snug max-w-xs">Schema validation required for cloud sync.</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                                    <Button
                                        onClick={handleDownloadTemplate}
                                        variant="outline"
                                        className="h-11 px-5 rounded-xl border-slate-200 dark:border-border text-slate-600 dark:text-muted-foreground font-black uppercase text-[9px] tracking-widest hover:bg-slate-50 dark:hover:bg-muted flex-1 md:flex-none transition-all "
                                    >
                                        <Download className="h-3.5 w-3.5 mr-2" /> Template
                                    </Button>
                                    <div className="relative flex-1 md:flex-none">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={isParsing || isDeploying}
                                        />
                                        <Button className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-black uppercase text-[9px] tracking-widest shadow-xl shadow-indigo-500/20 w-full md:w-auto transition-all ">
                                            {isParsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-2" />} Import Payload
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-xl shadow-indigo-500/20 rounded-[2rem] bg-slate-900 dark:bg-slate-950 p-6 text-white group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700" />
                                <div className="h-full flex flex-col justify-between space-y-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-indigo-400" />
                                        </div>
                                        <Badge variant="outline" className="border-white/20 text-white/60 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Status: Ready</Badge>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Pending Buffering</p>
                                        <h4 className="text-xl font-black  tracking-tighter">{parsedData.length} Valid Records</h4>
                                    </div>
                                    <Button
                                        onClick={handleDeploy}
                                        disabled={isDeploying || parsedData.length === 0}
                                        className="w-full h-10 rounded-xl bg-white text-slate-900 font-black uppercase text-[9px] tracking-widest hover:bg-indigo-50 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] shadow-xl"
                                    >
                                        Commit to Mainframe
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {parsedData.length > 0 && (
                            <Card className="border-none shadow-2xl shadow-slate-200/60 dark:shadow-black/40 rounded-[2rem] overflow-hidden bg-white dark:bg-card border border-slate-100 dark:border-border transition-all">
                                <div className="p-0 overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead className="bg-slate-50 dark:bg-muted/50 text-slate-400 dark:text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em]">
                                            <tr className="border-b border-slate-100 dark:border-border">
                                                <th className="px-6 py-4">Index</th>
                                                <th className="px-6 py-4">ID Profile</th>
                                                <th className="px-6 py-4">Identity Matrix</th>
                                                <th className="px-6 py-4">ST1 Value</th>
                                                <th className="px-6 py-4">ST2 Value</th>
                                                <th className="px-6 py-4">End Term</th>
                                                <th className="px-6 py-4">Grade Alpha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-border/50 font-bold">
                                            {parsedData.map((row, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 text-slate-300 dark:text-muted-foreground/40 font-mono ">{row.Sno}</td>
                                                    <td className="px-6 py-4 text-slate-900 dark:text-foreground font-black tracking-tight ">{row.RollNumber}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-800 dark:text-foreground uppercase  tracking-tight">{row.Name}</span>
                                                            <span className="text-[8px] text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.1em] opacity-60">{row.Subject}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-muted-foreground">
                                                        <span className="text-slate-900 dark:text-foreground">{row.ST1Marks}</span> <span className="text-slate-200 dark:text-muted-foreground opacity-30 font-medium">/ {row.ST1TotalMarks}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-muted-foreground">
                                                        <span className="text-slate-900 dark:text-foreground">{row.ST2Marks}</span> <span className="text-slate-200 dark:text-muted-foreground opacity-30 font-medium">/ {row.ST2TotalMarks}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-muted-foreground">
                                                        <span className="text-slate-900 dark:text-foreground">{row.EndTermMarks}</span> <span className="text-slate-200 dark:text-muted-foreground opacity-30 font-medium">/ {row.EndTermTotalMarks}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {row.Grade ? (
                                                            <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20 ">{row.Grade}</span>
                                                        ) : <span className="opacity-20">â€”</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                )
            ) : (
                !selectedSection ? (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3 opacity-60">
                            <div className="h-4 w-1 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ">Mentored Cohorts Matrix</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {mentoredSections.map((sec: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSection(sec)}
                                    className="text-left w-full group focus:outline-none"
                                >
                                    <div className="bg-white dark:bg-card p-6 rounded-[2rem] border border-slate-100 dark:border-border shadow-xl shadow-slate-200/30 dark:shadow-black/10 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative overflow-hidden group hover:-translate-y-1.5 border-b-4 border-b-emerald-500/20">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-all duration-700" />
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 dark:group-hover:bg-emerald-600 transition-all duration-500 group-hover:rotate-6">
                                                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase ">{sec.batch}</span>
                                                <span className="bg-slate-900 dark:bg-primary text-white px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest uppercase ">Sem {sec.semester}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-foreground tracking-tighter mb-1 uppercase  group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10">Section {sec.section}</h3>
                                        <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60 relative z-10">{sec.department}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-border transition-all">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted rounded-2xl h-11 w-11 border-slate-200 dark:border-border shadow-sm transition-all hover:scale-105"
                                    onClick={() => setSelectedSection(null)}
                                >
                                    <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-muted-foreground" />
                                </Button>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none">Section {selectedSection.section} Intelligence</h2>
                                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-2 opacity-80">
                                        <ShieldCheck className="h-3 w-3" /> Mentor Command Deck
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={fetchSectionGrades}
                                variant="ghost"
                                className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 h-9 px-4 hover:bg-slate-50 dark:hover:bg-muted/50 rounded-xl  transition-all"
                            >
                                <Activity className={cn("h-3.5 w-3.5", loadingSection && "animate-spin")} /> Refresh Matrix
                            </Button>
                        </div>

                        {loadingSection ? (
                            <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white dark:bg-background rounded-[2rem] border border-slate-100 dark:border-border border-dashed transition-all">
                                <div className="relative">
                                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-muted border-t-emerald-500 dark:border-t-emerald-400 animate-spin" />
                                    <Users className="h-6 w-6 text-emerald-500 dark:text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.25em]  animate-pulse">Decompiling Student Metrics...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(() => {
                                    const mentorSubjects = Array.from(new Set(sectionGrades.flatMap(s => s.grades.map((g: any) => g.subjectName))));
                                    return (
                                        <>
                                            {mentorSubjects.length === 0 ? (
                                                <div className="text-center py-20 bg-slate-50/50 dark:bg-card/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-border transition-all">
                                                    <Info className="h-10 w-10 text-slate-200 dark:text-muted-foreground/30 mx-auto mb-4" />
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest ">Signal Lost â€¢ No Subject Synchronization Detected</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2 pb-2">
                                                    {mentorSubjects.map((sub: unknown) => (
                                                        <button
                                                            key={sub as string}
                                                            onClick={() => setMentorSelectedSubject(sub as string)}
                                                            className={cn(
                                                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ",
                                                                mentorSelectedSubject === (sub as string)
                                                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20 scale-105"
                                                                    : "bg-white dark:bg-card border-slate-200 dark:border-border text-slate-500 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted"
                                                            )}
                                                        >
                                                            {sub as string}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {mentorSelectedSubject && (
                                                <Card className="border-none shadow-2xl shadow-slate-200/40 dark:shadow-black/40 rounded-[2.5rem] bg-white dark:bg-card border border-slate-100 dark:border-border overflow-hidden transition-all">
                                                    <div className="overflow-x-auto no-scrollbar">
                                                        <table className="w-full text-left border-collapse min-w-[900px]">
                                                            <thead>
                                                                <tr className="bg-slate-50 dark:bg-muted/50 border-b border-slate-100 dark:border-border">
                                                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Roll Number ID</th>
                                                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Personnel Profile</th>
                                                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">ST1 Value</th>
                                                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">ST2 Value</th>
                                                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">End Term</th>
                                                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Grade Vector</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50 dark:divide-border/50">
                                                                {sectionGrades.map((student: any) => {
                                                                    const pg = student.grades.find((g: any) => g.subjectName === mentorSelectedSubject);
                                                                    if (!pg) return null;
                                                                    return (
                                                                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-all group">
                                                                            <td className="px-8 py-5 text-sm font-black text-slate-400 dark:text-muted-foreground/40 font-mono ">{student.rollNo}</td>
                                                                            <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-foreground  tracking-tight">{student.name}</td>
                                                                            <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-muted-foreground">
                                                                                <span className="text-slate-900 dark:text-foreground">{pg.st1Marks ?? '-'}</span> <span className="text-slate-200 dark:text-muted-foreground/30 font-medium">/{pg.st1Total ?? '-'}</span>
                                                                            </td>
                                                                            <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-muted-foreground">
                                                                                <span className="text-slate-900 dark:text-foreground">{pg.st2Marks ?? '-'}</span> <span className="text-slate-200 dark:text-muted-foreground/30 font-medium">/{pg.st2Total ?? '-'}</span>
                                                                            </td>
                                                                            <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-muted-foreground">
                                                                                <span className="text-slate-900 dark:text-foreground">{pg.endTermMarks ?? '-'}</span> <span className="text-slate-200 dark:text-muted-foreground/30 font-medium">/{pg.endTermTotal ?? '-'}</span>
                                                                            </td>
                                                                            <td className="px-8 py-5">
                                                                                {pg.grade && pg.grade !== '-' ? (
                                                                                    <span className="bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest  shadow-lg shadow-emerald-500/20">{pg.grade}</span>
                                                                                ) : <span className="text-slate-200 dark:text-muted-foreground/20  tracking-widest">â€”</span>}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </Card>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
