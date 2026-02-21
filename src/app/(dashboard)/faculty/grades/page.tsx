'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

            // Re-fetch dynamics
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

    // Mentor view specific states
    // mentorViewMode removed as per request
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

    const getComponentPercentage = (marks: string, total: string) => {
        if (!marks || !total) return '-';
        const m = parseFloat(marks);
        const t = parseFloat(total);
        if (t === 0) return '-';
        return ((m / t) * 100).toFixed(1) + '%';
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
        <div className="max-w-7xl mx-auto p-6 pb-24 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Grading</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-indigo-500" /> Data Management & Section Intelligence
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0 self-start">
                    <button
                        onClick={() => { setActiveTab('SUBJECTS'); setSelectedSubject(null); setSelectedSection(null); }}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                            activeTab === 'SUBJECTS' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <BookOpen className="h-3.5 w-3.5" /> Grading Pipeline
                    </button>
                    {mentoredSections.length > 0 && (
                        <button
                            onClick={() => { setActiveTab('MENTOR'); setSelectedSubject(null); setSelectedSection(null); }}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2",
                                activeTab === 'MENTOR' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                        >
                            <ShieldCheck className="h-3.5 w-3.5" /> Section Intel
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'SUBJECTS' ? (
                // --- GRADING PIPELINE (EXISTING LOGIC) ---
                !selectedSubject ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Select Active Subject</h2>
                        </div>
                        {facultySubjects.length === 0 ? (
                            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
                                <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                                    <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
                                    <h3 className="text-lg font-black text-slate-700">No Subjects Assigned</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">
                                        You have not been assigned any subjects yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {facultySubjects.map((sub, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSubject(sub.trim())}
                                        className="text-left w-full group"
                                    >
                                        <Card className="border-none shadow-xl shadow-slate-200/40 hover:shadow-indigo-500/10 transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white hover:-translate-y-1">
                                            <CardContent className="p-8">
                                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all duration-500">
                                                    <BookOpen className="h-7 w-7 text-slate-400 group-hover:text-white transition-colors" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-[1.1] mb-2">
                                                    {sub.trim()}
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Academic Upload
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-5">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-white hover:bg-slate-50 rounded-2xl h-12 w-12 border-slate-200 shadow-sm"
                                onClick={() => { setSelectedSubject(null); setParsedData([]); }}
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </Button>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{selectedSubject}</h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mt-1.5">Deployment Framework</p>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-slate-900 uppercase">Data Operations</h3>
                                    <p className="text-sm font-bold text-slate-400 leading-snug max-w-sm">Use the system template to ensure schema validation before deployment.</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <Button
                                        onClick={handleDownloadTemplate}
                                        variant="outline"
                                        className="h-14 px-6 rounded-2xl border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50"
                                    >
                                        <Download className="h-4 w-4 mr-2" /> Template
                                    </Button>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            disabled={isParsing || isDeploying}
                                        />
                                        <Button className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 pointer-events-none">
                                            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload CSV
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-slate-900 p-8 text-white">
                                <div className="h-full flex flex-col justify-between space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Users className="h-6 w-6 text-indigo-400" />
                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Pipeline</p>
                                        <h4 className="text-2xl font-black">{parsedData.length} Valid Entries</h4>
                                    </div>
                                    <Button
                                        onClick={handleDeploy}
                                        disabled={isDeploying || parsedData.length === 0}
                                        className="w-full h-12 rounded-xl bg-white text-slate-900 font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 disabled:opacity-30"
                                    >
                                        Commit to Cloud
                                    </Button>
                                </div>
                            </Card>
                        </div>

                        {parsedData.length > 0 && (
                            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white">
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <tr>
                                                <th className="px-8 py-5">SNo</th>
                                                <th className="px-8 py-5">Roll ID</th>
                                                <th className="px-8 py-5">Student Identity</th>
                                                <th className="px-8 py-5">ST1</th>
                                                <th className="px-8 py-5">ST2</th>
                                                <th className="px-8 py-5">ETM</th>
                                                <th className="px-8 py-5">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 font-bold">
                                            {parsedData.map((row, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 text-slate-400">{row.Sno}</td>
                                                    <td className="px-8 py-5 text-slate-900">{row.RollNumber}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span>{row.Name}</span>
                                                            <span className="text-[9px] text-slate-400 uppercase tracking-widest">{row.Subject}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {row.ST1Marks} <span className="text-slate-300 font-medium">/{row.ST1TotalMarks}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {row.ST2Marks} <span className="text-slate-300 font-medium">/{row.ST2TotalMarks}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {row.EndTermMarks} <span className="text-slate-300 font-medium">/{row.EndTermTotalMarks}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {row.Grade ? (
                                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">{row.Grade}</span>
                                                        ) : '-'}
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
                // --- SECTION INTELLIGENCE (MENTOR VIEW) ---
                !selectedSection ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                            <h2 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Your Mentored Cohorts</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mentoredSections.map((sec: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSection(sec)}
                                    className="text-left w-full group"
                                >
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                        <div className="flex items-center justify-between mb-10">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-500">
                                                <Users className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">{sec.batch}</span>
                                                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Sem {sec.semester}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 uppercase group-hover:text-emerald-700 transition-colors">Section {sec.section}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">{sec.department}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-white hover:bg-slate-50 rounded-2xl h-12 w-12 border-slate-200 shadow-sm"
                                    onClick={() => setSelectedSection(null)}
                                >
                                    <ArrowLeft className="h-5 w-5 text-slate-600" />
                                </Button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Section {selectedSection.section} Intelligence</h2>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                        <ShieldCheck className="h-3 w-3" /> Mentor Control Panel
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={fetchSectionGrades}
                                variant="ghost"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2"
                            >
                                <Activity className={cn("h-3.5 w-3.5", loadingSection && "animate-spin")} /> Refresh Intel
                            </Button>
                        </div>

                        {loadingSection ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling grading matrix...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {(() => {
                                    const mentorSubjects = Array.from(new Set(sectionGrades.flatMap(s => s.grades.map((g: any) => g.subjectName))));
                                    return (
                                        <>
                                            {mentorSubjects.length === 0 ? (
                                                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                                    <Info className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-slate-500">No grading data synchronized yet for any subject.</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {mentorSubjects.map((sub: unknown) => (
                                                        <button
                                                            key={sub as string}
                                                            onClick={() => setMentorSelectedSubject(sub as string)}
                                                            className={cn(
                                                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                                mentorSelectedSubject === (sub as string)
                                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {sub as string}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {mentorSelectedSubject && (
                                                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                                            <thead>
                                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-[2.5rem]">Roll No</th>
                                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ST1</th>
                                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ST2</th>
                                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">End Term</th>
                                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tr-[2.5rem]">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50">
                                                                {sectionGrades.map((student: any) => {
                                                                    const pg = student.grades.find((g: any) => g.subjectName === mentorSelectedSubject);
                                                                    if (!pg) return null;
                                                                    return (
                                                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                                            <td className="px-8 py-5 text-sm font-bold text-slate-600">{student.rollNo}</td>
                                                                            <td className="px-8 py-5 text-sm font-black text-slate-900">{student.name}</td>
                                                                            <td className="px-8 py-5 text-sm font-medium text-slate-700">
                                                                                {pg.st1Marks ?? '-'} <span className="text-slate-300 font-medium">/{pg.st1Total ?? '-'}</span>
                                                                            </td>
                                                                            <td className="px-8 py-5 text-sm font-medium text-slate-700">
                                                                                {pg.st2Marks ?? '-'} <span className="text-slate-300 font-medium">/{pg.st2Total ?? '-'}</span>
                                                                            </td>
                                                                            <td className="px-8 py-5 text-sm font-medium text-slate-700">
                                                                                {pg.endTermMarks ?? '-'} <span className="text-slate-300 font-medium">/{pg.endTermTotal ?? '-'}</span>
                                                                            </td>
                                                                            <td className="px-8 py-5">
                                                                                {pg.grade && pg.grade !== '-' ? (
                                                                                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">{pg.grade}</span>
                                                                                ) : <span className="text-slate-400">-</span>}
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
