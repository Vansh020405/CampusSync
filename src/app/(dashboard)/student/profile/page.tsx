'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Hash, Book, Layers, GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNo: '',
        section: '',
        department: '',
        semester: ''
    });

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                email: session.user.email || '',
                rollNo: (session.user as any).rollNo || '',
                section: (session.user as any).section || '',
                department: (session.user as any).department || '',
                semester: (session.user as any).semester || ''
            });
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/student/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated. Please re-login to see changes.' });
                // We could potentially call update() if supported by the provider
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-32 pt-6 px-4 animate-in fade-in duration-700">
            <header className="px-2 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase">Profile</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage your institutional digital identity</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-0 dark:border dark:border-border rounded-[2.5rem] bg-white dark:bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                    <CardContent className="p-8 md:p-10 space-y-8">
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground ml-1">Personal Baseline</h2>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-muted-foreground ml-1 uppercase tracking-widest">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="pl-11 h-14 rounded-2xl border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/30 focus:bg-white dark:focus:bg-muted transition-all text-sm font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                     <label className="text-[11px] font-black text-slate-500 dark:text-muted-foreground ml-1 uppercase tracking-widest">University Email</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="pl-11 h-14 rounded-2xl border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/30 focus:bg-white dark:focus:bg-muted transition-all text-sm font-bold"
                                            placeholder="john.doe@university.edu"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground ml-1">Institutional Data</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-muted-foreground ml-1 uppercase tracking-widest">Roll Number</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <Hash className="h-4 w-4" />
                                        </div>
                                        <Input
                                            value={formData.rollNo}
                                            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                            className="pl-11 h-14 rounded-2xl border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/30 focus:bg-white dark:focus:bg-muted transition-all text-sm font-bold"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-muted-foreground ml-1 uppercase tracking-widest">Section</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <Input
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                            className="pl-11 h-14 rounded-2xl border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/30 focus:bg-white dark:focus:bg-muted transition-all text-sm font-bold"
                                            placeholder="A"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-muted-foreground ml-1 uppercase tracking-widest">Department</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <Book className="h-4 w-4" />
                                        </div>
                                        <Input
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="pl-11 h-14 rounded-2xl border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/30 focus:bg-white dark:focus:bg-muted transition-all text-sm font-bold"
                                            placeholder="Computer Science"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-muted-foreground ml-1 uppercase tracking-widest">Semester</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                            <GraduationCap className="h-4 w-4" />
                                        </div>
                                        <Input
                                            value={formData.semester}
                                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                            className="pl-11 h-14 rounded-2xl border-slate-100 dark:border-border bg-slate-50/50 dark:bg-muted/30 focus:bg-white dark:focus:bg-muted transition-all text-sm font-bold"
                                            placeholder="VI"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {message && (
                    <div className={cn(
                        "p-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500",
                        message.type === 'success' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100/50 dark:border-rose-500/20"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : null}
                        <p className="text-sm font-bold tracking-tight">{message.text}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-16 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Synchronizing...
                        </>
                    ) : (
                        "Update Identity"
                    )}
                </Button>
            </form>
        </div>
    );
}
