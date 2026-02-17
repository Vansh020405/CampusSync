'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Users, ShieldAlert } from "lucide-react";

export default function ExamPlannerPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exam Planner</h1>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manage Institutional Examination Schedules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-rose-50 border-b border-rose-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Calendar className="h-5 w-5 text-rose-500" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-rose-900">Schedule Management</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                            Draft and finalize examination dates, slots and venues for the upcoming academic session.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <Users className="h-5 w-5 text-indigo-500" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-900">Invigilation Duty</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                            Assign faculty members to examination rooms and manage duty swap requests.
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-amber-50 border-b border-amber-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <ShieldAlert className="h-5 w-5 text-amber-500" />
                            </div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-amber-900">Seating Plans</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                            Generate automated seating arrangements to ensure academic integrity and social distancing.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Initialization Pending</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">The Exam Planning module is currently being configured for the new session.</p>
            </div>
        </div>
    );
}
