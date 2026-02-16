'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Calendar, TrendingDown, LayoutDashboard, Upload, FileCheck, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_TIMETABLE } from "@/lib/store";
import { useRealtime } from "@/hooks/useRealtime";


// Extended mock student data with sections
const SECTION_STUDENTS = {
    "4G2": [
        { id: 101, rollNo: "CSE-23-4G2-01", name: "Rahul Sharma", attendance: 85 },
        { id: 102, rollNo: "CSE-23-4G2-02", name: "Priya Gupta", attendance: 92 },
        { id: 103, rollNo: "CSE-23-4G2-03", name: "Amit Kumar", attendance: 78 },
        { id: 104, rollNo: "CSE-23-4G2-04", name: "Sneha Patel", attendance: 88 },
        { id: 105, rollNo: "CSE-23-4G2-05", name: "Vikram Singh", attendance: 95 },
        { id: 106, rollNo: "CSE-23-4G2-06", name: "Ananya Reddy", attendance: 70 },
        { id: 107, rollNo: "CSE-23-4G2-07", name: "Rohan Verma", attendance: 82 },
        { id: 108, rollNo: "CSE-23-4G2-08", name: "Kavya Iyer", attendance: 90 },
        { id: 109, rollNo: "CSE-23-4G2-09", name: "Arjun Nair", attendance: 65 },
        { id: 110, rollNo: "CSE-23-4G2-10", name: "Divya Menon", attendance: 88 },
    ],
    "4G3": [
        { id: 201, rollNo: "CSE-23-4G3-01", name: "Kabir Bhat", attendance: 91 },
        { id: 202, rollNo: "CSE-23-4G3-02", name: "Zoya Ali", attendance: 68 },
        { id: 203, rollNo: "CSE-23-4G3-03", name: "Sahil Jain", attendance: 85 },
        { id: 204, rollNo: "CSE-23-4G3-04", name: "Diya Rao", attendance: 93 },
        { id: 205, rollNo: "CSE-23-4G3-05", name: "Kunal Sen", attendance: 72 },
        { id: 206, rollNo: "CSE-23-4G3-06", name: "Tanvi Hegde", attendance: 89 },
        { id: 207, rollNo: "CSE-23-4G3-07", name: "Ishaan Das", attendance: 75 },
        { id: 208, rollNo: "CSE-23-4G3-08", name: "Meera Joshi", attendance: 82 },
        { id: 209, rollNo: "CSE-23-4G3-09", name: "Aryan Khan", attendance: 88 },
        { id: 210, rollNo: "CSE-23-4G3-10", name: "Sanya Roy", attendance: 94 },
    ]
};

