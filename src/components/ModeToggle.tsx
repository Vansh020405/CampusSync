'use client';

import { useRouter } from 'next/navigation';
import { useMode } from '@/contexts/ModeContext';
import { Briefcase, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeToggle() {
    const { mode, setMode } = useMode();
    const router = useRouter();

    const handleModeSwitch = (newMode: 'internships' | 'campus') => {
        setMode(newMode);
        router.push(newMode === 'internships' ? '/home/internships' : '/home');
    };

    return (
        <div className="relative flex items-center p-1 bg-slate-100 transition-colors rounded-full w-48 border border-slate-200/50 shadow-inner group">
            {/* Elegant Background Slider with Multi-layered Gradient */}
            <div
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-in-out z-0",
                    "shadow-[0_4px_12px_rgba(13,148,136,0.3)] bg-gradient-to-br from-[#0D9488] via-[#14B8A6] to-[#0F766E]",
                    "border border-white/20",
                    mode === 'internships'
                        ? "translate-x-0"
                        : "translate-x-[calc(100%+0px)]"
                )}
            />

            {/* Internships Switch Button */}
            <button
                onClick={() => handleModeSwitch('internships')}
                className={cn(
                    "relative w-1/2 py-2 flex items-center justify-center gap-1.5 transition-all duration-500 z-10",
                )}
                aria-label="Switch to Internship Mode"
            >
                <Briefcase className={cn(
                    "w-3.5 h-3.5 transition-all duration-500",
                    mode === 'internships'
                        ? "text-white drop-shadow-sm scale-110"
                        : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider transition-all duration-500",
                    mode === 'internships' ? "text-white" : "text-slate-500"
                )}>
                    Jobs
                </span>
            </button>

            {/* Campus Switch Button */}
            <button
                onClick={() => handleModeSwitch('campus')}
                className={cn(
                    "relative w-1/2 py-2 flex items-center justify-center gap-1.5 transition-all duration-500 z-10",
                )}
                aria-label="Switch to Campus Mode"
            >
                <GraduationCap className={cn(
                    "w-4 h-4 transition-all duration-500",
                    mode === 'campus'
                        ? "text-white drop-shadow-sm scale-110"
                        : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider transition-all duration-500",
                    mode === 'campus' ? "text-white" : "text-slate-500"
                )}>
                    Campus
                </span>
            </button>
        </div>
    );
}
