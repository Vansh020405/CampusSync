'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Search, MapPin, Clock, Building2, Briefcase,
    DollarSign, ArrowRight, X, FileText, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function InternshipsPage() {
    const [internships, setInternships] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    useEffect(() => {
        const fetchInternships = async () => {
            try {
                const res = await fetch('/api/internships');
                const data = await res.json();
                if (Array.isArray(data)) setInternships(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInternships();
    }, []);

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

    if (isLoading) {
        return (
            <div className="flex flex-col h-[70vh] w-full items-center justify-center gap-4 animate-in fade-in duration-500">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Data</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-700">
            {/* Premium Header with Dynamic Mesh Gradient */}
            <div className="relative -mx-3 -mt-3 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2.5rem] shadow-lg shadow-indigo-500/10 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"></div>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#4338ca_0,transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative px-5 py-6 md:px-10 md:py-16">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-emerald-400 animate-ping"></div>
                                <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-xl px-2 py-0.5 font-black text-[8px] uppercase tracking-widest">
                                    Recruitment Live
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase  mt-0.5">
                                    In-Campus <span className="text-indigo-400">Opportunities</span>
                                </h1>
                                <p className="text-slate-400 font-bold text-[10px] md:text-sm max-w-lg opacity-70 uppercase tracking-widest leading-relaxed mt-1">
                                    Exclusive roles from premium partners.
                                </p>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <Link href="/student/applications" className="w-full sm:w-auto">
                                <Button className="w-full h-10 md:h-12 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl font-black uppercase tracking-widest text-[8px] md:text-[9px] rounded-xl shadow-xl transition-all active:scale-95">
                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                    Active Pipeline
                                </Button>
                            </Link>

                            <div className="relative w-full sm:w-72 group">
                                <div className="relative bg-white/5 backdrop-blur-2xl rounded-xl p-1 flex items-center shadow-xl border border-white/10 group-focus-within:border-white/20 transition-all">
                                    <Search className="ml-3 h-3.5 w-3.5 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search protocol..."
                                        className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest w-full px-3 py-1.5"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button onClick={() => setSearch('')} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 transition-all mr-1">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Filter Bar - Improved Scroll & Sticky */}
            <div className="sticky top-[64px] md:top-[80px] z-30 bg-slate-50/80 dark:bg-background/80 backdrop-blur-xl py-4 -mx-3 px-3 border-b border-slate-200/40 dark:border-border/40 mb-2">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center gap-2 px-1 py-1 rounded-2xl bg-white dark:bg-card border border-slate-200/50 dark:border-border/50 shadow-sm shrink-0">
                        <button
                            onClick={() => setSelectedSkill(null)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                !selectedSkill
                                    ? "bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground shadow-lg shadow-slate-200 dark:shadow-none"
                                    : "text-slate-400 dark:text-muted-foreground hover:text-slate-600 dark:hover:text-foreground"
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
                                        ? "bg-indigo-600 dark:bg-primary text-white dark:text-primary-foreground border-indigo-600 dark:border-primary shadow-lg shadow-indigo-100 dark:shadow-none"
                                        : "bg-white dark:bg-card text-slate-500 dark:text-muted-foreground border-slate-200/60 dark:border-border hover:border-slate-300 dark:hover:border-muted-foreground"
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
                    <div className="text-center py-24 bg-white dark:bg-card rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-border shadow-sm transition-all hover:border-indigo-100">
                        <div className="h-20 w-20 bg-slate-50 dark:bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                            <Search className="h-10 w-10 text-slate-200 dark:text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-foreground uppercase tracking-tight">No results matched</h3>
                        <p className="text-slate-400 dark:text-muted-foreground font-bold text-sm mt-2 max-w-xs mx-auto">Try broadening your search or resetting the skill filters.</p>
                        <Button
                            variant="outline"
                            className="mt-8 rounded-2xl border-2 px-8 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-muted"
                            onClick={() => { setSearch(''); setSelectedSkill(null); }}
                        >
                            Reset Console
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredInternships.map(internship => (
                            <Card key={internship.id} className="group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white dark:bg-card rounded-2xl overflow-hidden relative border dark:border-border">
                                {/* Applied Status or New Badge */}
                                <div className="absolute top-3 right-3 z-10">
                                    {internship.postedDate?.includes("hours") || internship.postedDate?.includes("Just") || (internship.createdAt && new Date(internship.createdAt).getTime() > Date.now() - 86400000) ? (
                                        <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/30 font-black px-2 py-0.5 text-[7px] md:text-[8px] uppercase tracking-widest rounded-full">
                                            New
                                        </Badge>
                                    ) : (
                                        <span className="text-[7px] md:text-[8px] font-black text-slate-300 dark:text-muted-foreground uppercase tracking-[0.2em]">
                                            {internship.postedDate || (internship.createdAt && new Date(internship.createdAt).toLocaleDateString())}
                                        </span>
                                    )}
                                </div>

                                <CardContent className="p-4 md:p-6">
                                    <div className="flex flex-col gap-4 md:gap-5">
                                        {/* Company & Role Header */}
                                        <div className="flex items-start gap-3 md:gap-4">
                                            <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-muted dark:to-muted/50 border border-slate-100/50 dark:border-border flex items-center justify-center text-lg md:text-xl font-black text-slate-800 dark:text-foreground shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                {internship.company.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="pt-0.5 pr-8 md:pr-10">
                                                <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-foreground leading-tight tracking-tight uppercase  group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors">
                                                    {internship.role}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Building2 className="h-2.5 w-2.5 text-slate-400" />
                                                    <p className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">{internship.company}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills Tags - Responsive Layout */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {internship.skills?.map((skill: string) => (
                                                <span
                                                    key={skill}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                        selectedSkill === skill
                                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                                                            : "bg-slate-50/50 dark:bg-muted/50 text-slate-400 border-slate-100 dark:border-border"
                                                    )}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50/50 dark:bg-muted/30 border border-slate-100 dark:border-border group-hover:bg-white dark:group-hover:bg-card transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-white dark:bg-muted flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0">
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[7px] font-black text-slate-300 dark:text-muted-foreground uppercase tracking-widest truncate">Stipend</p>
                                                    <p className="text-[9px] font-black text-slate-600 dark:text-foreground truncate">{internship.stipend}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-white dark:bg-muted flex items-center justify-center shadow-sm text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[7px] font-black text-slate-300 dark:text-muted-foreground uppercase tracking-widest truncate">Location</p>
                                                    <p className="text-[9px] font-black text-slate-600 dark:text-foreground truncate">{internship.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-white dark:bg-muted flex items-center justify-center shadow-sm text-slate-400 group-hover:text-amber-500 transition-colors shrink-0">
                                                    <Clock className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[7px] font-black text-slate-300 dark:text-muted-foreground uppercase tracking-widest truncate">Duration</p>
                                                    <p className="text-[9px] font-black text-slate-600 dark:text-foreground truncate">6 Months</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-white dark:bg-muted flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
                                                    <Briefcase className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[7px] font-black text-slate-300 dark:text-muted-foreground uppercase tracking-widest truncate">Type</p>
                                                    <p className="text-[9px] font-black text-slate-600 dark:text-foreground truncate">{internship.mode}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button className="w-full h-10 md:h-12 bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-primary/90 transition-all shadow-xl shadow-slate-100 dark:shadow-none active:scale-95">
                                            Apply Protocol
                                            <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
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
