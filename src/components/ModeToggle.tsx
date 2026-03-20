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
        <div className="relative flex items-center p-1.5 bg-slate-100 dark:bg-card transition-all rounded-full w-[84px] h-[44px] border border-slate-200/50 dark:border-border shadow-inner group">
            {/* Elegant Background Slider with Multi-layered Gradient */}
            <div
                className={cn(
                    "absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-in-out z-0",
                    "shadow-[0_4px_12px_rgba(13,148,136,0.2)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.6)] bg-gradient-to-br from-[#0D9488] via-[#14B8A6] to-[#0F766E] dark:from-primary dark:via-primary dark:to-primary",
                    "border border-white/20 dark:border-black/50",
                    mode === 'internships'
                        ? "translate-x-0"
                        : "translate-x-[calc(100%+0px)]"
                )}
            />

            {/* Internships Switch Button */}
            <button
                onClick={() => handleModeSwitch('internships')}
                className={cn(
                    "relative w-1/2 h-full flex items-center justify-center transition-all duration-500 z-10 rounded-full",
                    "bg-transparent border-none outline-none focus:outline-none",
                    "hover:bg-transparent active:bg-transparent focus-visible:outline-none",
                    "![background-color:transparent] [-webkit-tap-highlight-color:transparent]"
                )}
                aria-label="Switch to Internship Mode"
            >
                <Briefcase className={cn(
                    "w-5 h-5 transition-all duration-500",
                    mode === 'internships'
                        ? "text-white dark:text-primary-foreground drop-shadow-sm scale-110"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-muted-foreground dark:group-hover:text-foreground"
                )} />
            </button>

            {/* Campus Switch Button */}
            <button
                onClick={() => handleModeSwitch('campus')}
                className={cn(
                    "relative w-1/2 h-full flex items-center justify-center transition-all duration-500 z-10 rounded-full",
                    "bg-transparent border-none outline-none focus:outline-none",
                    "hover:bg-transparent active:bg-transparent focus-visible:outline-none",
                    "![background-color:transparent] [-webkit-tap-highlight-color:transparent]"
                )}
                aria-label="Switch to Campus Mode"
            >
                <GraduationCap className={cn(
                    "w-5 h-5 transition-all duration-500",
                    mode === 'campus'
                        ? "text-white dark:text-primary-foreground drop-shadow-sm scale-110"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-muted-foreground dark:group-hover:text-foreground"
                )} />
            </button>
        </div>
    );
}
