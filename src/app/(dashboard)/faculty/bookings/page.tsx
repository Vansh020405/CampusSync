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
    Activity, Filter, ChevronRight, ShieldCheck, User, Users
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
                    className: "bg-slate-900 dark:bg-card text-white dark:text-foreground border-slate-700 dark:border-border"
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
        <div className="min-h-screen bg-white dark:bg-background font-sans transition-colors animate-in fade-in duration-500">
            {/* Professional Header */}
            <div className="border-b border-slate-100 dark:border-border">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1 opacity-60">
                                <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ">Management Terminal</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tighter uppercase  leading-none">Office Presence</h1>
                            <p className="text-[10px] font-black text-slate-500 dark:text-muted-foreground/60 uppercase tracking-widest mt-1">
                                Controlling <span className="text-indigo-600 dark:text-indigo-400 font-black ">{bookings.filter(b => b.status === 'PENDING').length} Student Nodes</span> In Queue
                            </p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-slate-200 dark:border-border font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-muted transition-all active:scale-95 shadow-sm "
                        >
                            <RefreshCcw className={cn("h-3.5 w-3.5 text-slate-400 dark:text-muted-foreground", isLoading && "animate-spin")} />
                            <span>Synchronize Hub</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Status & Filters */}
                    <aside className="lg:col-span-3 space-y-6">
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/40 rounded-[2rem] bg-slate-50 dark:bg-card border border-slate-100 dark:border-border overflow-hidden p-6 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-4 opacity-60">
                                        <div className="h-4 w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
                                        <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Personnel Status</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white dark:bg-muted p-4 rounded-2xl border border-slate-100 dark:border-border shadow-sm">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-lg transition-all",
                                            status === 'AVAILABLE' ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" :
                                                status === 'ON_LEAVE' ? "bg-rose-500 shadow-lg shadow-rose-500/20" : "bg-amber-500 shadow-lg shadow-amber-500/20"
                                        )}>
                                            {status[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight  truncate">{status.replace('_', ' ')}</h3>
                                            <p className="text-[8px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest leading-none mt-1">Live Feed State</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { id: 'AVAILABLE', label: 'Online', color: 'emerald' },
                                        { id: 'NOT_AVAILABLE', label: 'Occupied', color: 'amber' },
                                        { id: 'ON_LEAVE', label: 'Offline', color: 'rose' }
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleUpdateStatus(s.id)}
                                            className={cn(
                                                "h-11 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-between group ",
                                                status === s.id
                                                    ? s.id === 'AVAILABLE' ? "bg-emerald-600 border-emerald-600 text-white shadow-xl scale-[1.02]" :
                                                      s.id === 'ON_LEAVE' ? "bg-rose-600 border-rose-600 text-white shadow-xl scale-[1.02]" :
                                                      "bg-amber-600 border-amber-600 text-white shadow-xl scale-[1.02]"
                                                    : "bg-white dark:bg-muted/50 border-slate-100 dark:border-border text-slate-400 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-1.5 w-1.5 rounded-full transition-all group-hover:scale-150", 
                                                    status === s.id ? "bg-white" : `bg-${s.color}-500`)} />
                                                <span>{s.label}</span>
                                            </div>
                                            {status === s.id && <ShieldCheck className="h-3.5 w-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-border space-y-4">
                                <div className="flex items-center justify-between opacity-60">
                                    <span className="text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">Filter Stream</span>
                                    <Filter className="h-3.5 w-3.5 text-slate-300 dark:text-muted-foreground" />
                                </div>
                                <div className="space-y-1.5">
                                    {['pending', 'approved', 'completed', 'all'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all  flex items-center justify-between",
                                                activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 dark:text-muted-foreground hover:text-slate-600 dark:hover:text-foreground hover:bg-white dark:hover:bg-muted"
                                            )}
                                        >
                                            <span>{tab}</span>
                                            {activeTab === tab && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Feed Section */}
                    <main className="lg:col-span-9 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search transmissions by identity or payload..."
                                className="w-full h-12 pl-11 pr-4 rounded-[1.5rem] border border-slate-100 dark:border-border bg-slate-50 dark:bg-muted/50 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-foreground placeholder:text-slate-300 dark:placeholder:text-muted-foreground/30 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-inner "
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
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
                                <div className="py-24 text-center bg-white dark:bg-card/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-border shadow-xl shadow-slate-200/20 mx-auto w-full px-8">
                                    <div className="h-16 w-16 bg-slate-50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <Mail className="h-8 w-8 text-slate-200 dark:text-muted-foreground/20" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">Terminal Buffer Empty</h3>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 mt-2 uppercase tracking-[0.3em]  max-w-sm mx-auto leading-relaxed">No student engagement requests detected in the current filter protocol.</p>
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
            "border-none shadow-xl shadow-slate-200/40 dark:shadow-black/20 rounded-[2rem] bg-white dark:bg-card overflow-hidden transition-all duration-500 hover:shadow-2xl border border-slate-50 dark:border-border/50",
            isExpanded && "ring-2 ring-indigo-500/50 dark:ring-indigo-500/30 -translate-y-1"
        )}>
            <CardContent className="p-0">
                <div className="p-5 md:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center text-base font-black text-white shadow-2xl shrink-0 transition-transform group-hover:rotate-6",
                                isMessage ? "bg-indigo-600 shadow-indigo-500/20" : "bg-emerald-600 shadow-emerald-500/20"
                            )}>
                                {(booking.studentName || "S").split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center flex-wrap gap-2 text-left">
                                    <h4 className="font-black text-base text-slate-900 dark:text-foreground truncate tracking-tight uppercase ">{booking.studentName}</h4>
                                    <Badge className={cn(
                                        "h-5 px-2 rounded-lg border border-transparent text-[8px] font-black uppercase tracking-widest  shadow-sm flex items-center gap-1.5",
                                        booking.status === 'APPROVED' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" :
                                            booking.status === 'REJECTED' ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20" : 
                                            "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
                                    )}>
                                        <StatusIcon className="h-2.5 w-2.5" />
                                        {booking.status}
                                    </Badge>
                                </div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest mt-1  opacity-60 bg-slate-50 dark:bg-muted/50 px-2 py-0.5 rounded-md w-max">ID: {booking.studentRollNo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end self-start md:self-center">
                            <button
                                onClick={() => onDelete(booking.id)}
                                className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-muted/50 text-slate-400 dark:text-muted-foreground/40 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all flex items-center justify-center shadow-inner hover:shadow-rose-500/50 hover:rotate-6"
                            >
                                <Trash2 className="h-4.5 w-4.5" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 p-6 rounded-[1.5rem] bg-slate-50 dark:bg-muted/20 border border-slate-100 dark:border-border transition-all relative">
                        <div className="absolute top-4 right-6 opacity-30">
                            <MessageSquare className="h-8 w-8 text-indigo-400/20" />
                        </div>
                        <div className="flex items-center justify-between mb-4 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ">
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 h-3 text-indigo-400" />
                                Student Transmitted Data
                            </div>
                            <span className="bg-white dark:bg-card px-2 py-0.5 rounded-lg border border-slate-100 dark:border-border">{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-black text-slate-700 dark:text-foreground leading-relaxed  border-l-2 border-indigo-500/20 pl-4 py-1">
                            "{booking.message}"
                        </p>
                    </div>

                    {booking.status === 'APPROVED' && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-white dark:bg-muted/30 border border-slate-100 dark:border-border shadow-sm">
                                <p className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-1 ">Allocated Date</p>
                                <p className="text-xs font-black text-slate-900 dark:text-foreground ">{booking.slotDate ? new Date(booking.slotDate).toLocaleDateString() : 'TBD'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-muted/30 border border-slate-100 dark:border-border shadow-sm">
                                <p className="text-[8px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] mb-1 ">Temporal Window</p>
                                <p className="text-xs font-black text-slate-900 dark:text-foreground ">{booking.slotTime || 'TBD'}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                <p className="text-[8px] font-black text-indigo-400 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1 ">Sector Location</p>
                                <p className="text-xs font-black text-slate-900 dark:text-foreground truncate ">{booking.location || 'HQ_CABIN'}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3">
                        {booking.status === "PENDING" && (
                            <>
                                {isExpanded ? (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 bg-slate-50/50 dark:bg-muted/10 p-6 lg:p-8 rounded-[2rem] border border-slate-100 dark:border-border shadow-inner">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ml-1  opacity-60">Proposed Date</label>
                                                <Input
                                                    type="date"
                                                    value={form.slotDate}
                                                    onChange={(e) => setForm({ ...form, slotDate: e.target.value })}
                                                    className="h-12 rounded-xl font-black bg-white dark:bg-muted border-slate-200 dark:border-border text-xs focus:ring-2 focus:ring-indigo-500/20 "
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ml-1  opacity-60">Proposed Time</label>
                                                <Input
                                                    type="time"
                                                    value={form.slotTime}
                                                    onChange={(e) => setForm({ ...form, slotTime: e.target.value })}
                                                    className="h-12 rounded-xl font-black bg-white dark:bg-muted border-slate-200 dark:border-border text-xs focus:ring-2 focus:ring-indigo-500/20 "
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-[0.2em] ml-1  opacity-60">Feedback Transmission</label>
                                            <Textarea
                                                value={form.replyMessage}
                                                onChange={(e) => setForm({ ...form, replyMessage: e.target.value })}
                                                placeholder="Enter response protocols or coordination details..."
                                                className="min-h-[120px] rounded-2xl font-black bg-white dark:bg-muted border-slate-200 dark:border-border text-xs p-6 focus:ring-2 focus:ring-indigo-500/20 resize-none  shadow-inner"
                                            />
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <Button
                                                onClick={() => onAction(booking.id, 'APPROVED')}
                                                className="flex-1 h-14 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95 "
                                            >
                                                Confirm Authorization
                                            </Button>
                                            <Button
                                                onClick={() => onExpand(null)}
                                                variant="outline"
                                                className="px-8 h-14 rounded-2xl border-slate-200 dark:border-border text-slate-400 dark:text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white dark:hover:bg-muted transition-all bg-white dark:bg-card "
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <Button
                                            className="flex-1 h-16 bg-slate-900 dark:bg-indigo-600 text-white dark:text-black rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-95 shadow-2xl shadow-indigo-500/20 group  overflow-hidden relative"
                                            onClick={() => onExpand(booking.id)}
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-full bg-white/10 skew-x-12 translate-x-12 group-hover:translate-x-0 transition-transform duration-700" />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                Process Transmission
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-16 px-10 rounded-[1.5rem] border-rose-100 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all hover:border-rose-200 dark:hover:border-rose-500/40 "
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
