'use client'

import dynamic from 'next/dynamic'
import { Globe } from 'lucide-react'

const CampusMap = dynamic(() => import('@/components/map/MapLibreMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-50 dark:bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
            <Globe className="h-10 w-10 text-emerald-500 animate-pulse" />
            <p className="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.3em]">Loading Map...</p>
        </div>
    )
})

export default function StudentMapPage() {
    return (
        <div className="h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-[#0A0A0A] overflow-hidden">
            <CampusMap />
        </div>
    )
}
