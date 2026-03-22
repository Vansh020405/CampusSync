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
    CheckCircle2, XCircle, Clock, MessageSquare, Send, Sparkles, Calendar, Plus, Trash2,
    RefreshCcw, Filter, User, ChevronRight, Activity
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
    const [bookingType, setBookingType] = useState<"MESSAGE" | "APPOINTMENT">("MESSAGE");

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const [facRes, bookRes] = await Promise.all([
                fetch('/api/faculty/list'),
                fetch('/api/bookings')
            ]);

            if (facRes.ok) {
                const facData = await facRes.json();
                if (Array.isArray(facData)) setFacultyList(facData);
            }

            if (bookRes.ok) {
                const bookData = await bookRes.json();
                if (Array.isArray(bookData)) setBookings(bookData);
            }

            if (silent) {
                toast({
                    title: "Sync Success",
                    description: "Directory and transmission buffer updated.",
                    className: "bg-slate-900 text-white border-none"
                });
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast({
                variant: "destructive",
                title: "Inlet Error",
                description: "Failed to establish link with the academic hub.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => fetchData(true);

    const handleSendMessage = async () => {
        if (!selectedFaculty || !message.trim()) {
            toast({ variant: "destructive", title: "Incomplete Payload" });
            return;
        }
        setSending(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyId: selectedFaculty.id,
                    message: message,
                    agenda: bookingType === "MESSAGE" ? "Quick Message" : "Consultation Request",
                    agendaType: bookingType === "MESSAGE" ? "DOUBT" : "APPOINTMENT"
                })
            });
            if (res.ok) {
                setMessage("");
                setIsDrawerOpen(false);
                toast({
                    title: "Dispatched",
                    description: `Transmission to ${selectedFaculty.name} confirmed.`,
                    className: "bg-indigo-600 text-white border-none shadow-xl"
                });
                handleRefresh();
            } else {
                throw new Error("Failed");
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Terminal Error", description: "Handshake failure during dispatch." });
        } finally {
            setSending(false);
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (!confirm("Purge record from history?")) return;
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Purged", description: "Protocol wiped from active buffer.", className: "bg-slate-900 text-white" });
                setBookings(prev => prev.filter(b => b.id !== id));
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Wipe Error" });
        }
    };

    const openMessageDrawer = (faculty: any) => {
        setSelectedFaculty(faculty);
        setIsDrawerOpen(true);
    };

    const departments = ["All", ...Array.from(new Set(facultyList.flatMap(f => f.departments || [])))];

    const filteredFaculty = facultyList.filter(faculty => {
        const matchesSearch = (faculty.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (faculty.subjects || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDepartment = selectedDepartment === "All" || (faculty.departments || []).includes(selectedDepartment);
        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-background">
            {/* Professional Student-Side Header */}
            <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-border">
                <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="space-y-0.5 md:space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="h-3 w-3 md:h-4 md:w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground/60">Academic Network</span>
                            </div>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase">Faculty Nexus</h1>
                            <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-muted-foreground/80 opacity-80">Connect with mentors and coordinate strategic engagements.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                variant="outline"
                                className="h-10 md:h-11 px-5 md:px-6 rounded-xl border-slate-200 dark:border-border bg-white dark:bg-card font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-muted transition-all active:scale-95 shadow-sm dark:shadow-none"
                            >
                                <RefreshCcw className={cn("h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400", isLoading && "animate-spin")} />
                                <span>Sync</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Navigation & Selection */}
                    <aside className="lg:col-span-3 space-y-4 md:space-y-6">
                        <Card className="border-none shadow-sm dark:shadow-none rounded-2xl bg-white dark:bg-card overflow-hidden border dark:border-border">
                            <CardContent className="p-4 md:p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest">Departments</label>
                                        <Filter className="h-3 w-3 text-slate-300 dark:text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        {departments.map((dept) => (
                                            <button
                                                key={dept}
                                                onClick={() => setSelectedDepartment(dept)}
                                                className={cn(
                                                    "w-full text-left px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                                                    selectedDepartment === dept 
                                                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-foreground hover:bg-slate-50 dark:hover:bg-muted"
                                                )}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Transmission status mini-widget */}
                        {bookings.length > 0 && (
                            <Card className="border-none shadow-sm rounded-2xl bg-indigo-600 p-6 text-white group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl transition-transform group-hover:scale-110"></div>
                                <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-4">Active Buffers</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black">{bookings.length}</span>
                                    <span className="text-indigo-200 text-[10px] font-bold uppercase">Transmissions</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Monitor Status</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </Card>
                        )}
                    </aside>

                    {/* Feed Section */}
                    <main className="lg:col-span-9 space-y-4 md:space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Mentor, domain, or subject code..."
                                    className="w-full h-11 md:h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-[11px] md:text-xs font-black text-slate-800 dark:text-foreground placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all shadow-sm dark:shadow-none uppercase tracking-tight"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Active Transmissions (Horizontal Strip if on mobile/condensed on desktop) */}
                        {bookings.length > 0 && (
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest pl-1">Live Reliability Buffer</span>
                                </div>
                                <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {bookings.slice(0, 5).map(b => (
                                        <Card key={b.id} className="flex-shrink-0 w-56 md:w-64 border-none shadow-sm dark:shadow-none bg-white dark:bg-card rounded-2xl p-3.5 md:p-4 group border dark:border-border">
                                            <div className="flex items-center justify-between mb-2.5 md:mb-3">
                                                <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-slate-50 dark:bg-muted flex items-center justify-center text-[9px] md:text-[10px] font-black text-slate-400 dark:text-muted-foreground/50 uppercase tracking-tighter">
                                                    {(b.faculty?.name || b.facultyName || "F").split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <Badge className={cn(
                                                    "h-5 px-2 rounded-full border-none text-[7px] md:text-[8px] font-black uppercase tracking-widest shadow-none",
                                                    b.status === 'APPROVED' ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
                                                        b.status === 'REJECTED' ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400" : "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                                )}>
                                                    {b.status}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] md:text-xs font-black text-slate-900 dark:text-foreground truncate mb-0.5 uppercase tracking-tight">{b.faculty?.name || b.facultyName}</p>
                                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-muted-foreground/60 truncate opacity-60 ">"{b.message}"</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Faculty Pool */}
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest pl-1">Faculty Pool</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {isLoading ? (
                                    Array(4).fill(0).map((_, i) => <div key={i} className="h-32 md:h-40 rounded-2xl bg-white dark:bg-card animate-pulse border dark:border-border" />)
                                ) : filteredFaculty.length > 0 ? (
                                    filteredFaculty.map((faculty) => (
                                        <FacultyCard
                                            key={faculty.id}
                                            faculty={faculty}
                                            onClick={() => openMessageDrawer(faculty)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm dark:shadow-none">
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest  opacity-50">Zero Matches Found in this Matrix</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-100 dark:border-border rounded-t-[2rem] p-4">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="mx-auto w-10 h-1 rounded-full bg-slate-200 dark:bg-muted mb-6 mt-1" />
                        <DrawerHeader className="pb-4">
                            <DrawerTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground text-center uppercase tracking-tighter ">Establish Link</DrawerTitle>
                            <DrawerDescription className="text-center font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-[0.2em] text-[8px] md:text-[9px]">Target: {selectedFaculty?.name}</DrawerDescription>
                        </DrawerHeader>

                        <div className="px-4 space-y-5 md:space-y-6">
                            <div className="flex p-1 bg-slate-50 dark:bg-muted border border-slate-100 dark:border-border rounded-xl md:rounded-2xl">
                                <button
                                    className={cn("flex-1 h-10 md:h-11 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all", bookingType === "MESSAGE" ? "bg-white dark:bg-card shadow-sm text-indigo-600 dark:text-primary" : "text-slate-400")}
                                    onClick={() => setBookingType("MESSAGE")}
                                >
                                    Quick Message
                                </button>
                                <button
                                    className={cn("flex-1 h-10 md:h-11 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all", bookingType === "APPOINTMENT" ? "bg-white dark:bg-card shadow-sm text-emerald-600 dark:text-emerald-400" : "text-slate-400")}
                                    onClick={() => setBookingType("APPOINTMENT")}
                                >
                                    Appointment
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-widest ml-1">Payload Content</label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Briefly state your objective..."
                                    className="min-h-[100px] md:min-h-[120px] rounded-xl md:rounded-2xl bg-white dark:bg-card border-slate-200 dark:border-border text-[11px] md:text-xs font-black p-4 resize-none focus:ring-0 uppercase tracking-tight"
                                />
                            </div>

                            <Button
                                onClick={handleSendMessage}
                                disabled={sending || !message.trim()}
                                className={cn(
                                    "w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95",
                                    bookingType === "MESSAGE" ? "bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white dark:text-primary-foreground" : "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                                )}
                            >
                                {sending ? "Transmitting..." : "Initiate Handshake"}
                            </Button>
                        </div>

                        <div className="p-4 md:p-6 text-center">
                            <DrawerClose asChild>
                                <Button variant="ghost" className="w-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-muted-foreground/30 hover:bg-transparent">Abort Operation</Button>
                            </DrawerClose>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

function FacultyCard({ faculty, onClick }: any) {
    const isOnline = faculty.status === 'AVAILABLE' || faculty.isAvailable;
    return (
        <Card
            className="group border-none shadow-sm dark:shadow-none rounded-2xl bg-white dark:bg-card overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer border dark:border-border"
            onClick={onClick}
        >
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className={cn(
                        "h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-lg font-black text-white shadow-sm shrink-0 uppercase tracking-tighter",
                        isOnline ? "bg-emerald-600 dark:bg-emerald-500" : "bg-slate-300 dark:bg-muted"
                    )}>
                        {(faculty.name || "F").split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-foreground truncate tracking-tight uppercase">{faculty.name}</h4>
                            <div className={cn(
                                "h-1.5 w-1.5 md:h-2 md:w-2 rounded-full shrink-0",
                                isOnline ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-muted"
                            )} />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-muted-foreground/60 uppercase tracking-widest mt-0.5 truncate opacity-70">{faculty.department}</p>
                    </div>
                </div>
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-50 dark:border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-muted text-slate-400 dark:text-muted-foreground/50">
                            <MapPin className="h-3 w-3" />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-black text-slate-500 dark:text-muted-foreground uppercase">{faculty.cabin || "Room 302"}</span>
                    </div>
                    <Button variant="ghost" className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400">
                        <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
