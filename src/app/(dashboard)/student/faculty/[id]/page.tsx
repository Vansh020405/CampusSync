'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, MapPin, Mail, Phone, BookOpen, Calendar,
    CheckCircle2, XCircle, Clock, User
} from "lucide-react";
import { DEMO_FACULTY, DEMO_TIMETABLE, TimeSlot } from "@/lib/store";
import { cn } from "@/lib/utils";
import Link from 'next/link';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function FacultyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const facultyId = parseInt(params.id as string);

    const faculty = DEMO_FACULTY.find(f => f.id === facultyId);
    const timetable = DEMO_TIMETABLE.filter(t => t.facultyId === facultyId);

    if (!faculty) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <User className="h-16 w-16 text-slate-300" />
                <p className="text-slate-600">Faculty not found</p>
                <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const getTimetableSlot = (day: string, time: string): TimeSlot | undefined => {
        return timetable.find(t => t.day === day && t.startTime === time);
    };

    const getSlotColor = (slot?: TimeSlot) => {
        if (!slot) return "bg-slate-50 border-slate-100";
        if (slot.isFree) return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 cursor-pointer";
        return "bg-slate-100 border-slate-200";
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

                <div className="relative px-6 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-white hover:bg-white/20 mb-4 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex gap-4">
                        <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                            {faculty.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white mb-1">{faculty.name}</h1>
                            <p className="text-emerald-100 text-sm mb-2">{faculty.department}</p>
                            <Badge className={cn(
                                "text-[10px]",
                                faculty.isAvailable
                                    ? "bg-white/20 text-white border-white/30"
                                    : "bg-red-500/20 text-red-100 border-red-300/30"
                            )}>
                                {faculty.isAvailable ? (
                                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Available</>
                                ) : (
                                    <><XCircle className="h-3 w-3 mr-1" /> On Leave</>
                                )}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Cabin Location</p>
                            <p className="font-medium text-slate-900">{faculty.cabin}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-medium text-slate-900">{faculty.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Phone</p>
                            <p className="font-medium text-slate-900">{faculty.phone}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Subjects */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Subjects Handled</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {faculty.subjects.map((subject, idx) => (
                            <Badge key={idx} variant="outline" className="border-emerald-200 text-emerald-700">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {subject}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Bio */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 leading-relaxed">{faculty.bio}</p>
                </CardContent>
            </Card>

            {/* Weekly Timetable */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            Weekly Timetable
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded bg-emerald-200"></div>
                                <span className="text-slate-600">Free</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="h-3 w-3 rounded bg-slate-200"></div>
                                <span className="text-slate-600">Busy</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
                        <div className="min-w-[600px]">
                            {/* Time Header */}
                            <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
                                <div className="text-xs font-medium text-slate-600"></div>
                                {DAYS.map(day => (
                                    <div key={day} className="text-xs font-medium text-slate-600 text-center">
                                        {day.slice(0, 3)}
                                    </div>
                                ))}
                            </div>

                            {/* Timetable Grid */}
                            {TIME_SLOTS.map(time => (
                                <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
                                    <div className="text-xs text-slate-600 flex items-center">
                                        {time}
                                    </div>
                                    {DAYS.map(day => {
                                        const slot = getTimetableSlot(day, time);
                                        return (
                                            <div
                                                key={`${day}-${time}`}
                                                className={cn(
                                                    "min-h-[50px] rounded-lg border-2 p-1.5 transition-all",
                                                    getSlotColor(slot)
                                                )}
                                            >
                                                {slot && (
                                                    <div className="text-[10px]">
                                                        {slot.isFree ? (
                                                            <p className="font-medium text-emerald-700">Free</p>
                                                        ) : (
                                                            <>
                                                                <p className="font-medium text-slate-700 truncate">{slot.subject}</p>
                                                                <p className="text-slate-500 truncate">{slot.room}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        Tap on green slots to book a consultation
                    </p>
                </CardContent>
            </Card>

            {/* Book Consultation Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
                <Link href={`/student/faculty/${faculty.id}/book`}>
                    <Button
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                        disabled={!faculty.isAvailable}
                    >
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Consultation
                    </Button>
                </Link>
            </div>
        </div>
    );
}
