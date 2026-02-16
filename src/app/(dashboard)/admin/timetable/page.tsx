'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
    Plus, Save, Trash2, Clock,
    MapPin, ChevronLeft, Shield, Box, Users, Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TIME_SLOTS = [
    "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "12:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00",
    "03:00 - 04:00"
];

type ViewMode = 'selection' | 'faculty' | 'student';

interface SlotData {
    day: string;
    time: string;
    subject?: string;
    room?: string;
    teacher?: string;
    period?: string;
    section?: string;
}

export default function TimetableArchitecture() {
    const { toast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('selection');
    const [timetable, setTimetable] = useState<SlotData[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentSlot, setCurrentSlot] = useState<Partial<SlotData> | null>(null);

    // Dynamic Lists State
    const [subjects, setSubjects] = useState(["Java", "DBMS", "OS", "Maths", "CN", "AI", "S&UL", "OT"]);
    const [rooms, setRooms] = useState(["LH-101", "LH-102", "LAB-1", "LAB-2", "LH-303", "LH-401"]);
    const [teachers, setTeachers] = useState(["Sumit", "Dr. Priya", "Prof. Amit", "Dr. Sneha", "Prof. Vikram", "Manpreet", "Priyanka"]);
    const [sections, setSections] = useState(["4G1", "4G2", "4G3", "6G1", "6G2"]);

    // Custom fields trackers
    const [isCustomSubject, setIsCustomSubject] = useState(false);
    const [isCustomRoom, setIsCustomRoom] = useState(false);
    const [isCustomTeacher, setIsCustomTeacher] = useState(false);
    const [isCustomSection, setIsCustomSection] = useState(false);

    const [selectedSection, setSelectedSection] = useState("4G1");
    const [selectedTeacher, setSelectedTeacher] = useState("Sumit");

    const handleSlotClick = (day: string, time: string) => {
        const existing = timetable.find(s =>
            s.day === day &&
            s.time === time &&
            (viewMode === 'student' ? s.section === selectedSection : s.teacher === selectedTeacher)
        );
        setCurrentSlot(existing || {
            day,
            time,
            section: viewMode === 'student' ? selectedSection : undefined,
            teacher: viewMode === 'faculty' ? selectedTeacher : undefined
        });
        setIsCustomSubject(false);
        setIsCustomRoom(false);
        setIsCustomTeacher(false);
        setIsCustomSection(false);
        setIsEditModalOpen(true);
    };

    const saveSlot = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSlot) return;

        // Dynamic list enrichment
        if (currentSlot.subject && !subjects.includes(currentSlot.subject)) {
            setSubjects(prev => [...prev, currentSlot.subject!]);
        }
        if (currentSlot.room && !rooms.includes(currentSlot.room)) {
            setRooms(prev => [...prev, currentSlot.room!]);
        }
        if (currentSlot.teacher && !teachers.includes(currentSlot.teacher)) {
            setTeachers(prev => [...prev, currentSlot.teacher!]);
        }
        if (currentSlot.section && !sections.includes(currentSlot.section)) {
            setSections(prev => [...prev, currentSlot.section!]);
        }

        setTimetable(prev => {
            const filtered = prev.filter(s =>
                !(s.day === currentSlot.day &&
                    s.time === currentSlot.time &&
                    (viewMode === 'student' ? s.section === currentSlot.section : s.teacher === currentSlot.teacher))
            );
            return [...filtered, currentSlot as SlotData];
        });

        setIsEditModalOpen(false);
        toast({ title: "Matrix Synchronized", description: "Slot updated and options indexed." });
    };

    const deleteSlot = () => {
        if (!currentSlot) return;
        setTimetable(prev => prev.filter(s => !(s.day === currentSlot.day && s.time === currentSlot.time)));
        setIsEditModalOpen(false);
    };

    if (viewMode === 'selection') {
        return (
            <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 bg-white min-h-screen font-sans">
                <div className="text-center space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] flex items-center justify-center gap-2">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        System Architecture
                    </p>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
                        Protocol Selection
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        onClick={() => setViewMode('faculty')}
                        className="group relative bg-[#F8FAFC] border border-slate-100 rounded-[2.5rem] p-8 flex flex-col justify-between h-96 cursor-pointer transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 active:scale-95"
                    >
                        <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all z-10">
                            <Box className="h-7 w-7" />
                        </div>
                        <div className="z-10">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Faculty Core</h2>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed group-hover:text-slate-600 transition-colors">
                                Build schedules centered around instructor availability and departmental resources.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest z-10">
                            Initialize <ChevronLeft className="h-4 w-4 rotate-180 text-indigo-500" />
                        </div>
                    </div>

                    <div
                        onClick={() => setViewMode('student')}
                        className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between h-96 cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-900/20 active:scale-95"
                    >
                        <div className="h-14 w-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all z-10">
                            <Users className="h-7 w-7" />
                        </div>
                        <div className="z-10">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Student Matrix</h2>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed group-hover:text-slate-300 transition-colors">
                                Define segment-based learning timelines for specific sections and year groups.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest z-10">
                            Initialize <ChevronLeft className="h-4 w-4 rotate-180 text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto space-y-10 pb-32 px-8 py-12 bg-white min-h-screen font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <button
                        onClick={() => setViewMode('selection')}
                        className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors mb-2 group"
                    >
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> System Root
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        {viewMode === 'faculty' ? 'Faculty' : 'Student'} Architecture
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target:</span>
                        {viewMode === 'student' ? (
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className="h-9 w-32 border-none bg-white rounded-xl font-bold text-[10px] uppercase shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {sections.map((s: string) => <SelectItem key={s} value={s}>SEC {s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                <SelectTrigger className="h-9 w-44 border-none bg-white rounded-xl font-bold text-[10px] uppercase shadow-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    {teachers.map((t: string) => <SelectItem key={t} value={t}>Prof. {t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <Button onClick={saveSlot} className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                        <Save className="h-4 w-4 mr-2" /> Deploy Sync
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-4 w-full">
                <div className="w-full">
                    <table className="w-full border-separate border-spacing-2 table-fixed">
                        <thead>
                            <tr>
                                <th className="p-3 text-[11px] font-black text-slate-600 uppercase tracking-widest text-left w-24">Day</th>
                                {TIME_SLOTS.map((time, idx) => (
                                    <th key={time} className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest leading-none">P{idx + 1}</span>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none whitespace-nowrap">{time.split(' - ')[0]}</span>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none whitespace-nowrap">{time.split(' - ')[1]}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {DAYS.map(day => (
                                <tr key={day}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                            {day.slice(0, 3)}
                                        </div>
                                    </td>
                                    {TIME_SLOTS.map(time => {
                                        const slot = timetable.find(s =>
                                            s.day === day &&
                                            s.time === time &&
                                            (viewMode === 'student' ? s.section === selectedSection : s.teacher === selectedTeacher)
                                        );
                                        return (
                                            <td key={`${day}-${time}`}>
                                                <div
                                                    onClick={() => handleSlotClick(day, time)}
                                                    className={cn(
                                                        "h-24 rounded-2xl p-3 flex flex-col justify-center border transition-all cursor-pointer relative group overflow-hidden",
                                                        slot
                                                            ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-900"
                                                            : "bg-[#F8FAFC] border-slate-50 hover:border-slate-200"
                                                    )}
                                                >
                                                    {slot ? (
                                                        <>
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                                                            <div className="text-[9px] font-black uppercase text-slate-500 mb-0.5 leading-none tracking-widest">
                                                                {viewMode === 'faculty' ? `SEC ${slot.section}` : (slot.teacher ? `Prof. ${slot.teacher}` : 'Allocated')}
                                                            </div>
                                                            <div className="text-[11px] font-black uppercase tracking-tight text-slate-900 mb-1.5 leading-tight overflow-hidden text-ellipsis line-clamp-2">
                                                                {slot.subject}
                                                            </div>
                                                            <div className="flex items-center justify-between mt-auto">
                                                                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                                                                    <MapPin className="h-2 w-2 text-indigo-700" />
                                                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{slot.room}</span>
                                                                </div>
                                                                <Sparkles className="h-3 w-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-all">
                                                            <div className="h-6 w-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                <Plus className="h-3 w-3" />
                                                            </div>
                                                            <span className="text-[7px] font-black uppercase tracking-widest">Deploy</span>
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
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] border border-slate-100 shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="bg-slate-900 p-8 text-white">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Edit Slot</h2>
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest mt-1">
                            {currentSlot?.day} • {currentSlot?.time}
                        </p>
                    </div>

                    <div className="px-8 pt-6">
                        <Label className="text-[11px] font-black uppercase text-slate-600 tracking-widest px-1">Quick Matrix Presets</Label>
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                            {Array.from(new Set(timetable.map(s => JSON.stringify({
                                subject: s.subject,
                                room: s.room,
                                teacher: s.teacher,
                                section: s.section
                            })))).slice(0, 5).map((presetStr, idx) => {
                                const preset = JSON.parse(presetStr);
                                if (!preset.subject) return null;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setCurrentSlot(prev => ({ ...prev, ...preset }));
                                            setIsCustomSubject(false);
                                            setIsCustomRoom(false);
                                            setIsCustomTeacher(false);
                                            setIsCustomSection(false);
                                        }}
                                        className="flex-shrink-0 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-left hover:border-slate-900 transition-all group"
                                    >
                                        <div className="text-[8px] font-black text-slate-900 uppercase leading-none mb-1">{preset.subject}</div>
                                        <div className="text-[7px] font-bold text-slate-400 uppercase leading-none">{preset.room} • {viewMode === 'faculty' ? preset.section : preset.teacher}</div>
                                    </button>
                                );
                            })}
                            {timetable.length === 0 && (
                                <div className="text-[10px] font-medium text-slate-300 py-2">No active matrices to clone.</div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={saveSlot} className="p-8 pt-2 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase text-slate-600 tracking-widest px-1">Subject</Label>
                                {isCustomSubject ? (
                                    <Input
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900"
                                        placeholder="Enter custom subject..."
                                        value={currentSlot?.subject || ''}
                                        onChange={(e) => setCurrentSlot(prev => ({ ...prev, subject: e.target.value }))}
                                        autoFocus
                                    />
                                ) : (
                                    <Select
                                        value={currentSlot?.subject}
                                        onValueChange={(val) => val === 'CUSTOM' ? setIsCustomSubject(true) : setCurrentSlot(prev => ({ ...prev, subject: val }))}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900">
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {subjects.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            <SelectItem value="CUSTOM" className="font-bold text-indigo-600">Custom...</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Room</Label>
                                {isCustomRoom ? (
                                    <Input
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900"
                                        placeholder="Enter custom room..."
                                        value={currentSlot?.room || ''}
                                        onChange={(e) => setCurrentSlot(prev => ({ ...prev, room: e.target.value }))}
                                        autoFocus
                                    />
                                ) : (
                                    <Select
                                        value={currentSlot?.room}
                                        onValueChange={(val) => val === 'CUSTOM' ? setIsCustomRoom(true) : setCurrentSlot(prev => ({ ...prev, room: val }))}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900">
                                            <SelectValue placeholder="Select Room" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {rooms.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                            <SelectItem value="CUSTOM" className="font-bold text-indigo-600">Custom...</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {viewMode === 'student' ? (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Faculty</Label>
                                    {isCustomTeacher ? (
                                        <Input
                                            className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900"
                                            placeholder="Name..."
                                            value={currentSlot?.teacher || ''}
                                            onChange={(e) => setCurrentSlot(prev => ({ ...prev, teacher: e.target.value }))}
                                            autoFocus
                                        />
                                    ) : (
                                        <Select
                                            value={currentSlot?.teacher}
                                            onValueChange={(val) => val === 'CUSTOM' ? setIsCustomTeacher(true) : setCurrentSlot(prev => ({ ...prev, teacher: val }))}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900">
                                                <SelectValue placeholder="Select Faculty" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {teachers.map((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                <SelectItem value="CUSTOM" className="font-bold text-indigo-600">Custom...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Allocation (Section)</Label>
                                    {isCustomSection ? (
                                        <Input
                                            className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900"
                                            placeholder="Enter section..."
                                            value={currentSlot?.section || ''}
                                            onChange={(e) => setCurrentSlot(prev => ({ ...prev, section: e.target.value }))}
                                            autoFocus
                                        />
                                    ) : (
                                        <Select
                                            value={currentSlot?.section}
                                            onValueChange={(val) => val === 'CUSTOM' ? setIsCustomSection(true) : setCurrentSlot(prev => ({ ...prev, section: val }))}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900">
                                                <SelectValue placeholder="Select Section" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {sections.map((s: string) => <SelectItem key={s} value={s}>SEC {s}</SelectItem>)}
                                                <SelectItem value="CUSTOM" className="font-bold text-indigo-600">Custom...</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={deleteSlot} className="h-12 w-12 rounded-xl border-slate-100 text-slate-300 hover:text-rose-500 p-0 transition-all">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                            <Button type="submit" className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                                Save Matrix
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
