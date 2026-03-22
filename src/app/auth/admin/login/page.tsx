'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/Logo";

export default function AdminLoginPage() {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        position: '',
        department: '',
        subjects: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('admin-credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: "Access Denied",
                    description: "Invalid login details.",
                    variant: "destructive",
                });
            } else {
                router.push('/admin/dashboard');
                toast({
                    title: "Success",
                    description: "Logged in successfully. Redirecting...",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/signup/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Account Created",
                    description: "Admin account created. Please log in.",
                });
                setActiveTab('login');
                setUsername(formData.username);
            } else {
                toast({
                    title: "Registration Failed",
                    description: data.error || "Could not create admin account.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to connect.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] relative overflow-hidden font-sans selection:bg-slate-900 selection:text-white">
            {/* Minimal Geometric Background */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50"></div>

            <div className="w-full max-w-md px-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col items-center mb-10 space-y-4">
                    <BrandLogo size={48} withText />
                    <div className="h-0.5 w-8 bg-slate-900/5 rounded-full" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] text-center">Admin Login</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100/50 p-1 rounded-[1.5rem] border border-slate-100 mb-6 mx-4">
                    <button
                        onClick={() => setActiveTab('login')}
                        className={cn(
                            "flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            activeTab === 'login' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-500"
                        )}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setActiveTab('signup')}
                        className={cn(
                            "flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                            activeTab === 'signup' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-500"
                        )}
                    >
                        Sign Up
                    </button>
                </div>

                <Card className="border-[0.5px] border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4 text-center">
                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
                            {activeTab === 'login' ? "Admin Login" : "Admin Sign Up"}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs font-medium">
                            {activeTab === 'login' ? "Enter your details to log in" : "Create a new admin account"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 pt-4">
                        {activeTab === 'login' ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">Username</Label>
                                    <div className="relative group">
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="admin_id"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="h-14 bg-slate-50/50 border-none rounded-2xl focus-visible:ring-slate-900 font-bold placeholder:text-slate-200 transition-all group-hover:bg-slate-50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-slate-400">Password</Label>
                                        <Lock className="h-3 w-3 text-slate-200" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 bg-slate-50/50 border-none rounded-2xl focus-visible:ring-slate-900 font-bold placeholder:text-slate-200 transition-all group-hover:bg-slate-50"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Validating...
                                        </>
                                    ) : (
                                        <>
                                            Log In <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-1">Full Name</Label>
                                        <Input
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900 font-bold text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-1">Username</Label>
                                        <Input
                                            placeholder="adm_101"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900 font-bold text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-1">Position</Label>
                                        <Input
                                            placeholder="System Admin"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900 font-bold text-xs"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-1">Department</Label>
                                        <Input
                                            placeholder="IT Division"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900 font-bold text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-1">Primary Subjects (Optional)</Label>
                                    <Input
                                        placeholder="Database Mgmt, Networks"
                                        value={formData.subjects}
                                        onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                                        className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900 font-bold text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-1">Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="h-12 bg-slate-50/50 border-none rounded-xl focus-visible:ring-slate-900 font-bold text-xs"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] mt-4"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing Up..." : "Sign Up"}
                                </Button>
                            </form>
                        )}

                        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                CampusSync Â© 2026
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Indicator */}
                <div className="mt-8 flex justify-center gap-4 opacity-40">
                    <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">System Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


