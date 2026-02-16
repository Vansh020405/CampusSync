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
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Premium Gradient Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2.5rem] shadow-xl shadow-indigo-500/10 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-700"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>

                <div className="relative px-6 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Live Recruitment
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                                In-Campus Internships
                            </h1>
                            <p className="text-indigo-100 font-medium max-w-lg">
                                Exclusive opportunities from top companies visiting the campus.
                                Filter by your skillset and apply instantly.
                            </p>
                        </div>

                        {/* Search Bar in Header */}
                        <div className="relative w-full md:w-80">
                            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl blur-sm transform translate-y-2"></div>
                            <div className="relative bg-white rounded-2xl p-1.5 flex items-center shadow-lg">
                                <Search className="h-5 w-5 text-slate-400 ml-3 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search role or company..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-400 px-3 py-2 outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Filter Bar */}
            <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-slate-200/50 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 shrink-0">
                        Filter by Skills:
                    </span>
                    <button
                        onClick={() => setSelectedSkill(null)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0",
                            !selectedSkill
                                ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        )}
                    >
                        All
                    </button>
                    {allSkills.map(skill => (
                        <button
                            key={skill}
                            onClick={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5",
                                selectedSkill === skill
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {skill}
                            {selectedSkill === skill && <X className="h-3 w-3" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Feed */}
            <div className="space-y-4 px-1">
                {filteredInternships.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No matches found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search query.</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => { setSearch(''); setSelectedSkill(null); }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredInternships.map(internship => (
                            <Card key={internship.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-[1.5rem] overflow-hidden relative">
                                {/* Hover Gradient Border Effect */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-100 rounded-[1.5rem] transition-all pointer-events-none"></div>

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl font-black text-slate-600 shadow-inner">
                                                {internship.company.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {internship.role}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                                    <p className="text-sm font-bold text-slate-500">{internship.company}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {internship.postedDate?.includes("hours") || internship.postedDate?.includes("Just") ? (
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-2 py-0.5 pt-1 text-[10px] uppercase tracking-wider">
                                                New
                                            </Badge>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {internship.postedDate}
                                            </span>
                                        )}
                                    </div>

                                    {/* Skills Tags */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {internship.skills?.map(skill => (
                                            <span
                                                key={skill}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border",
                                                    selectedSkill === skill
                                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                        : "bg-slate-50 text-slate-500 border-slate-100"
                                                )}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <DollarSign className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Stipend</p>
                                                <p className="text-xs font-bold">{internship.stipend}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <MapPin className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location</p>
                                                <p className="text-xs font-bold">{internship.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Duration</p>
                                                <p className="text-xs font-bold">6 Months</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Briefcase className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Type</p>
                                                <p className="text-xs font-bold">{internship.mode}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group-hover:shadow-indigo-200 group-hover:bg-indigo-600 group-hover:translate-y-[-2px]">
                                        View Details & Apply
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
