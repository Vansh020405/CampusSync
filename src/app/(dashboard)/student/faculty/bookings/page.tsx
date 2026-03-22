'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar, Clock, User, FileText, CheckCircle2, XCircle,
    AlertCircle, Ban, ArrowRight
} from "lucide-react";
import { DEMO_BOOKINGS, DEMO_FACULTY, Booking } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function StudentBookingsPage() {
    const [activeTab, setActiveTab] = useState("all");

    // Filter bookings by status
    const filterBookings = (status?: string) => {
        if (!status || status === "all") return DEMO_BOOKINGS;
        return DEMO_BOOKINGS.filter(b => b.status === status);
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
            COMPLETED: {
                label: "Completed",
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: CheckCircle2
            },
            CANCELLED: {
                label: "Cancelled",
                color: "bg-slate-100 text-slate-700 border-slate-200",
                icon: Ban
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

    const getAgendaIcon = (type: string) => {
        const icons: Record<string, string> = {
            INTERNSHIP: "ðŸ’¼",
            RESUME: "ðŸ“„",
            DOUBT: "â“",
            RESEARCH: "ðŸ”¬",
            OTHER: "ðŸ“"
        };
        return icons[type] || "ðŸ“";
    };

    const BookingCard = ({ booking }: { booking: Booking }) => {
        const faculty = DEMO_FACULTY.find(f => f.id === booking.facultyId);
        if (!faculty) return null;

        return (
            <Card className="hover:shadow-md transition-all border-slate-200">
                <CardContent className="p-4">
                    <div className="flex gap-3">
                        {/* Faculty Avatar */}
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {faculty.name.split(' ').map(n => n[0]).join('')}
                        </div>

                        {/* Booking Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                    <h3 className="font-semibold text-slate-900">{faculty.name}</h3>
                                    <p className="text-xs text-slate-600">{faculty.department}</p>
                                </div>
                                {getStatusBadge(booking.status)}
                            </div>

                            {/* Date & Time */}
                            <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Calendar className="h-3 w-3 shrink-0" />
                                    <span>{new Date(booking.slotDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Clock className="h-3 w-3 shrink-0" />
                                    <span>{booking.slotTime}</span>
                                </div>
                            </div>

                            {/* Agenda */}
                            <div className="bg-slate-50 rounded-lg p-2.5 mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">{getAgendaIcon(booking.agendaType)}</span>
                                    <p className="text-xs font-medium text-slate-700">
                                        {booking.agendaType.charAt(0) + booking.agendaType.slice(1).toLowerCase()}
                                    </p>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-2">{booking.agenda}</p>
                            </div>

                            {/* Actions */}
                            {booking.status === "PENDING" && (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50">
                                        <Ban className="h-3 w-3 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {booking.status === "APPROVED" && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                                    <p className="text-xs text-emerald-700 font-medium">
                                        âœ“ Confirmed - Please arrive 5 minutes early
                                    </p>
                                </div>
                            )}

                            {booking.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                                    <p className="text-xs text-blue-700">
                                        <strong>Note:</strong> {booking.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const bookings = filterBookings(activeTab);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">My Bookings</h1>
                            <p className="text-emerald-100 text-sm">Track your consultations</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <Calendar className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-4 h-11 bg-slate-100">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="PENDING" className="text-xs">Pending</TabsTrigger>
                    <TabsTrigger value="APPROVED" className="text-xs">Approved</TabsTrigger>
                    <TabsTrigger value="COMPLETED" className="text-xs">Past</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6 space-y-3">
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    ) : (
                        <Card className="border-dashed border-2 border-slate-200">
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600 font-medium mb-1">No bookings found</p>
                                <p className="text-sm text-slate-400 mb-4">
                                    {activeTab === "all"
                                        ? "You haven't booked any consultations yet"
                                        : `No ${activeTab.toLowerCase()} bookings`}
                                </p>
                                <Link href="/student/faculty">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                                        <User className="h-4 w-4 mr-2" />
                                        Browse Faculty
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Quick Action */}
            <Link href="/student/faculty">
                <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 border-0 hover:shadow-xl transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="text-white">
                            <p className="font-semibold mb-1">Book Another Consultation</p>
                            <p className="text-xs text-emerald-100">Browse available faculty</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-white" />
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
