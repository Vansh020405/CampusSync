'use client';

import { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar as CalendarIcon } from 'lucide-react';

export function Clock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-slate-50/50 backdrop-blur-sm border border-slate-100 rounded-2xl mr-4">
            <div className="flex items-center gap-2">
                <ClockIcon className="h-3.5 w-3.5 text-[#0D9488]" />
                <span className="text-[11px] font-black text-slate-700 tabular-nums uppercase tracking-widest">
                    {formatTime(time)}
                </span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {formatDate(time)}
                </span>
            </div>
        </div>
    );
}
