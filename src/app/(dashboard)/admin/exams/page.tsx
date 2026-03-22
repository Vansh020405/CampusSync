'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Calendar,
    Users,
    Trash2,
    Edit,
    Upload,
    Download,
    CheckCircle2,
    AlertCircle,
    Search,
    ChevronRight,
    Building2,
    Clock,
    Layout,
    ArrowRight,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import DatesheetManager from "@/components/admin/exams/DatesheetManager";
import { useSession } from "next-auth/react";

interface Exam {
    id: string;
    name: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    type: string;
    room: string;
    hall?: string;
    block?: string;
    floor?: string;
    invigilatorId?: string;
    invigilator?: {
        name: string;
    };
    _count?: {
        seating: number;
    };
}

interface Faculty {
    id: string;
    name: string;
    facultyId: string;
    role?: string;
}

export default function AdminExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [isDutyModalOpen, setIsDutyModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [selectedInvigilatorId, setSelectedInvigilatorId] = useState<string>('');
    const { toast } = useToast();
    const { data: session, status: sessionStatus } = useSession();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        date: '',
        startTime: '',
        endTime: '',
        duration: '',
        type: 'End-Sem',
        room: '',
        hall: '',
        block: '',
        floor: '',
        invigilatorId: ''
    });

    useEffect(() => {
        fetchExams();
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const res = await fetch('/api/faculty/list');
            if (res.ok) setFacultyList(await res.json());
        } catch (error) {
            console.error("Failed to fetch faculty", error);
        }
    };

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/exams');
            if (res.ok) {
                const data = await res.json();
                setExams(data);
            }
        } catch (error) {
            console.error("Failed to fetch exams", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async () => {
        try {
            const res = await fetch('/api/admin/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Exam schedule created successfully",
                });
                setIsAddModalOpen(false);
                fetchExams();
                setFormData({
                    name: '', subject: '', date: '', startTime: '', endTime: '',
                    duration: '', type: 'End-Sem', room: '', hall: '', block: '', floor: '',
                    invigilatorId: ''
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create exam",
                variant: "destructive"
            });
        }
    };

    const handleDeleteExam = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exam?')) return;

        try {
            const res = await fetch(`/api/admin/exams/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast({
                    title: "Deleted",
                    description: "Exam schedule removed",
                });
                fetchExams();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete exam",
                variant: "destructive"
            });
        }
    };

    const handleUpdateDuty = async () => {
        if (!selectedExam || !selectedInvigilatorId) return;
        try {
            const res = await fetch(`/api/admin/exams/${selectedExam.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invigilatorId: selectedInvigilatorId })
            });

            if (res.ok) {
                toast({
                    title: "Duty Assigned",
                    description: "Invigilator has been successfully allotted.",
                });
                fetchExams();
                setIsDutyModalOpen(false);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to assign duty",
                variant: "destructive"
            });
        }
    };

    const handleAllocateSeats = async (examId: string) => {
        try {
            const res = await fetch('/api/admin/exams/allocate-seats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId })
            });

            if (res.ok) {
                const data = await res.json();
                toast({
                    title: "Allocation Successful",
                    description: data.message,
                });
                fetchExams();
                setIsAllocationModalOpen(false);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to allocate seats",
                variant: "destructive"
            });
        }
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csv = event.target?.result as string;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            const examsData = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',');
                return {
                    name: values[0],
                    subject: values[1],
                    date: values[2],
                    startTime: values[3],
                    endTime: values[4],
                    duration: values[5],
                    type: values[6],
                    room: values[7],
                    hall: values[8],
                    block: values[9],
                    floor: values[10]
                };
            });

            try {
                const res = await fetch('/api/admin/exams/bulk-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exams: examsData })
                });

                if (res.ok) {
                    toast({
                        title: "Bulk Upload Complete",
                        description: `Successfully imported ${examsData.length} exams`,
                    });
                    fetchExams();
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to perform bulk upload",
                    variant: "destructive"
                });
            }
        };
        reader.readAsText(file);
    };

    const filteredExams = exams.filter(exam =>
        exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sessionStatus === 'loading') return null;
    if ((session?.user as any)?.role !== 'ADMIN') {
        return (
            <div className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="bg-white rounded-[3rem] border border-slate-200 p-20 shadow-2xl">
                    <ShieldAlert className="h-20 w-20 text-rose-100 mx-auto mb-8" />
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 ">
                        Access <span className="text-rose-600 not-">Restricted</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">
                        You are currently authenticated with a non-privileged account. Please switch to an Administrative Protocol to access this hub.
                    </p>
                    <Button
                        className="rounded-2xl bg-slate-900 text-white px-10 h-14 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                        onClick={() => window.location.href = '/auth/login'}
                    >
                        Switch to Admin Portal
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <Tabs defaultValue="management" className="w-full">
                <div className="flex px-4 items-center justify-between mb-8">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200">
                        <TabsTrigger value="management" className="rounded-2xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all">
                            Management
                        </TabsTrigger>
                        <TabsTrigger value="datesheet" className="rounded-2xl px-8 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                            Datesheet
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="management" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 pt-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-rose-600" />
                                EXAM MANAGEMENT
                            </h1>
                            <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px] ml-1">
                                Schedule, Seat Allocation & Venue Control
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <label className="cursor-pointer">
                                <div className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                    <Upload className="h-4 w-4" />
                                    BULK UPLOAD
                                </div>
                                <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                            </label>
                            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-10 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100">
                                        <Plus className="h-4 w-4" />
                                        NEW EXAM
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Schedule New Exam</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Exam Name</Label>
                                            <Input
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                placeholder="e.g. End Term Examination"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</Label>
                                            <Input
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                placeholder="e.g. Computer Networks"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</Label>
                                            <Input
                                                type="date"
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Exam Type</Label>
                                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ST1">ST1</SelectItem>
                                                    <SelectItem value="ST2">ST2</SelectItem>
                                                    <SelectItem value="ST3">ST3</SelectItem>
                                                    <SelectItem value="Practical">Practical</SelectItem>
                                                    <SelectItem value="End Term">End Term</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Start Time</Label>
                                            <Input
                                                placeholder="09:00 AM"
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">End Time</Label>
                                            <Input
                                                placeholder="12:00 PM"
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Block / Building</Label>
                                            <Input
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                placeholder="Block A"
                                                value={formData.block}
                                                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Room No</Label>
                                            <Input
                                                className="rounded-xl border-slate-100 bg-slate-50/50"
                                                placeholder="L-401"
                                                value={formData.room}
                                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Invigilator</Label>
                                            <Select value={formData.invigilatorId} onValueChange={(v) => setFormData({ ...formData, invigilatorId: v })}>
                                                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 text-xs font-bold ring-offset-rose-50">
                                                    <SelectValue placeholder="Select faculty member..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-100">
                                                    {facultyList.map((faculty, idx) => (
                                                        <SelectItem key={faculty.id || idx} value={faculty.id} className="text-xs font-bold">
                                                            {faculty.name} ({faculty.role || 'Faculty'})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-8">
                                        <Button className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-rose-100" onClick={handleCreateExam}>
                                            Confirm Schedule
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Quick Stats Overlay */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5">
                            <div className="h-16 w-16 bg-rose-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Scheduled</p>
                                <h2 className="text-4xl font-black text-slate-900 leading-none">{exams.length}</h2>
                                <span className="text-[10px] text-rose-600 font-bold uppercase mt-1 inline-block ">Academic Session 2024</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5">
                            <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seating Finalized</p>
                                <h2 className="text-4xl font-black text-slate-900 leading-none">
                                    {exams.reduce((acc, curr) => acc + (curr._count?.seating || 0), 0)}
                                </h2>
                                <span className="text-[10px] text-indigo-600 font-bold uppercase mt-1 inline-block ">Students Allotted</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-5">
                            <div className="h-16 w-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                                <Layout className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Venues</p>
                                <h2 className="text-4xl font-black text-slate-900 leading-none">
                                    {new Set(exams.map(e => e.room)).size}
                                </h2>
                                <span className="text-[10px] text-amber-600 font-bold uppercase mt-1 inline-block ">Classrooms Utilized</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Action Bar */}
                    <div className="px-4">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-sm flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by subject or exam name..."
                                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 h-12 text-sm font-bold text-slate-900"
                                />
                            </div>
                            <Button variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 border-none">
                                <Layout className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    {/* Exams Table View */}
                    <div className="px-4">
                        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exam Identification</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Venue & Duty</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operational Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold animate-pulse">Synchronizing Records...</td></tr>
                                        ) : filteredExams.length === 0 ? (
                                            <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">No examinations found</td></tr>
                                        ) : filteredExams.map((exam) => (
                                            <tr key={exam.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-rose-600 uppercase tracking-wider mb-0.5">{exam.type}</span>
                                                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-rose-600 transition-colors">{exam.subject}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase opacity-60">{exam.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs uppercase">
                                                            <Calendar className="h-3 w-3 text-slate-300" />
                                                            {new Date(exam.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mt-1">
                                                            <Clock className="h-3 w-3 text-slate-200" />
                                                            {exam.startTime} - {exam.endTime}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 text-slate-700 font-black text-[11px] uppercase tracking-wider">
                                                            <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                                                            Room {exam.room}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase ml-5 opacity-60">{exam.block} â€¢ {exam.floor}</span>
                                                        {exam.invigilator && (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase mt-2 ml-5 bg-rose-50 px-2 py-0.5 rounded-md w-fit">
                                                                <Users className="h-2.5 w-2.5" />
                                                                {exam.invigilator.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {exam._count?.seating && exam._count.seating > 0 ? (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-2 text-[9px] font-black uppercase shadow-none">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Allotted
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-50 text-amber-600 border-none rounded-lg px-2 text-[9px] font-black uppercase shadow-none">
                                                            <AlertCircle className="h-3 w-3 mr-1" /> Pending
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            className="h-9 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border-none text-[10px] font-black uppercase tracking-widest transition-all"
                                                            onClick={() => {
                                                                setSelectedExam(exam);
                                                                setIsAllocationModalOpen(true);
                                                            }}
                                                        >
                                                            <Users className="h-3.5 w-3.5 mr-2" />
                                                            Allocate
                                                        </Button>
                                                        <Button
                                                            className="h-9 px-3 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border-none text-[10px] font-black uppercase tracking-widest transition-all"
                                                            onClick={() => {
                                                                setSelectedExam(exam);
                                                                setSelectedInvigilatorId(exam.invigilatorId || '');
                                                                setIsDutyModalOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="h-3.5 w-3.5 mr-2" />
                                                            Duty
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                            onClick={() => handleDeleteExam(exam.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Duty Allotment Modal */}
                    <Dialog open={isDutyModalOpen} onOpenChange={setIsDutyModalOpen}>
                        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Assign Invigilator</DialogTitle>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{selectedExam?.subject}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedExam?.room} | {selectedExam?.date}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Faculty</Label>
                                    <Select value={selectedInvigilatorId} onValueChange={setSelectedInvigilatorId}>
                                        <SelectTrigger className="rounded-xl border-slate-100 bg-white text-xs font-bold h-12">
                                            <SelectValue placeholder="Choose invigilator..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            {facultyList.map(faculty => (
                                                <SelectItem key={faculty.id} value={faculty.id} className="text-xs font-bold">
                                                    {faculty.name} ({faculty.facultyId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setIsDutyModalOpen(false)}>Cancel</Button>
                                <Button
                                    className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100"
                                    onClick={handleUpdateDuty}
                                >
                                    Confirm Duty
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Allocation Confirm Modal */}
                    <Dialog open={isAllocationModalOpen} onOpenChange={setIsAllocationModalOpen}>
                        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Automated Allocation</DialogTitle>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{selectedExam?.subject}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedExam?.room} | {selectedExam?.date}</p>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 leading-relaxed text-center px-4">
                                    The system will automatically assign sequential seat numbers (S-1, S-2, etc.) to all registered students in the system for this examination.
                                </p>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="ghost" className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={() => setIsAllocationModalOpen(false)}>Cancel</Button>
                                <Button
                                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                                    onClick={() => selectedExam && handleAllocateSeats(selectedExam.id)}
                                >
                                    Start Allocation
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Final Footer Accent */}
                    <div className="pt-20 text-center opacity-40">
                        <ShieldAlert className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Administrative Authority Protocol Only</p>
                    </div>
                </TabsContent>

                <TabsContent value="datesheet" className="px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <DatesheetManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
