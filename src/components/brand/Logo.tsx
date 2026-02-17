
import React from 'react';
import { cn } from '@/lib/utils';

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
                    variant === 'dark' ? "bg-slate-900" : "bg-white"
                )}
            >
                {/* Dynamic SVG Logo */}
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3/4 h-3/4"
                >
                    {/* Outer Sync Circle Layer 1 */}
                    <path
                        d="M80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50C20 33.4315 33.4315 20 50 20"
                        stroke={variant === 'dark' ? "white" : "#0f172a"}
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="opacity-20"
                    />

                    {/* Styled 'C' and 'S' Integration */}
                    <path
                        d="M75 35C70 25 60 20 50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C60 80 70 75 75 65"
                        stroke="url(#logo-gradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />

                    {/* Inner 'S' Curve / Node Connection */}
                    <path
                        d="M35 50C35 40 45 35 50 35C60 35 65 45 65 50C65 55 60 65 50 65C45 65 35 60 35 50Z"
                        fill="url(#logo-gradient)"
                        className="animate-pulse"
                    />

                    {/* Sync Arrows / Pointers */}
                    <circle cx="75" cy="35" r="6" fill="#0D9488" />
                    <circle cx="75" cy="65" r="6" fill="#4F46E5" />

                    <defs>
                        <linearGradient id="logo-gradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4F46E5" />
                            <stop offset="1" stopColor="#0D9488" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {withText && (
                <div className="flex flex-col select-none">
                    <span className={cn(
                        "text-xl font-black tracking-tighter leading-none italic",
                        variant === 'dark' ? "text-slate-900" : "text-white"
                    )}>
                        Campus<span className="text-teal-600 not-italic">Sync</span>
                    </span>
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-[0.3em] opacity-40",
                        variant === 'dark' ? "text-slate-900" : "text-white"
                    )}>
                        Chitkara University
                    </span>
                </div>
            )}
        </div>
    );
};
