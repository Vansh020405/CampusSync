'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Save, Trash2, Clock,
    MapPin, Box, Sparkles, User, GraduationCap, ChevronRight, Loader2, Search, Info, Check, ChevronsUpDown, RotateCcw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TIME_SLOTS = [
    { label: "P1", time: "09:00 - 10:00" },
    { label: "P2", time: "10:00 - 11:00" },
    { label: "P3", time: "11:00 - 12:00" },
    { label: "P4", time: "12:00 - 13:00" },
    { label: "P5", time: "13:00 - 14:00" }, // Lunch
    { label: "P6", time: "14:00 - 15:00" },
    { label: "P7", time: "15:00 - 16:00" }
];

const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "AIML", "DS", "IOT"];
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const BATCHES = ["Morning", "Evening"];

interface TimetableSlot {
    id?: string;
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    classroom: string;
    section: string;
    facultyId: string;
    faculty?: { name: string };
    batch: string;
    department: string;
    semester: string;
    floor: string;
}

export default function AdminTimetableManagement() {
    const { toast } = useToast();
    const [department, setDepartment] = useState("CSE");
    const [semester, setSemester] = useState("4");
    const [batch, setBatch] = useState("Morning");

    const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Context / Focus State (Global Selection)
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    // Resources for selection
    const [subjects, setSubjects] = useState<string[]>([]);
    const [rooms, setRooms] = useState<string[]>([]);
    const [teachers, setTeachers] = useState<{ id: string, name: string, subjects?: string[] }[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<{ id: string, name: string }[]>([]);

    // Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{
        day: string;
        time: { label: string, time: string };
        data?: Partial<TimetableSlot>;
    } | null>(null);

    // Form State (Inside Modal)
    const [formSubject, setFormSubject] = useState("");
    const [formTeacher, setFormTeacher] = useState("");
    const [formRoom, setFormRoom] = useState("");
    const [formSection, setFormSection] = useState("");

    // Drag and Drop Transition state
    const [draggedData, setDraggedData] = useState<any>(null);
    const [dropTarget, setDropTarget] = useState<{ day: string, time24: string } | null>(null);

    const fetchResources = async () => {
        try {
            const [resRes, facRes] = await Promise.all([
                fetch('/api/admin/resources'),
                fetch('/api/faculty/list')
            ]);
            const resData = await resRes.json();
            const facData = await facRes.json();

            setSubjects(resData.subjects || []);
            setRooms(resData.rooms || []);
            setSections(resData.sections || []);
            setTeachers(facData || []);

            if (resData.subjects?.length > 0) setSelectedSubject(resData.subjects[0]);
            if (resData.rooms?.length > 0) setSelectedRoom(resData.rooms[0]);
            if (resData.sections?.length > 0) setSelectedSection(resData.sections[0]);
        } catch (e) {
            console.error("Resource fetch failed", e);
        }
    };

    // Filter teachers based on subject focus
    useEffect(() => {
        if (!selectedSubject) {
            setFilteredTeachers(teachers.map(t => ({ id: t.id, name: t.name })));
            return;
        }
        const filtered = teachers.filter(t =>
            !t.subjects || t.subjects.some(s => s.toLowerCase() === selectedSubject.toLowerCase())
        ).map(t => ({ id: t.id, name: t.name }));

        setFilteredTeachers(filtered);
        if (filtered.length > 0 && !filtered.some(t => t.id === selectedTeacher)) {
            setSelectedTeacher(filtered[0].id);
        }
    }, [selectedSubject, teachers]);

    const [teacherSchedule, setTeacherSchedule] = useState<TimetableSlot[]>([]);

    const fetchTeacherSchedule = async (id: string) => {
        if (!id) {
            setTeacherSchedule([]);
            return;
        };
        try {
            const res = await fetch(`/api/timetable?facultyId=${id}`);
            const data = await res.json();
            setTeacherSchedule(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Teacher schedule fetch failed", e);
        }
    };

    useEffect(() => {
        if (selectedTeacher) {
            fetchTeacherSchedule(selectedTeacher);
        } else {
            setTeacherSchedule([]);
        }
    }, [selectedTeacher]);

    const fetchTimetable = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/timetable?department=${department}&semester=${semester}&batch=${batch}`);
            const data = await res.json();
            setTimetable(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Timetable fetch failed", e);
            toast({ title: "Error", description: "Failed to load timetable", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        fetchTimetable();
    }, [department, semester, batch]);

    const normalizeTime = (timeStr: string) => {
        if (!timeStr) return "";
        const [time, ampm] = timeStr.trim().split(/\s+/);
        const [hStr, mStr] = time.split(':');
        let h = parseInt(hStr);
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${mStr.padStart(2, '0')}`;
    };

    // Organize timetable into a 2D map: [day][startTime] -> TimetableSlot[]
    const gridData = useMemo(() => {
        const map: Record<string, Record<string, TimetableSlot[]>> = {};
        DAYS.forEach(d => {
            map[d] = {};
            TIME_SLOTS.forEach(slot => {
                const startTime = slot.time.split(' - ')[0];
                const normalizedStart = normalizeTime(startTime);

                map[d][normalizedStart] = timetable.filter(t => {
                    return t.day.toUpperCase() === d.toUpperCase() &&
                        normalizeTime(t.startTime) === normalizedStart;
                });
            });
        });
        return map;
    }, [timetable]);

    const teacherGridData = useMemo(() => {
        const map: Record<string, Record<string, TimetableSlot[]>> = {};
        DAYS.forEach(d => {
            map[d] = {};
            TIME_SLOTS.forEach(slot => {
                const startTime = slot.time.split(' - ')[0];
                const normalizedStart = normalizeTime(startTime);

                map[d][normalizedStart] = teacherSchedule.filter(t => {
                    return t.day.toUpperCase() === d.toUpperCase() &&
                        normalizeTime(t.startTime) === normalizedStart;
                });
            });
        });
        return map;
    }, [teacherSchedule]);

    const handleAddClick = (day: string, slot: { label: string, time: string }) => {
        setEditingSlot({ day, time: slot });
        // Auto-fill context from global selection
        setFormSubject(selectedSubject);
        setFormTeacher(selectedTeacher);
        // Leave Room/Section for manual entry unless globally set
        setFormRoom(selectedRoom);
        setFormSection(selectedSection);
        setIsModalOpen(true);
    };

    const handleEditClick = (day: string, slot: { label: string, time: string }, existingData: TimetableSlot) => {
        setEditingSlot({ day, time: slot, data: existingData });
        setFormSubject(existingData.subject);
        setFormTeacher(existingData.facultyId);
        setFormRoom(existingData.classroom);
        setFormSection(existingData.section);
        setIsModalOpen(true);
    };

    const handleDragStart = (data: any) => {
        setDraggedData(data);
    };

    const handleDrop = (day: string, slot: { label: string, time: string }) => {
        setDropTarget(null);
        if (!draggedData) return;

        let payload: any = null;

        if (draggedData.type === 'FOCUS') {
            payload = {
                subject: selectedSubject,
                teacher: selectedTeacher,
                room: selectedRoom,
                section: selectedSection
            };
        } else if (draggedData.type === 'ENTRY') {
            const d = draggedData.data;
            payload = {
                subject: d.subject,
                teacher: d.facultyId,
                room: d.classroom,
                section: d.section
            };
        }

        if (payload) {
            // PURELY LOCAL UPDATE (NO API)
            const startTime = slot.time.split(' - ')[0];
            const endTime = slot.time.split(' - ')[1];

            const newSlot: TimetableSlot = {
                id: `temp-${Date.now()}`,
                day,
                startTime,
                endTime,
                subject: payload.subject,
                facultyId: payload.teacher,
                classroom: payload.room,
                section: payload.section,
                department,
                semester,
                batch,
                floor: "1",
                faculty: teachers.find(t => t.id === payload.teacher) as any
            };

            setTimetable(prev => [...prev, newSlot]);
            toast({ title: "Draft Added", description: "Slot updated in local matrix" });
        }
    };

    // Search states for Combobox
    const [openSection, setOpenSection] = useState(false);
    const [openRoom, setOpenRoom] = useState(false);
    const [searchSection, setSearchSection] = useState("");
    const [searchRoom, setSearchRoom] = useState("");

    const handleSave = () => {
        if (!formSubject || !formTeacher || !formRoom || !formSection || !editingSlot) {
            toast({ title: "Validation Error", description: "Please fill all fields", variant: "destructive" });
            return;
        }

        const startTime = editingSlot.time.time.split(' - ')[0];
        const endTime = editingSlot.time.time.split(' - ')[1];

        // CHECK FOR ROOM CONFLICTS
        const isRoomOccupied = timetable.some(t =>
            t.day === editingSlot.day &&
            t.startTime === startTime &&
            t.classroom === formRoom &&
            t.id !== editingSlot.data?.id
        );

        if (isRoomOccupied) {
            toast({
                title: "Room Conflict",
                description: `Room ${formRoom} is already occupied by another class at this time!`,
                variant: "destructive"
            });
            return;
        }

        // Ensure custom values are suggested next time
        if (formRoom && !rooms.includes(formRoom)) setRooms(prev => [...prev, formRoom]);
        if (formSection && !sections.includes(formSection)) setSections(prev => [...prev, formSection]);

        const updatedSlot: TimetableSlot = {
            id: editingSlot.data?.id || `temp-${Date.now()}`,
            day: editingSlot.day,
            startTime,
            endTime,
            subject: formSubject,
            facultyId: formTeacher,
            classroom: formRoom,
            section: formSection,
            department,
            semester,
            batch,
            floor: "1",
            faculty: teachers.find(t => t.id === formTeacher) as any
        };

        // PURELY LOCAL UPDATE
        setTimetable(prev => {
            const filtered = prev.filter(t => t.id !== updatedSlot.id);
            return [...filtered, updatedSlot];
        });
        setIsModalOpen(false);
        toast({ title: "Draft Saved", description: "Changes kept in local buffer" });
    };

    const deployArchitecture = async () => {
        setIsSaving(true);
        try {
            const payload = timetable.map(t => ({
                day: t.day,
                time: `${t.startTime} - ${t.endTime}`,
                subject: t.subject,
                facultyId: t.facultyId,
                classroom: t.classroom,
                section: t.section,
                department: t.department,
                semester: t.semester,
                batch: t.batch,
                floor: t.floor
            }));

            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timetable: payload,
                    viewMode: 'department',
                    filters: { department, semester, batch }
                })
            });

            if (res.ok) {
                toast({ title: "Architecture Deployed", description: "Matrix synchronized with database" });
                fetchTimetable();
            } else {
                const err = await res.json();
                toast({
                    title: "Sync Error",
                    description: err.details || "Database rejected the matrix",
                    variant: "destructive"
                });
            }
        } catch (e: any) {
            toast({ title: "Deployment Failed", description: e.message || "Connection error", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = (targetId: string) => {
        setTimetable(prev => prev.filter(t => t.id !== targetId));
        setIsModalOpen(false);
        toast({ title: "Removed", description: "Slot cleared from local matrix" });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
            {/* Animated Header Section */}
            <div className="flex flex-col gap-8 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-white shadow-xl">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Global Timetable
                            </h1>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Metropolis Grid System</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg mr-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Context:</span>
                            <span className="text-xs font-bold text-slate-700">{department} • Sem {semester} • {batch}</span>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Are you sure you want to clear the entire grid? This action cannot be undone.")) {
                                    setTimetable([]);
                                    toast({ title: "Grid Reset", description: "All slots cleared from local view" });
                                }
                            }}
                            disabled={isSaving}
                            className="bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-lg font-bold text-xs px-5 h-9 shadow-sm transition-all mr-2"
                        >
                            <RotateCcw className="h-3 w-3 mr-2" />
                            Reset
                        </Button>
                        <Button
                            onClick={deployArchitecture}
                            disabled={isSaving}
                            className="bg-black text-white rounded-lg font-bold text-xs px-5 h-9 shadow-lg shadow-black/20 hover:bg-slate-800 transition-all"
                        >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                            Deploy Grid
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Global Context Controls */}
                    <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dept</label>
                            <Select value={department} onValueChange={setDepartment}>
                                <SelectTrigger className="w-20 h-8 text-xs font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                                <SelectContent><div className="max-h-60">{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</div></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sem</label>
                            <Select value={semester} onValueChange={setSemester}>
                                <SelectTrigger className="w-16 h-8 text-xs font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                                <SelectContent>{SEMESTERS.map(s => <SelectItem key={s} value={s}>S{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="w-px h-8 bg-slate-100 mx-1" />
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Batch</label>
                            <Select value={batch} onValueChange={setBatch}>
                                <SelectTrigger className="w-24 h-8 text-xs font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                                <SelectContent>{BATCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="w-px h-8 bg-slate-100 mx-2" />

                        {/* Global Brush */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                            <label className="text-[9px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-2 w-2" /> Active Subject
                            </label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger className="h-8 text-xs font-bold bg-teal-50/50 border-teal-100 text-teal-900 border"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                            <label className="text-[9px] font-bold text-teal-600 uppercase tracking-wider">Active Faculty</label>
                            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                <SelectTrigger className="h-8 text-xs font-bold bg-teal-50/50 border-teal-100 text-teal-900 border"><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                                <SelectContent>{filteredTeachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Draggable Payload Card */}
                    <div
                        draggable
                        onDragStart={() => handleDragStart({ type: 'FOCUS' })}
                        className="bg-teal-600 text-white p-4 rounded-2xl shadow-xl shadow-teal-600/20 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform w-full md:w-auto min-w-[200px]"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Drag Payload</span>
                            <Box className="h-3 w-3 opacity-80" />
                        </div>
                        <div className="text-sm font-bold leading-tight">
                            {selectedSubject || "Select Subject"}
                        </div>
                        <div className="text-[10px] font-medium opacity-80 mt-1">
                            {teachers.find(t => t.id === selectedTeacher)?.name || "Select Faculty"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timetable Grid Container */}
            <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-6 md:p-8 relative overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
                        <div className="h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest animate-pulse">Reconfiguring Matrix...</p>
                    </div>
                )}

                <div className="overflow-visible">
                    <table className="w-full border-separate border-spacing-y-4 border-spacing-x-1 table-fixed">
                        <thead>
                            <tr>
                                <th className="w-28 text-left py-4 px-2">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Timeline</span>
                                        <div className="h-1 w-8 bg-slate-100 rounded-full" />
                                    </div>
                                </th>
                                {TIME_SLOTS.map((slot, idx) => (
                                    <th key={idx} className="p-0 group">
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-2 transition-all group-hover:bg-slate-50 group-hover:border-slate-200 relative mx-1">
                                            <div className="absolute -top-2 -right-1 h-5 w-5 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm z-10">
                                                <span className="text-[8px] font-black text-teal-600">{slot.label}</span>
                                            </div>
                                            <div className="text-center group-hover:scale-105 transition-transform overflow-hidden">
                                                <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter block truncate">
                                                    {slot.time.split(' - ')[0]}
                                                </span>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map((day) => (
                                <tr key={day}>
                                    <td className="w-28 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 text-right">
                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
                                                    {day.slice(0, 3)}
                                                </span>
                                            </div>
                                            <div className="h-10 w-1 bg-teal-600 rounded-full" />
                                        </div>
                                    </td>
                                    {TIME_SLOTS.map((slot, idx) => {
                                        const normalizedTime = normalizeTime(slot.time.split(' - ')[0]);
                                        const entries = gridData[day]?.[normalizedTime] || [];
                                        const isOccupied = entries.length > 0;
                                        const isLunch = slot.label === "P5";
                                        const isDropTarget = dropTarget?.day === day && dropTarget?.time24 === normalizedTime;

                                        if (isLunch) {
                                            return (
                                                <td key={idx} className="opacity-40 grayscale pointer-events-none">
                                                    <div className="h-28 rounded-xl bg-slate-100/50 border border-dashed border-slate-200 flex items-center justify-center">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] rotate-[-90deg]">Lunch Phase</span>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={idx}>
                                                <div
                                                    onDragOver={(e) => { e.preventDefault(); setDropTarget({ day, time24: normalizedTime }); }}
                                                    onDragLeave={() => setDropTarget(null)}
                                                    onDrop={() => handleDrop(day, slot)}
                                                    className={cn(
                                                        "h-32 rounded-xl border-2 transition-all p-3 flex flex-col items-center justify-center relative overflow-hidden group",
                                                        isOccupied
                                                            ? "bg-white border-slate-100 shadow-xl shadow-slate-100 hover:border-teal-500 hover:shadow-teal-100 cursor-default"
                                                            : "bg-[#F8FAFC] border-dashed border-slate-100 hover:bg-white hover:border-teal-600 hover:scale-[1.02] cursor-pointer",
                                                        isDropTarget && "bg-teal-50 border-teal-500 border-solid scale-105 z-10"
                                                    )}
                                                    onClick={(e) => {
                                                        // If clicking the container background, trigger ADD
                                                        if (e.target === e.currentTarget) {
                                                            handleAddClick(day, slot);
                                                        }
                                                    }}
                                                >
                                                    {isOccupied ? (
                                                        <div className="w-full h-full grid grid-cols-2 gap-1 content-start overflow-y-auto scrollbar-thin py-0.5">
                                                            {entries.map((entry, eIdx) => (
                                                                <button
                                                                    key={eIdx}
                                                                    draggable
                                                                    onDragStart={() => handleDragStart({ type: 'ENTRY', data: entry })}
                                                                    onClick={(e) => { e.stopPropagation(); handleEditClick(day, slot, entry); }}
                                                                    className={cn(
                                                                        "w-full text-left p-1.5 rounded-lg bg-white border shadow-sm transition-all group/sub cursor-grab active:cursor-grabbing flex flex-col justify-between min-h-[50px]",
                                                                        selectedTeacher === entry.facultyId
                                                                            ? "border-teal-500 bg-teal-50/30"
                                                                            : "border-slate-200 hover:border-slate-400"
                                                                    )}
                                                                >
                                                                    <div className="flex justify-between items-start gap-1">
                                                                        <span className={cn(
                                                                            "text-[8px] font-black px-1 py-0.5 rounded uppercase leading-none",
                                                                            selectedTeacher === entry.facultyId ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-900"
                                                                        )}>
                                                                            {entry.section}
                                                                        </span>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "text-[9px] font-bold truncate uppercase mt-1",
                                                                        selectedTeacher === entry.facultyId ? "text-teal-900" : "text-slate-600"
                                                                    )}>
                                                                        {entry.subject}
                                                                    </div>
                                                                </button>
                                                            ))}

                                                            {/* Add Button in Empty Quadrant */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleAddClick(day, slot); }}
                                                                className="w-full text-left p-1.5 rounded-lg border border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 flex items-center justify-center min-h-[50px] group/add transition-all"
                                                            >
                                                                <Plus className="h-4 w-4 text-slate-300 group-hover/add:text-teal-500" />
                                                            </button>

                                                            {/* Conflict Warning if Selected Teacher Busy */}
                                                            {teacherGridData[day]?.[normalizedTime]?.some(t => !entries.some(e => e.id === t.id)) && (
                                                                <div className="col-span-2 mt-1 p-1 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
                                                                    <span className="text-[8px] font-black text-amber-700 uppercase">External Conflict</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex flex-col items-center justify-center h-full w-full group-hover:scale-105 transition-transform gap-1"
                                                            onClick={() => handleAddClick(day, slot)}
                                                        >
                                                            {/* Teacher Allotment Overlay (Conflict/Busy View) */}
                                                            {teacherGridData[day]?.[normalizedTime]?.length > 0 ? (
                                                                <div className="w-full p-2 rounded-xl bg-amber-50/50 border border-dashed border-amber-200 flex flex-col items-start gap-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="h-2 w-2 text-amber-600" />
                                                                        <span className="text-[8px] font-black text-amber-600 uppercase">Busy Elsewhere</span>
                                                                    </div>
                                                                    {teacherGridData[day][normalizedTime].map((tSlot, tsIdx) => (
                                                                        <div key={tsIdx} className="text-[9px] font-bold text-amber-700 leading-none">
                                                                            {tSlot.section} • {tSlot.subject}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="h-8 w-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-teal-600 group-hover:border-teal-100 transition-all">
                                                                    <Plus className="h-4 w-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bottom Legend */}
                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-teal-500 shadow-lg shadow-teal-200" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Matrix</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Phase</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <Box className="h-3 w-3 text-slate-300" />
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Drag Payload to Sync Slots</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                        <Info className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">Global Synchronization Enabled</span>
                    </div>
                </div>
            </div>

            {/* Modal for Adding/Editing */}
            {/* Modal for Adding/Editing */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md bg-white border-none rounded-2xl shadow-2xl p-0 overflow-hidden outline-none">
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-col gap-1">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            {editingSlot?.data ? "Modify Slot Matrix" : "New Entry"}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{editingSlot?.day} • {editingSlot?.time.label} Phase</span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Subject</Label>
                                <Select value={formSubject} onValueChange={setFormSubject}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-slate-50 border-slate-100">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Faculty</Label>
                                <Select value={formTeacher} onValueChange={setFormTeacher}>
                                    <SelectTrigger className="h-10 text-xs font-bold bg-slate-50 border-slate-100">
                                        <SelectValue placeholder="Select Faculty" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTeachers.map(t => <SelectItem key={t.id} value={t.id}>Prof. {t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 flex flex-col">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Target Section</Label>
                                <Popover open={openSection} onOpenChange={setOpenSection}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openSection}
                                            className="h-10 justify-between text-xs font-bold bg-white border-slate-200"
                                        >
                                            {formSection || "Select or Type..."}
                                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search section..."
                                                className="h-8 text-xs"
                                                value={searchSection}
                                                onValueChange={setSearchSection}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2">
                                                        <p className="text-xs text-slate-500 mb-2">No section found.</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-xs h-7 border-teal-200 text-teal-700 hover:bg-teal-50"
                                                            onClick={() => {
                                                                setFormSection(searchSection.toUpperCase());
                                                                setOpenSection(false);
                                                            }}
                                                        >
                                                            Use "{searchSection.toUpperCase()}"
                                                        </Button>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Existing Sections">
                                                    {sections.map((section) => (
                                                        <CommandItem
                                                            key={section}
                                                            value={section}
                                                            onSelect={(currentValue) => {
                                                                // cmdk returns value in lowercase, so utilize original section or uppercase it
                                                                setFormSection(section);
                                                                setOpenSection(false);
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-3 w-3",
                                                                    formSection === section ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {section}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="text-xs font-bold text-slate-500 uppercase">Room Node</Label>
                                <Popover open={openRoom} onOpenChange={setOpenRoom}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openRoom}
                                            className="h-10 justify-between text-xs font-bold bg-white border-slate-200"
                                        >
                                            {formRoom || "Select or Type..."}
                                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search room..."
                                                className="h-8 text-xs"
                                                value={searchRoom}
                                                onValueChange={setSearchRoom}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2">
                                                        <p className="text-xs text-slate-500 mb-2">No room found.</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-xs h-7 border-teal-200 text-teal-700 hover:bg-teal-50"
                                                            onClick={() => {
                                                                setFormRoom(searchRoom.toUpperCase());
                                                                setOpenRoom(false);
                                                            }}
                                                        >
                                                            Use "{searchRoom.toUpperCase()}"
                                                        </Button>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Existing Rooms">
                                                    {rooms.map((room) => (
                                                        <CommandItem
                                                            key={room}
                                                            value={room}
                                                            onSelect={(currentValue) => {
                                                                setFormRoom(room);
                                                                setOpenRoom(false);
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-3 w-3",
                                                                    formRoom === room ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {room}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            {editingSlot?.data && (
                                <Button
                                    onClick={() => handleDelete(editingSlot.data!.id!)}
                                    disabled={isSaving}
                                    variant="destructive"
                                    className="h-10 w-10 p-0 rounded-lg aspect-square bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 h-10 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-slate-800"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {editingSlot?.data ? "Update Matrix" : "Confirm Entry"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

