'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowRight, User, Hash, School, BookOpen, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

export default function StudentSignupPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        rollNo: "",
        section: "",
        department: "CSE",
        year: "3",
        email: "",
        password: "",
        confirmPassword: "",
        batch: "Morning"
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSignup = async () => {
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup/student", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    semester: formData.year // Use the input field value
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Signup failed");
            }

            // Success - Sign in automatically and redirect to dashboard
            const loginRes = await signIn("student-credentials", {
                rollNo: formData.rollNo,
                password: formData.password as string,
                redirect: false
            });

            if (loginRes?.ok) {
                window.location.href = "/home";
            } else {
                window.location.href = "/?registered=true";
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <GraduationCap className="h-24 w-24 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black tracking-tight">Student Sign Up</h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Create Student Account</p>
                    </div>
                </div>

                <CardContent className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 mb-8">
                        <div className={cn("h-1 flex-1 rounded-full", step >= 1 ? "bg-slate-900" : "bg-slate-100")} />
                        <div className={cn("h-1 flex-1 rounded-full", step >= 2 ? "bg-slate-900" : "bg-slate-100")} />
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (step === 1) handleNext(); else handleSignup(); }}>
                        {step === 1 ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Full name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            placeholder="Enter your full name"
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400">Roll Number</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                placeholder="e.g. 23-4G2-01"
                                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                                value={formData.rollNo}
                                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400">Section</Label>
                                        <div className="relative">
                                            <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                placeholder="e.g. 4G2"
                                                className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                                value={formData.section}
                                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Department</Label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap gap-1">
                                        {["CSE", "ECE", "ME", "CE", "CSE AI ML", "DS", "IOT"].map((dept) => (
                                            <button
                                                key={dept}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, department: dept })}
                                                className={cn(
                                                    "px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    formData.department === dept
                                                        ? "bg-white text-slate-900 shadow-sm"
                                                        : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Semester</Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            type="number"
                                            min="1"
                                            max="8"
                                            placeholder="e.g. 3"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                        />
                                    </div>
                                </div>


                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">BATCH</Label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        {["Morning", "Evening"].map((batch) => (
                                            <button
                                                key={batch}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, batch })}
                                                className={cn(
                                                    "flex-1 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    formData.batch === batch
                                                        ? "bg-white text-slate-900 shadow-sm"
                                                        : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {batch}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    className="w-full h-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4"
                                    onClick={handleNext}
                                    disabled={!formData.name || !formData.rollNo || !formData.section}
                                >
                                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Email (Optional)</Label>
                                    <Input
                                        type="email"
                                        placeholder="rahul@student.edu"
                                        className="h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            type="password"
                                            placeholder="Create password"
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            type="password"
                                            placeholder="Repeat password"
                                            className="pl-10 h-10 rounded-xl bg-slate-50 border-none focus-visible:ring-slate-900"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button variant="ghost" type="button" onClick={handleBack} className="flex-1 h-12 rounded-2xl font-bold text-slate-400" disabled={isLoading}>Back</Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                                        disabled={isLoading || !formData.password || formData.password !== formData.confirmPassword}
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
            </Card >
        </div >
    );
}
