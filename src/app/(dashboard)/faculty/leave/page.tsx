'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Plus,
    TrendingUp, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock leave data
const MOCK_LEAVES = [
    {
        id: 1,
        fromDate: "2026-02-20",
        toDate: "2026-02-21",
        reason: "Medical appointment",
        status: "APPROVED" as const,
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        days: 2
    },
    {
        id: 2,
        fromDate: "2026-03-05",
        toDate: "2026-03-07",
        reason: "Attending conference in Delhi",
        status: "PENDING" as const,
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        days: 3
    },
    {
        id: 3,
        fromDate: "2026-01-15",
        toDate: "2026-01-15",
        reason: "Personal work",
        status: "REJECTED" as const,
        appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        days: 1
    }
];

export default function FacultyLeavePage() {
    const [leaves, setLeaves] = useState(MOCK_LEAVES);
    const [showForm, setShowForm] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [reason, setReason] = useState("");

    const leaveStats = {
        totalAllowed: 15,
        taken: 12,
        pending: 3,
        remaining: 3
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const newLeave = {
            id: leaves.length + 1,
            fromDate,
            toDate,
            reason,
            status: "PENDING" as const,
            appliedAt: new Date(),
            days
        };

        setLeaves([newLeave, ...leaves]);
        setShowForm(false);
        setFromDate("");
        setToDate("");
        setReason("");
    };

    const getStatusBadge = (status: string) => {
        const configs = {
            PENDING: {
                label: "Pending",
                color: "bg-amber-100 text-amber-700 border-amber-200",
                icon: Clock
            },
            APPROVED: {
                label: "Approved",
                color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                icon: CheckCircle2
            },
            REJECTED: {
                label: "Rejected",
                color: "bg-red-100 text-red-700 border-red-200",
                icon: XCircle
            },
        };

        const config = configs[status as keyof typeof configs] || configs.PENDING;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={cn("text-[10px]", config.color)}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Leave Management</h1>
                            <p className="text-emerald-100 text-sm">Apply and track your leaves</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <Calendar className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] mb-1">Total</p>
                            <p className="text-xl font-bold text-white">{leaveStats.totalAllowed}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] mb-1">Taken</p>
                            <p className="text-xl font-bold text-white">{leaveStats.taken}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] mb-1">Pending</p>
                            <p className="text-xl font-bold text-white">{leaveStats.pending}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3">
                            <p className="text-emerald-100 text-[10px] mb-1">Left</p>
                            <p className="text-xl font-bold text-white">{leaveStats.remaining}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Balance Card */}
            <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium text-emerald-900">Leave Balance</p>
                            <p className="text-xs text-emerald-700">Academic Year 2025-26</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-700">{leaveStats.remaining}</p>
                            <p className="text-xs text-emerald-600">days remaining</p>
                        </div>
                    </div>
                    <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-600"
                            style={{ width: `${(leaveStats.remaining / leaveStats.totalAllowed) * 100}%` }}
                        ></div>
                    </div>
                </CardContent>
            </Card>

            {/* Apply Leave Button */}
            {!showForm && (
                <Button
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setShowForm(true)}
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Apply for Leave
                </Button>
            )}

            {/* Leave Application Form */}
            {showForm && (
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            New Leave Application
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="fromDate" className="text-sm">From Date</Label>
                                <input
                                    id="fromDate"
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="toDate" className="text-sm">To Date</Label>
                                <input
                                    id="toDate"
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    required
                                    min={fromDate}
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm mt-1.5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="reason" className="text-sm">Reason</Label>
                                <Textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please provide a reason for your leave..."
                                    required
                                    rows={4}
                                    className="mt-1.5"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Submit Application
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFromDate("");
                                        setToDate("");
                                        setReason("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Leave History */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 px-1">Leave History</h2>

                {leaves.map((leave) => (
                    <Card key={leave.id} className={cn(
                        "transition-all",
                        leave.status === "PENDING" && "border-amber-200 bg-amber-50/30",
                        leave.status === "APPROVED" && "border-emerald-200 bg-emerald-50/30",
                        leave.status === "REJECTED" && "border-red-200 bg-red-50/30"
                    )}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900">
                                            {new Date(leave.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            {leave.fromDate !== leave.toDate && (
                                                <> - {new Date(leave.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                            )}
                                        </h3>
                                        <Badge className="bg-slate-200 text-slate-700 text-[10px]">
                                            {leave.days} {leave.days === 1 ? 'day' : 'days'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        Applied {leave.appliedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                {getStatusBadge(leave.status)}
                            </div>

                            <div className="bg-white rounded-lg p-3">
                                <p className="text-xs font-medium text-slate-700 mb-1">Reason:</p>
                                <p className="text-sm text-slate-600">{leave.reason}</p>
                            </div>

                            {leave.status === "PENDING" && (
                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Cancel Request
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {leaves.length === 0 && (
                    <Card className="border-dashed border-2 border-slate-200">
                        <CardContent className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium mb-1">No leave applications</p>
                            <p className="text-sm text-slate-400">Click "Apply for Leave" to create one</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Leave Policy</p>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Apply at least 3 days in advance for planned leaves</li>
                                <li>• Medical leaves require certificate submission</li>
                                <li>• Maximum 3 consecutive days without prior approval</li>
                                <li>• Unused leaves don't carry forward</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
