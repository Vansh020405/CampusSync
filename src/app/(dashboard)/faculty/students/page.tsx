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
        <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500 font-sans mt-4 px-4 min-h-screen bg-white dark:bg-background">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-border transition-all">
                <div className="flex items-center gap-5 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted rounded-2xl h-12 w-12 border-slate-200 dark:border-border shadow-sm shrink-0 transition-all"
                        onClick={() => router.push('/faculty/menu')}
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-muted-foreground" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight leading-none uppercase  mt-1">Section Roster</h2>
                        <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2  opacity-80">
                            <Users className="h-3 w-3" /> {students.length} Mentored Units Assigned
                        </p>
                    </div>
                </div>
                <div className="w-full md:max-w-md relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 dark:text-muted-foreground group-focus-within:text-cyan-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by identity, roll or section..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl text-[13px] font-black text-slate-700 dark:text-foreground placeholder:opacity-40 uppercase tracking-tight focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 shadow-sm transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Student Roster...</p>
                </div>
            ) : sections.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 dark:bg-muted/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-border transition-all">
                    <div className="h-16 w-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-border">
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
                                    <div className="h-8 w-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20">
                                        <LayoutGrid className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-foreground tracking-tight uppercase  mt-0.5">Section {section}</h3>
                                    <span className="bg-slate-100 dark:bg-muted text-slate-500 dark:text-muted-foreground text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest  opacity-70">
                                        {sectionStudents.length} Mentored Units
                                    </span>
                                </div>

                                <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-[2.5rem] bg-white dark:bg-card overflow-hidden transition-all">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-slate-50/80 dark:bg-muted/30 border-b border-slate-100 dark:border-border">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] rounded-tl-[2.5rem] w-32 ">Roll Identity</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Full Name</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] w-32 ">Dept</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] w-32 ">Phase / Batch</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] rounded-tr-[2.5rem] ">Transmission</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-border/50">
                                                {sectionStudents.map((student) => (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-muted/50 transition-colors group">
                                                        <td className="px-8 py-5 text-sm font-black text-slate-600 dark:text-muted-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors uppercase ">
                                                            {student.rollNo}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase ">
                                                                    {student.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <span className="text-sm font-black text-slate-900 dark:text-foreground group-hover:text-cyan-900 dark:group-hover:text-cyan-200 transition-colors uppercase  truncate">
                                                                    {student.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase tracking-widest  opacity-60">
                                                            {student.department}
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-black text-slate-700 dark:text-foreground uppercase  tracking-tighter">Phase {student.semester}</span>
                                                                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-muted-foreground tracking-widest  opacity-60">{student.batch} Batch</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            {student.email ? (
                                                                <a href={`mailto:${student.email}`} className="text-[10px] font-black text-slate-500 dark:text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors uppercase tracking-tight  opacity-70 underline underline-offset-2">
                                                                    {student.email}
                                                                </a>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-300 dark:text-muted-foreground opacity-30  uppercase">No email provided</span>
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
