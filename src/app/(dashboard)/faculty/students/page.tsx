'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, Loader2, ArrowLeft, GraduationCap, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function MyStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/faculty/mentor/students');
                if (res.ok) {
                    const data = await res.json();
                    setStudents(data);
                } else {
                    toast.error("Failed to load mentored students");
                }
            } catch (error) {
                toast.error("Error connecting to server");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.section.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sections = Array.from(new Set(students.map(s => s.section)));

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500 font-sans mt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-white hover:bg-slate-50 rounded-2xl h-12 w-12 border-slate-200 shadow-sm shrink-0"
                        onClick={() => router.push('/faculty/menu')}
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Mentored Students</h2>
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                            <Users className="h-3 w-3" /> {students.length} Total Assigned
                        </p>
                    </div>
                </div>
                <div className="w-full md:max-w-md relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, roll no, or section..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 shadow-sm transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Student Roster...</p>
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <GraduationCap className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-700">No Mentored Sections</h3>
                    <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">
                        You have not been assigned as a mentor for any sections yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {sections.map(section => {
                        const sectionStudents = filteredStudents.filter(s => s.section === section);
                        if (sectionStudents.length === 0) return null;

                        return (
                            <div key={section} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-cyan-50 flex items-center justify-center border border-cyan-100">
                                        <LayoutGrid className="h-4 w-4 text-cyan-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Section {section}</h3>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                        {sectionStudents.length} Students
                                    </span>
                                </div>

                                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-[2.5rem] w-32">Roll No</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Dept</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Sem / Batch</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tr-[2.5rem]">Contact</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {sectionStudents.map((student) => (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-5 text-sm font-bold text-slate-600 group-hover:text-cyan-600 transition-colors">
                                                            {student.rollNo}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                                                                    {student.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <span className="text-sm font-black text-slate-900 group-hover:text-cyan-900 transition-colors">
                                                                    {student.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                            {student.department}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-bold text-slate-700">Sem {student.semester}</span>
                                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{student.batch} Batch</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            {student.email ? (
                                                                <a href={`mailto:${student.email}`} className="text-xs font-medium text-slate-500 hover:text-cyan-600 transition-colors">
                                                                    {student.email}
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-slate-300 italic">No email provided</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
