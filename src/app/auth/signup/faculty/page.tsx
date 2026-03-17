'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, ArrowRight, User, Fingerprint, MapPin, Mail, Lock, Plus, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { signIn } from "next-auth/react";

export default function FacultySignupPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        facultyId: "",
        departments: [] as string[],
        office: "",
        subjects: [] as string[],
        email: "",
        password: ""
    });

    const [departmentInput, setDepartmentInput] = useState("");

    const [subjectInput, setSubjectInput] = useState("");
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
                    department: formData.departments,
                    subjects: formData.subjects,
                    sectionsTeaching: [],
                    cabinLocation: formData.office
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

    const addDepartment = () => {
        if (departmentInput && !formData.departments.includes(departmentInput)) {
            setFormData({ ...formData, departments: [...formData.departments, departmentInput] });
            setDepartmentInput("");
        }
    };

    const removeSubject = (s: string) => setFormData({ ...formData, subjects: formData.subjects.filter(i => i !== s) });
    const removeDepartment = (d: string) => setFormData({ ...formData, departments: formData.departments.filter(i => i !== d) });

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="h-24 w-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black tracking-tight">Faculty Sign Up</h1>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Create Faculty Account</p>
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

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Add Departments</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                placeholder="e.g. Computer Science"
                                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                                value={departmentInput}
                                                onChange={(e) => setDepartmentInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addDepartment();
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={addDepartment}
                                            className="rounded-xl px-4 bg-slate-900 text-white hover:bg-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5 transition-all"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {["CSE", "ECE", "ME", "CE", "CSE AI ML", "DS", "IOT"].map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => {
                                                    if (!formData.departments.includes(d)) {
                                                        setFormData({ ...formData, departments: [...formData.departments, d] });
                                                    }
                                                }}
                                                className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors"
                                            >
                                                + {d}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2 min-h-[20px]">
                                        {formData.departments.length > 0 ? formData.departments.map(d => (
                                            <Badge key={d} className="bg-slate-100 text-slate-700 border-none rounded-lg px-2 py-1 flex items-center gap-1 group transition-all">
                                                <span className="text-[9px] font-black uppercase tracking-tight">{d}</span>
                                                <X className="h-2.5 w-2.5 cursor-pointer opacity-50 group-hover:opacity-100" onClick={() => removeDepartment(d)} />
                                            </Badge>
                                        )) : (
                                            <p className="text-[9px] font-bold text-slate-300 italic">No departments added yet</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
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
                                        <Label className="text-[10px] font-black uppercase text-slate-400">BATCH</Label>
                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                            {["Morning", "Evening"].map((batch) => (
                                                <button
                                                    key={batch}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, office: batch })}
                                                    className={cn(
                                                        "flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                        formData.office === batch
                                                            ? "bg-white text-emerald-600 shadow-sm"
                                                            : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    {batch}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400">Add Subjects</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter subject name..."
                                                className="h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-emerald-500"
                                                value={subjectInput}
                                                onChange={(e) => setSubjectInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addSubject();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={addSubject}
                                                className="rounded-xl px-4 bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/10 transition-all"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-2 min-h-[20px]">
                                            {formData.subjects.length > 0 ? formData.subjects.map(s => (
                                                <Badge key={s} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none rounded-lg px-2 py-1 flex items-center gap-1 group transition-all">
                                                    <span className="text-[9px] font-black uppercase tracking-tight">{s}</span>
                                                    <X className="h-2.5 w-2.5 cursor-pointer opacity-50 group-hover:opacity-100" onClick={() => removeSubject(s)} />
                                                </Badge>
                                            )) : (
                                                <p className="text-[9px] font-bold text-slate-300 italic">No subjects added yet</p>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                <Button
                                    type="button"
                                    className="w-full h-12 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-6 shadow-xl shadow-emerald-600/10 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                                    onClick={handleNext}
                                    disabled={!formData.name || formData.subjects.length === 0 || formData.departments.length === 0}
                                >
                                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">College Email</Label>
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
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
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
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Account Summary</p>
                                    <p className="text-xs font-bold text-slate-700">Your Account Details</p>
                                    {formData.departments.length > 0 && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            Depts: <span className="text-slate-600 font-black">{formData.departments.join(', ')}</span>
                                        </p>
                                    )}
                                    {formData.subjects.length > 0 && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            Teaching: <span className="text-slate-600 font-black">{formData.subjects.join(', ')}</span>
                                        </p>
                                    )}
                                    <p className="text-[9px] text-slate-400 leading-relaxed">You can manage attendance and send messages for these groups.</p>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button variant="ghost" type="button" onClick={handleBack} className="flex-1 h-12 rounded-2xl font-bold text-slate-400" disabled={isLoading}>Back</Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                                        disabled={isLoading || !formData.password}
                                    >
                                        {isLoading ? "Signing Up..." : "Sign Up"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-50">
                        <Link href="/" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest transition-colors">
                            Already have an account? Log In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
