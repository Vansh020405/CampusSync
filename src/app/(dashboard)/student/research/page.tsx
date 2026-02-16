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
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden rounded-b-[2.5rem] shadow-xl shadow-indigo-500/10 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700"></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>

                <div className="relative px-6 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                    <Sparkles className="mr-1.5 h-3 w-3 text-amber-300" />
                                    Research Hub
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                                Innovation & Discovery
                            </h1>
                            <p className="text-blue-100 font-medium max-w-xl text-sm leading-relaxed">
                                Collaborate on groundbreaking research, publish papers, and find expert mentorship from specialized faculty.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button className="bg-white text-indigo-600 hover:bg-blue-50 font-bold shadow-lg border-2 border-transparent hover:border-indigo-100 transition-all">
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Paper
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Tabs */}
            <Tabs defaultValue="opportunities" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl w-full md:w-auto grid grid-cols-2 md:inline-flex mb-6">
                    <TabsTrigger value="opportunities" className="rounded-lg font-bold text-xs px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
                        Research Opportunities
                    </TabsTrigger>
                    <TabsTrigger value="mentors" className="rounded-lg font-bold text-xs px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all">
                        Find Mentors
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="opportunities" className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search research topics, labs, or professors..."
                            className="pl-10 h-12 rounded-xl bg-white border-slate-200 focus-visible:ring-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-4">
                        {opportunities.map((op) => (
                            <Card key={op.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden cursor-pointer">
                                <CardContent className="p-0 flex flex-col md:flex-row">
                                    {/* Left Accent */}
                                    <div className={`w-full md:w-2 bg-gradient-to-b ${op.id % 2 === 0 ? 'from-purple-500 to-indigo-500' : 'from-blue-500 to-cyan-500'}`}></div>

                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <Badge variant="outline" className="mb-2 border-indigo-100 text-indigo-600 bg-indigo-50 font-bold text-[10px] tracking-wider uppercase">
                                                    {op.department}
                                                </Badge>
                                                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {op.title}
                                                </h3>
                                                <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> Mentor: {op.mentor}
                                                </p>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <p className="text-xs font-bold text-slate-400">Deadline</p>
                                                <p className="text-sm font-black text-slate-700">{op.deadline}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl mb-4">
                                            {op.description}
                                        </p>

                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex gap-2">
                                                {op.tags.map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-6 font-bold text-xs h-9 shadow-md group-hover:bg-indigo-600 transition-all">
                                                View & Apply <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="mentors" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mentors.map((mentor) => (
                            <Card key={mentor.id} className="border-none shadow-sm hover:shadow-lg transition-all bg-white rounded-2xl overflow-hidden group">
                                <CardContent className="p-6 text-center">
                                    <div className="h-20 w-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border-4 border-white shadow-sm">
                                        <Users className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900">{mentor.name}</h3>
                                    <p className="text-xs font-medium text-slate-500 mb-4">{mentor.role}</p>

                                    <div className="flex flex-wrap justify-center gap-1.5 mb-6 opacity-80">
                                        {mentor.expertise.map(exp => (
                                            <span key={exp} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                {exp}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold h-9 transition-colors">
                                            <MessageCircle className="mr-2 h-3.5 w-3.5" />
                                            Connect
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 rounded-xl text-xs font-bold h-9 hover:bg-slate-50">
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
