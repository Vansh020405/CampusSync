'use client';

import { useState } from 'react';
import { useStore } from "@/lib/store";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search, MapPin, Clock, Building2, Briefcase,
    DollarSign, ArrowRight, Sparkles, X
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function InternshipsPage() {
    const { internships } = useStore();
    const [search, setSearch] = useState('');
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    // ongoing: Extract unique skills from all internships
    const allSkills = Array.from(new Set(internships.flatMap(i => i.skills || [])));

    const filteredInternships = internships.filter(internship => {
        const matchesSearch =
            internship.role.toLowerCase().includes(search.toLowerCase()) ||
            internship.company.toLowerCase().includes(search.toLowerCase());

        const matchesSkill = selectedSkill
            ? internship.skills?.includes(selectedSkill)
            : true;

        return matchesSearch && matchesSkill;
    });

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-700">
            {/* Premium Gradient Header - Optimized for Mobile */}
            <div className="relative -mx-3 -mt-3 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2rem] md:rounded-b-[3rem] shadow-xl shadow-indigo-500/10 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>

                <div className="relative px-5 py-8 md:px-10 md:py-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Recruitment Active
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
                                    In-Campus <br className="sm:hidden" /> Internships
                                </h1>
                                <p className="text-indigo-100 font-bold text-sm md:text-base max-w-lg opacity-90 leading-relaxed">
                                    Exclusive opportunities from premium partners.
                                    Filter by your expertise and apply instantly.
                                </p>
                            </div>
                        </div>

                        {/* Search Bar in Header - Enhanced for Mobile */}
                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] transform translate-y-1 transition-transform group-focus-within:translate-y-2"></div>
                            <div className="relative bg-white/95 backdrop-blur-xl rounded-[1.5rem] p-1.5 flex items-center shadow-2xl border border-white/20">
                                <Search className="h-5 w-5 text-indigo-400 ml-4 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search role, company or skill..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-800 placeholder:text-slate-400 px-4 py-3 outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Filter Bar - Improved Scroll & Sticky */}
            <div className="sticky top-[64px] md:top-[80px] z-30 bg-slate-50/80 backdrop-blur-xl py-4 -mx-3 px-3 border-b border-slate-200/40 mb-2">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-2 px-1 py-1 rounded-2xl bg-white border border-slate-200/50 shadow-sm shrink-0">
                        <button
                            onClick={() => setSelectedSkill(null)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                !selectedSkill
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            All
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {allSkills.map(skill => (
                            <button
                                key={skill}
                                onClick={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-2",
                                    selectedSkill === skill
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                        : "bg-white text-slate-500 border-slate-200/60 hover:border-slate-300"
                                )}
                            >
                                {skill}
                                {selectedSkill === skill && <X className="h-3 w-3" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            <div className="space-y-6">
                {filteredInternships.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-sm transition-all hover:border-indigo-100">
                        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No results matched</h3>
                        <p className="text-slate-400 font-bold text-sm mt-2 max-w-xs mx-auto">Try broadening your search or resetting the skill filters.</p>
                        <Button
                            variant="outline"
                            className="mt-8 rounded-2xl border-2 px-8 font-black text-xs uppercase tracking-widest hover:bg-slate-50"
                            onClick={() => { setSearch(''); setSelectedSkill(null); }}
                        >
                            Reset Console
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredInternships.map(internship => (
                            <Card key={internship.id} className="group border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white rounded-[2rem] overflow-hidden relative">
                                {/* Applied Status or New Badge */}
                                <div className="absolute top-6 right-6 z-10">
                                    {internship.postedDate?.includes("hours") || internship.postedDate?.includes("Just") ? (
                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-3 py-1 text-[9px] uppercase tracking-widest rounded-full">
                                            New
                                        </Badge>
                                    ) : (
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                            {internship.postedDate}
                                        </span>
                                    )}
                                </div>

                                <CardContent className="p-6 md:p-8">
                                    <div className="flex flex-col gap-6">
                                        {/* Company & Role Header */}
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100/50 flex items-center justify-center text-2xl font-black text-slate-800 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                {internship.company.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="pt-1 pr-12"> {/* Padding right to avoid overlapping the badge */}
                                                <h3 className="font-black text-xl md:text-2xl text-slate-900 leading-[1.1] tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {internship.role}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center">
                                                        <Building2 className="h-3 w-3 text-indigo-500" />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-500 tracking-tight">{internship.company}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills Tags - Responsive Layout */}
                                        <div className="flex flex-wrap gap-2">
                                            {internship.skills?.map(skill => (
                                                <span
                                                    key={skill}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                                                        selectedSkill === skill
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                                                            : "bg-slate-50/50 text-slate-400 border-slate-100 group-hover:border-slate-200"
                                                    )}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Info Grid - Stacked on tiny mobile, 2 columns on others */}
                                        <div className="grid grid-cols-2 gap-3 md:gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-100 group-hover:bg-white group-hover:border-indigo-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Stipend</p>
                                                    <p className="text-[11px] md:text-xs font-black text-slate-700">{internship.stipend}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-green-500 transition-colors">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Location</p>
                                                    <p className="text-[11px] md:text-xs font-black text-slate-700 truncate max-w-[80px] md:max-w-none">{internship.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-amber-500 transition-colors">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Duration</p>
                                                    <p className="text-[11px] md:text-xs font-black text-slate-700">6 Months</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-2xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Type</p>
                                                    <p className="text-[11px] md:text-xs font-black text-slate-700">{internship.mode}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button className="w-full h-14 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 group-hover:shadow-indigo-200 group-hover:bg-indigo-600 group-hover:scale-[1.02] active:scale-95">
                                            Analyze Opportunity
                                            <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
