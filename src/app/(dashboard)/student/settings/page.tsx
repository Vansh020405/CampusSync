'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Moon, Sun, Bell, Shield, Smartphone, Globe, Info, LogOut, ChevronRight, Lock, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export default function StudentSettingsPage() {
    const { data: session } = useSession()
    const { theme } = useTheme()

    const settingGroups = [
        {
            title: "Appearance",
            icon: Sparkles,
            items: [
                { 
                    label: "Interface Theme", 
                    description: "Switch between light and dark modes",
                    action: <ThemeToggle />,
                    icon: theme === 'dark' ? Moon : Sun 
                }
            ]
        },
        {
            title: "Security & Privacy",
            icon: Shield,
            items: [
                { label: "Biometric Login", description: "Enable Face ID or Fingerprint", icon: Lock, toggle: true },
                { label: "Two-Factor Auth", description: "Secure your account with 2FA", icon: Smartphone, toggle: true },
            ]
        },
        {
            title: "Notifications",
            icon: Bell,
            items: [
                { label: "Push Notifications", description: "Get alerts on your phone", icon: Bell, toggle: true },
                { label: "Email Summaries", description: "Weekly performance digests", icon: Globe, toggle: true },
            ]
        }
    ]

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 pt-4 md:pt-6 px-3 md:px-4">
            <header className="px-1 md:px-2 flex items-center gap-2.5">
                <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border flex items-center justify-center shadow-sm dark:shadow-none shrink-0">
                    <Settings className="h-4 w-4 md:h-5 md:w-5 text-slate-900 dark:text-foreground" />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase  mt-0.5">Settings</h1>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Manage your institutional digital profile</p>
                </div>
            </header>

            <div className="space-y-6">
                {settingGroups.map((group, gIdx) => (
                    <section key={gIdx} className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <group.icon className="h-3.5 w-3.5 text-slate-400" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground">{group.title}</h2>
                        </div>
                        
                        <Card className="border-0 dark:border dark:border-border rounded-[2.5rem] bg-white dark:bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-border/50">
                                {group.items.map((item, iIdx) => (
                                    <div key={iIdx} className="p-6 md:p-8 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-muted/50 flex items-center justify-center text-slate-500 dark:text-muted-foreground group-hover:scale-110 transition-transform">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] md:text-sm font-black text-slate-900 dark:text-foreground leading-tight tracking-tight uppercase ">{item.label}</h3>
                                                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 dark:text-muted-foreground mt-0.5 opacity-60 tracking-tight">{item.description}</p>
                                            </div>
                                        </div>
                                        {'action' in item && item.action ? (
                                            <div>{item.action as React.ReactNode}</div>
                                        ) : 'toggle' in item && item.toggle ? (
                                            <div className="h-5 w-10 rounded-full bg-slate-200 dark:bg-muted relative cursor-not-allowed p-1 transition-colors">
                                                <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                                            </div>
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-slate-300" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                ))}

                <section className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Info className="h-3 w-3 text-slate-400" />
                        <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground opacity-60">About System</h2>
                    </div>
                    <Card className="border-0 dark:border dark:border-border rounded-2xl md:rounded-[2.5rem] bg-indigo-950/5 dark:bg-card shadow-sm dark:shadow-none overflow-hidden p-5 md:p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs md:text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight ">CampusSync Enterprise</h3>
                            <p className="text-[9px] md:text-[11px] font-black text-slate-400 dark:text-muted-foreground mt-0.5 opacity-60">Version 2.4.0 â€¢ Build 2026.18.03</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-slate-200 dark:border-border text-slate-400 dark:text-muted-foreground text-[8px] md:text-[10px] font-black px-3 py-0.5">STABLE</Badge>
                    </Card>
                </section>

                <Button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    variant="ghost" 
                    className="w-full h-14 md:h-16 rounded-2xl md:rounded-[2.5rem] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-black tracking-widest uppercase text-[10px] md:text-xs flex items-center justify-center gap-2.5 mt-6 border border-dashed border-rose-200 dark:border-rose-900/40"
                >
                    <LogOut className="h-4 w-4" /> Shutdown Session
                </Button>
            </div>
        </div>
    )
}
