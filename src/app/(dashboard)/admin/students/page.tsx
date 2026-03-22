'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search, User, Mail, GraduationCap,
    ChevronLeft, Sparkles, Building2, MapPin,
    Users, MoreHorizontal, ShieldCheck, Filter,
    Layers, Hash, MailQuestion, Bookmark
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface Student {
    id: string;
    name: string;
    rollNo: string;
    section: string;
    department: string;
    email: string;
    semester: string;
}

export default function StudentRegistry() {
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const sectionsRes = await fetch('/api/admin/sections');
                const sectionsData = await sectionsRes.json();
                setSections(sectionsData);

                const studentsRes = await fetch('/api/admin/students/list');
                const studentsData = await studentsRes.json();
                setStudents(studentsData);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSection = s.section === selectedSection;
        return matchesSearch && matchesSection;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 px-6 py-12 bg-white min-h-screen font-sans text-slate-900">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors mb-2 group"
                    >
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Admin Hub
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        {selectedSection ? `SEC ${selectedSection}` : "Student Registry"}
                    </h1>
                </div>

                {selectedSection && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedSection(null);
                                setSearchQuery("");
                            }}
                            className="h-10 px-5 rounded-xl border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                            Change Section
                        </Button>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search Name/Roll..."
                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none font-bold text-xs uppercase tracking-tight focus-visible:ring-slate-900 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : !selectedSection ? (
                /* Minimalist Section Selection */
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-2">
                    {sections.map((sec) => (
                        <div
                            key={sec}
                            onClick={() => setSelectedSection(sec)}
                            className="cursor-pointer bg-white border border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-slate-900 hover:bg-slate-50 transition-all duration-200 group"
                        >
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-indigo-600">Section</p>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{sec}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Streamlined Student List */
                <div className="px-2">
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Student Profile</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Roll No</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">Contact Sync</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px] font-black uppercase">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 tracking-tight uppercase group-hover:text-indigo-600 transition-colors">{student.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{student.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-slate-900 font-mono tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                {student.rollNo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-xs font-medium text-slate-500 lowercase">{student.email}</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-20 text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No entries found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
