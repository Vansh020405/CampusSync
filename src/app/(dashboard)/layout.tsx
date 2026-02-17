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
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* Top Navbar - Optimized for Mobile */}
            <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="relative flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
                    {/* Left: Logo Tag */}
                    <div className="flex items-center shrink-0">
                        <BrandLogo size={34} className="md:size-[42px]" withText={false} />
                        <div className="hidden md:block ml-2">
                            <span className="text-xl font-black tracking-tighter leading-none italic text-slate-900 leading-none">
                                Campus<span className="text-teal-600 not-italic">Sync</span>
                            </span>
                        </div>
                    </div>

                    {/* Center: Mode Switcher Pill */}
                    {!isAdmin && session?.user?.role !== 'FACULTY' && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
                                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
                                    <User className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] border-slate-100 shadow-2xl p-2 mt-2">
                                <DropdownMenuLabel className="px-4 py-3">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold text-slate-800">{session?.user?.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{session?.user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => router.push('/home')} className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-tight text-slate-600 hover:text-slate-900 transition-colors">
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/student/profile')} className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-tight text-slate-600 hover:text-slate-900 transition-colors">
                                    Profile Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-500 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-tight hover:bg-red-50 transition-colors">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={cn(
                "flex-1 p-3 md:p-6 lg:p-8 space-y-4",
                !isAdmin && "pb-24" // Extra padding for bottom nav
            )}>
                {children}
            </main>

            {/* Bottom Navigation - Managed by BottomNav component */}
            <BottomNav />
        </div>
    )
}
