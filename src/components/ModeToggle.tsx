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
        router.push('/home');
    };

    return (
        <div className="relative flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full w-full max-w-xs mx-auto shadow-inner">
            {/* Animated Background Slider */}
            <div
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out shadow-md",
                    mode === 'internships'
                        ? "left-1 bg-gradient-to-r from-indigo-600 to-blue-600"
                        : "left-[calc(50%+2px)] bg-gradient-to-r from-emerald-600 to-teal-600"
                )}
            />

            {/* Internships Button */}
            <button
                onClick={() => handleModeSwitch('internships')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 z-10",
                    mode === 'internships'
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
            >
                <Briefcase className={cn(
                    "w-4 h-4 transition-all duration-300",
                    mode === 'internships' && "scale-110"
                )} />
                <span className="hidden sm:inline">Internships</span>
            </button>

            {/* Campus Button */}
            <button
                onClick={() => handleModeSwitch('campus')}
                className={cn(
                    "relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 z-10",
                    mode === 'campus'
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
            >
                <GraduationCap className={cn(
                    "w-4 h-4 transition-all duration-300",
                    mode === 'campus' && "scale-110"
                )} />
                <span className="hidden sm:inline">Campus</span>
            </button>
        </div>
    );
}
