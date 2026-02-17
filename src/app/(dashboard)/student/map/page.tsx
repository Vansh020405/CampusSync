'use client'

import dynamic from 'next/dynamic'
import { Compass, Globe, Map as MapIcon, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

// Dynamically import the map with SSR disabled because MapLibre needs the window object
const CampusMap = dynamic(() => import('@/components/map/MapLibreMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-slate-950 flex flex-col items-center justify-center rounded-[3.5rem] border border-slate-900 gap-6 shadow-2xl">
            <div className="h-16 w-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white animate-spin">
                <Globe className="h-8 w-8" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Synchronizing MapLibre Engine...</p>
        </div>
    )
})

export default function StudentMapPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <header className="px-6 py-8 md:px-12 md:pt-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                            <Compass className="h-3 w-3" /> CHITKARA UNIVERSITY MAP
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                            Smart <span className="text-indigo-600 not-italic">Campus</span> Map
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg">
                            An interactive geospatial interface providing high-fidelity navigation and location insights for Chitkara University.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 leading-none">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live View
                            </p>
                        </div>
                        <div className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coverage</p>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                                <ShieldCheck className="h-3 w-3 text-indigo-500" /> Full Campus
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="pb-20"
            >
                <CampusMap />
            </motion.main>

            {/* Footer Accent */}
            <div className="max-w-7xl mx-auto px-6 pb-20 opacity-30">
                <div className="flex items-center justify-center gap-4 text-slate-400 font-black text-[9px] uppercase tracking-[0.5em]">
                    <div className="h-px w-20 bg-slate-200" />
                    Verified Proprietary Navigation Data
                    <div className="h-px w-20 bg-slate-200" />
                </div>
            </div>
        </div>
    )
}
