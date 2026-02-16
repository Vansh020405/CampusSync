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
                <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
                    {/* Left: CS Logo Tag */}
                    <div className="flex items-center">
                        <div className="h-9 w-9 md:h-10 md:w-10 bg-[#0D9488] rounded-xl flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-emerald-600/10 text-sm md:text-base">
                            CS
                        </div>
                    </div>

                    {/* Center: Mode Switcher Pill */}
                    {!isAdmin && session?.user?.role !== 'FACULTY' && (
                        <div className="flex-1 flex justify-center">
                            <ModeToggle />
                        </div>
                    )}

                    {/* Right: User Profile Circle */}
                    <div className="flex items-center">
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
