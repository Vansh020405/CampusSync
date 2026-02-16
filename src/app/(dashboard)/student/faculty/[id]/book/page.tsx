'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft, Calendar, Clock, User, FileText, CheckCircle2
} from "lucide-react";
import { DEMO_FACULTY, DEMO_TIMETABLE } from "@/lib/store";
import { cn } from "@/lib/utils";

const AGENDA_TYPES = [
    { value: "INTERNSHIP", label: "Internship Guidance", icon: "💼" },
    { value: "RESUME", label: "Resume Review", icon: "📄" },
    { value: "DOUBT", label: "Subject Doubt", icon: "❓" },
    { value: "RESEARCH", label: "Research Help", icon: "🔬" },
    { value: "OTHER", label: "Other", icon: "📝" },
];

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const facultyId = parseInt(params.id as string);

    const faculty = DEMO_FACULTY.find(f => f.id === facultyId);
    const freeSlots = DEMO_TIMETABLE.filter(t => t.facultyId === facultyId && t.isFree);

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [agendaType, setAgendaType] = useState("");
    const [agenda, setAgenda] = useState("");
    const [studentName, setStudentName] = useState("Rahul Sharma");
    const [studentEmail, setStudentEmail] = useState("rahul@student.edu");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!faculty) {
        return <div>Faculty not found</div>;
    }

    // Generate next 7 days
    const getNextDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
                display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
        }
        return days;
    };

    const nextDays = getNextDays();
    const selectedDay = nextDays.find(d => d.date === selectedDate);
    const availableSlots = selectedDay
        ? freeSlots.filter(s => s.day === selectedDay.day)
        : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);

        // Redirect after success
        setTimeout(() => {
            router.push('/student/faculty/bookings');
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
                <p className="text-slate-600 text-center max-w-sm">
                    Your consultation with {faculty.name} has been booked. You'll receive a confirmation email shortly.
                </p>
                <Button onClick={() => router.push('/student/faculty/bookings')} className="bg-emerald-600 hover:bg-emerald-700">
                    View My Bookings
                </Button>
            </div>
        );
    }

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

                    <h1 className="text-2xl font-bold text-white mb-1">Book Consultation</h1>
                    <p className="text-emerald-100 text-sm">with {faculty.name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Info */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Your Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-sm">Full Name</Label>
                            <Input
                                id="name"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                required
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                                required
                                className="mt-1.5"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Select Date */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-600" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {nextDays.map((day) => (
                                <button
                                    key={day.date}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(day.date);
                                        setSelectedSlot("");
                                    }}
                                    className={cn(
                                        "p-3 rounded-lg border-2 text-left transition-all",
                                        selectedDate === day.date
                                            ? "border-emerald-600 bg-emerald-50"
                                            : "border-slate-200 hover:border-emerald-300"
                                    )}
                                >
                                    <p className="text-xs text-slate-600">{day.day.slice(0, 3)}</p>
                                    <p className="font-semibold text-slate-900">{day.display}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Select Time Slot */}
                {selectedDate && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                Select Time Slot
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            type="button"
                                            onClick={() => setSelectedSlot(`${slot.startTime}-${slot.endTime}`)}
                                            className={cn(
                                                "p-3 rounded-lg border-2 text-center transition-all",
                                                selectedSlot === `${slot.startTime}-${slot.endTime}`
                                                    ? "border-emerald-600 bg-emerald-50"
                                                    : "border-emerald-200 hover:border-emerald-400 bg-emerald-50/30"
                                            )}
                                        >
                                            <p className="font-semibold text-slate-900">
                                                {slot.startTime} - {slot.endTime}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No free slots available on this day
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Agenda Type */}
                {selectedSlot && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-600" />
                                Consultation Purpose
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="agendaType" className="text-sm">Select Type</Label>
                                <Select value={agendaType} onValueChange={setAgendaType} required>
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Choose consultation type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AGENDA_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <span className="flex items-center gap-2">
                                                    <span>{type.icon}</span>
                                                    <span>{type.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="agenda" className="text-sm">Details</Label>
                                <Textarea
                                    id="agenda"
                                    value={agenda}
                                    onChange={(e) => setAgenda(e.target.value)}
                                    placeholder="Briefly describe what you'd like to discuss..."
                                    required
                                    rows={4}
                                    className="mt-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                {selectedSlot && agendaType && agenda && (
                    <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                    Confirm Booking
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}
