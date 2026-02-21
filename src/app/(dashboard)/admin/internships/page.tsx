'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Calendar } from 'lucide-react';

export default function AdminInternships() {
    const [internships, setInternships] = useState<any[]>([]);
    const [view, setView] = useState<'list' | 'create'>('list');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch internships on load
    const fetchInternships = async () => {
        setIsLoading(true);
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

    useEffect(() => {
        fetchInternships();
    }, []);

    // Form state
    const [form, setForm] = useState({
        company: '',
        role: '',
        stipend: '',
        location: '',
        mode: 'Onsite',
        deadline: '',
        eligibilityCgpa: 0,
        branchesAllowed: '',
        description: '',
        applyLink: '',
        skills: ''
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/internships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                alert("Internship Posted Successfully!");
                fetchInternships();
                setView('list');
                setForm({
                    company: '',
                    role: '',
                    stipend: '',
                    location: '',
                    mode: 'Onsite',
                    deadline: '',
                    eligibilityCgpa: 0,
                    branchesAllowed: '',
                    description: '',
                    applyLink: '',
                    skills: ''
                });
            } else {
                alert("Failed to post internship.");
            }
        } catch (err) {
            console.error(err);
            alert("Error posting internship.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this?")) return;
        try {
            const res = await fetch(`/api/internships?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchInternships();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (view === 'create') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Post Vacancy</h2>
                        <p className="text-slate-500 font-bold text-sm">Create a new opportunity for the campus.</p>
                    </div>
                    <Button variant="outline" onClick={() => setView('list')} className="rounded-2xl border-2 font-black text-xs uppercase tracking-widest px-6">
                        Discard
                    </Button>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <CardTitle className="text-lg font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Opportunity Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Company Entity</label>
                                    <Input
                                        required
                                        placeholder="e.g. Google Cloud"
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-indigo-500 transition-all font-bold"
                                        value={form.company}
                                        onChange={e => setForm({ ...form, company: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Designation</label>
                                    <Input
                                        required
                                        placeholder="e.g. Frontend Engineer"
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-indigo-500 transition-all font-bold"
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Compensation (Stipend)</label>
                                    <Input
                                        required
                                        placeholder="e.g. ₹50k/month"
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-indigo-500 transition-all font-bold"
                                        value={form.stipend}
                                        onChange={e => setForm({ ...form, stipend: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Office Location</label>
                                    <Input
                                        required
                                        placeholder="e.g. Bangalore, KA"
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-indigo-500 transition-all font-bold"
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Operating Mode</label>
                                    <Select
                                        value={form.mode}
                                        onValueChange={(val) => setForm({ ...form, mode: val })}
                                    >
                                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                                            <SelectItem value="Remote" className="rounded-xl font-bold">Remote</SelectItem>
                                            <SelectItem value="Onsite" className="rounded-xl font-bold">Onsite</SelectItem>
                                            <SelectItem value="Hybrid" className="rounded-xl font-bold">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Application Deadline</label>
                                    <Input
                                        type="date"
                                        required
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                                        value={form.deadline}
                                        onChange={e => setForm({ ...form, deadline: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Minimum CGPA Requirement</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                                        value={form.eligibilityCgpa}
                                        onChange={e => setForm({ ...form, eligibilityCgpa: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Departments</label>
                                    <Input
                                        placeholder="e.g. CSE, ECE, IT"
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold text-indigo-600"
                                        value={form.branchesAllowed}
                                        onChange={e => setForm({ ...form, branchesAllowed: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Comprehensive Description</label>
                                <Textarea
                                    className="min-h-[150px] rounded-[2rem] border-slate-100 bg-slate-50/30 focus:bg-white p-6 font-bold leading-relaxed transition-all"
                                    required
                                    placeholder="Outline role responsibilities and expectations..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Key Skillsets Needed</label>
                                <Input
                                    placeholder="React, AWS, Python, System Design..."
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold"
                                    value={form.skills}
                                    onChange={e => setForm({ ...form, skills: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">External Application Portal (Optional)</label>
                                <Input
                                    type="url"
                                    placeholder="https://company.com/apply"
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white font-bold text-indigo-600"
                                    value={form.applyLink}
                                    onChange={e => setForm({ ...form, applyLink: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl hover:shadow-indigo-200" disabled={isLoading}>
                                {isLoading ? "Synchronizing..." : "Authorize & Post Opportunity"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Internship Management</h2>
                    <p className="text-slate-500 font-bold">Manage and monitor corporate internship vacancies.</p>
                </div>
                <Button onClick={() => setView('create')} className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-3">
                    <Plus className="h-5 w-5" /> Add New Role
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.length === 0 && !isLoading && (
                    <div className="col-span-full py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No Active Postings Found</h3>
                    </div>
                )}

                {internships.map((internship) => (
                    <Card key={internship.id} className="group border-none shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden flex flex-col h-full border-t-4 border-t-transparent hover:border-t-indigo-500">
                        <CardContent className="p-8 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-800 shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {internship.company.substring(0, 2).toUpperCase()}
                                </div>
                                <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black px-3 py-1 text-[9px] uppercase tracking-widest border-none transition-colors">
                                    {internship.mode}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-8 flex-grow">
                                <h3 className="font-black text-xl text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{internship.role}</h3>
                                <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                    {internship.company}
                                </p>
                            </div>

                            <div className="space-y-4 p-5 rounded-3xl bg-slate-50 group-hover:bg-slate-100/50 transition-colors border border-slate-100 mb-8">
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Location</span>
                                    <span className="text-slate-900">{internship.location}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <span>CTC/Stipend</span>
                                    <span className="text-indigo-600">{internship.stipend}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Deadline</span>
                                    <span className="text-rose-500 flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(internship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-auto pt-2">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-all">
                                    <Edit2 className="h-4 w-4 mr-2" /> Modify
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="h-12 w-12 rounded-xl border-none shadow-lg shadow-rose-100 flex items-center justify-center p-0 transition-all hover:scale-105"
                                    onClick={() => handleDelete(internship.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
