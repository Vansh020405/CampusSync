'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    BookOpen,
    Clock,
    Save,
    Plus,
    Trash2,
    ChevronRight,
    Search,
    Filter,
    Table as TableIcon,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface SubjectExam {
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
}

export default function DatesheetManager() {
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('');
    const [batchType, setBatchType] = useState('Morning Batch');
    const [subjects, setSubjects] = useState<SubjectExam[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const departments = ['Computer Science', 'CSE AI ML', 'Mathematics', 'Data Science', 'ECE', 'Mechanical', 'Psychology'];
    const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const { data: session, status: sessionStatus } = useSession();

    // Load initial state from local storage
    useEffect(() => {
        const saved = localStorage.getItem('datesheet-draft');
        if (saved) {
            try {
                const { department: d, semester: s, batchType: b, subjects: sub } = JSON.parse(saved);
                setDepartment(d || '');
                setSemester(s || '');
                setBatchType(b || 'Morning Batch');
                setSubjects(sub || []);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }
    }, []);

    // Persist state to local storage
    useEffect(() => {
        if (department || semester || subjects.length > 0) {
            localStorage.setItem('datesheet-draft', JSON.stringify({
                department,
                semester,
                batchType,
                subjects
            }));
        }
    }, [department, semester, batchType, subjects]);

    useEffect(() => {
        if (department && semester && session?.user?.role === 'ADMIN') {
            // Only fetch if subjects are empty or we're switching filters
            // Check if existing subjects match the filters to avoid unnecessary fetches
            if (subjects.length === 0) {
                fetchSubjects();
            }
        }
    }, [department, semester, session]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/exams/datesheet/subjects?department=${department}&semester=${semester}`);
            if (res.ok) {
                const data = await res.json();
                const initialSchedule = data.map((subjectName: string) => ({
                    subject: subjectName,
                    date: '',
                    startTime: '09:00 AM',
                    endTime: '12:00 PM',
                    type: 'ST1'
                }));
                setSubjects(initialSchedule);
                toast({
                    title: "Subjects Loaded",
                    description: `Found ${data.length} subjects for the selected criteria.`,
                });
            } else if (res.status === 401) {
                toast({
                    title: "Unauthorized",
                    description: "Your session has expired or you do not have permission. Please log in as Admin.",
                    variant: "destructive"
                });
            } else {
                throw new Error('Fallback to registry failed');
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
            toast({
                title: "Registry Sync Issue",
                description: "Failed to fetch subjects. Ensure you are logged in as Admin.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (sessionStatus === 'loading') return null;
    if (session?.user?.role !== 'ADMIN') {
        return (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-rose-50 rounded-[3rem] border-2 border-dashed border-rose-100">
                <ShieldAlert className="h-12 w-12 text-rose-200" />
                <div>
                    <h3 className="text-sm font-black text-rose-500 uppercase tracking-tight">Access Restricted</h3>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Administrative Credentials Required</p>
                </div>
                <Button variant="outline" className="mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => window.location.href = '/auth/login'}>
                    Go to Login Portal
                </Button>
            </div>
        );
    }

    const handleUpdateSubject = (index: number, field: keyof SubjectExam, value: string) => {
        const updated = [...subjects];
        updated[index] = { ...updated[index], [field]: value };
        setSubjects(updated);
    };

    const handleSaveDatesheet = async () => {
        // Validation
        const incomplete = subjects.some(s => !s.date || !s.startTime || !s.endTime);
        if (incomplete) {
            toast({
                title: "Incomplete Schedule",
                description: "Please set dates and times for all subjects.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/exams/datesheet/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    department,
                    semester,
                    section: batchType,
                    exams: subjects
                })
            });

            if (res.ok) {
                toast({
                    title: "Datesheet Saved",
                    description: "Examination schedule has been synchronized across platforms.",
                });
                // Clear draft after successful save
                localStorage.removeItem('datesheet-draft');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            toast({
                title: "Sync Failed",
                description: "Could not persist the datesheet to the database.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Filter Card */}
            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 px-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Filter className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">Program Configuration</CardTitle>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define department and semester scope</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Academic Department</Label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 text-xs font-bold transition-all">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept} className="rounded-xl text-xs font-bold uppercase tracking-tight py-3">{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Semester</Label>
                            <Select value={semester} onValueChange={setSemester}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 text-xs font-bold transition-all">
                                    <SelectValue placeholder="Semester 1-8" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                    {semesters.map(sem => (
                                        <SelectItem key={sem} value={sem} className="rounded-xl text-xs font-bold uppercase py-3 text-center">Semester {sem}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Batch Schedule</Label>
                            <Select value={batchType} onValueChange={setBatchType}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-indigo-500 text-xs font-bold transition-all px-6">
                                    <SelectValue placeholder="Batch Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                    <SelectItem value="Morning Batch" className="rounded-xl text-xs font-bold uppercase py-3">Morning Batch (4G1-4G5)</SelectItem>
                                    <SelectItem value="Evening Batch" className="rounded-xl text-xs font-bold uppercase py-3">Evening Batch (4G6-4G10)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timetable Card */}
            <AnimatePresence mode="wait">
                {department && semester && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <Card className="rounded-[3rem] border-slate-100 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
                            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
                                        <TableIcon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Examination Schedule</CardTitle>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatic Subject Population Active</p>
                                    </div>
                                </div>
                                <Button
                                    disabled={subjects.length === 0 || isSaving}
                                    onClick={handleSaveDatesheet}
                                    className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-lg shadow-indigo-100"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {isSaving ? "Synchronizing..." : "Deploy Datesheet"}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Subject Details</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exam Date</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Start Time</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End Time</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="p-20 text-center flex flex-col items-center justify-center gap-4">
                                                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Retrieving Syllabus Maps...</p>
                                                    </td>
                                                </tr>
                                            ) : subjects.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-20 text-center">
                                                        <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic opacity-60">No subjects found for this criteria in the academic registry.</p>
                                                    </td>
                                                </tr>
                                            ) : subjects.map((sub, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{sub.subject}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-indigo-50 text-indigo-600 border-none rounded px-2 text-[8px] font-black uppercase">Core Program</Badge>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Input
                                                            type="date"
                                                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase transition-all focus:bg-white"
                                                            value={sub.date}
                                                            onChange={(e) => handleUpdateSubject(idx, 'date', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Input
                                                            placeholder="09:00 AM"
                                                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase transition-all focus:bg-white"
                                                            value={sub.startTime}
                                                            onChange={(e) => handleUpdateSubject(idx, 'startTime', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Input
                                                            placeholder="12:00 PM"
                                                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase transition-all focus:bg-white"
                                                            value={sub.endTime}
                                                            onChange={(e) => handleUpdateSubject(idx, 'endTime', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <Select value={sub.type} onValueChange={(v) => handleUpdateSubject(idx, 'type', v)}>
                                                            <SelectTrigger className="h-10 rounded-xl border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-slate-100">
                                                                <SelectItem value="ST1" className="text-[10px] font-black uppercase">ST1</SelectItem>
                                                                <SelectItem value="ST2" className="text-[10px] font-black uppercase">ST2</SelectItem>
                                                                <SelectItem value="ST3" className="text-[10px] font-black uppercase">ST3</SelectItem>
                                                                <SelectItem value="Practical" className="text-[10px] font-black uppercase">Practicals</SelectItem>
                                                                <SelectItem value="End Term" className="text-[10px] font-black uppercase">End Term</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Conflict & Validation Footer */}
                        {subjects.length > 0 && (
                            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4">
                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest italic">Compliance Check Activated</h4>
                                    <p className="text-[10px] font-semibold text-amber-700/80 leading-relaxed uppercase tracking-tight">
                                        The system will validate schedules against existing faculty duty allocations and classroom availability. Duplicate dates/slots will be flagged upon submission. Ensure specific classroom numbers are assigned via the Management Tab after saving the Datesheet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!department && (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <BookOpen className="h-12 w-12 text-slate-200" />
                    <div>
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-tight">Configuration Required</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Select Program & Semester to initiate registry synchronization</p>
                    </div>
                </div>
            )}
        </div>
    );
}
