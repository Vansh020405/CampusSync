'use client';

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User, Mail, Fingerprint, MapPin, Building,
    ShieldCheck, Calendar, BookOpen, ChevronLeft
} from "lucide-react";
import Link from 'next/link';

export default function FacultyProfile() {
    const { data: session } = useSession();
    const user = session?.user as any;

    if (!session) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500 mt-4">
            <div className="flex items-center gap-4 px-1">
                <Link href="/faculty">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100">
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Identity</h1>
            </div>

            {/* Profile Card */}
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 relative">
                    <div className="absolute -bottom-16 left-8">
                        <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-xl shadow-emerald-900/10">
                            <div className="h-full w-full rounded-[1.5rem] bg-slate-100 flex items-center justify-center">
                                <User className="h-16 w-16 text-slate-300" />
                            </div>
                        </div>
                    </div>
                </div>

                <CardContent className="pt-20 px-8 pb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Prof. {user?.name}</h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Faculty</p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-black text-[10px]">
                            VERIFIED CREDS
                        </Badge>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                    <Fingerprint className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty ID</p>
                                    <p className="font-bold text-slate-700 mt-1">{user?.facultyId || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                    <Building className="h-5 w-5 text-teal-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                                    <p className="font-bold text-slate-700 mt-1">{user?.department || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-rose-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cabin Location</p>
                                    <p className="font-bold text-slate-700 mt-1">Block A-302</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Clearance</p>
                                    <p className="font-bold text-slate-700 mt-1">Faculty Master</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Teaching Assignment</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">JAVA PROGRAMMING</Badge>
                            <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">DATA STRUCTURES</Badge>
                            <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-lg font-bold text-[10px]">DBMS</Badge>
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
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-900 transition-all">
                        <ChevronLeft className="h-6 w-6 rotate-180" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
