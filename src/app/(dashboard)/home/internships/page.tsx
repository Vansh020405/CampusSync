'use client';

import InternshipDashboard from "@/components/dashboards/InternshipDashboard";
import { useMode } from "@/contexts/ModeContext";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InternshipHomePage() {
    const { mode } = useMode();
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            router.push('/admin/dashboard');
        } else if (session?.user?.role === 'FACULTY') {
            router.push('/faculty');
        } else if (mode === 'campus') {
            router.push('/home');
        }
    }, [mode, session, router]);

    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'FACULTY' || mode === 'campus') return null;

    return (
        <div className="min-h-screen">
            <InternshipDashboard />
        </div>
    );
}
