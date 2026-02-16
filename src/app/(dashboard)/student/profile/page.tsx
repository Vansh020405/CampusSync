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
        <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-700">
            <div className="mb-12">
                <h1 className="text-4xl font-normal text-slate-800 tracking-tight mb-2">Account</h1>
                <p className="text-slate-400 text-sm font-light">Manage your institutional identity and preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-white rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Personal Details</label>

                            <div className="grid gap-4">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[14px]"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[14px]"
                                        placeholder="University Email"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Institutional Data</label>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <Hash className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={formData.rollNo}
                                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[14px]"
                                        placeholder="Roll Number"
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <Layers className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[14px]"
                                        placeholder="Section"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <Book className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[14px]"
                                        placeholder="Department"
                                    />
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <Input
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        className="pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-[14px]"
                                        placeholder="Semester"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {message && (
                    <div className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300",
                        message.type === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                    )}>
                        {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : null}
                        <p className="text-[13px] font-medium">{message.text}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-14 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-[15px] transition-all shadow-xl shadow-slate-200"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Archiving Changes...
                        </>
                    ) : (
                        "Save Profile"
                    )}
                </Button>
            </form>
        </div>
    );
}
