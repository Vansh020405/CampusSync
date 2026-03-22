'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CheckCircle2, XCircle, Clock, Users, AlertTriangle,
    Calendar, TrendingDown, LayoutDashboard, Upload, FileCheck, Loader2, BookOpen, Save, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";


// Student sync enabled - mock data removed to prevent sync confusion

export default function FacultyAttendancePage() {
    const { data: session } = useSession();
    const facultyId = (session?.user as any)?.id;
    const facultyName = session?.user?.name || "Faculty";

    // Get subjects and sections for this faculty from session
    const facultySubjectsString = (session?.user as any)?.subjects;
    const facultySubjects = facultySubjectsString
        ? (facultySubjectsString.startsWith('[') ? JSON.parse(facultySubjectsString) : facultySubjectsString.split(','))
        : ["No Subjects"];

    const [selectedSection, setSelectedSection] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");

    // Automatically select the first assigned subject and section if available
    useEffect(() => {
        if (facultySubjects.length > 0 && !selectedSubject) {
            setSelectedSubject(facultySubjects[0].trim());
        }
    }, [facultySubjects, selectedSubject]);

    const [combinedSections, setCombinedSections] = useState<string[]>([]);

    // Fetch and merge teaching sections and mentored sections
    useEffect(() => {
        const fetchAllSections = async () => {
            const sectionsData = (session?.user as any)?.sectionsTeaching;
            let sections: string[] = [];

            if (sectionsData) {
                sections = typeof sectionsData === 'string' && sectionsData.startsWith('[')
                    ? JSON.parse(sectionsData)
                    : (Array.isArray(sectionsData) ? [...sectionsData] : [sectionsData]);
            }

            try {
                const res = await fetch('/api/faculty/mentored-sections');
                if (res.ok) {
                    const mentored = await res.json();
                    if (Array.isArray(mentored)) {
                        mentored.forEach((m: any) => {
                            if (!sections.includes(m.section)) {
                                sections.push(m.section);
                            }
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch mentored sections:", err);
            }

            setCombinedSections(sections);
            if (sections.length > 0 && !selectedSection) {
                setSelectedSection(sections[0]);
            }
        };

        if (session) {
            fetchAllSections();
        }
    }, [session, selectedSection]);

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const offset = today.getTimezoneOffset() * 60000;
        return new Date(today.getTime() - offset).toISOString().split('T')[0];
    });
    const [selectedPeriods, setSelectedPeriods] = useState<number[]>([1]);
    const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
    const [isSaved, setIsSaved] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const { broadcast } = useRealtime();
    const [sectionStudents, setSectionStudents] = useState<Record<string, any[]>>({});
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    // Fetch students from database
    const fetchStudents = async () => {
        if (!selectedSection || !selectedSubject) return;
        setIsLoadingStudents(true);
        try {
            const subjectParam = `?subject=${encodeURIComponent(selectedSubject)}`;
            const res = await fetch(`/api/students/by-section/${encodeURIComponent(selectedSection)}${subjectParam}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSectionStudents(prev => ({ ...prev, [`${selectedSection}-${selectedSubject}`]: data }));
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    // Fetch students from database
    useEffect(() => {
        if (selectedSection && selectedSubject) {
            fetchStudents();
        }
    }, [selectedSection, selectedSubject]);

    // Reset attendance and save state when section, subject or date changes
    useEffect(() => {
        setAttendance({});
        setIsSaved(false);
    }, [selectedSection, selectedSubject, selectedDate]);

    // Get current students from state
    const currentStudents = sectionStudents[`${selectedSection}-${selectedSubject}`] || [];

    const currentSubject = selectedSubject || facultySubjects[0]?.trim() || "Unassigned";

    // Helper to get raw sections list for selectors
    const getSectionsList = () => {
        return combinedSections;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadSuccess(false);

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (!content) return;

            // Simple CSV parsing logic
            const lines = content.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('id'));
            const nameIdx = headers.findIndex(h => h.includes('name'));

            if (rollIdx === -1 || nameIdx === -1) {
                alert("Invalid CSV format. Please ensure 'Roll No' and 'Name' columns exist.");
                setIsUploading(false);
                return;
            }

            const newStudents = lines.slice(1).map((line, index) => {
                const cols = line.split(',').map(c => c.trim());
                return {
                    id: `UPLOAD-${Date.now()}-${index}`, // Unique string ID
                    rollNo: cols[rollIdx] || `ROLL-${index}`,
                    name: cols[nameIdx] || `Student ${index}`,
                    attendance: Math.floor(Math.random() * (100 - 60 + 1)) + 60 // Mock overall attendance
                };
            });

            if (newStudents.length > 0) {
                setSectionStudents(prev => ({
                    ...prev,
                    [selectedSection]: newStudents
                }));
                // Reset attendance for new list
                setAttendance({});
                setUploadSuccess(true);
                setTimeout(() => setUploadSuccess(false), 3000);
            }

            setIsUploading(false);
        };
        reader.readAsText(file);
    };

    const handleMarkAttendance = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
        setIsSaved(false);
    };

    const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
        const newAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
        currentStudents.forEach(student => {
            newAttendance[student.id] = status;
        });
        setAttendance(newAttendance);
        setIsSaved(false);
    };

    const handleSave = async () => {
        if (!facultyId || Object.keys(attendance).length === 0) return;

        setIsSaved(true);

        try {
            // 1. Persist to Database
            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facultyId,
                    subject: currentSubject,
                    date: selectedDate,
                    periods: selectedPeriods,
                    attendance
                })
            });

            if (!res.ok) throw new Error("Persistence failed");

            // 2. Real-time Sync: Notify students immediately
            currentStudents.forEach(student => {
                const status = attendance[student.id];
                if (status) {
                    broadcast({
                        type: 'ATTENDANCE_UPDATE',
                        data: {
                            studentId: student.id.toString(),
                            subject: currentSubject,
                            percentage: status === 'PRESENT' ? Math.min(100, (student.attendance || 75) + 0.5) : (student.attendance || 75)
                        }
                    });
                }
            });

            // 3. Refresh local data to show updated percentages
            await fetchStudents();

        } catch (err) {
            console.error("Save failed:", err);
            alert("Digital Ledger synchronization failed. Please retry.");
        } finally {
            setTimeout(() => setIsSaved(false), 3000);
        }
    };

    const stats = {
        total: currentStudents.length,
        present: Object.values(attendance).filter(s => s === 'PRESENT').length,
        absent: Object.values(attendance).filter(s => s === 'ABSENT').length,
        percentage: currentStudents.length > 0
            ? Math.round((Object.values(attendance).filter(s => s === 'PRESENT').length / currentStudents.length) * 100)
            : 0
    };

    const lowAttendanceStudents = currentStudents.filter(s => s.attendance < 75);

    return (
        <div className="space-y-4 pb-20 max-w-7xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-screen bg-slate-50/30 dark:bg-background font-sans">
            {/* Extremely Compact Header & Toolbar */}
            <div className="bg-white dark:bg-card rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                        <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 dark:text-foreground tracking-tight leading-none uppercase ">Attendance</h1>
                        <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Digital Ledger Console</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-grow justify-start md:justify-end min-w-0">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-9 w-full md:w-40 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-muted border-slate-200 dark:border-border text-slate-600 dark:text-foreground">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] border-slate-100 dark:border-border">
                            {facultySubjects.map((subject: string) => (
                                <SelectItem key={subject} value={subject.trim()} className="text-[10px] font-black uppercase tracking-wider">
                                    {subject.trim()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="h-9 w-32 md:w-32 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-muted border-slate-200 dark:border-border text-slate-600 dark:text-foreground">
                            <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] border-slate-100 dark:border-border">
                            {getSectionsList().map((section: string) => (
                                <SelectItem key={section} value={section} className="text-[10px] font-black uppercase tracking-wider">
                                    Section {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-9 w-36 px-2 rounded-md border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-foreground focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />

                    <div className="h-8 w-px bg-slate-200 dark:bg-border mx-1 hidden lg:block" />

                    <div className="flex bg-slate-100/80 dark:bg-muted/50 p-1 rounded-xl gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                            const isSelected = selectedPeriods.includes(p);
                            return (
                                <motion.button
                                    key={p}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (isSelected) {
                                            if (selectedPeriods.length > 1) setSelectedPeriods(prev => prev.filter(i => i !== p));
                                        } else {
                                            setSelectedPeriods(prev => [...prev, p].sort((a, b) => a - b));
                                        }
                                    }}
                                    className={cn(
                                        "relative h-7 w-7 rounded-lg text-[10px] font-black transition-colors flex items-center justify-center overflow-hidden",
                                        isSelected ? "text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    )}
                                >
                                    {isSelected && (
                                        <motion.div
                                            layoutId={`period-bg-${p}`}
                                            className="absolute inset-0 bg-emerald-600"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                                        />
                                    )}
                                    <span className="relative z-10">P{p}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Combined List & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Main List */}
                <div className="lg:col-span-3 space-y-3">
                    <Card className="border border-slate-100 dark:border-border shadow-sm overflow-hidden bg-white dark:bg-card rounded-2xl">
                        {/* List Header */}
                        <div className="bg-slate-50/50 dark:bg-muted/20 border-b border-slate-100 dark:border-border px-4 py-2 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest w-8">Roll</span>
                                <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">Student Name</span>
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 uppercase" onClick={() => handleMarkAll('PRESENT')}>
                                    ALL PRESENT
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 uppercase" onClick={() => handleMarkAll('ABSENT')}>
                                    ALL ABSENT
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {currentStudents.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 dark:text-muted-foreground text-xs font-black uppercase tracking-widest opacity-50">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Synchronizing Roster...
                                </div>
                            ) : (
                                currentStudents.map((student, idx) => {
                                    const status = attendance[student.id];
                                    return (
                                        <div key={student.id} className={cn(
                                            "flex items-center justify-between px-4 py-2 border-b border-slate-50 dark:border-border/50 hover:bg-slate-50/50 dark:hover:bg-muted/30 transition-colors last:border-0",
                                            idx % 2 === 0 ? "bg-white dark:bg-card" : "bg-[#fafafa] dark:bg-muted/10"
                                        )}>
                                            <div className="flex items-center gap-4 flex-grow min-w-0">
                                                <Badge variant="outline" className="w-12 justify-center font-mono text-[9px] border-slate-200 dark:border-border text-slate-500 dark:text-muted-foreground bg-white dark:bg-muted shadow-sm uppercase">
                                                    {student.rollNo.slice(-3)}
                                                </Badge>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate uppercase">{student.name}</p>
                                                    {student.attendance < 75 ? (
                                                        <span className="text-[8px] font-black text-red-500 dark:text-red-400 flex items-center gap-0.5 leading-none mt-1 uppercase tracking-widest">
                                                            <AlertTriangle className="h-2 w-2" /> {student.attendance}% ATT RISK
                                                        </span>
                                                    ) : (
                                                        <span className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5 leading-none mt-1 uppercase tracking-widest">
                                                            <CheckCircle2 className="h-2 w-2" /> {student.attendance}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'PRESENT')}
                                                    className={cn(
                                                        "h-7 w-8 rounded text-[10px] font-black transition-all border",
                                                        status === 'PRESENT'
                                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
                                                            : "bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                                                    )}
                                                >
                                                    P
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAttendance(student.id, 'ABSENT')}
                                                    className={cn(
                                                        "h-7 w-8 rounded text-[10px] font-black transition-all border",
                                                        status === 'ABSENT'
                                                            ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-200"
                                                            : "bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600"
                                                    )}
                                                >
                                                    A
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Stats & Actions */}
                <div className="space-y-3">
                    <Card className="border-none shadow-md bg-slate-900 dark:bg-muted text-white rounded-2xl overflow-hidden">
                        <CardContent className="p-5">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mb-3">Intelligence Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-300 dark:text-muted-foreground uppercase tracking-widest">Present</span>
                                    <span className="text-sm font-black text-emerald-400">{stats.present}</span>
                                </div>
                                <div className="w-full bg-slate-800 dark:bg-background h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.percentage}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-300 dark:text-muted-foreground uppercase tracking-widest">Absent</span>
                                    <span className="text-sm font-black text-red-400">{stats.absent}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-slate-800 dark:border-border">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-300 dark:text-muted-foreground uppercase tracking-widest">Efficiency</span>
                                        <span className={cn(
                                            "text-lg font-black",
                                            stats.percentage >= 75 ? "text-emerald-400" : "text-amber-400"
                                        )}>{stats.percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        className={cn(
                            "w-full h-12 shadow-lg transition-all font-black text-xs uppercase tracking-widest rounded-xl",
                            isSaved
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={handleSave}
                        disabled={Object.keys(attendance).length === 0 || isSaved}
                    >
                        {isSaved ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Sync Complete
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Save & Sync
                            </div>
                        )}
                    </Button>

                    {/* Compact CSV Upload Trigger */}
                    <div className="relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csv-upload-compact"
                        />
                        <label
                            htmlFor="csv-upload-compact"
                            className={cn(
                                "flex items-center justify-center gap-2 w-full h-10 rounded-xl border-2 border-dashed transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wide",
                                isUploading ? "bg-slate-50 border-slate-200 text-slate-400" :
                                    uploadSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                        "border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 bg-white"
                            )}
                        >
                            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            {isUploading ? "Processing..." : uploadSuccess ? "Imported!" : "Import CSV"}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
