'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User, Mail, Fingerprint, MapPin, Building,
    ShieldCheck, Calendar, BookOpen, ChevronLeft,
    Edit2, Save, X, Plus, Loader2, Users
} from "lucide-react";
import Link from 'next/link';

export default function FacultyProfile() {
    const { data: session, update } = useSession();
    const user = session?.user as any;

    const [isEditing, setIsEditing] = useState(false);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [newSubject, setNewSubject] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.subjects) {
            try {
                const parsed = typeof user.subjects === 'string'
                    ? JSON.parse(user.subjects)
                    : user.subjects;
                setSubjects(Array.isArray(parsed) ? parsed : [user.subjects]);
            } catch (e) {
                setSubjects(user.subjects.split(',').map((s: string) => s.trim()));
            }
        }
    }, [user?.subjects]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch('/api/faculty/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects })
            });

            if (res.ok) {
                await update({ ...session, user: { ...user, subjects: JSON.stringify(subjects) } });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Save profile error:", error);
        } finally {
            setSaving(false);
        }
    };

    const addSubject = () => {
        if (newSubject.trim()) {
            setSubjects([...subjects, newSubject.trim().toUpperCase()]);
            setNewSubject("");
        }
    };

    const removeSubject = (index: number) => {
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    if (!session) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 mt-4 px-4 overflow-x-hidden md:px-0 font-sans min-h-screen bg-white dark:bg-background">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <Link href="/faculty">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-card shadow-sm border border-slate-100 dark:border-border transition-all">
                            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-muted-foreground" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase  mt-1">Faculty Identity</h1>
                </div>
                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-slate-900 dark:bg-primary text-white dark:text-primary-foreground rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 dark:hover:bg-primary/90 transition-all  h-10"
                    >
                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                        Modify Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                            className="rounded-2xl px-4 font-black text-[10px] uppercase tracking-widest dark:text-muted-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={saving}
                            onClick={handleSave}
                            className="bg-emerald-600 text-white rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all  h-10"
                        >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                            Commit
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <Card className="border-none shadow-2xl bg-white dark:bg-card rounded-[2.5rem] overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-emerald-600/20 dark:to-teal-700/20 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="h-32 w-32 rounded-[2rem] bg-white dark:bg-muted p-2 shadow-xl shadow-slate-900/10 dark:shadow-black/20 border-4 border-white dark:border-card">
                            <div className="h-full w-full rounded-[1.5rem] bg-slate-100 dark:bg-background flex items-center justify-center">
                                <User className="h-16 w-16 text-slate-300 dark:text-muted-foreground/30" />
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-20 px-4 md:px-8 pb-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight truncate uppercase ">Prof. {user?.name}</h2>
                            <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60 ">Institutional Faculty</p>
                        </div>
                        <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-4 py-1.5 rounded-xl font-black text-[10px] hidden sm:flex shrink-0 uppercase tracking-widest  opacity-70">
                            Verified Creds
                        </Badge>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-muted/50 border border-slate-100 dark:border-border transition-all">
                                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-muted shadow-sm flex items-center justify-center shrink-0">
                                    <Fingerprint className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60">Faculty ID</p>
                                    <p className="font-bold text-slate-700 dark:text-foreground mt-1 truncate">{user?.facultyId || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-muted/50 border border-slate-100 dark:border-border transition-all">
                                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-muted shadow-sm flex items-center justify-center shrink-0">
                                    <Building className="h-5 w-5 text-teal-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60">Department</p>
                                    <p className="font-bold text-slate-700 dark:text-foreground mt-1 truncate">{user?.department || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-muted/50 border border-slate-100 dark:border-border transition-all">
                                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-muted shadow-sm flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-rose-500" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60">Cabin Location</p>
                                    <p className="font-bold text-slate-700 dark:text-foreground mt-1">{user?.cabinLocation || "Block A-302"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-muted/50 border border-slate-100 dark:border-border transition-all">
                                <div className="h-10 w-10 rounded-2xl bg-white dark:bg-muted shadow-sm flex items-center justify-center shrink-0 border border-slate-100 dark:border-border">
                                    <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-muted-foreground" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest opacity-60">Role Clearance</p>
                                    <p className="font-bold text-slate-700 dark:text-foreground mt-1">Faculty Master</p>
                                </div>
                            </div>

                            {/* Mentorship Identity Card - Professional Version */}
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-900 dark:bg-muted text-white md:col-span-2 shadow-lg shadow-slate-900/10 transition-transform active:scale-[0.99] border dark:border-border">
                                <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 dark:border-border">
                                    <Users className="h-5 w-5 text-white dark:text-primary" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">Section Mentorship</p>
                                    <div className="mt-2 text-white">
                                        <p className="text-xs font-black uppercase  tracking-widest">Institutional Mentor</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 opacity-60 ">Assigned by System Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Teaching Assignment</h3>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                    placeholder="Enter subject name..."
                                    className="flex-1 bg-slate-50 dark:bg-muted border border-slate-200 dark:border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground/30 transition-all focus:border-indigo-500/30"
                                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                                />
                                <Button onClick={addSubject} size="sm" className="bg-teal-600 rounded-xl">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {subjects.length > 0 ? subjects.map((subject, idx) => (
                                <Badge key={idx} className="bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground hover:bg-slate-200 dark:hover:bg-muted/80 transition-all border-none px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-2 group shadow-sm">
                                    {subject}
                                    {isEditing && (
                                        <X
                                            className="h-3 w-3 cursor-pointer hover:text-rose-500 transition-colors"
                                            onClick={() => removeSubject(idx)}
                                        />
                                    )}
                                </Badge>
                            )) : (
                                <p className="text-slate-400 text-[10px] font-bold ">No subjects assigned</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="h-32 w-32" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Institutional Dashboard</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Academic Master Controls</p>
                    </div>
                    <Link href="/faculty">
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-900 transition-all">
                            <ChevronLeft className="h-6 w-6 rotate-180" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
