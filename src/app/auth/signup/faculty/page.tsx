'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, ArrowRight, User, Fingerprint, MapPin, Mail, Lock, Plus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { signIn } from "next-auth/react";

export default function FacultySignupPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        facultyId: "",
        department: "Computer Science",
        cabin: "",
        subjects: [] as string[],
        sections: [] as string[],
        email: "",
        password: ""
    });

    const [subjectInput, setSubjectInput] = useState("");
    const [sectionInput, setSectionInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSignup = async () => {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup/faculty", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    subjects: formData.subjects,
                    sectionsTeaching: formData.sections,
                    cabinLocation: formData.cabin
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Signup failed");
            }

            // Success - Sign in automatically and redirect to dashboard
            const loginRes = await signIn("faculty-credentials", {
                facultyId: formData.facultyId,
                password: formData.password as string,
                redirect: false
            });

            if (loginRes?.ok) {
                window.location.href = "/faculty";
            } else {
                window.location.href = "/?registered=true";
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const addSubject = () => {
        if (subjectInput && !formData.subjects.includes(subjectInput)) {
            setFormData({ ...formData, subjects: [...formData.subjects, subjectInput] });
            setSubjectInput("");
        }
    };

    const addSection = () => {
        if (sectionInput && !formData.sections.includes(sectionInput)) {
            setFormData({ ...formData, sections: [...formData.sections, sectionInput] });
            setSectionInput("");
        }
    };

    const removeSubject = (s: string) => setFormData({ ...formData, subjects: formData.subjects.filter(i => i !== s) });
    const removeSection = (s: string) => setFormData({ ...formData, sections: formData.sections.filter(i => i !== s) });

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="h-24 w-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black tracking-tight">Faculty Onboarding</h1>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Management Access Control</p>
                    </div>
                </div>

                <CardContent className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 mb-8">
                        <div className={cn("h-1 flex-1 rounded-full", step >= 1 ? "bg-emerald-600" : "bg-emerald-50")} />
                        <div className={cn("h-1 flex-1 rounded-full", step >= 2 ? "bg-emerald-600" : "bg-emerald-50")} />
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (step === 2) handleSignup(); }}>
                        {step === 1 ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Full name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            placeholder="e.g. Dr. Jane Doe"
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400">Faculty ID</Label>
                                        <div className="relative">
                                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                placeholder="Unique ID"
                                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                                value={formData.facultyId}
                                                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400">Cabin Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                placeholder="e.g. Block A-301"
                                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                                value={formData.cabin}
                                                onChange={(e) => setFormData({ ...formData, cabin: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Add Subjects</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. DBMS"
                                            className="h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                            value={subjectInput}
                                            onChange={(e) => setSubjectInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                                        />
                                        <Button type="button" size="icon" onClick={addSubject} className="rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.subjects.map(s => (
                                            <Badge key={s} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none rounded-lg px-2 flex items-center gap-1">
                                                {s} <X className="h-3 w-3 cursor-pointer" onClick={() => removeSubject(s)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Assigned Sections</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. 4G2"
                                            className="h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                            value={sectionInput}
                                            onChange={(e) => setSectionInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addSection()}
                                        />
                                        <Button type="button" size="icon" onClick={addSection} className="rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.sections.map(s => (
                                            <Badge key={s} className="bg-slate-900 text-white border-none rounded-lg px-2 flex items-center gap-1">
                                                {s} <X className="h-3 w-3 cursor-pointer" onClick={() => removeSection(s)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    className="w-full h-12 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4"
                                    onClick={handleNext}
                                    disabled={!formData.name || formData.subjects.length === 0}
                                >
                                    Credential Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Institutional Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            type="email"
                                            placeholder="jane.doe@campus.edu"
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Faculty Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            type="password"
                                            placeholder="Create password"
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 p-4 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Onboarding Summary</p>
                                    <p className="text-xs font-bold text-slate-700">Linking Profile to <span className="text-emerald-600">{formData.sections.join(', ')}</span></p>
                                    <p className="text-[9px] text-slate-400 leading-relaxed">Once approved, you will be able to manage attendance and broadcast messages to these specific groups.</p>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button variant="ghost" type="button" onClick={handleBack} className="flex-1 h-12 rounded-2xl font-bold text-slate-400" disabled={isLoading}>Back</Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                                        disabled={isLoading || !formData.password}
                                    >
                                        {isLoading ? "Registering..." : "Register Prof."}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50">
                        <Link href="/" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest transition-colors">
                            Returning Faculty? Sign in here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
