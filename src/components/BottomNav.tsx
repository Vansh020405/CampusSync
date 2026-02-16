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
    Clock
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
        { href: "/student/resume", label: "Resume", icon: FileText },
        { href: "/student/research", label: "Research", icon: Search },
        { href: "/student/applications", label: "Track", icon: CheckCircle },
    ]

    // Campus Mode Links
    const campusLinks = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/student/faculty", label: "Faculty", icon: Users },
        { href: "/student/classes", label: "Classes", icon: Calendar },
        { href: "/student/syllabus", label: "Syllabus", icon: BookOpen },
        { href: "/student/attendance", label: "Attendance", icon: Clock },
    ]

    const facultyLinks = [
        { href: "/faculty", label: "Dashboard", icon: Home },
        { href: "/faculty/availability", label: "Schedule", icon: Calendar },
        { href: "/faculty/bookings", label: "Bookings", icon: CheckCircle },
        { href: "/faculty/attendance", label: "Attendance", icon: Clock },
        { href: "/faculty/syllabus", label: "Syllabus", icon: BookOpen },
    ]

    const adminLinks = [
        { href: "/admin/dashboard", label: "Home", icon: Home },
        { href: "/admin/timetable", label: "Schedule", icon: Calendar },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/internships", label: "Jobs", icon: Briefcase },
        { href: "/admin/analytics", label: "Stats", icon: BarChart2 },
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
        <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex h-16 items-center justify-around px-2">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href))
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center py-2 text-xs font-medium transition-all hover:scale-105 active:scale-95",
                                isActive
                                    ? mode === 'internships'
                                        ? "text-blue-600"
                                        : "text-emerald-600"
                                    : "text-slate-500"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 mb-1 transition-all",
                                isActive && "fill-current scale-110"
                            )} />
                            <span className="text-[10px] scale-90">{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
