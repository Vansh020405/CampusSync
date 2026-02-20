'use client';

import { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Save,
    CheckCircle2, AlertCircle, Loader2,
    ChevronRight, GraduationCap, LayoutGrid,
    ArrowUpDown, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Section {
    department: string;
    semester: string;
    section: string;
    batch: string;
}

interface Faculty {
    id: string;
    name: string;
    facultyId: string;
    department: string;
}

interface Assignment {
    id?: string;
    department: string;
    semester: string;
    section: string;
    batch: string;
    facultyId: string;
}

export default function AdminMentorsPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [assignments, setAssignments] = useState<Record<string, string>>({}); // sectionKey -> facultyId
    const [pendingAssignments, setPendingAssignments] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        department: 'ALL',
        semester: 'ALL',
        batch: 'ALL'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log("Fetching data with cache control...");

            const [secRes, facRes, assignRes] = await Promise.all([
                fetch('/api/admin/sections/list', { cache: 'no-store', headers: { 'Pragma': 'no-cache' } }),
                fetch('/api/faculty/list', { cache: 'no-store', headers: { 'Pragma': 'no-cache' } }),
                fetch('/api/admin/mentors/assignments', { cache: 'no-store', headers: { 'Pragma': 'no-cache' } })
            ]);

            const secData = secRes.ok ? await secRes.json().catch(() => []) : [];
            const facData = facRes.ok ? await facRes.json().catch(() => []) : [];
            const assignData = assignRes.ok ? await assignRes.json().catch(() => []) : [];

            // Normalize sections from API
            const normalizedSections = Array.isArray(secData) ? secData.map((s: any) => ({
                ...s,
                department: (s.department || '').toUpperCase(),
                section: (s.section || '').toUpperCase(),
                batch: (s.batch || 'Morning').charAt(0).toUpperCase() + (s.batch || 'Morning').slice(1).toLowerCase()
            })) : [];

            setSections(normalizedSections);

            if (Array.isArray(facData)) {
                setFaculty(facData);
            } else {
                setFaculty([]);
            }

            const assignMap: Record<string, string> = {};
            if (Array.isArray(assignData)) {
                assignData.forEach((a: Assignment) => {
                    // Normalize assignment keys for matching
                    const dept = (a.department || '').toUpperCase().trim();
                    const section = (a.section || '').toUpperCase().trim();
                    const batch = (a.batch || 'Morning').charAt(0).toUpperCase() + (a.batch || 'Morning').slice(1).toLowerCase().trim();
                    const semester = (a.semester || '').trim();
                    const key = `${dept}-${semester}-${section}-${batch}`;
                    assignMap[key] = a.facultyId;
                });
            }
            setAssignments(assignMap);
            setPendingAssignments(assignMap);
        } catch (error: any) {
            console.error("CRITICAL PORTAL ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (section: Section, facultyId: string) => {
        if (!facultyId) return;

        const sanitizedSection = {
            ...section,
            section: section.section.toUpperCase().trim(),
            department: section.department.toUpperCase().trim(),
            batch: (section.batch ? section.batch.charAt(0).toUpperCase() + section.batch.slice(1).toLowerCase() : 'Morning').trim(),
            semester: section.semester.trim()
        };

        const key = `${sanitizedSection.department}-${sanitizedSection.semester}-${sanitizedSection.section}-${sanitizedSection.batch}`;
        setSaving(key);

        try {
            console.log("Saving assignment for sanitized section:", sanitizedSection);
            const res = await fetch('/api/admin/mentors/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...sanitizedSection,
                    facultyId
                })
            });

            if (res.ok) {
                setAssignments(prev => ({ ...prev, [key]: facultyId }));
            } else {
                const errData = await res.json();
                console.error("FAILED TO SAVE ASSIGNMENT:", errData);
            }
        } catch (error) {
            console.error("Save assignment error:", error);
        } finally {
            setSaving(null);
        }
    };

    const getUniqueValues = (key: keyof Section) => {
        const values = Array.isArray(sections) ? sections.map(s => s[key]) : [];
        const baseOptions: Record<string, string[]> = {
            department: ['CSE', 'CSE AI ML', 'CSE DS', 'ECE', 'ME', 'Mathematics', 'Applied Sciences'],
            semester: ['1', '2', '3', '4', '5', '6', '7', '8'],
            batch: ['Morning', 'Evening']
        };

        const uniqueValues = Array.from(new Set([...values, ...(baseOptions[key] || [])]));
        return ['ALL', ...uniqueValues.sort()];
    };

    const filteredSections = (() => {
        const rawSections = Array.isArray(sections) && sections.length > 0 ? sections : [];

        // If we have no data, generate "Virtual Sections" based on filters to allow assignment
        if (rawSections.length === 0 && !loading) {
            const depts = filters.department === 'ALL' ? ['CSE', 'CSE AI ML', 'ECE'] : [filters.department];
            const sems = filters.semester === 'ALL' ? ['1', '2', '4', '6'] : [filters.semester];
            const batches = filters.batch === 'ALL' ? ['Morning', 'Evening'] : [filters.batch];
            const secs = ['G1', 'G2', 'G3', 'G4', 'G5'];

            const virtual: Section[] = [];
            depts.forEach(d => {
                sems.forEach(s => {
                    batches.forEach(b => {
                        secs.forEach(sec => {
                            virtual.push({ department: d, semester: s, section: sec, batch: b });
                        });
                    });
                });
            });
            return virtual.filter(v => {
                const matchesSearch = v.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.department.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesSearch;
            }); // Removed the .slice(0, 50) to show all matching virtual sections
        }

        return rawSections.filter(s => {
            const matchesDept = filters.department === 'ALL' || s.department === filters.department;
            const matchesSem = filters.semester === 'ALL' || s.semester === filters.semester;
            const matchesBatch = filters.batch === 'ALL' || s.batch === filters.batch;
            const matchesSearch =
                s.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.department.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesDept && matchesSem && matchesBatch && matchesSearch;
        });
    })();

    if (loading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
                <p className="text-slate-400 font-medium animate-pulse">Initializing Mentor Matrix...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* LEFT SIDEBAR: PARAMETERS */}
            <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-white/5 shadow-2xl z-20 shrink-0">
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="h-8 w-8 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 rotate-2">
                            <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black tracking-tight leading-none">Mentor Hub</h2>
                            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-[0.15em] mt-1">Console</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Parameter Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <Filter className="h-3 w-3 text-teal-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parameters</span>
                            </div>

                            <div className="space-y-2.5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-200 focus:ring-1 focus:ring-teal-500 transition-all outline-none"
                                        value={filters.department}
                                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                    >
                                        <option value="ALL" className="bg-slate-900">All Depts</option>
                                        {getUniqueValues('department').filter(v => v !== 'ALL').map(v => (
                                            <option key={v} value={v} className="bg-slate-900">{v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Semester</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-200 focus:ring-1 focus:ring-teal-500 transition-all outline-none"
                                        value={filters.semester}
                                        onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                                    >
                                        <option value="ALL" className="bg-slate-900">All Semesters</option>
                                        {getUniqueValues('semester').filter(v => v !== 'ALL').map(v => (
                                            <option key={v} value={v} className="bg-slate-900">Sem {v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Batch</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-200 focus:ring-1 focus:ring-teal-500 transition-all outline-none"
                                        value={filters.batch}
                                        onChange={(e) => setFilters(prev => ({ ...prev, batch: e.target.value }))}
                                    >
                                        <option value="ALL" className="bg-slate-900">All Batches</option>
                                        {getUniqueValues('batch').filter(v => v !== 'ALL').map(v => (
                                            <option key={v} value={v} className="bg-slate-900">{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Search Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <Search className="h-3 w-3 text-teal-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Section ID..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-200 focus:ring-1 focus:ring-teal-500 transition-all outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={() => {
                                setFilters({ department: 'ALL', semester: 'ALL', batch: 'ALL' });
                                setSearchQuery('');
                            }}
                            className="w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-wider transition-all border border-teal-500/20 mt-2 active:scale-95"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="mt-auto p-6 pt-0">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Sync</span>
                        </div>
                        <p className="text-[9px] font-medium text-slate-500 leading-tight">Changes push instantly to user dashboards.</p>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex items-baseline gap-3">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight italic leading-none">Allotment Console</h1>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Faculty-Student Mapping</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sections</p>
                                <p className="text-xs font-black text-slate-900 leading-none">{filteredSections.length}</p>
                            </div>
                            <div className="h-6 w-[1px] bg-slate-100" />
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Faculty</p>
                                <p className="text-xs font-black text-teal-600 leading-none">{faculty.length}</p>
                            </div>
                            {(() => {
                                const unsyncedCount = Object.keys(pendingAssignments).filter(k => pendingAssignments[k] !== assignments[k]).length;
                                if (unsyncedCount > 0) {
                                    return (
                                        <>
                                            <div className="h-6 w-[1px] bg-slate-100" />
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Pending</p>
                                                <p className="text-xs font-black text-amber-600 leading-none">{unsyncedCount} Updates</p>
                                            </div>
                                        </>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-5xl mx-auto space-y-3">
                        {filteredSections.map((section) => {
                            const key = `${section.department.trim()}-${section.semester.trim()}-${section.section.trim()}-${section.batch.trim()}`;
                            const currentMentorId = assignments[key];
                            const pendingMentorId = pendingAssignments[key];
                            const isSaving = saving === key;
                            const hasChanged = pendingMentorId !== currentMentorId;

                            // Find faculty details for richer UI
                            const selectedFaculty = faculty.find(f => f.id === pendingMentorId);

                            const sectionLabel = section.section.toUpperCase();

                            return (
                                <div key={key} className={cn(
                                    "bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:border-slate-300 group relative flex flex-col md:flex-row items-start md:items-center gap-6 overflow-hidden",
                                    hasChanged && "bg-teal-50/30 border-teal-500/30 shadow-sm"
                                )}>
                                    {/* Visual Accent - Static and Clean */}
                                    <div className={cn(
                                        "absolute top-0 left-0 bottom-0 w-1",
                                        section.batch === 'Morning' ? "bg-amber-400" : "bg-indigo-500"
                                    )} />

                                    {/* Section Identity */}
                                    <div className="flex items-center gap-4 shrink-0 min-w-[180px]">
                                        <div className="h-11 w-11 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                                            <span className="text-sm font-black text-white italic tracking-tighter">{sectionLabel}</span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-1.5 mb-1 text-[8px] font-black uppercase tracking-widest">
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded",
                                                    section.batch === 'Morning' ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                                                )}>
                                                    {section.batch}
                                                </span>
                                                <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                    Sem {section.semester}
                                                </span>
                                            </div>
                                            <h3 className="text-[11px] font-bold text-slate-700 truncate uppercase">
                                                {section.department}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Console Divider */}
                                    <div className="hidden md:block h-10 w-[1px] bg-slate-200/60 shrink-0" />

                                    {/* Control Hub */}
                                    <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
                                        <div className="relative flex-1 w-full">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                                                {selectedFaculty ? (
                                                    <div className="h-6 w-6 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                                                        <GraduationCap className="h-3 w-3 text-teal-600" />
                                                    </div>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                                                        <UserPlus className="h-3 w-3 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>

                                            <select
                                                className={cn(
                                                    "w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 py-3 text-xs font-bold transition-all appearance-none outline-none focus:border-slate-400 focus:bg-white cursor-pointer",
                                                    pendingMentorId ? "text-slate-900" : "text-slate-400 italic"
                                                )}
                                                value={pendingMentorId || ''}
                                                onChange={(e) => setPendingAssignments(prev => ({ ...prev, [key]: e.target.value }))}
                                                disabled={isSaving || faculty.length === 0}
                                            >
                                                {faculty.length === 0 ? (
                                                    <option>Connecting to faculty database...</option>
                                                ) : (
                                                    <option value="">Select Department Mentor...</option>
                                                )}
                                                {Array.isArray(faculty) && [...faculty].sort((a, b) => a.name.localeCompare(b.name)).map(f => (
                                                    <option key={f.id} value={f.id}>
                                                        {f.name} ({f.department})
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-300" />
                                            </div>
                                        </div>

                                        {/* Action Stack */}
                                        <div className="shrink-0">
                                            {isSaving ? (
                                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Syncing</span>
                                                </div>
                                            ) : hasChanged ? (
                                                <button
                                                    onClick={() => handleAssign(section, pendingMentorId)}
                                                    className="bg-slate-950 hover:bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
                                                >
                                                    <Save className="h-3.5 w-3.5" />
                                                    Commit Sync
                                                </button>
                                            ) : (
                                                <div className={cn(
                                                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border",
                                                    currentMentorId
                                                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                                        : "bg-slate-50 border-slate-200 text-slate-400"
                                                )}>
                                                    {currentMentorId ? (
                                                        <>
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">In Sync</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Allotment</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredSections.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem] space-y-4">
                                <AlertCircle className="h-10 w-10 text-slate-100" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Results Matched</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
