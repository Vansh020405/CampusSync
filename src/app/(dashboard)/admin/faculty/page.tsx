'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search, User, Mail, GraduationCap,
    ChevronLeft, Sparkles, Building2, MapPin,
    Phone, MoreHorizontal, ShieldCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface FacultyMember {
    id: string;
    facultyId: string;
    name: string;
    department: string;
    email: string;
    cabin: string;
    status: string;
    subjects: string[];
    sections: string[];
}

export default function FacultyDirectory() {
    const [faculty, setFaculty] = useState<FacultyMember[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const res = await fetch('/api/faculty/list');
                const data = await res.json();
                setFaculty(data);
            } catch (error) {
                console.error("Error loading faculty:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    const filteredFaculty = faculty.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facultyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-32 px-6 py-12 bg-white min-h-screen font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors mb-2 group"
                    >
                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Admin Hub
                    </Link>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                        Faculty Directory
                    </h1>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, ID, or subject..."
                        className="pl-12 h-12 rounded-2xl bg-slate-50 border-none font-bold text-xs uppercase tracking-tight shadow-sm focus-visible:ring-slate-900 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Matrix Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-48 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
                    ))
                ) : filteredFaculty.length > 0 ? (
                    filteredFaculty.map((member) => (
                        <div
                            key={member.id}
                            className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 flex flex-col justify-between h-64 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    member.status === 'AVAILABLE' ? "bg-emerald-500" : "bg-amber-500"
                                )} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs font-black uppercase shadow-inner">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                                {member.name}
                                            </h3>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tight">
                                            #{member.facultyId}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold uppercase tracking-tight">
                                        <Building2 className="h-3 w-3 text-slate-400" /> {member.department}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold lowercase">
                                        <Mail className="h-3 w-3 text-slate-400" /> {member.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold uppercase tracking-tighter">
                                        <MapPin className="h-3 w-3 text-slate-400" /> {member.cabin || "N/A"}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1 opacity-80">
                                    {member.subjects.slice(0, 3).map((sub, i) => (
                                        <span key={i} className="text-[8px] font-black bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-lg uppercase">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teaching</span>
                                    <span className="text-[11px] font-black text-slate-900 uppercase">
                                        {member.sections.length > 0 ? member.sections.join(' • ') : "Pending"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center space-y-4">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Search className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No Personnel Found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
