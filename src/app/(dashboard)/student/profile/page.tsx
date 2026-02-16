'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    User, Mail, Hash, School, ShieldCheck,
    Calendar, MapPin, GraduationCap, ChevronLeft,
    Save, Edit2, Loader2, CheckCircle2
} from "lucide-react";
import Link from 'next/link';
import { toast } from "sonner";

export default function StudentProfile() {
    const { data: session, update } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        section: "",
        department: "",
        email: "",
        semester: ""
    });

    useEffect(() => {
        if (session?.user) {
            const user = session.user as any;
            setFormData({
                name: user.name || "",
                rollNo: user.rollNo || "",
                section: user.section || "",
                department: user.department || "",
                email: user.email || "",
                semester: user.semester || ""
            });
        }
    }, [session]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/student/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("Profile updated successfully");
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        ...formData
                    }
                });
                setIsEditing(false);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 mt-4 px-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                    <Link href="/home">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100 h-10 w-10">
                            <ChevronLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
                </div>
                {!isEditing ? (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2"
                    >
                        <Edit2 className="h-3 w-3" /> Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsEditing(false)}
                            className="rounded-2xl font-bold text-xs uppercase tracking-widest h-10 px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest h-10 px-6 gap-2"
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="h-32 bg-slate-900 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-900/10">
                            <div className="h-full w-full rounded-[1.5rem] bg-slate-50 flex items-center justify-center border border-slate-100">
                                <User className="h-16 w-16 text-slate-200" />
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-20 px-8 pb-8">
                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Full Identity Name</p>
                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm tracking-tight focus-visible:ring-indigo-500"
                                />
                            ) : (
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{formData.name}</h2>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Institutional Roll</p>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input
                                            value={formData.rollNo}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm disabled:opacity-100 disabled:bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Section</p>
                                    <div className="relative group">
                                        <School className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input
                                            value={formData.section}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm disabled:opacity-100 disabled:bg-slate-50/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Communication Matrix</p>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input
                                            value={formData.email}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm disabled:opacity-100 disabled:bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Core Department</p>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        <Input
                                            value={formData.department}
                                            disabled={!isEditing}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm disabled:opacity-100 disabled:bg-slate-50/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verification Status</p>
                                        <p className="text-sm font-bold text-indigo-900">Institutional Identity Verified</p>
                                    </div>
                                </div>
                                <Badge className="bg-white text-indigo-600 font-bold border-none shadow-sm h-8 px-4 rounded-lg">LVL 4 SECURE</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <GraduationCap className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Academic Passport</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">ID Proof • Academic Session 2024-25</p>
                    <div className="mt-10 flex items-center gap-6">
                        <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center p-2">
                            <div className="h-full w-full bg-slate-950 rounded-lg"></div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight leading-relaxed max-w-[220px]">This ID is cryptographically signed and used for secure campus resource access.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