export default function FacultyAttendancePage() {
    const { data: session } = useSession();
    const facultyId = (session?.user as any)?.id || "1";
    const facultyName = session?.user?.name || "Faculty";
    const [selectedSection, setSelectedSection] = useState<string>("4G2");
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
        fetchStudents();
    }, [selectedSection]);

    // Reset attendance and save state when section or date changes
    useEffect(() => {
        setAttendance({});
        setIsSaved(false);
    }, [selectedSection, selectedDate]);

    // Get subjects for this faculty from timetable
    const myLectures = DEMO_TIMETABLE.filter(t => t.facultyId === facultyId);
    const mySubjects = Array.from(new Set(myLectures.map(l => l.subject).filter(Boolean)));

    const currentStudents = sectionStudents[selectedSection as keyof typeof SECTION_STUDENTS] || [];

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
                    id: Date.now() + index, // Generate temporary unique ID
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
        if (Object.keys(attendance).length === 0) return;

        setIsSaved(true);

        try {
            // 1. Persist to Database
            const res = await fetch("/api/attendance/mark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facultyId,
                    subject: "Java", // Mock - would come from selector
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
                            subject: "Java",
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
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Attendance</h1>
                            <p className="text-emerald-100 text-sm">Java Faculty Hub</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <CheckCircle2 className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] uppercase font-bold mb-1">My Subjects</p>
                            <p className="text-lg font-bold text-white leading-tight">{mySubjects.length}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] uppercase font-bold mb-1">Sections</p>
                            <p className="text-lg font-bold text-white">4G2, 4G3</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] uppercase font-bold mb-1">Total Students</p>
                            <p className="text-lg font-bold text-white">20</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Management Console */}
            <Card className="border-none shadow-xl shadow-emerald-900/10 bg-white overflow-hidden rounded-3xl">
                <div className="bg-gradient-to-r from-slate-50 to-white border-b px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
                            <LayoutDashboard className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Session Console</h2>
                            <p className="text-[10px] font-bold text-slate-400">CONFIGURE LECTURE & ASSETS</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50/50 font-black px-4 py-1 rounded-full text-[10px]">
                        {selectedPeriods.length} PERIOD{selectedPeriods.length > 1 ? 'S' : ''} ACTIVE
                    </Badge>
                </div>

                <CardContent className="p-6 space-y-7">
                    {/* Selectors Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Users className="h-3 w-3 text-emerald-500" />
                                Target Section
                            </label>
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className="border-2 border-slate-50 focus:ring-emerald-500 h-14 bg-slate-50/50 rounded-2xl transition-all hover:bg-white hover:border-emerald-200 font-bold text-slate-700 px-5">
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2 shadow-2xl p-2">
                                    <SelectItem value="4G2" className="rounded-xl py-3 font-bold focus:bg-emerald-50 focus:text-emerald-700">Section 4G2 (Java)</SelectItem>
                                    <SelectItem value="4G3" className="rounded-xl py-3 font-bold focus:bg-emerald-50 focus:text-emerald-700">Section 4G3 (Java)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                <Calendar className="h-3 w-3 text-emerald-500" />
                                Session Date
                            </label>
                            <div className="relative group">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full h-14 pl-14 pr-5 rounded-2xl border-2 border-slate-50 bg-slate-50/50 text-sm font-black text-slate-700 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Period Selector */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            <Clock className="h-3 w-3 text-emerald-500" />
                            Select Academic Periods (1hr Each)
                        </label>
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                                const isSelected = selectedPeriods.includes(p);
                                const startTime = 9 + (p - 1);
                                const endTime = startTime + 1;
                                const timeLabel = `${startTime.toString().padStart(2, '0')}:00 - ${endTime.toString().padStart(2, '0')}:00`;

                                return (
                                    <Button
                                        key={p}
                                        variant={isSelected ? "default" : "outline"}
                                        onClick={() => {
                                            if (isSelected) {
                                                if (selectedPeriods.length > 1) {
                                                    setSelectedPeriods(prev => prev.filter(item => item !== p));
                                                }
                                            } else {
                                                setSelectedPeriods(prev => [...prev, p].sort((a, b) => a - b));
                                            }
                                        }}
                                        className={cn(
                                            "h-auto py-3 px-6 rounded-xl font-black text-xs transition-all flex flex-col gap-1 min-w-[140px] shrink-0",
                                            isSelected ? "bg-emerald-600 scale-105 shadow-lg shadow-emerald-200" : "border-2 border-slate-100 text-slate-400 hover:border-emerald-200 bg-white"
                                        )}
                                    >
                                        <span className="text-lg">P{p}</span>
                                        <span className="text-[10px] opacity-70 font-medium tracking-wide">{timeLabel}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Automation Visual Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Smart Automation</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    {/* CSV Upload Module */}
                    <div className="group relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            className={cn(
                                "flex items-center justify-between px-6 h-16 rounded-2xl border-2 transition-all cursor-pointer",
                                isUploading ? "bg-slate-50 border-slate-200 animate-pulse" :
                                    uploadSuccess ? "bg-emerald-50 border-emerald-400 text-emerald-700 shadow-lg shadow-emerald-200/50" :
                                        "border-slate-50 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-11 w-11 rounded-xl flex items-center justify-center transition-all",
                                    uploadSuccess ? "bg-emerald-500 text-white" : "bg-white text-emerald-600 shadow-sm group-hover:scale-110"
                                )}>
                                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black text-slate-800 tracking-tight">
                                        {isUploading ? "Analysing CSV Payload..." :
                                            uploadSuccess ? "Database Synchronized" : "Import Student Roster"}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {uploadSuccess ? "Records updated successfully" : "Automatically populate session list"}
                                    </p>
                                </div>
                            </div>
                            <div className="h-8 w-8 rounded-xl bg-white/50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">
                                <FileCheck className="h-4 w-4" />
                            </div>
                        </label>
                    </div>

                    {/* Quick Batch Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Button
                            variant="outline"
                            className="bg-emerald-50/30 border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-black h-14 rounded-2xl transition-all active:scale-95 group shadow-sm flex flex-col items-center justify-center gap-0.5"
                            onClick={() => handleMarkAll('PRESENT')}
                        >
                            <span className="text-sm">ALL PRESENT</span>
                            <span className="text-[9px] font-bold opacity-70 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> BULK ACTION
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-red-50/30 border-2 border-red-100 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 font-black h-14 rounded-2xl transition-all active:scale-95 group shadow-sm flex flex-col items-center justify-center gap-0.5"
                            onClick={() => handleMarkAll('ABSENT')}
                        >
                            <span className="text-sm">ALL ABSENT</span>
                            <span className="text-[9px] font-bold opacity-70 flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> BULK ACTION
                            </span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Live Stats */}
            {Object.keys(attendance).length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Present', val: stats.present, color: 'emerald' },
                        { label: 'Absent', val: stats.absent, color: 'red' },
                        { label: 'Rate', val: `${stats.percentage}%`, color: 'blue' },
                    ].map((stat, i) => (
                        <Card key={i} className={cn("border-2 shadow-sm", `border-${stat.color}-100 bg-${stat.color}-50/50`)}>
                            <CardContent className="p-2 text-center">
                                <p className={cn("text-xl font-black", `text-${stat.color}-700`)}>{stat.val}</p>
                                <p className={cn("text-[10px] uppercase font-bold", `text-${stat.color}-600`)}>{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Student List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Students in {selectedSection} ({currentStudents.length})
                    </h2>
                </div>

                {currentStudents.map((student) => {
                    const status = attendance[student.id];

                    return (
                        <Card key={student.id} className={cn(
                            "transition-all border-none bg-white hover:shadow-md",
                            status === 'PRESENT' && "bg-emerald-50/30",
                            status === 'ABSENT' && "bg-red-50/30",
                            status === 'LATE' && "bg-amber-50/30",
                        )}>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-9 w-9 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 select-none",
                                        status === 'PRESENT' ? "bg-emerald-600 shadow-md shadow-emerald-200" :
                                            status === 'ABSENT' ? "bg-red-600 shadow-md shadow-red-200" :
                                                status === 'LATE' ? "bg-amber-600 shadow-md shadow-amber-200" : "bg-slate-200 text-slate-500"
                                    )}>
                                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-black text-slate-800 text-sm leading-tight truncate">{student.name}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-tighter truncate uppercase italic">{student.rollNo}</p>
                                    </div>

                                    {/* Compact Marking Controls */}
                                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                                        {[
                                            { id: 'PRESENT', label: 'P', color: 'bg-emerald-600', active: 'emerald' },
                                            { id: 'ABSENT', label: 'A', color: 'bg-red-600', active: 'red' },
                                        ].map((btn) => (
                                            <button
                                                key={btn.id}
                                                onClick={() => handleMarkAttendance(student.id, btn.id as any)}
                                                className={cn(
                                                    "h-8 px-5 rounded-lg text-[10px] font-black transition-all active:scale-95 flex-1",
                                                    status === btn.id
                                                        ? `${btn.color} text-white shadow-sm`
                                                        : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="w-14 text-right shrink-0">
                                        <p className="text-[9px] font-bold text-slate-300 uppercase leading-none mb-0.5">Overall</p>
                                        <p className={cn(
                                            "text-sm font-black",
                                            student.attendance >= 75 ? "text-emerald-600" : "text-red-600"
                                        )}>
                                            {student.attendance}%
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] font-medium text-slate-400 pl-14">
                                    * Latency &gt;15m counts as Absent per policy.
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Save Button */}
                <div className="sticky bottom-20 pt-4 px-2 bg-gradient-to-t from-slate-50 to-transparent pb-4">
                    <Button
                        className={cn(
                            "w-full h-14 shadow-xl transition-all font-black text-lg rounded-2xl",
                            isSaved
                                ? "bg-green-600 hover:bg-green-700 scale-95"
                                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                        )}
                        onClick={handleSave}
                        disabled={Object.keys(attendance).length === 0}
                    >
                        {isSaved ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6" />
                                SUCCESSFULLY SAVED
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 font-black">
                                SAVE {selectedSection} ATTENDANCE
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Alerts */}
            {lowAttendanceStudents.length > 0 && (
                <Card className="border-red-200 bg-red-50 shadow-sm">
                    <CardHeader className="p-4 border-b border-red-100">
                        <CardTitle className="text-sm font-black flex items-center gap-2 text-red-900 uppercase">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            CRITICAL: Attendance Alert
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        {lowAttendanceStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between bg-white/80 rounded-xl p-3 border-2 border-red-50 shadow-sm">
                                <div>
                                    <p className="text-sm font-black text-slate-900">{student.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500">{student.rollNo}</p>
                                </div>
                                <Badge className="bg-red-600 text-white font-black h-8 px-3">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    {student.attendance}%
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
