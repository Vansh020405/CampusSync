import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
    className?: string;
    size?: number | string;
    withText?: boolean;
    variant?: 'light' | 'dark';
}

export const BrandLogo: React.FC<LogoProps> = ({
    className,
    size = 40,
    withText = false,
    variant = 'dark'
}) => {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div
                style={{ width: size, height: size }}
                className={cn(
                    "relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-lg transform transition-transform hover:scale-105 duration-300",
                    "bg-slate-900 dark:bg-white"
                )}
            >
                <Image
                    src="/logo.png"
                    alt="CampusSync Logo"
                    fill
                    className="object-cover"
                />
            </div>

            {withText && (
                <div className="flex flex-col select-none">
                    <span className={cn(
                        "text-xl font-black tracking-tighter leading-none italic",
                        "text-slate-900 dark:text-white"
                    )}>
                        Campus<span className="text-teal-600 dark:text-teal-400 not-italic">Sync</span>
                    </span>
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-[0.3em] opacity-40",
                        "text-slate-900 dark:text-white"
                    )}>
                        Chitkara University
                    </span>
                </div>
            )}
        </div>
    );
};
