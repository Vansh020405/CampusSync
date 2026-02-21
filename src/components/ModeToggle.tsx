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
        <div className="relative flex items-center p-1 bg-slate-100/50 rounded-full w-fit border border-slate-200/50 backdrop-blur-sm">
            {/* Animated Background Slider */}
            <div
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-500 ease-bounce-ease shadow-sm bg-[#0D9488]",
                    mode === 'internships'
                        ? "left-1"
                        : "left-[calc(50%+3px)]"
                )}
            />

            {/* Internships Button */}
            <button
                onClick={() => handleModeSwitch('internships')}
                className={cn(
                    "relative w-20 md:w-32 py-2.5 md:py-2 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                    mode === 'internships' ? "" : ""
                )}
            >
                <Briefcase className={cn(
                    "w-3.5 h-3.5 md:w-5 md:h-5 transition-all duration-300",
                    mode === 'internships' ? "text-white scale-110" : "text-slate-400"
                )} />
            </button>

            {/* Campus Button */}
            <button
                onClick={() => handleModeSwitch('campus')}
                className={cn(
                    "relative w-20 md:w-32 py-2.5 md:py-2 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                    mode === 'campus' ? "" : ""
                )}
            >
                <GraduationCap className={cn(
                    "w-4 h-4 md:w-6 md:h-6 transition-all duration-300",
                    mode === 'campus' ? "text-white scale-110" : "text-slate-400"
                )} />
            </button>
        </div>
    );
}
