'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar, Clock, CheckCircle2, XCircle,
    MessageSquare, MapPin, Search, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
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

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookRes, statusRes] = await Promise.all([
                    fetch('/api/bookings'),
                    fetch('/api/faculty/status')
                ]);
                const bookData = await bookRes.json();
                const statusData = await statusRes.json();

                if (Array.isArray(bookData)) setBookings(bookData);
                if (statusData.status) setStatus(statusData.status);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load requests.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
                title: "Status Updated",
                description: `You are now marked as ${newStatus.replace('_', ' ').toLowerCase()}.`,
                className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            });
        } catch (e) {
            setStatus(oldStatus);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update status.",
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

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Update failed");
            }

            // Refresh bookings
            const refreshRes = await fetch('/api/bookings');
            const data = await refreshRes.json();
            setBookings(data);
            setSelectedBooking(null);
            setApprovalForm({
                slotTime: "",
                slotDate: new Date().toISOString().split('T')[0],
                location: "Cabin",
                replyMessage: ""
            });

            toast({
                title: action === 'APPROVED' ? "Request Approved" : "Request Rejected",
                description: action === 'APPROVED'
                    ? `Scheduled for ${new Date(approvalForm.slotDate).toLocaleDateString()} at ${approvalForm.slotTime}.`
                    : "The student has been notified.",
                className: action === 'APPROVED' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : undefined
            });

        } catch (e: any) {
            console.error("Failed to update booking", e);
            toast({
                variant: "destructive",
                title: "Action Failed",
                description: e.message || "Could not update request.",
            });
        }
    };

    const filterBookings = (status?: string) => {
        let filtered = bookings;

        // Tab Filter
        if (status && status !== "all") {
            if (status === "pending") filtered = filtered.filter(b => b.status === "PENDING");
            else if (status === "approved") filtered = filtered.filter(b => b.status === "APPROVED");
            else if (status === "completed") filtered = filtered.filter(b => b.status === "COMPLETED");
        }

        // Search Filter
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            filtered = filtered.filter(b =>
                (b.studentName || "").toLowerCase().includes(lowerSearch) ||
                (b.message || "").toLowerCase().includes(lowerSearch) ||
                (b.agenda || "").toLowerCase().includes(lowerSearch)
            );
        }

        return filtered;
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
            APPROVED: { label: "Scheduled", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
            REJECTED: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
            COMPLETED: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle2 },
        };
        const config = configs[status] || configs.PENDING;
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium", config.color)}>
                <Icon className="h-3 w-3 mr-1.5" />
                {config.label}
            </Badge>
        );
    };

    const BookingCard = ({ booking }: { booking: any }) => {
        const isExpanded = selectedBooking === booking.id;
        const isMessage = booking.agendaType === 'DOUBT';

        return (
            <Card className={cn(
                "transition-all duration-200 border-slate-200 hover:border-emerald-200 hover:shadow-md",
                isExpanded && "ring-1 ring-emerald-500 shadow-lg"
            )}>
                <CardContent className="p-0">
                    <div className="p-4 flex gap-4">
                        {/* Avatar */}
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm",
                            isMessage ? "bg-gradient-to-br from-blue-400 to-indigo-500" : "bg-gradient-to-br from-emerald-400 to-teal-500"
                        )}>
                            {(booking.studentName || "S").split(' ').map((n: string) => n[0]).join('')}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div>
                                    <h3 className="font-semibold text-slate-900 truncate">{booking.studentName || "Unknown Student"}</h3>
                                    <p className="text-xs text-slate-500">{booking.studentRollNo || "ID: --"} • {new Date(booking.createdAt).toLocaleDateString()}</p>
                                </div>
                                {getStatusBadge(booking.status)}
                            </div>

                            <div className="mt-2 text-sm text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    {isMessage ? <MessageSquare className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                    {isMessage ? "Message" : "Consultation Request"}
                                </div>
                                {booking.message || booking.agenda || "No content provided."}
                            </div>

                            {/* Scheduled Info */}
                            {booking.status === "APPROVED" && (
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    <div className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-100 flex items-center">
                                        <Calendar className="h-3 w-3 mr-1.5" />
                                        {booking.slotDate ? new Date(booking.slotDate).toLocaleDateString() : 'TBD'}
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-100 flex items-center">
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        {booking.slotTime || 'TBD'}
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-100 flex items-center">
                                        <MapPin className="h-3 w-3 mr-1.5" />
                                        {booking.location || 'TBD'}
                                    </div>
                                </div>
                            )}

                            {/* Actions Section */}
                            <div className="mt-4">
                                {booking.status === "PENDING" && (
                                    <>
                                        {isExpanded ? (
                                            <div className="space-y-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                    <h4 className="text-sm font-semibold text-slate-800">Approve & Schedule</h4>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedBooking(null)}>
                                                        <XCircle className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-medium text-slate-500">Date</Label>
                                                        <Input
                                                            type="date"
                                                            className="h-9 text-xs"
                                                            value={approvalForm.slotDate}
                                                            onChange={(e) => setApprovalForm({ ...approvalForm, slotDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-medium text-slate-500">Time</Label>
                                                        <Input
                                                            type="time"
                                                            className="h-9 text-xs"
                                                            value={approvalForm.slotTime}
                                                            onChange={(e) => setApprovalForm({ ...approvalForm, slotTime: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-500">Location</Label>
                                                    <Input
                                                        placeholder="Office / Lab / Online"
                                                        className="h-9 text-xs"
                                                        value={approvalForm.location}
                                                        onChange={(e) => setApprovalForm({ ...approvalForm, location: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-500">Reply Note</Label>
                                                    <Textarea
                                                        value={approvalForm.replyMessage}
                                                        onChange={(e) => setApprovalForm({ ...approvalForm, replyMessage: e.target.value })}
                                                        placeholder="Add a message for the student..."
                                                        className="min-h-[60px] text-xs resize-none"
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-9 text-xs font-medium"
                                                        onClick={() => handleBookingAction(booking.id, 'APPROVED')}
                                                        disabled={!approvalForm.slotTime || !approvalForm.slotDate}
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 h-9 text-xs font-medium hover:bg-slate-50"
                                                        onClick={() => setSelectedBooking(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs font-medium bg-slate-900 hover:bg-slate-800 shadow-sm"
                                                    onClick={() => setSelectedBooking(booking.id)}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Reply & Schedule
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 text-xs font-medium border-red-200 text-red-600 hover:bg-red-50"
                                                    onClick={() => handleBookingAction(booking.id, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const currentBookings = filterBookings(activeTab);
    const pendingCount = bookings.filter(b => b.status === "PENDING").length;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Communication Hub</h1>
                            <p className="text-emerald-100 text-sm">Manage student requests & bookings</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                            <MessageSquare className="h-7 w-7 text-white" />
                        </div>
                    </div>

                    {/* Stats & Search */}
                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-100" />
                            <Input
                                placeholder="Search students..."
                                className="pl-9 h-11 bg-white/10 border-white/20 text-white placeholder:text-emerald-100/70 focus:bg-white/20 transition-all border-0 ring-1 ring-white/20"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 h-11 flex items-center text-white text-sm font-medium whitespace-nowrap">
                            <span className="text-emerald-100 mr-2">Pending:</span>
                            {pendingCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Control */}
            <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-200">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-sm ring-2 ring-white",
                            status === 'AVAILABLE' ? "bg-emerald-100 text-emerald-600" :
                                status === 'ON_LEAVE' ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"
                        )}>
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Your Status</p>
                            <p className="text-xs text-slate-500">
                                {status === 'AVAILABLE' ? "Students can book you" : status === 'ON_LEAVE' ? "Marked as On Leave" : "Marked as Busy"}
                            </p>
                        </div>
                    </div>
                    <Select value={status} onValueChange={handleUpdateStatus}>
                        <SelectTrigger className="w-[140px] h-9 text-xs font-medium border-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AVAILABLE">
                                <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />Available</div>
                            </SelectItem>
                            <SelectItem value="NOT_AVAILABLE">
                                <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-slate-500 mr-2" />Busy</div>
                            </SelectItem>
                            <SelectItem value="ON_LEAVE">
                                <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-red-500 mr-2" />On Leave</div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-11 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="pending" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending</TabsTrigger>
                    <TabsTrigger value="approved" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Scheduled</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Completed</TabsTrigger>
                    <TabsTrigger value="all" className="text-xs rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4 space-y-3">
                    {currentBookings.length > 0 ? (
                        currentBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Mail className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium">No requests here</h3>
                            <p className="text-sm text-slate-500 mt-1">Check other tabs or wait for new requests.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
