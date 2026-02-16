'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase, MapPin, DollarSign, Calendar, Star, CheckCircle,
    Share, Clock, ExternalLink
} from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/components/ui/use-toast";

interface InternshipCardProps {
    internship: any;
    onSave?: (id: number) => void;
    onApply?: (id: number) => void;
    hideActions?: boolean;
}

export function InternshipCard({ internship, onSave, onApply, hideActions = false }: InternshipCardProps) {
    const isDeadlineNear = new Date(internship.deadline) < new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

    return (
        <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm active:scale-[0.99] transition-transform duration-100">
            <CardHeader className="pb-2 pt-4 px-4 bg-slate-50/50">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold leading-tight">{internship.role}</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-700 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {internship.company}
                        </CardDescription>
                    </div>
                    {isDeadlineNear && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5 animate-pulse">
                            Urgent
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="py-3 px-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <DollarSign className="w-3 h-3 text-green-600" /> {internship.stipend}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <MapPin className="w-3 h-3 text-blue-600" /> {internship.location} ({internship.mode})
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 text-amber-500" /> {internship.eligibilityCgpa}+ CGPA
                    </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 font-medium pt-1">
                    <Clock className="w-3 h-3" />
                    Apply by {new Date(internship.deadline).toLocaleDateString()}
                </div>
            </CardContent>

            {!hideActions && (
                <CardFooter className="bg-slate-50 px-4 py-2 flex gap-2 border-t">
                    <Link href={`/student/internships/${internship.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs h-8">
                            View Details
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                        onClick={() => onApply?.(internship.id)}
                    >
                        Apply Now
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-amber-500"
                        onClick={() => onSave?.(internship.id)}
                    >
                        <Star className="w-4 h-4" />
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

export function ApplicationStatusCard({ application, internship }: { application: any, internship: any }) {
    const statusColors: Record<string, string> = {
        'SAVED': 'bg-slate-100 text-slate-600',
        'APPLIED': 'bg-blue-100 text-blue-700',
        'INTERVIEW': 'bg-purple-100 text-purple-700',
        'SELECTED': 'bg-green-100 text-green-700',
        'REJECTED': 'bg-red-100 text-red-700',
    };

    return (
        <Card className="mb-3 border-l-[3px] border-l-slate-300">
            <CardContent className="p-4 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm">{internship?.role || "Unknown Role"}</span>
                    <span className="text-xs text-muted-foreground">{internship?.company || "Unknown Company"}</span>
                    <span className="text-[10px] text-slate-400">
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                </div>
                <Badge className={`${statusColors[application.status]} hover:bg-opacity-80 border-0`}>
                    {application.status}
                </Badge>
            </CardContent>
        </Card>
    )
}
