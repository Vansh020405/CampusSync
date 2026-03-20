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
        <div className="max-w-2xl mx-auto space-y-8 pb-32 pt-6 px-4">
            <header className="px-2 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase">Alerts</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real-time institutional intelligence</p>
                    </div>
                </div>
            </header>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <Card key={alert.id} className={cn(
                        "border-0 dark:border dark:border-border rounded-[2.5rem] bg-white dark:bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 hover:scale-[1.01] group",
                        alert.isNew && "ring-1 ring-amber-500/20"
                    )}>
                        <CardContent className="p-6 md:p-8">
                            <div className="flex items-start gap-6">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg transition-transform group-hover:rotate-6",
                                    alert.color
                                )}>
                                    <alert.icon className="h-7 w-7" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={cn(
                                            "rounded-full text-[9px] font-black px-3 py-0.5 border-slate-100 dark:border-border",
                                            alert.isNew ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10" : "text-slate-400"
                                        )}>
                                            {alert.type} {alert.isNew && "• NEW"}
                                        </Badge>
                                        <span className="text-[10px] font-bold text-slate-300 dark:text-muted-foreground">{alert.time}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-foreground leading-tight tracking-tight">
                                        {alert.title}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground leading-relaxed">
                                        {alert.message}
                                    </p>
                                    <div className="pt-2">
                                        <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-transparent dark:text-primary flex items-center gap-1 group/btn">
                                            View Details <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-8">
                <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Archive older transmissions
                </Button>
            </div>
        </div>
    )
}
