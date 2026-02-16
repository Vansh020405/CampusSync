'use client';

import { useStore } from "@/lib/store";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase, MapPin, DollarSign, Calendar, Star, CheckCircle,
    Share, Clock, ExternalLink, ArrowLeft
} from "lucide-react";
import Link from 'next/link';

export default function InternshipDetailsPage() {
    const { id } = useParams();
    const { internships } = useStore();
    const internship = internships.find(i => i.id === Number(id));

    if (!internship) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
                <h2 className="text-xl font-bold mb-2">Internship Not Found</h2>
                <Link href="/student/internships">
                    <Button variant="outline">Back to Feed</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center gap-4">
                <Link href="/student/internships">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold truncate">{internship.role}</h1>
                    <p className="text-xs text-muted-foreground truncate">{internship.company}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {/* Meta info */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stipend</span>
                        <span className="font-semibold text-green-700">{internship.stipend}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {internship.location} ({internship.mode})
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Apply Before</span>
                        <span className="font-medium text-amber-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(internship.deadline).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Eligibility</span>
                        <Badge variant="secondary" className="text-xs">
                            {internship.eligibilityCgpa}+ CGPA
                        </Badge>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Job Description</h2>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {internship.description}
                    </p>
                </div>

                {/* Branches */}
                <div className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Allowed Branches</h2>
                    <div className="flex flex-wrap gap-2">
                        {internship.branchesAllowed.map((branch: string) => (
                            <Badge key={branch} variant="outline" className="text-xs font-normal">
                                {branch}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Selection Process (Mock) */}
                <div className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Selection Process</h2>
                    <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1 pl-1">
                        <li>Resume Shortlisting</li>
                        <li>Online Assessment</li>
                        <li>Technical Interview</li>
                        <li>HR Discussion</li>
                    </ol>
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
                <Button variant="outline" className="flex-1" onClick={() => alert("Saved!")}>
                    Save
                </Button>
                <Button className="flex-[2] bg-blue-600 hover:bg-blue-700" onClick={() => alert("Applied!")}>
                    Apply Now <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
            </div>
        </div>
    );
}
