'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HelpCircle, Mail, Phone, MessageSquare, Book, FileText, Globe, Search, ChevronRight, Sparkles, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StudentHelpPage() {
    const categories = [
        {
            title: "Quick Documentation",
            items: [
                { icon: Book, label: "Campus Handbook", value: "2026 Edition" },
                { icon: FileText, label: "Exam Protocols", value: "SOP v4.2" },
                { icon: Globe, label: "Network Access", value: "SSID: CAMPUS-5G" },
            ]
        },
        {
            title: "Support Channels",
            items: [
                { icon: Mail, label: "Academic Support", value: "it-support@campussync.ac.in" },
                { icon: Phone, label: "Emergency Helpline", value: "+91 800-455-8291" },
            ]
        }
    ]

    const faqs = [
        { q: "How do I sync my attendance?", a: "Attendance syncs automatically every midnight. If you missed a class, submit a leave request via the Attendance portal." },
        { q: "Where can I find my roll number?", a: "Your official institutional roll number is visible under the Profile section of your dashboard." },
        { q: "Password transformation?", a: "Use the Password reset link on the login screen or visit the IT desk in Block C for biometric resets." }
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 pt-4 md:pt-6 px-3 md:px-4">
            <header className="px-1 md:px-2 flex items-center gap-2.5">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                    <HelpCircle className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase  mt-0.5">Support</h1>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Institutional guidance system</p>
                </div>
            </header>

            <div className="space-y-6">
                <Card className="border-0 dark:border dark:border-border rounded-[1.5rem] md:rounded-[2.5rem] bg-indigo-950/5 dark:bg-card shadow-sm dark:shadow-none overflow-hidden p-5 md:p-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full mb-4">
                        <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-indigo-900 dark:text-foreground">AI Intelligence Active</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-foreground leading-tight tracking-tight mb-4 uppercase ">
                        Consult your AI Placement Mentor
                    </h2>
                    <Button className="rounded-xl md:rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 px-5 md:px-6 font-black text-[10px] uppercase tracking-widest h-11 md:h-12 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2">
                        Open Mentor Chat <ExternalLink className="h-4 w-4" />
                    </Button>
                </Card>

                {categories.map((group, gIdx) => (
                    <section key={gIdx} className="space-y-3">
                        <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ml-2 opacity-60">{group.title}</h2>
                        <Card className="border-0 dark:border dark:border-border rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-border/50">
                                {group.items.map((item, iIdx) => (
                                    <div key={iIdx} className="p-4 md:p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-muted/50 flex items-center justify-center text-slate-500 dark:text-muted-foreground group-hover:scale-110 transition-transform">
                                                <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] md:text-sm font-black text-slate-900 dark:text-foreground leading-tight tracking-tight uppercase ">{item.label}</h3>
                                                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-muted-foreground mt-0.5 opacity-60 truncate max-w-[140px] md:max-w-none">{item.value}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                ))}

                <section className="space-y-3 pt-2">
                    <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground ml-2 opacity-60">Knowledge Base</h2>
                    <div className="grid gap-2.5">
                        {faqs.map((faq, idx) => (
                            <Card key={idx} className="border-0 dark:border dark:border-border rounded-[1.25rem] md:rounded-[2rem] bg-white dark:bg-card shadow-sm p-4 md:p-6 group hover:shadow-md transition-all">
                                <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-foreground mb-1.5 flex items-center justify-between uppercase ">
                                    {faq.q}
                                    <HelpCircle className="h-3.5 w-3.5 text-slate-200 dark:text-muted-foreground shrink-0 ml-2" />
                                </h3>
                                <p className="text-[10px] md:text-[12px] font-medium text-slate-500 dark:text-muted-foreground leading-relaxed  opacity-85">
                                    "{faq.a}"
                                </p>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
