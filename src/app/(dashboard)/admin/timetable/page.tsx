'use client';

import { useState, useEffect } from 'react';
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

export default function TimetableArchitecture() {
    const { toast } = useToast();
    const viewMode = 'faculty';
    const [timetable, setTimetable] = useState<SlotData[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentSlot, setCurrentSlot] = useState<Partial<SlotData> | null>(null);

    // Dynamic Lists State
    const [subjects, setSubjects] = useState(["Java", "DBMS", "OS", "Maths", "CN", "AI", "S&UL", "OT"]);
    const [rooms, setRooms] = useState(["LH-101", "LH-102", "LAB-1", "LAB-2", "LH-303", "LH-401"]);
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
    const [sections, setSections] = useState<string[]>([]);

    // Custom fields trackers
    const [isCustomSubject, setIsCustomSubject] = useState(false);
    const [isCustomRoom, setIsCustomRoom] = useState(false);
    const [isCustomTeacher, setIsCustomTeacher] = useState(false);
    const [isCustomSection, setIsCustomSection] = useState(false);

    const [selectedTeacher, setSelectedTeacher] = useState(""); // This will now store the ID
    const [isLoading, setIsLoading] = useState(true);
    const [isDeploying, setIsDeploying] = useState(false);

    // Helper to merge teachers uniquely
    const mergeTeachers = (current: { id: string, name: string }[], incoming: { id: string, name: string }[]) => {
        const map = new Map<string, string>();
        // Process current list first
        current.forEach(t => {
            if (t.id && t.name) {
                // If existing name is just the ID, and we have a better name, we might want to update
                // But generally, prioritize human names over IDs
                map.set(t.id.toLowerCase(), t.name);
            }
        });
        // Merge incoming
        incoming.forEach(t => {
            const id = t.id.toLowerCase();
            const existingName = map.get(id);
            // Only set if we don't have it, OR if the existing name is just the ID and the new one is better
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
                const [facRes, secRes] = await Promise.all([
                    fetch('/api/faculty/list'),
                    fetch('/api/admin/sections')
                ]);
                const facData = await facRes.json();
                const secData = await secRes.json();

                const teacherObjects = facData.map((f: any) => ({ id: f.id, name: f.name }));
                setTeachers(prev => mergeTeachers(prev, teacherObjects));
                setSections(secData);

                if (teacherObjects.length > 0) setSelectedTeacher(teacherObjects[0].id);
            } catch (error) {
                console.error("Resource Sync Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, []);

    // Existing Timetable Sync
    useEffect(() => {
        const fetchExisting = async () => {
            const target = `facultyId=${selectedTeacher}`;
            if (!selectedTeacher) return;

            try {
                const res = await fetch(`/api/timetable?${target}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Update teachers list if we find new faculty IDs in the fetched timetable
                    const uniqueTeacherIds = [...new Set(data.map(s => s.facultyId).filter(Boolean))];
                    const newIncoming: { id: string, name: string }[] = uniqueTeacherIds.map(tid => ({ id: tid as string, name: tid as string }));

                    setTeachers(prev => mergeTeachers(prev, newIncoming));

                    const mapped: SlotData[] = data.map(s => {
                        // Normalize 12h (DB) to 24h (UI Grid)
                        const formatTo24 = (timeStr: string) => {
                            const [time, ampm] = timeStr.split(' ');
                            if (!ampm) return timeStr; // Fallback for raw 24h
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
    }, [selectedTeacher, viewMode]);

    const handleSlotClick = (day: string, time: string) => {
        const existing = timetable.find(s =>
            s.day === day &&
            s.time === time &&
            s.teacher === selectedTeacher
        );
        setCurrentSlot(existing || {
            day,
            time,
            section: undefined,
            teacher: selectedTeacher
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
        if (currentSlot.teacher && !teachers.some(t => t.id === currentSlot.teacher || t.name === currentSlot.teacher)) {
            // Only add if it's truly a new custom entry
            setTeachers(prev => [...prev, { id: currentSlot.teacher!, name: currentSlot.teacher! }]);
        }
        if (currentSlot.section && !sections.includes(currentSlot.section)) {
            setSections(prev => [...prev, currentSlot.section!]);
        }

        setTimetable(prev => {
            const filtered = prev.filter(s =>
                !(s.day === currentSlot.day &&
                    s.time === currentSlot.time &&
                    s.teacher === currentSlot.teacher)
            );
            return [...filtered, currentSlot as SlotData];
        });

        setIsEditModalOpen(false);
        toast({ title: "Matrix Synchronized", description: "Slot updated and options indexed." });
    };

    const deploySync = async () => {
        const targetSlots = timetable.filter(s =>
            s.teacher === selectedTeacher
        );


        setIsDeploying(true);
        try {
            const currentTargetId = selectedTeacher;

            // Map slots and resolve faculty IDs
            const syncPayload = targetSlots.map(s => {
                // Find teacher ID from our index
                const teacherObj = teachers.find(t =>
                    t.id === s.teacher ||
                    t.name === s.teacher ||
                    t.id.toLowerCase() === s.teacher?.toLowerCase()
                );

                return {
                    ...s,
                    facultyId: viewMode === 'faculty' ? selectedTeacher : (teacherObj?.id || s.teacher)
                };
            });

            console.log("Synchronizing Matrix Payload:", { viewMode, targetId: currentTargetId, slots: syncPayload });

            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timetable: syncPayload,
                    viewMode,
                    targetId: currentTargetId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error || "Deployment Failed");

            toast({
                title: "Deployment Successful",
                description: `Schedules for ${teachers.find(t => t.id === selectedTeacher)?.name} have been synchronized with the live portal.`,
            });
        } catch (error: any) {
            console.error("Deploy Error:", error);
            toast({
                title: "Deployment Failed",
                description: error.message || "Critical synchronization error. Please check engine connectivity.",
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
        <div className="max-w-full mx-auto space-y-10 pb-32 px-8 py-12 bg-white min-h-screen font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        Faculty Architecture
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Manage Faculty:</span>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                            <SelectTrigger className="h-9 w-44 border-none bg-white rounded-xl font-bold text-[10px] uppercase shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {teachers.map((t) => <SelectItem key={t.id} value={t.id}>Prof. {t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={deploySync}
                        disabled={isDeploying}
                        className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                    >
                        {isDeploying ? (
                            <Clock className="h-4 w-4 animate-spin text-indigo-400" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isDeploying ? 'Deploying...' : 'Deploy Sync'}
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
                                            (s.teacher === selectedTeacher)
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
                                                                {`SEC ${slot.section}`}
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
                                const preset = JSON.parse(presetStr as string);
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
                                        <div className="text-[7px] font-bold text-slate-400 uppercase leading-none">{preset.room} • {preset.section}</div>
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
