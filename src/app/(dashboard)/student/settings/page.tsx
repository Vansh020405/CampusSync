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
        <div className="max-w-2xl mx-auto space-y-8 pb-32 pt-6 px-4">
            <header className="px-2 space-y-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-slate-900 dark:bg-card border border-slate-100 dark:border-border flex items-center justify-center shadow-lg">
                        <Settings className="h-5 w-5 text-white dark:text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-foreground tracking-tight uppercase">Settings</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage your institutional digital profile</p>
                    </div>
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
                                                <h3 className="text-sm font-black text-slate-900 dark:text-foreground leading-tight tracking-tight">{item.label}</h3>
                                                <p className="text-[11px] font-medium text-slate-400 dark:text-muted-foreground mt-1">{item.description}</p>
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

                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-muted-foreground">About App</h2>
                    </div>
                    <Card className="border-0 dark:border dark:border-border rounded-[2.5rem] bg-indigo-950/5 dark:bg-card shadow-sm overflow-hidden p-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-foreground">CampusSync Enterprise</h3>
                            <p className="text-[11px] font-medium text-slate-400 mt-1">Version 2.4.0 • Build 2026.18.03</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-slate-200 text-slate-400 text-[10px] font-black px-4 py-1">STABLE</Badge>
                    </Card>
                </section>

                <Button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    variant="ghost" 
                    className="w-full h-20 rounded-[2.5rem] text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-black tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 mt-8 border-2 border-dashed border-rose-100 dark:border-rose-900/30"
                >
                    <LogOut className="h-4 w-4" /> Sign Out from Instance
                </Button>
            </div>
        </div>
    )
}
