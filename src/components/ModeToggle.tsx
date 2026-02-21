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
        <div className="relative flex items-center p-1 bg-slate-100/40 hover:bg-slate-100/60 transition-colors rounded-full w-fit border border-slate-200/50 backdrop-blur-md shadow-inner">
            {/* Elegant Background Slider with Multi-layered Gradient */}
            <div
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-bounce-ease z-0",
                    "shadow-[0_4px_12px_rgba(13,148,136,0.2)] bg-gradient-to-br from-[#0D9488] via-[#14B8A6] to-[#0F766E]",
                    "border border-white/20",
                    mode === 'internships'
                        ? "left-1"
                        : "left-[calc(50%+3px)]"
                )}
            />

            {/* Internships Switch Button */}
            <button
                onClick={() => handleModeSwitch('internships')}
                className={cn(
                    "relative min-w-[90px] md:min-w-[130px] h-9 md:h-11 rounded-full flex items-center justify-center gap-2 transition-all duration-500 z-10",
                    "hover:scale-[1.02] active:scale-95"
                )}
                aria-label="Switch to Internship Mode"
            >
                <Briefcase className={cn(
                    "w-3.5 h-3.5 md:w-4.5 md:h-4.5 transition-all duration-500 shrink-0",
                    mode === 'internships'
                        ? "text-white drop-shadow-sm"
                        : "text-slate-400"
                )} />
                <span className={cn(
                    "text-[10px] md:text-xs font-black uppercase tracking-[0.1em] transition-all duration-500 shrink-0",
                    mode === 'internships' ? "text-white block" : "text-slate-400 hidden"
                )}>
                    Jobs
                </span>
            </button>

            {/* Campus Switch Button */}
            <button
                onClick={() => handleModeSwitch('campus')}
                className={cn(
                    "relative min-w-[90px] md:min-w-[130px] h-9 md:h-11 rounded-full flex items-center justify-center gap-2 transition-all duration-500 z-10",
                    "hover:scale-[1.02] active:scale-95"
                )}
                aria-label="Switch to Campus Mode"
            >
                <GraduationCap className={cn(
                    "w-4 h-4 md:w-5.5 md:h-5.5 transition-all duration-500 shrink-0",
                    mode === 'campus'
                        ? "text-white drop-shadow-sm"
                        : "text-slate-400"
                )} />
                <span className={cn(
                    "text-[10px] md:text-xs font-black uppercase tracking-[0.1em] transition-all duration-500 shrink-0",
                    mode === 'campus' ? "text-white block" : "text-slate-400 hidden"
                )}>
                    Campus
                </span>
            </button>
        </div>
    );
}
