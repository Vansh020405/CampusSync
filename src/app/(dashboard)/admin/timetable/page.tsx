'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
    Plus, Save, Trash2, Clock,
    MapPin, Box, Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TIME_SLOTS = [
    "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
    "15:00 - 16:00"
];

type ViewMode = 'faculty' | 'student';

interface SlotData {
    day: string;
    time: string;
    subject?: string;
    room?: string;
    teacher?: string;
    period?: string;
    section?: string;
}

const formatDisplayTime = (time24: string) => {
    if (!time24) return "";
    return time24.split(' - ').map(t => {
        let [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${hh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    }).join(' - ');
};

export default function TimetableArchitecture() {
    const { toast } = useToast();
    const [timetable, setTimetable] = useState<SlotData[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentSlot, setCurrentSlot] = useState<Partial<SlotData> | null>(null);

    // Dynamic Lists State
    const [subjects, setSubjects] = useState(["Java", "DBMS", "OS", "Maths", "CN", "AI", "S&UL", "OT"]);
    const [rooms, setRooms] = useState(["LH-101", "LH-102", "LH-103", "LAB-1", "LAB-2", "LAB-3", "AUD-1"]);
    const [allTeachers, setAllTeachers] = useState<any[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<{ id: string; name: string }[]>([]);
    const [sections, setSections] = useState<string[]>([]);

    // Selection State
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");

    // Custom fields trackers
    const [isCustomSubject, setIsCustomSubject] = useState(false);
    const [isCustomRoom, setIsCustomRoom] = useState(false);
    const [isCustomTeacher, setIsCustomTeacher] = useState(false);
    const [isCustomSection, setIsCustomSection] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isDeploying, setIsDeploying] = useState(false);
    const [draggedData, setDraggedData] = useState<string | SlotData | null>(null);
    const [dropTarget, setDropTarget] = useState<{ day: string, time: string } | null>(null);

    // Helper to merge teachers uniquely
    const mergeTeachers = (current: { id: string, name: string }[], incoming: { id: string, name: string }[]) => {
        const map = new Map<string, string>();
        current.forEach(t => map.set(t.id.toLowerCase(), t.name));
        incoming.forEach(t => {
            const id = t.id.toLowerCase();
            const existingName = map.get(id);
            if (!map.has(id) || (existingName === t.id && t.name !== t.id)) {
                map.set(id, t.name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    };

    // Initial Data Sync
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [facRes, resRes] = await Promise.all([
                    fetch('/api/faculty/list'),
                    fetch('/api/admin/resources')
                ]);
                const facData = await facRes.json();
                const resData = await resRes.json();

                setAllTeachers(facData || []);

                if (resData.sections?.length > 0) setSections(resData.sections);
                if (resData.subjects?.length > 0) setSubjects(resData.subjects);
                if (resData.rooms?.length > 0) setRooms(resData.rooms);

                // Default selection
                if (resData.subjects?.length > 0) {
                    const firstSub = resData.subjects[0];
                    setSelectedSubject(firstSub);
                }
            } catch (error) {
                console.error("Resource Sync Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, []);

    // Subject -> Teacher filtering logic
    useEffect(() => {
        if (!selectedSubject) {
            setFilteredTeachers([]);
            return;
        }

        const filtered = allTeachers.filter(f =>
            f.subjects?.some((s: string) => s.toLowerCase() === selectedSubject.toLowerCase())
        ).map(f => ({ id: f.id, name: f.name }));

        setFilteredTeachers(filtered);

        // Auto-select first teacher in filtered list if current selected is not in it
        if (filtered.length > 0 && !filtered.some(t => t.id === selectedTeacher)) {
            setSelectedTeacher(filtered[0].id);
        }
    }, [selectedSubject, allTeachers]);

    // Timetable Sync
    useEffect(() => {
        const fetchExisting = async () => {
            if (!selectedTeacher) {
                setTimetable([]);
                return;
            }

            try {
                const res = await fetch(`/api/timetable?facultyId=${selectedTeacher}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    const mapped: SlotData[] = data.map(s => {
                        const formatTo24 = (timeStr: string) => {
                            const [time, ampm] = timeStr.split(' ');
                            if (!ampm) return timeStr;
                            let [h, m] = time.split(':').map(Number);
                            if (ampm === 'PM' && h < 12) h += 12;
                            if (ampm === 'AM' && h === 12) h = 0;
                            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        };

                        return {
                            day: s.day,
                            time: `${formatTo24(s.startTime)} - ${formatTo24(s.endTime)}`,
                            subject: s.subject,
                            room: s.classroom,
                            teacher: s.facultyId,
                            section: s.section
                        };
                    });
                    setTimetable(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch existing matrix:", error);
            }
        };
        fetchExisting();
    }, [selectedTeacher]);

    const handleSlotClick = (day: string, time: string, prefilledSubject?: string) => {
        const existing = timetable.find(s =>
            s.day === day &&
            s.time === time &&
            s.teacher === selectedTeacher
        );
        setCurrentSlot(existing || {
            day,
            time,
            subject: prefilledSubject || selectedSubject,
            teacher: selectedTeacher
        });
        setIsCustomSubject(false);
        setIsCustomRoom(false);
        setIsCustomTeacher(false);
        setIsCustomSection(false);
        setIsEditModalOpen(true);
    };

    const handleDragStart = (data: string | SlotData) => {
        setDraggedData(data);
    };

    const handleDrop = (day: string, time: string) => {
        if (!draggedData) return;

        const isObject = typeof draggedData !== 'string';
        const subject = isObject ? (draggedData as SlotData).subject : (draggedData as string);

        const existing = timetable.find(s =>
            s.day === day &&
            s.time === time &&
            s.teacher === selectedTeacher
        );

        if (existing) {
            // Update existing slot with new data
            setTimetable(prev => prev.map(s =>
                (s.day === day && s.time === time && s.teacher === selectedTeacher)
                    ? {
                        ...s,
                        subject: subject,
                        room: isObject ? (draggedData as SlotData).room : s.room,
                        teacher: selectedTeacher,
                        section: isObject ? (draggedData as SlotData).section : s.section
                    }
                    : s
            ));
            toast({ title: "Matrix Updated", description: `Replicated ${subject} to ${day} ${time}` });
        } else {
            // Create new slot
            const newSlot: SlotData = {
                day,
                time,
                subject: subject,
                room: isObject ? (draggedData as SlotData).room : undefined,
                teacher: selectedTeacher,
                section: isObject ? (draggedData as SlotData).section : undefined,
            };
            setTimetable(prev => [...prev, newSlot]);
            toast({ title: "Slot Created", description: `Cloned ${subject} to ${day} ${time}` });
        }

        setDraggedData(null);
        setDropTarget(null);
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
        if (currentSlot.section && !sections.includes(currentSlot.section)) {
            setSections(prev => [...prev, currentSlot.section!]);
        }

        setTimetable(prev => {
            const filtered = prev.filter(s =>
                !(s.day === currentSlot.day &&
                    s.time === currentSlot.time &&
                    s.teacher === selectedTeacher)
            );
            return [...filtered, currentSlot as SlotData];
        });

        setIsEditModalOpen(false);
        toast({ title: "Matrix Synchronized", description: "Slot updated." });
    };

    const deploySync = async () => {
        const targetSlots = timetable.filter(s => s.teacher === selectedTeacher);

        setIsDeploying(true);
        try {
            const syncPayload = targetSlots.map(s => ({
                ...s,
                facultyId: selectedTeacher
            }));

            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timetable: syncPayload,
                    viewMode: 'faculty',
                    targetId: selectedTeacher
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || "Deployment Failed");

            toast({
                title: "Deployment Successful",
                description: `Schedule for Prof. ${allTeachers.find(t => t.id === selectedTeacher)?.name || selectedTeacher} synchronized.`,
            });
        } catch (error: any) {
            console.error("Deploy Error:", error);
            toast({
                title: "Deployment Failed",
                description: error.message || "Critical synchronization error.",
                variant: "destructive"
            });
        } finally {
            setIsDeploying(false);
        }
    };

    const deleteSlot = () => {
        if (!currentSlot) return;
        setTimetable(prev => prev.filter(s =>
            !(s.day === currentSlot.day &&
                s.time === currentSlot.time &&
                s.teacher === selectedTeacher)
        ));
        setIsEditModalOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-sm animate-pulse">
                        <Box className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Analyzing Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-32 px-8 py-12 bg-white min-h-screen font-sans">
            {/* Centered Header */}
            <div className="flex flex-col items-center gap-10 mb-16 text-center">
                <div className="space-y-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase px-4">
                        Faculty Architecture <span className="text-indigo-600">2026</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Global Matrix Control</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-slate-50/50 rounded-[3rem] border border-slate-100 shadow-sm">
                    {/* Subject Selector */}
                    <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-[2rem] shadow-sm border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Choose Subject:</span>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="h-10 w-44 border-none bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-tight text-slate-900 shadow-inner">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {/* Draggable Badge */}
                        {selectedSubject && (
                            <div
                                draggable
                                onDragStart={() => handleDragStart(selectedSubject)}
                                className="h-10 px-6 bg-indigo-600 hover:bg-black rounded-2xl flex items-center gap-2 cursor-grab active:cursor-grabbing transition-all shadow-md group border border-indigo-400"
                            >
                                <Box className="h-3.5 w-3.5 text-indigo-200" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedSubject}</span>
                                <Plus className="h-3 w-3 text-indigo-300 group-hover:scale-125 transition-transform" />
                            </div>
                        )}
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />

                    {/* Teacher Selector */}
                    <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-[2rem] shadow-sm border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Instructor:</span>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger className="h-10 w-44 border-none bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-tight text-slate-900 shadow-inner">
                                <SelectValue placeholder="Select Faculty" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                                {filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((t) => <SelectItem key={t.id} value={t.id}>Prof. {t.name}</SelectItem>)
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">No Matches found for this subject</p>
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={deploySync}
                        disabled={isDeploying || !selectedTeacher}
                        className="h-12 px-8 rounded-[2rem] bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95"
                    >
                        {isDeploying ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isDeploying ? 'Deploying...' : 'Deploy Synchronization'}
                    </Button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-4 w-full">
                <div className="w-full overflow-hidden">
                    <table className="w-full border-separate border-spacing-2 table-fixed">
                        <thead>
                            <tr>
                                <th className="p-3 text-[11px] font-black text-slate-600 uppercase tracking-widest text-left w-24">Day</th>
                                {TIME_SLOTS.map((time, idx) => (
                                    <th key={time} className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest leading-none">P{idx + 1}</span>
                                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none whitespace-nowrap">
                                                {formatDisplayTime(time.split(' - ')[0])}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none whitespace-nowrap">
                                                {formatDisplayTime(time.split(' - ')[1])}
                                            </span>
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
                                            s.teacher === selectedTeacher
                                        );
                                        return (
                                            <td key={`${day}-${time}`}>
                                                <div
                                                    onClick={() => handleSlotClick(day, time)}
                                                    draggable={!!slot}
                                                    onDragStart={() => {
                                                        if (slot) handleDragStart(slot as SlotData);
                                                    }}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        setDropTarget({ day, time });
                                                    }}
                                                    onDragLeave={() => setDropTarget(null)}
                                                    onDrop={() => handleDrop(day, time)}
                                                    className={cn(
                                                        "h-24 rounded-2xl p-3 flex flex-col justify-center border transition-all cursor-pointer relative group overflow-hidden",
                                                        slot
                                                            ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-900 cursor-grab active:cursor-grabbing"
                                                            : "bg-[#F8FAFC] border-slate-50 hover:border-slate-200",
                                                        dropTarget?.day === day && dropTarget?.time === time && "ring-2 ring-indigo-500 bg-indigo-50/50 border-indigo-200 border-dashed"
                                                    )}
                                                >
                                                    {slot ? (
                                                        <>
                                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-l-full" />
                                                            <div className="pl-2">
                                                                <div className="text-[8px] font-black uppercase text-indigo-500/60 mb-1 leading-none tracking-[0.2em] truncate">
                                                                    SEC {slot.section || '---'}
                                                                </div>
                                                                <div className="text-[12px] font-black uppercase tracking-tighter text-slate-900 mb-2 leading-tight overflow-hidden text-ellipsis line-clamp-1">
                                                                    {slot.subject}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                                                    <MapPin className="h-2.5 w-2.5 text-indigo-600" />
                                                                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-none">
                                                                        {slot.room || 'TBA'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-400/20 group-hover:bg-indigo-500/10 transition-colors" />
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1.5 group-hover:scale-110 transition-transform">
                                                            <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                                <Plus className="h-4 w-4" />
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-indigo-600">Sync Slot</span>
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
                            {currentSlot?.day} • {formatDisplayTime(currentSlot?.time || "")}
                        </p>
                    </div>

                    <form onSubmit={saveSlot} className="p-8 pt-6 space-y-6">
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

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                                    Target Section
                                </Label>
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
