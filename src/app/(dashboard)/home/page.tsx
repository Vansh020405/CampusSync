'use client';

import { useEffect } from "react";
import { useMode } from "@/contexts/ModeContext";
import InternshipDashboard from "@/components/dashboards/InternshipDashboard";
import CampusDashboard from "@/components/dashboards/CampusDashboard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const { mode } = useMode();
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
        } else if (session?.user?.role === 'FACULTY') {
            router.push('/faculty');
        } else if (mode === 'internships') {
            router.push('/home/internships');
        }
    }, [mode, session, router]);

    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'FACULTY' || mode === 'internships') {
        return null;
    }

    return (
        <div className="min-h-screen">
            <CampusDashboard />
        </div>
    );
}
