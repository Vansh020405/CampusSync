
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BookOpen,
    Plus,
    Save,
    Trash2,
    Settings2,
    CheckCircle2,
    GripVertical,
    Layers,
    UserPlus,
    X,
    Upload,
    FileUp,
    FileSpreadsheet,
    FileText as FileIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const EXAM_TYPES = ['ST1', 'ST2', 'ST3', 'End Term', 'Practical'];
const BATCHES = ['Morning', 'Evening', 'Both'];

export default function AdminSyllabusPage() {
    const { toast } = useToast();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [dynamicDepartments, setDynamicDepartments] = useState<string[]>([]);

    // Form State
    const [selectedSubject, setSelectedSubject] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newSubject, setNewSubject] = useState({
        subjectName: '',
        subjectCode: '',
        department: '',
        topics: [] as any[]
    });

    // Assignment State
    const [assignmentForm, setAssignmentForm] = useState({
        subjectId: '',
        department: '',
        semester: '',
        batch: 'Both'
    });

    const [activeMilestones, setActiveMilestones] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sRes, aRes, mRes] = await Promise.all([
                fetch('/api/admin/syllabus'),
                fetch('/api/admin/syllabus/assign'),
                fetch('/api/admin/syllabus/metadata')
            ]);

            const sData = await sRes.json();
            const aData = await aRes.json();
            const mData = await mRes.json();

            if (Array.isArray(sData)) {
                setSubjects(sData);
            } else {
                console.error("Subjects fetch error:", sData);
                setSubjects([]);
                if (sData.error) toast({ title: "Sync Error", description: sData.error, variant: "destructive" });
            }

            if (Array.isArray(aData)) {
                setAssignments(aData);
            } else {
                console.error("Assignments fetch error:", aData);
                setAssignments([]);
            }

            if (mData.departments) {
                setDynamicDepartments(mData.departments);
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Terminal connection failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddMilestone = (ms: string) => {
        if (!activeMilestones.includes(ms)) {
            setActiveMilestones(prev => [...prev, ms]);
        }
    };

    const handleAddTopic = (examType: string) => {
        setNewSubject(prev => ({
            ...prev,
            topics: [...prev.topics, { title: '', totalLectures: 1, examType }]
        }));
    };

    const handleTopicChange = (index: number, field: string, value: any) => {
        const updatedTopics = [...newSubject.topics];
        updatedTopics[index] = { ...updatedTopics[index], [field]: value };
        setNewSubject(prev => ({ ...prev, topics: updatedTopics }));
    };

    const handleRemoveTopic = (index: number) => {
        setNewSubject(prev => ({
            ...prev,
            topics: prev.topics.filter((_, i) => i !== index)
        }));
    };

    const handleSaveSubject = async () => {
        if (!newSubject.subjectName || newSubject.topics.length === 0) {
            toast({ title: "Validation Error", description: "Subject name and at least one topic required", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/syllabus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditing ? { ...newSubject, id: selectedSubject.id } : newSubject)
            });

            if (res.ok) {
                toast({ title: "Success", description: `Subject ${isEditing ? 'updated' : 'created'} successfully` });
                fetchData();
                resetForm();
            } else {
                const errorData = await res.json();
                toast({
                    title: "Architecture Error",
                    description: errorData.details || errorData.error || "Failed to commit subject",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Terminal synchronization failed", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>, examType: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const newTopics: any[] = [];

            lines.forEach((line, index) => {
                if (index === 0 && line.toLowerCase().includes('title')) return; // Skip header
                const parts = line.split(',');
                if (parts.length >= 1 && parts[0].trim()) {
                    newTopics.push({
                        title: parts[0].trim(),
                        totalLectures: parseInt(parts[1]) || 1,
                        examType: examType
                    });
                }
            });

            if (newTopics.length > 0) {
                setNewSubject(prev => ({
                    ...prev,
                    topics: [...prev.topics, ...newTopics]
                }));
                toast({ title: "CSV Parsed", description: `Added ${newTopics.length} topics to ${examType}` });
            }
        };
        reader.readAsText(file);
    };

    const handleAssign = async () => {
        if (!assignmentForm.subjectId || !assignmentForm.department || !assignmentForm.semester) {
            toast({ title: "Validation Error", description: "All assignment fields are required", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/syllabus/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentForm)
            });

            if (res.ok) {
                toast({ title: "Success", description: "Subject assigned successfully" });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to assign subject", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/syllabus/assign?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Success", description: "Assignment removed" });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove assignment", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setSelectedSubject(null);
        setActiveMilestones([]);
        setNewSubject({
            subjectName: '',
            subjectCode: '',
            department: '',
            topics: []
        });
    };

    const editSubject = (sub: any) => {
        setIsEditing(true);
        setSelectedSubject(sub);

        const milestones = Array.from(new Set(sub.topics.map((t: any) => t.examType || 'ST1'))) as string[];
        setActiveMilestones(milestones);

        setNewSubject({
            subjectName: sub.subjectName,
            subjectCode: sub.subjectCode || '',
            department: sub.department,
            topics: sub.topics.map((t: any) => ({
                title: t.title,
                totalLectures: t.totalLectures,
                examType: t.examType || 'ST1'
            }))
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-8 py-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-mono">Academic Operations</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Syllabus Alloting</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose">
                            Allot Subjects, Configure <span className="text-indigo-500">Exams</span> & Assign to Branches
                        </p>
                    </div>
                    <Button onClick={resetForm} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 h-12 gap-2 shadow-xl shadow-slate-200">
                        <Plus className="h-4 w-4" />
                        Create New Subject
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Editor */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden ring-1 ring-slate-100">
                            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
                                <div>
                                    <CardTitle className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <BookOpen className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        {isEditing ? 'Edit Subject Details' : 'Subject Creation Engine'}
                                    </CardTitle>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure curriculum architecture & exam mapping</p>
                                </div>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 w-8 rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-8 space-y-10">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Name</Label>
                                        <Input
                                            placeholder="e.g. Advanced Java Programming"
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-indigo-500 font-bold"
                                            value={newSubject.subjectName}
                                            onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Code</Label>
                                        <Input
                                            placeholder="e.g. CS302"
                                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-indigo-500 font-bold"
                                            value={newSubject.subjectCode}
                                            onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</Label>
                                        <Select
                                            value={newSubject.department}
                                            onValueChange={(v) => setNewSubject({ ...newSubject, department: v })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold">
                                                <SelectValue placeholder="Select Branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dynamicDepartments.map(dept => (
                                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Topics Manager */}
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">Topic Architecture</h3>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">First select a milestone, then add syllabus nodes</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select onValueChange={handleAddMilestone}>
                                                <SelectTrigger className="h-10 w-44 rounded-xl border-emerald-100 bg-emerald-50/30 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                                                    <div className="flex items-center gap-2">
                                                        <Plus className="h-3 w-3" />
                                                        Add Exam Milestone
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EXAM_TYPES.map(e => (
                                                        <SelectItem key={e} value={e} disabled={activeMilestones.includes(e)}>{e}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        {activeMilestones.length === 0 && (
                                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
                                                <div className="h-16 w-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                    <Layers className="h-8 w-8 text-slate-200" />
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Initialization Pending</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Select an ST or End Term milestone above to begin</p>
                                            </div>
                                        )}

                                        {activeMilestones.map((ms) => (
                                            <div key={ms} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center justify-between bg-slate-900 px-6 py-4 rounded-2xl shadow-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-[10px]">
                                                            {ms}
                                                        </div>
                                                        <span className="text-xs font-black text-white uppercase tracking-widest italic">{ms} SYLLABUS NODES</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {/* CSV Upload */}
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept=".csv"
                                                                id={`csv-${ms}`}
                                                                className="hidden"
                                                                onChange={(e) => handleCSVUpload(e, ms)}
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                className="h-8 rounded-lg bg-white/5 text-white/60 hover:text-emerald-400 hover:bg-white/10 font-bold text-[9px] uppercase tracking-widest gap-2 cursor-pointer"
                                                            >
                                                                <label htmlFor={`csv-${ms}`}>
                                                                    <FileSpreadsheet className="h-3 w-3" />
                                                                    Import CSV
                                                                </label>
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            onClick={() => handleAddTopic(ms)}
                                                            className="h-8 rounded-lg bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Add Node
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setActiveMilestones(prev => prev.filter(p => p !== ms))}
                                                            className="h-8 w-8 rounded-full text-white/20 hover:text-rose-500"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-1 pl-4 border-l-2 border-slate-100 italic">
                                                    {newSubject.topics.filter(t => t.examType === ms).length === 0 && (
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 pl-4">No data nodes committed for this milestone.</p>
                                                    )}
                                                    {newSubject.topics.map((topic, index) => {
                                                        if (topic.examType !== ms) return null;
                                                        return (
                                                            <div key={index} className="group flex items-center gap-3 p-1.5 px-4 rounded-xl bg-white border border-slate-50 hover:border-indigo-100 hover:shadow-lg transition-all duration-300">
                                                                <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex-1 flex items-center gap-3">
                                                                    <Input
                                                                        placeholder="Topic Title"
                                                                        className="h-8 rounded-lg bg-slate-50/30 border-none focus:ring-0 font-bold text-sm placeholder:text-slate-300 flex-1"
                                                                        value={topic.title}
                                                                        onChange={(e) => handleTopicChange(index, 'title', e.target.value)}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveTopic(index)}
                                                                    className="h-8 w-8 rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex justify-end gap-3">
                                    <Button
                                        onClick={handleSaveSubject}
                                        disabled={isSaving}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-10 gap-2 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        {isSaving ? "Synchronizing..." : <><Save className="h-5 w-5" /> Commit Architecture</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Actions & List */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-8">

                        {/* Assignment Card */}
                        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-900 text-white overflow-hidden active:scale-[1.01] transition-transform">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <UserPlus className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    Allot Subject
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Registry</Label>
                                        <Select
                                            onValueChange={(v) => setAssignmentForm({ ...assignmentForm, subjectId: v })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-white/10 border-white/10 text-white font-bold">
                                                <SelectValue placeholder="Identify Subject..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Branch</Label>
                                            <Select
                                                onValueChange={(v) => setAssignmentForm({ ...assignmentForm, department: v })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-white/10 border-white/10 text-white font-bold">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dynamicDepartments.map(dept => (
                                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester</Label>
                                            <Select
                                                onValueChange={(v) => setAssignmentForm({ ...assignmentForm, semester: v })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-white/10 border-white/10 text-white font-bold">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Batch</Label>
                                        <Select
                                            defaultValue="Both"
                                            onValueChange={(v) => setAssignmentForm({ ...assignmentForm, batch: v })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-white/10 border-white/10 text-white font-bold uppercase tracking-widest text-[10px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BATCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAssign}
                                    disabled={isSaving}
                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] italic shadow-xl shadow-emerald-500/20"
                                >
                                    Push Allotment
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent History / Subjects List */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 flex items-center justify-between">
                                Master Subjects
                                <Badge variant="outline" className="text-[8px] font-black border-slate-200 text-slate-400">{subjects.length}</Badge>
                            </h3>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {subjects.map(s => (
                                    <div key={s.id} className="group p-4 rounded-3xl bg-white border border-slate-100 hover:border-indigo-100 transition-all flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-slate-900 tracking-tight">{s.subjectName}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.subjectCode} • {s.topics.length} Nodes</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => editSubject(s)} className="h-8 w-8 rounded-full text-slate-300 hover:text-indigo-500 hover:bg-indigo-50">
                                            <Settings2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Assignments List */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">
                                Active Allotments
                            </h3>
                            <div className="space-y-2">
                                {assignments.map(a => (
                                    <div key={a.id} className="p-4 rounded-3xl bg-emerald-50/30 border border-emerald-100/50 flex items-center justify-between animate-in fade-in zoom-in duration-500">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-900">{a.subject.subjectName}</p>
                                            <div className="flex gap-2">
                                                <Badge className="bg-emerald-500 text-white border-0 text-[7px] font-black px-1.5 py-0">SEM {a.semester}</Badge>
                                                <Badge variant="outline" className="text-[7px] font-black border-emerald-200 text-emerald-600 px-1.5 py-0 uppercase">{a.department}</Badge>
                                                <Badge variant="secondary" className="text-[7px] font-black bg-slate-100 text-slate-500 px-1.5 py-0 uppercase">{a.batch}</Badge>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAssignment(a.id)} className="h-8 w-8 rounded-full text-rose-300 hover:text-rose-500 hover:bg-rose-50">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

