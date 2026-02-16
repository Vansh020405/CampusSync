'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, User, Lock, ArrowRight, Building2, Globe, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminSignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        confirmPassword: ""
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Admin core registered successfully");
                router.push("/admin/dashboard");
            } else {
                toast.error(data.error || "Signup failed");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
            <Card className="max-w-md w-full border border-slate-100 shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Shield className="h-24 w-24" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 hover:text-white transition-colors">
                            <ChevronLeft className="h-3 w-3" /> Dashboard
                        </Link>
                        <h1 className="text-3xl font-black tracking-tighter uppercase">Admin Provision</h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Node Setup • Level 4 Access</p>
                    </div>
                </div>

                <CardContent className="p-10 space-y-8">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Administrator Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        required
                                        placeholder="Enter full name"
                                        className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm focus-visible:ring-slate-900 transition-all placeholder:text-slate-300"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">System Username</Label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        required
                                        placeholder="Unique network handle"
                                        className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm focus-visible:ring-slate-900 transition-all placeholder:text-slate-300"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Security Token</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <Input
                                            required
                                            type="password"
                                            placeholder="Create password"
                                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm focus-visible:ring-slate-900 transition-all placeholder:text-slate-300"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Verify Token</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <Input
                                            required
                                            type="password"
                                            placeholder="Repeat password"
                                            className="pl-12 h-12 rounded-xl bg-slate-50 border-none font-bold text-sm focus-visible:ring-slate-900 transition-all placeholder:text-slate-300"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isLoading ? "Provisioning..." : "Authorize Administrative Node"}
                            {!isLoading && <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="pt-8 border-t border-slate-50 text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-relaxed px-4">
                            This action will create a new institutional root account with global management permissions.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
