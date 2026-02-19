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

    // Automatically select the first assigned section if available
    useEffect(() => {
        const sectionsData = (session?.user as any)?.sectionsTeaching;
        if (sectionsData) {
            const sections = typeof sectionsData === 'string' && sectionsData.startsWith('[')
                ? JSON.parse(sectionsData)
                : (Array.isArray(sectionsData) ? sectionsData : [sectionsData]);

            if (sections.length > 0 && !selectedSection) {
                setSelectedSection(sections[0]);
            }
        }
    }, [session, selectedSection]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
        if (!selectedSection) return;
        setIsLoadingStudents(true);
        try {
            const res = await fetch(`/api/students/by-section/${selectedSection}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSectionStudents(prev => ({ ...prev, [selectedSection]: data }));
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    // Fetch students from database
    useEffect(() => {
        if (selectedSection) {
            fetchStudents();
        }
    }, [selectedSection]);

    // Reset attendance and save state when section, subject or date changes
    useEffect(() => {
        setAttendance({});
        setIsSaved(false);
    }, [selectedSection, selectedSubject, selectedDate]);

    // Get current students from state
    const currentStudents = sectionStudents[selectedSection] || [];

    const currentSubject = selectedSubject || facultySubjects[0]?.trim() || "Unassigned";

    // Helper to get raw sections list for selectors
    const getSectionsList = () => {
        const sectionsData = (session?.user as any)?.sectionsTeaching;
        if (!sectionsData) return [];
        return typeof sectionsData === 'string' && sectionsData.startsWith('[')
            ? JSON.parse(sectionsData)
            : (Array.isArray(sectionsData) ? sectionsData : [sectionsData]);
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
        <div className="space-y-4 pb-20 max-w-7xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Extremely Compact Header & Toolbar */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">Attendance</h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick Marking Console</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-grow justify-end">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="h-9 w-40 text-xs font-bold bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {facultySubjects.map((subject: string) => (
                                <SelectItem key={subject} value={subject.trim()} className="text-xs font-bold">
                                    {subject.trim()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger className="h-9 w-32 text-xs font-bold bg-slate-50 border-slate-200">
                            <SelectValue placeholder="Section" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {getSectionsList().map((section: string) => (
                                <SelectItem key={section} value={section} className="text-xs font-bold">
                                    Section {section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-9 w-36 px-2 rounded-md border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                    />

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />

                    <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1">
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
                    <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white rounded-2xl">
                        {/* List Header */}
                        <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-2 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-8">Roll</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</span>
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleMarkAll('PRESENT')}>
                                    ALL PRESENT
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleMarkAll('ABSENT')}>
                                    ALL ABSENT
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {currentStudents.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs font-bold">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 opacity-50" />
                                    Loading roster...
                                </div>
                            ) : (
                                currentStudents.map((student, idx) => {
                                    const status = attendance[student.id];
                                    return (
                                        <div key={student.id} className={cn(
                                            "flex items-center justify-between px-4 py-2 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0",
                                            idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                                        )}>
                                            <div className="flex items-center gap-4 flex-grow min-w-0">
                                                <Badge variant="outline" className="w-12 justify-center font-mono text-[9px] border-slate-200 text-slate-500 bg-white shadow-sm">
                                                    {student.rollNo.slice(-3)}
                                                </Badge>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{student.name}</p>
                                                    {student.attendance < 75 && (
                                                        <span className="text-[8px] font-black text-red-500 flex items-center gap-0.5 leading-none mt-0.5">
                                                            <AlertTriangle className="h-2 w-2" /> {student.attendance}% ATT
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
                    <Card className="border-none shadow-md bg-slate-900 text-white rounded-2xl overflow-hidden">
                        <CardContent className="p-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Session Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-300">Present</span>
                                    <span className="text-sm font-black text-emerald-400">{stats.present}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.percentage}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-300">Absent</span>
                                    <span className="text-sm font-black text-red-400">{stats.absent}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-300">Total Rate</span>
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
