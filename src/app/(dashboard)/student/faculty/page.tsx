'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Users, MapPin, Mail, Search,
    CheckCircle2, XCircle, Clock, MessageSquare, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function FacultyDirectoryPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [facultyList, setFacultyList] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Message Drawer State
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facRes, bookRes] = await Promise.all([
                    fetch('/api/faculty/list'),
                    fetch('/api/bookings')
                ]);
                const facData = await facRes.json();
                const bookData = await bookRes.json();
                if (Array.isArray(facData)) setFacultyList(facData);
                if (Array.isArray(bookData)) setBookings(bookData);
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load faculty data.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSendMessage = async () => {
        if (!selectedFaculty || !message.trim()) return;
        setSending(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyId: selectedFaculty.id,
                    message: message,
                    agenda: "Consultation Request"
                })
            });
            if (res.ok) {
                setMessage("");
                setIsDrawerOpen(false);
                toast({
                    title: "Request Sent",
                    description: `Your message to ${selectedFaculty.name} has been sent.`,
                    className: "bg-emerald-50 border-emerald-200 text-emerald-800"
                });

                // Refresh bookings
                const bookRes = await fetch('/api/bookings');
                const bookData = await bookRes.json();
                setBookings(bookData);
            } else {
                throw new Error("Failed to send");
            }
        } catch (e) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send message. Please try again.",
            });
        } finally {
            setSending(false);
        }
    };

    const openMessageDrawer = (faculty: any) => {
        setSelectedFaculty(faculty);
        setIsDrawerOpen(true);
    };

    // Get unique departments
    const departments = ["All", ...Array.from(new Set(facultyList.map(f => f.department)))];

    // Filter faculty
    const filteredFaculty = facultyList.filter(faculty => {
        const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (faculty.subjects || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDepartment = selectedDepartment === "All" || faculty.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5"><CheckCircle2 className="h-3 w-3 mr-1" />Available</Badge>;
            case 'ON_LEAVE':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] px-2 py-0.5"><XCircle className="h-3 w-3 mr-1" />On Leave</Badge>;
            case 'NOT_AVAILABLE':
            default:
                return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] px-2 py-0.5"><Clock className="h-3 w-3 mr-1" />Busy</Badge>;
        }
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
                            <h1 className="text-3xl font-bold text-white mb-1">Faculty Directory</h1>
                            <p className="text-emerald-100 text-sm">Find professors & book consultations</p>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* My Requests Section */}
            {bookings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 px-1 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        Recent Requests
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.slice(0, 3).map(b => (
                            <Card key={b.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold text-slate-900">{b.facultyName}</p>
                                        <Badge variant="secondary" className={cn(
                                            "text-[10px] px-1.5 py-0.5",
                                            b.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" :
                                                b.status === 'REJECTED' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {b.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{b.message}</p>
                                    {b.status === 'APPROVED' && b.slotTime && (
                                        <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded-md border border-emerald-100 flex items-center gap-2">
                                            <div className="font-medium">{new Date(b.slotDate).toLocaleDateString()} at {b.slotTime}</div>
                                            {/* Location is accessed safely */}
                                            {b.location && <div className="text-emerald-600">({b.location})</div>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="space-y-4 pt-2">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search by name or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 h-12 bg-white border-slate-200 rounded-xl shadow-sm text-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {departments.map((dept) => (
                        <Button
                            key={dept}
                            size="sm"
                            variant={selectedDepartment === dept ? "default" : "outline"}
                            onClick={() => setSelectedDepartment(dept)}
                            className={cn(
                                "shrink-0 h-9 text-xs rounded-full px-4",
                                selectedDepartment === dept
                                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {dept}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Faculty List */}
            <div className="space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    Faculty Members ({filteredFaculty.length})
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFaculty.map((faculty) => (
                        <Card key={faculty.id} className="hover:shadow-lg transition-all border-slate-200 group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4 flex gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                                        {faculty.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900 truncate">{faculty.name}</h3>
                                            {getStatusBadge(faculty.status)}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mb-2">{faculty.department}</p>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                                <span className="truncate">{faculty.cabin || "Main Block"}</span>
                                            </div>
                                            {faculty.email && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                                                    <span className="truncate">{faculty.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                                    <Button
                                        size="sm"
                                        className="w-full h-9 text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm"
                                        onClick={() => openMessageDrawer(faculty)}
                                    >
                                        <MessageSquare className="h-3 w-3 mr-2" />
                                        Message / Book
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredFaculty.length === 0 && !isLoading && (
                    <div className="py-12 text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-slate-900 font-medium mb-1">No faculty found</p>
                        <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Message Drawer */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle className="text-center">Message {selectedFaculty?.name}</DrawerTitle>
                            <DrawerDescription className="text-center">Send a booking request or quick query.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 space-y-4">
                            <Textarea
                                placeholder="Example: Hi Sir, I have a doubt regarding the last assignment. Can I meet you tomorrow?"
                                className="min-h-[120px] text-sm resize-none bg-slate-50 border-slate-200 focus:border-emerald-500"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base shadow-lg shadow-emerald-200"
                                onClick={handleSendMessage}
                                disabled={sending || !message.trim()}
                            >
                                {sending ? "Sending..." : "Send Request"}
                                <Send className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                        <DrawerFooter className="pt-2">
                            <DrawerClose asChild>
                                <Button variant="outline" className="h-11">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
