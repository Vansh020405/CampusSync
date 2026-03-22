'use client'

import Image from "next/image"
import { ModeToggle } from "@/components/ModeToggle"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { BottomNav } from "@/components/BottomNav"
import { Clock } from "@/components/Clock"
import { PlacementMentorChat } from "@/components/chat/PlacementMentorChat"
import { ThemeToggle } from "@/components/ThemeToggle"
import { BrandLogo } from "@/components/brand/Logo"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const isAdmin = session?.user?.role === 'ADMIN'

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/")
        }
    }, [status, router])

    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (status === "unauthenticated") return null

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-background">
            {/* Top Navbar - Optimized for Mobile */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-100 dark:border-border">
                <div className="flex h-16 items-center justify-between px-3 md:px-6 gap-2">
                    {/* Left: Logo Tag */}
                    <div className="flex items-center shrink-0 w-auto">
                        <BrandLogo size={32} withText className="ml-1 md:ml-2 scale-90 md:scale-100 origin-left" />
                    </div>

                    {/* Center: Mode Switcher Pill */}
                    {!isAdmin && session?.user?.role !== 'FACULTY' && !pathname.startsWith('/admin') && (
                        <div className="flex-1 flex justify-center w-full max-w-[200px] sm:max-w-none">
                            <ModeToggle />
                        </div>
                    )}

                    {/* Right: User Profile Circle */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:block">
                            <Clock />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-slate-50 dark:bg-card border border-slate-100 dark:border-border hover:bg-slate-100 dark:hover:bg-secondary transition-all">
                                    <User className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-[2.5rem] bg-white dark:bg-card border-slate-100 dark:border-border shadow-2xl p-2 mt-2 overflow-hidden">
                                <DropdownMenuLabel className="px-5 py-4">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-base font-black text-slate-900 dark:text-foreground tracking-tight">{session?.user?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-[0.15em] truncate">{session?.user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50 dark:bg-border mx-2" />
                                <div className="p-1 space-y-1">
                                    <DropdownMenuItem onClick={() => router.push('/home')} className="rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-slate-900 dark:hover:text-foreground transition-all cursor-pointer">
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/student/profile')} className="rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-muted hover:text-slate-900 dark:hover:text-foreground transition-all cursor-pointer">
                                        Profile
                                    </DropdownMenuItem>
                                </div>
                                <DropdownMenuSeparator className="bg-slate-50 dark:bg-border mx-2" />
                                <div className="p-1">
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-rose-500 dark:text-rose-400 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-3">
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={cn(
                "flex-1 p-3 md:p-6 lg:p-8 space-y-4",
                !isAdmin && !pathname.startsWith('/admin') && "pb-24" // Extra padding for bottom nav
            )}>
                {children}
            </main>

            {/* Bottom Navigation - Managed by BottomNav component */}
            {!pathname.startsWith('/admin') && <BottomNav />}

            {/* AI Placement Mentor for Students */}
            {session?.user?.role === 'STUDENT' && <PlacementMentorChat />}
        </div>
    )
}
