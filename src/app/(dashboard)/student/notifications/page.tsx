'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Zap, Calendar, Award, Info, ChevronRight, CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudentNotificationsPage() {
    const alerts = [
        {
            id: 1,
            type: 'URGENT',
            icon: Zap,
            color: 'bg-indigo-600',
            title: 'Attendance Recovery Protocol',
            message: 'Your attendance in Data Structures is currently 68%. Submit your medical leave form by Friday.',
            time: '2 hrs ago',
            isNew: true
        },
        {
            id: 2,
            type: 'ACADEMIC',
            icon: Calendar,
            color: 'bg-emerald-600',
            title: 'End-Sem Schedule Released',
            message: 'The official schedule for Dec 2026 examinations is now available for download.',
            time: 'Yesterday',
            isNew: false
        },
        {
            id: 3,
            type: 'PLACEMENT',
            icon: Award,
            color: 'bg-blue-600',
            title: 'Microsoft Shortlist Out',
            message: 'Congratulations! You have been shortlisted for the technical round at Microsoft.',
            time: '2 days ago',
            isNew: false
        },
        {
            id: 4,
            type: 'MESSAGE',
            icon: MessageSquare,
            color: 'bg-purple-600',
            title: 'Prof. Sharma sent a note',
            message: 'Note: The lab session for tomorrow is rescheduled to 2:00 PM in Lab 402.',
            time: '3 days ago',
            isNew: false
        }
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 pt-4 px-4">
            <header className="px-1 space-y-1">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none shrink-0">
                        <Bell className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase  mt-0.5">Intelligence</h1>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60  leading-none">Real-time alert protocol active</p>
                    </div>
                </div>
            </header>

            <div className="space-y-3">
                {alerts.map((alert) => (
                    <Card key={alert.id} className={cn(
                        "border-0 dark:border dark:border-border rounded-2xl bg-white dark:bg-card shadow-sm dark:shadow-none overflow-hidden transition-all duration-300 group",
                        alert.isNew && "ring-1 ring-amber-500/20"
                    )}>
                        <CardContent className="p-4 md:p-6">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:rotate-6",
                                    alert.color
                                )}>
                                    <alert.icon className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <Badge variant="outline" className={cn(
                                            "rounded-lg text-[7px] md:text-[8px] font-black px-2 py-0.5 border-slate-100 dark:border-border uppercase tracking-widest",
                                            alert.isNew ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10" : "text-slate-400"
                                        )}>
                                            {alert.type} {alert.isNew && "â€¢ NEW"}
                                        </Badge>
                                        <span className="text-[8px] font-black text-slate-300 dark:text-muted-foreground uppercase opacity-70 shrink-0">{alert.time}</span>
                                    </div>
                                    <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-foreground leading-tight tracking-tight uppercase ">
                                        {alert.title}
                                    </h3>
                                    <p className="text-[11px] md:text-xs font-black text-slate-400 dark:text-muted-foreground leading-relaxed mt-1 line-clamp-2 uppercase tracking-tight opacity-80">
                                        {alert.message}
                                    </p>
                                    <div className="pt-2">
                                        <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-transparent dark:text-primary flex items-center gap-1 group/btn">
                                            Execute <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-6">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-muted-foreground hover:bg-transparent hover:text-indigo-500 transition-colors">
                    Archive Transmission History
                </Button>
            </div>
        </div>
    )
}
