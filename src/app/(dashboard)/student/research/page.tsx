'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Search, FileText, Users, Calendar, Upload, Sparkles,
    BookOpen, Award, ExternalLink, ChevronRight, UserPlus,
    MessageCircle
} from "lucide-react"

export default function ResearchPage() {
    const [search, setSearch] = useState('');

    const opportunities = [
        {
            id: 1,
            title: "AI for Sustainability",
            mentor: "Dr. Anjali Gupta",
            department: "Computer Science",
            description: "Looking for students to work on optimizing energy consumption using deep reinforcement learning.",
            tags: ["Machine Learning", "Python", "Sustainability"],
            positions: 2,
            deadline: "Mar 20, 2026",
            image: "bg-emerald-100 text-emerald-600"
        },
        {
            id: 2,
            title: "Quantum Cryptography",
            mentor: "Prof. Rajesh Kumar",
            department: "Mathematics",
            description: "Research on post-quantum cryptographic algorithms. Strong mathematical background required.",
            tags: ["Cryptography", "Math", "Algorithms"],
            positions: 1,
            deadline: "Mar 25, 2026",
            image: "bg-purple-100 text-purple-600"
        }
    ];

    const mentors = [
        {
            id: 1,
            name: "Dr. Anjali Gupta",
            role: "Associate Professor, CSE",
            expertise: ["AI/ML", "Optimization"],
            available: true
        },
        {
            id: 2,
            name: "Prof. Rajesh Kumar",
            role: "Professor, Mathematics",
            expertise: ["Cryptography", "Number Theory"],
            available: false
        },
        {
            id: 3,
            name: "Dr. Sarah Khan",
            role: "Assistant Professor, ECE",
            expertise: ["Signal Processing", "IoT"],
            available: true
        }
    ];

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-5xl mx-auto">

            {/* Premium Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2.5rem] shadow-xl shadow-indigo-500/10 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 dark:from-card dark:via-card dark:to-card dark:border dark:border-border"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>

                <div className="relative px-5 py-8 md:px-10 md:py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                                    <Sparkles className="mr-1.5 h-3 w-3 text-amber-300" />
                                    Research Hub
                                </Badge>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2 uppercase">
                                Innovation Hub
                            </h1>
                            <p className="text-blue-100 font-bold max-w-xl text-xs leading-relaxed opacity-80">
                                Collaborate on groundbreaking research, publish papers, and find expert mentorship from specialized faculty.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button className="h-11 bg-white text-indigo-600 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest shadow-lg border-2 border-transparent hover:border-indigo-100 transition-all px-6 rounded-xl">
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Paper
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Tabs */}
            <Tabs defaultValue="opportunities" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-muted p-1 rounded-xl w-full md:w-auto grid grid-cols-2 md:inline-flex mb-6">
                    <TabsTrigger value="opportunities" className="rounded-lg font-black text-[10px] uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                        Opportunities
                    </TabsTrigger>
                    <TabsTrigger value="mentors" className="rounded-lg font-black text-[10px] uppercase tracking-widest px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap">
                        Mentors
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="opportunities" className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Filters: Topic, Lab, Professor..."
                            className="pl-11 h-12 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border font-bold text-xs focus-visible:ring-indigo-500 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-3">
                        {opportunities.map((op) => (
                            <Card key={op.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-card rounded-2xl overflow-hidden cursor-pointer dark:border dark:border-border">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    {/* Left Accent */}
                                    <div className={`w-full md:w-1.5 bg-gradient-to-b ${op.id % 2 === 0 ? 'from-purple-500 to-indigo-500' : 'from-blue-500 to-cyan-500'}`}></div>

                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <Badge variant="outline" className="mb-1.5 border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-black text-[8px] tracking-widest uppercase">
                                                    {op.department}
                                                </Badge>
                                                <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-foreground group-hover:text-indigo-600 dark:group-hover:text-primary transition-colors leading-tight">
                                                    {op.title}
                                                </h3>
                                                <p className="text-[10px] md:text-xs font-black text-slate-400 dark:text-muted-foreground mt-1 flex items-center gap-1 uppercase tracking-tight">
                                                    <Users className="h-2.5 w-2.5" /> Mentor: {op.mentor}
                                                </p>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs font-bold text-slate-400">Deadline</p>
                                                <p className="text-sm font-black text-slate-700">{op.deadline}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground leading-relaxed max-w-3xl mb-4">
                                            {op.description}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex gap-1.5">
                                                {op.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-muted text-slate-500 dark:text-muted-foreground text-[8px] md:text-[9px] font-black border border-slate-100 dark:border-border uppercase tracking-widest">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <Button size="sm" className="bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white dark:text-primary-foreground rounded-xl px-5 font-black text-[10px] uppercase tracking-widest h-10 shadow-md group-hover:bg-indigo-600 transition-all">
                                                Analyze <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="mentors" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mentors.map((mentor) => (
                            <Card key={mentor.id} className="border-none shadow-sm hover:shadow-lg transition-all bg-white dark:bg-card rounded-2xl overflow-hidden group border dark:border-border">
                                <CardContent className="p-5 text-center">
                                    <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-50 dark:bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border-2 border-white dark:border-border shadow-sm">
                                        <Users className="h-8 w-8 text-slate-300 dark:text-muted-foreground" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight">{mentor.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-muted-foreground mb-4 uppercase tracking-wider">{mentor.role}</p>

                                    <div className="flex flex-wrap justify-center gap-1 mb-6 opacity-80">
                                        {mentor.expertise.map(exp => (
                                            <span key={exp} className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20">
                                                {exp}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button className="flex-1 bg-slate-900 dark:bg-primary hover:bg-indigo-600 dark:hover:bg-primary/90 text-white dark:text-primary-foreground rounded-xl text-[9px] font-black uppercase tracking-widest h-10 transition-colors shadow-sm">
                                            <MessageCircle className="mr-2 h-3.5 w-3.5" />
                                            Connect
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-slate-200 dark:border-border text-slate-600 dark:text-muted-foreground rounded-xl text-[9px] font-black uppercase tracking-widest h-10 hover:bg-slate-50 dark:hover:bg-muted transition-colors">
                                            Profile
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
