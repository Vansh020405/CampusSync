'use client';

import { useStore } from "@/lib/store";
import { ApplicationStatusCard } from "@/components/InternshipComponents";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default function ApplicationsPage() {
    const { internships, getStudentApplications } = useStore();
    // In a real app, this would use the session user id
    const mockStudentId = "student@campus.edu";
    const applications = getStudentApplications(mockStudentId);

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold">No Applications Yet</h2>
                    <p className="text-muted-foreground text-sm">Start applying to internships to see them here.</p>
                </div>
                <Link href="/student/internships">
                    <Button>Browse Opportunities</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/student">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold">My Applications</h1>
            </div>

            <div className="space-y-3">
                {applications.map(({ application, internship }) => (
                    <ApplicationStatusCard
                        key={application.id}
                        application={application}
                        internship={internship}
                    />
                ))}
            </div>
        </div>
    );
}
