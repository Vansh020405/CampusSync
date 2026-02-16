'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Plus, Calendar } from 'lucide-react';

export default function AdminInternships() {
    const { internships, addInternship } = useStore();
    const [view, setView] = useState<'list' | 'create'>('list');

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
        applyLink: ''
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addInternship({
            ...form,
            branchesAllowed: form.branchesAllowed.split(',').map(s => s.trim()),
            eligibilityCgpa: Number(form.eligibilityCgpa)
        });
        setView('list');
        alert("Internship Posted!");
        setForm({ ...form, company: '', role: '', description: '' }); // Reset partial
    };

    if (view === 'create') {
        return (
            <div className="space-y-4">
                <Button variant="outline" onClick={() => setView('list')} className="mb-4">
                    Back to List
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Post New Internship</CardTitle>
                        <CardDescription>Enter details below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Job Role</label>
                                    <Input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stipend</label>
                                    <Input required placeholder="e.g. ₹50k/month" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Work Mode</label>
                                    <Select
                                        value={form.mode}
                                        onValueChange={(val) => setForm({ ...form, mode: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="Onsite">Onsite</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deadline</label>
                                    <Input type="date" required value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Min CGPA</label>
                                    <Input type="number" step="0.1" required value={form.eligibilityCgpa} onChange={e => setForm({ ...form, eligibilityCgpa: parseFloat(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Branches (comma separated)</label>
                                    <Input placeholder="CSE, ECE, ME" value={form.branchesAllowed} onChange={e => setForm({ ...form, branchesAllowed: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Description</label>
                                <Textarea className="min-h-[100px]" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Application Link/Email</label>
                                <Input type="url" placeholder="https://..." value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full">Post Internship</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Internships</h2>
                <Button onClick={() => setView('create')}>
                    <Plus className="mr-2 h-4 w-4" /> Post New
                </Button>
            </div>

            <div className="grid gap-4">
                {internships.map((internship) => (
                    <Card key={internship.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold">{internship.role}</h3>
                            <p className="text-sm text-muted-foreground">{internship.company} • {internship.location}</p>
                            <div className="flex gap-2 text-xs">
                                <Badge variant="outline">{internship.mode}</Badge>
                                <span className="flex items-center text-muted-foreground">
                                    <Calendar className="mr-1 h-3 w-3" /> {new Date(internship.deadline).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
