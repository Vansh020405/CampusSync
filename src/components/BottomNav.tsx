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
        <div className="fixed bottom-0 left-0 z-50 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 pt-2 pb-safe pb-6 md:pb-8 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.08)] safe-area-inset-bottom">
            <div className="flex items-center justify-around px-2 md:px-4 max-w-screen-xl mx-auto">
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href))
                    const isAttendance = link.label === 'Attendance'

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center transition-all duration-300 flex-1 min-w-0 px-1",
                                isActive ? "text-[#0D9488]" : "text-slate-400"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                isActive && isAttendance ? "bg-[#0D9488] text-white" : ""
                            )}>
                                <Icon className={cn(
                                    "h-5 w-5 md:h-[22px] md:w-[22px] transition-all",
                                    isActive && !isAttendance ? "stroke-[2.5]" : "stroke-[1.5]"
                                )} />
                            </div>
                            <span className={cn(
                                "text-[9px] md:text-[10px] font-bold mt-0.5 md:mt-1 tracking-tight transition-all duration-300 truncate max-w-full px-1 text-center",
                                isActive ? "opacity-100 text-[#0D9488]" : "opacity-70 text-slate-400"
                            )}>
                                {link.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
