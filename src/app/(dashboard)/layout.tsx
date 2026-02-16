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
            {/* Top Navbar */}
            <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="flex h-16 items-center justify-between px-4 md:px-6">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 relative rounded-lg overflow-hidden shadow-sm">
                            <Image src="/icons/logo.svg" alt="Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-lg hidden sm:inline text-slate-900">CampusSync</span>
                    </div>

                    {/* Mode Toggle - Only for Students in Career/Campus modes */}
                    {!isAdmin && session?.user?.role !== 'FACULTY' && (
                        <div className="flex-1 flex justify-center px-4">
                            <ModeToggle />
                        </div>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                                    <User className="h-5 w-5 text-slate-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-xl">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-black text-slate-900">{session?.user?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{session?.user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => router.push('/home')} className="rounded-xl font-bold text-xs uppercase tracking-tight">
                                    Home Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/student/profile')} className="rounded-xl font-bold text-xs uppercase tracking-tight">
                                    Profile Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-50" />
                                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-500 rounded-xl font-bold text-xs uppercase tracking-tight">
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
                "flex-1 p-4 md:p-6 lg:p-8 space-y-4",
                !isAdmin && "pb-24" // Extra padding for bottom nav
            )}>
                {children}
            </main>

            {/* Bottom Navigation - Managed by BottomNav component */}
            <BottomNav />
        </div>
    )
}
