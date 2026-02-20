'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMode } from "@/contexts/ModeContext"
import { cn } from "@/lib/utils"
import {
    Briefcase,
    Users,
    FileText,
    BarChart2,
    BookOpen,
    Calendar,
    CheckCircle,
    GraduationCap,
    Home,
    Search,
    Bell,
    Clock,
    LayoutGrid
} from "lucide-react"

export function BottomNav() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { mode } = useMode()
    const role = session?.user?.role?.toLowerCase()

    if (!role) return null

    // Internships Mode Links
    const internshipsLinks = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/student/internships", label: "Jobs", icon: Briefcase },
        { href: "/student/menu", label: "Apps", icon: LayoutGrid },
        { href: "/student/resume", label: "Resume", icon: FileText },
        { href: "/student/applications", label: "Track", icon: CheckCircle },
    ]

    // Campus Mode Links
    const campusLinks = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/student/classes", label: "Classes", icon: Calendar },
        { href: "/student/menu", label: "Apps", icon: LayoutGrid },
        { href: "/student/syllabus", label: "Syllabus", icon: BookOpen },
        { href: "/student/attendance", label: "Attendance", icon: Clock },
    ]

    const facultyLinks = [
        { href: "/faculty", label: "Home", icon: Home },
        { href: "/faculty/availability", label: "Schedule", icon: Calendar },
        { href: "/faculty/menu", label: "Apps", icon: LayoutGrid },
        { href: "/faculty/attendance", label: "Attendance", icon: Clock },
        { href: "/faculty/syllabus", label: "Syllabus", icon: BookOpen },
    ]

    const adminLinks = [
        { href: "/admin/dashboard", label: "Home", icon: Home },
        { href: "/admin/timetable", label: "Schedule", icon: Calendar },
        { href: "/admin/syllabus", label: "Syllabus", icon: BookOpen },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/internships", label: "Jobs", icon: Briefcase },
    ]

    let links: { href: string; label: string; icon: any }[] = []
    if (role === 'student') {
        links = mode === 'internships' ? internshipsLinks : campusLinks
    } else if (role === 'faculty') {
        links = facultyLinks
    } else if (role === 'admin') {
        links = adminLinks
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[3rem] py-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between px-8 relative">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href))

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center transition-all duration-500 group",
                                isActive ? "text-[#0D9488]" : "text-slate-400"
                            )}
                            title={link.label}
                        >
                            <div className={cn(
                                "relative z-10 p-3 rounded-2xl transition-all duration-500",
                                isActive ? "bg-[#0D9488]/10 scale-110" : "group-hover:bg-slate-50"
                            )}>
                                <Icon className={cn(
                                    "h-6 w-6 transition-all duration-500",
                                    isActive ? "stroke-[2.5]" : "stroke-[1.5]"
                                )} />
                                {isActive && (
                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D9488] opacity-20"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D9488]"></span>
                                    </span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
