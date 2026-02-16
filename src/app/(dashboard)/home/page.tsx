'use client';

import { useMode } from "@/contexts/ModeContext";
import InternshipDashboard from "@/components/dashboards/InternshipDashboard";
import CampusDashboard from "@/components/dashboards/CampusDashboard";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function HomePage() {
    const { mode } = useMode();
    const { data: session } = useSession();

    if (session?.user?.role === 'ADMIN') {
        redirect('/admin/dashboard');
    }

    if (session?.user?.role === 'FACULTY') {
        redirect('/faculty');
    }

    return (
        <div className="min-h-screen">
            {mode === 'internships' ? <InternshipDashboard /> : <CampusDashboard />}
        </div>
    );
}
