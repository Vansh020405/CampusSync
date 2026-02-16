'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Calendar, Clock, CheckCircle2, XCircle,
    MessageSquare, MapPin, Search, Mail, Trash2, RefreshCcw,
    Activity, Filter, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function FacultyBookingsPage() {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
    const [searchText, setSearchText] = useState("");
    const [approvalForm, setApprovalForm] = useState({
        slotTime: "",
        slotDate: new Date().toISOString().split('T')[0],
        location: "Cabin",
        replyMessage: ""
    });
    const [status, setStatus] = useState("AVAILABLE");
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [bookRes, statusRes] = await Promise.all([
                fetch('/api/bookings'),
                fetch('/api/faculty/status')
            ]);
            const bookData = await bookRes.json();
            const statusData = await statusRes.json();

            if (Array.isArray(bookData)) setBookings(bookData);
            if (statusData.status) setStatus(statusData.status);

            if (silent) {
                toast({
                    title: "Sync Complete",
                    description: "Interface synchronized with hub.",
                    className: "bg-slate-900 text-white border-slate-700"
                });
            }
        } catch (error) {
            console.error("Fetch error", error);
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Connection to campus hub failed.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => fetchData(true);

    const handleUpdateStatus = async (newStatus: string) => {
        const oldStatus = status;
        setStatus(newStatus);
        try {
            const res = await fetch('/api/faculty/status', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed");
            toast({
                title: "Status Broadcasted",
                description: `Broadcast set to ${newStatus.replace('_', ' ')}.`,
                className: "bg-indigo-600 text-white border-none shadow-xl"
            });
        } catch (e) {
            setStatus(oldStatus);
            toast({
                variant: "destructive",
                title: "Sync Failed",
                description: "Status broadcast unsuccessful.",
            });
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: action,
                    slotTime: action === 'APPROVED' ? approvalForm.slotTime : null,
                    slotDate: action === 'APPROVED' ? approvalForm.slotDate : null,
                    location: action === 'APPROVED' ? approvalForm.location : null,
                    replyMessage: approvalForm.replyMessage
                })
            });

            if (!res.ok) throw new Error("Internal failure");

            toast({
                title: action === 'APPROVED' ? "Authorized" : "Declined",
                description: "Student record updated.",
                className: action === 'APPROVED' ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            });

            handleRefresh();
            setSelectedBooking(null);
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: "Operation failed." });
        }
    };

    const handleDeleteBooking = async (id: string) => {
        if (!confirm("Permanent purge from system?")) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Purged", description: "Record removed.", className: "bg-slate-900 text-white" });
                setBookings(prev => prev.filter(b => b.id !== id));
            }
        } catch (error) {
            toast({ variant: "destructive", title: "System Error" });
        }
    };

    const currentBookings = bookings.filter(b => {
        const matchesTab = activeTab === "all" || b.status.toLowerCase() === activeTab;
        const matchesSearch = !searchText ||
            b.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
            b.message?.toLowerCase().includes(searchText.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Professional Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-4 w-4 text-indigo-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Management Panel</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Faculty Inflow</h1>
                            <p className="text-xs font-bold text-slate-500">Processing <span className="text-indigo-600">{bookings.filter(b => b.status === 'PENDING').length} pending</span> student engagements.</p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-slate-200 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                        >
                            <RefreshCcw className={cn("h-3.5 w-3.5 text-slate-400", isLoading && "animate-spin")} />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Status & Filters */}
                    <aside className="lg:col-span-3 space-y-6">
                        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Your Status</p>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-xs",
                                                status === 'AVAILABLE' ? "bg-emerald-500 shadow-lg shadow-emerald-200" :
                                                    status === 'ON_LEAVE' ? "bg-rose-500 shadow-lg shadow-rose-200" : "bg-amber-500 shadow-lg shadow-amber-200"
                                            )}>
                                                {status[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900">{status.replace('_', ' ')}</h3>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Hub Status</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'AVAILABLE', label: 'Available', color: 'emerald' },
                                            { id: 'NOT_AVAILABLE', label: 'Busy', color: 'amber' },
                                            { id: 'ON_LEAVE', label: 'On Leave', color: 'rose' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => handleUpdateStatus(s.id)}
                                                className={cn(
                                                    "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-3",
                                                    status === s.id
                                                        ? `bg-${s.color}-600 border-${s.color}-600 text-white shadow-md`
                                                        : `border-slate-100 text-slate-400 hover:bg-${s.color}-50 hover:text-${s.color}-600 hover:border-${s.color}-100`
                                                )}
                                            >
                                                <div className={cn("h-1.5 w-1.5 rounded-full", status === s.id ? "bg-white" : `bg-${s.color}-500`)} />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FILTER</span>
                                        <Filter className="h-3 w-3 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        {['pending', 'approved', 'completed', 'all'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    activeTab === tab ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                                )}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Feed Section */}
                    <main className="lg:col-span-9 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter transmissions..."
                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:ring-0 outline-none transition-all shadow-sm"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            {currentBookings.length > 0 ? (
                                currentBookings.map((booking) => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        isExpanded={selectedBooking === booking.id}
                                        onExpand={setSelectedBooking}
                                        onAction={handleBookingAction}
                                        onDelete={handleDeleteBooking}
                                        form={approvalForm}
                                        setForm={setApprovalForm}
                                    />
                                ))
                            ) : (
                                <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <Mail className="h-8 w-8 text-slate-200 mx-auto mb-4" />
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">No Conversations</p>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">No student request data found.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

function BookingCard({ booking, isExpanded, onExpand, onAction, onDelete, form, setForm }: any) {
    const isMessage = booking.agendaType === 'DOUBT';
    const StatusIcon = booking.status === 'APPROVED' ? CheckCircle2 : booking.status === 'REJECTED' ? XCircle : Clock;

    return (
        <Card className={cn(
            "border-none shadow-sm rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md",
            isExpanded && "ring-1 ring-indigo-500"
        )}>
            <CardContent className="p-0">
                <div className="p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0",
                                isMessage ? "bg-indigo-600" : "bg-emerald-600"
                            )}>
                                {(booking.studentName || "S").split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black text-sm text-slate-900 truncate tracking-tight">{booking.studentName}</h4>
                                    <Badge className={cn(
                                        "h-5 px-2 rounded-full border-none text-[8px] font-black uppercase tracking-widest",
                                        booking.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                                            booking.status === 'REJECTED' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                    )}>
                                        <StatusIcon className="h-2.5 w-2.5" />
                                        {booking.status}
                                    </Badge>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{booking.studentRollNo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                            <button
                                onClick={() => onDelete(booking.id)}
                                className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="flex items-center justify-between mb-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-3 w-3 text-indigo-400" />
                                Student Message
                            </div>
                            <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                            "{booking.message}"
                        </p>
                    </div>

                    {booking.status === 'APPROVED' && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-white border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="text-xs font-black text-slate-900">{booking.slotDate ? new Date(booking.slotDate).toLocaleDateString() : 'TBD'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                                <p className="text-xs font-black text-slate-900">{booking.slotTime || 'TBD'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Location</p>
                                <p className="text-xs font-black text-slate-900 truncate">{booking.location || 'TBD'}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3">
                        {booking.status === "PENDING" && (
                            <>
                                {isExpanded ? (
                                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300 bg-slate-50/30 p-6 rounded-2xl border border-slate-100/30">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Date</label>
                                                <Input
                                                    type="date"
                                                    value={form.slotDate}
                                                    onChange={(e) => setForm({ ...form, slotDate: e.target.value })}
                                                    className="h-12 rounded-xl font-bold bg-white text-xs border-slate-200"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Time</label>
                                                <Input
                                                    type="time"
                                                    value={form.slotTime}
                                                    onChange={(e) => setForm({ ...form, slotTime: e.target.value })}
                                                    className="h-12 rounded-xl font-bold bg-white text-xs border-slate-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty Feedback</label>
                                            <Textarea
                                                value={form.replyMessage}
                                                onChange={(e) => setForm({ ...form, replyMessage: e.target.value })}
                                                placeholder="Enter response protocols..."
                                                className="min-h-[100px] rounded-xl font-bold bg-white text-xs p-5 resize-none border-slate-200"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                onClick={() => onAction(booking.id, 'APPROVED')}
                                                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Confirm Authorization
                                            </Button>
                                            <Button
                                                onClick={() => onExpand(null)}
                                                variant="outline"
                                                className="px-6 h-12 rounded-xl text-slate-400 font-bold text-xs"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button
                                            className="flex-1 h-14 bg-slate-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-95 shadow-lg group"
                                            onClick={() => onExpand(booking.id)}
                                        >
                                            <span>Process Request</span>
                                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-14 px-8 rounded-[1.25rem] border-rose-100 text-rose-500 font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all hover:border-rose-200"
                                            onClick={() => onAction(booking.id, 'REJECTED')}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
