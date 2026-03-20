'use client'

import { useState } from 'react'
import {
    Trophy,
    Plus,
    Calendar,
    MapPin,
    Award,
    Upload,
    X,
    CheckCircle2,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Achievement {
    id: string
    eventName: string
    venue: string
    position: '1st' | '2nd' | '3rd' | 'PARTICIPATION'
    date: string
    hasCertificate: boolean
}

export default function AchievementsPage() {
    const { toast } = useToast()
    const [achievements, setAchievements] = useState<Achievement[]>([
        {
            id: '1',
            eventName: 'Inter-College Hackathon',
            venue: 'Tech Park, Block B',
            position: '1st',
            date: '2024-01-15',
            hasCertificate: true
        },
        {
            id: '2',
            eventName: 'Regional Sports Meet',
            venue: 'Main Stadium',
            position: '2nd',
            date: '2023-12-10',
            hasCertificate: true
        }
    ])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeFilter, setActiveFilter] = useState<'ALL' | Achievement['position']>('ALL')
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
    const [formData, setFormData] = useState({
        eventName: '',
        venue: '',
        position: 'PARTICIPATION' as Achievement['position'],
        date: new Date().toISOString().split('T')[0],
        certificate: null as File | null
    })

    const filteredAchievements = activeFilter === 'ALL' 
        ? achievements 
        : achievements.filter(a => a.position === activeFilter)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newAchievement: Achievement = {
            id: Math.random().toString(36).substr(2, 9),
            eventName: formData.eventName,
            venue: formData.venue,
            position: formData.position,
            date: formData.date,
            hasCertificate: !!formData.certificate
        }

        setAchievements([newAchievement, ...achievements])
        setIsModalOpen(false)
        setFormData({ eventName: '', venue: '', position: 'PARTICIPATION', date: new Date().toISOString().split('T')[0], certificate: null })

        toast({
            title: "Asset Verified & Logged",
            description: "Institutional milestone has been encrypted to your profile.",
        })
    }

    const positionOptions = [
        { value: '1st', label: '1st Place', color: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' },
        { value: '2nd', label: '2nd Place', color: 'bg-slate-100 dark:bg-muted text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border' },
        { value: '3rd', label: '3rd Place', color: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' },
        { value: 'PARTICIPATION', label: 'Participation', color: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-10 px-4 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 shrink-0">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-foreground flex items-center gap-4 italic uppercase">
                        <Trophy className="h-12 w-12 text-yellow-500 dark:text-yellow-400 drop-shadow-xl" />
                        <span className="text-yellow-500 dark:text-yellow-400 not-italic">AChievements</span>
                    </h1>
                    <p className="text-slate-500 dark:text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] ml-1">
                        Institutional Achievement Space
                    </p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-[1.5rem] bg-slate-900 dark:bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black dark:hover:bg-primary/90 transition-all active:scale-95">
                            <Plus className="h-5 w-5" />
                            add new achievement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] max-h-[50vh] rounded-[2.5rem] bg-white dark:bg-card border-0 dark:border dark:border-border shadow-[0_0_80px_rgba(0,0,0,0.2)] p-0 overflow-hidden flex flex-col">
                        <div className="bg-slate-950 p-6 text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/20 rounded-full blur-[80px] -mr-24 -mt-24" />
                            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Achievement</DialogTitle>
                            <DialogDescription className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1 leading-none">
                               Institutional Performance
                            </DialogDescription>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ml-2">event name</Label>
                                    <Input
                                        required
                                        placeholder="e.g. ALPHA HACKATHON 2024"
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-muted border-none font-bold text-slate-900 dark:text-foreground text-xs uppercase tracking-tight placeholder:text-slate-300 dark:placeholder:text-muted-foreground/30 px-5 focus-visible:ring-2 focus-visible:ring-yellow-500"
                                        value={formData.eventName}
                                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ml-2">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            required
                                            placeholder="LOCATION UNIT..."
                                            className="h-12 pl-12 rounded-xl bg-slate-50 dark:bg-muted border-none font-bold text-slate-900 dark:text-foreground text-xs uppercase tracking-tight placeholder:text-slate-300 dark:placeholder:text-muted-foreground/30 focus-visible:ring-2 focus-visible:ring-yellow-500"
                                            value={formData.venue}
                                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ml-2">Position</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {positionOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, position: opt.value as Achievement['position'] })}
                                                className={cn(
                                                    "h-10 rounded-xl border text-[9px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5",
                                                    formData.position === opt.value
                                                        ? opt.color + " shadow-inner scale-[0.97] border-transparent"
                                                        : "bg-white dark:bg-muted border-slate-100 dark:border-border text-slate-400 dark:text-muted-foreground/50 hover:border-slate-300 dark:hover:border-muted-foreground"
                                                )}
                                            >
                                                {formData.position === opt.value && <CheckCircle2 className="h-3 w-3" />}
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ml-2">Event Date</Label>
                                    <div className="relative w-full">
                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <Input
                                            required
                                            type="date"
                                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-muted border-none font-bold text-slate-900 dark:text-foreground text-xs uppercase tracking-tight focus-visible:ring-2 focus-visible:ring-yellow-500 [color-scheme:light] dark:[color-scheme:dark] appearance-none"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-muted-foreground ml-2">Certificate (if any)</Label>
                                    <div className="relative group/upload">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setFormData({ ...formData, certificate: e.target.files?.[0] || null })}
                                        />
                                        <div className={cn(
                                            "h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all group-hover/upload:bg-slate-100 dark:group-hover/upload:bg-muted/50",
                                            formData.certificate 
                                                ? "border-emerald-500 bg-emerald-500/5" 
                                                : "border-slate-200 dark:border-border bg-slate-50 dark:bg-muted"
                                        )}>
                                            {formData.certificate ? (
                                                <>
                                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase truncate px-6 tracking-widest">{formData.certificate.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-6 w-6 text-slate-300 dark:text-muted-foreground/30" />
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-muted-foreground/50 uppercase tracking-[0.3em]">upload</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-primary text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[0.98] transition-all">
                                    submit
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Achievements List Container */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 shrink-0">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-muted-foreground whitespace-nowrap">
                        {activeFilter === 'ALL' ? 'ALL achievements' : `${activeFilter} milestone logs`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            onClick={() => setActiveFilter('ALL')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                                activeFilter === 'ALL' 
                                    ? "bg-slate-900 dark:bg-primary text-white border-transparent shadow-md" 
                                    : "bg-white dark:bg-card border-slate-100 dark:border-border text-slate-400 hover:text-indigo-600"
                            )}
                        >
                            ALL
                        </button>
                        {positionOptions.map(opt => (
                            <button 
                                key={opt.value}
                                onClick={() => setActiveFilter(opt.value as Achievement['position'])}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                                    activeFilter === opt.value 
                                        ? "bg-slate-900 dark:bg-primary text-white border-transparent shadow-md" 
                                        : "bg-white dark:bg-card border-slate-100 dark:border-border text-slate-400 hover:text-indigo-600"
                                )}
                            >
                                {opt.value === 'PARTICIPATION' ? 'Entry' : opt.value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable List */}
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-3 pb-8">
                        <AnimatePresence mode="popLayout">
                            {filteredAchievements.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedAchievement(item)}
                                    className="group relative bg-white dark:bg-card border-0 dark:border dark:border-border rounded-2xl p-4 hover:bg-slate-50 dark:hover:bg-muted/30 transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                            item.position === '1st' ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                                                item.position === '2nd' ? "bg-slate-50 dark:bg-muted text-slate-500 dark:text-slate-400" :
                                                    item.position === '3rd' ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                                                        "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        )}>
                                            <Trophy className="h-5 w-5 stroke-[2]" />
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-slate-900 dark:text-foreground tracking-tight uppercase truncate">
                                                    {item.eventName}
                                                </h4>
                                                {item.hasCertificate && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 dark:text-muted-foreground uppercase tracking-wider mt-0.5">
                                                <span className="flex items-center gap-1 truncate">
                                                    <MapPin className="h-3 w-3 text-indigo-500 shrink-0" /> {item.venue}
                                                </span>
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <Calendar className="h-3 w-3 text-indigo-500 shrink-0" /> {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0 whitespace-nowrap",
                                            item.position === '1st' ? "bg-yellow-100/50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30" :
                                                item.position === '2nd' ? "bg-slate-100/50 dark:bg-muted text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border" :
                                                    item.position === '3rd' ? "bg-orange-100/50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30" :
                                                        "bg-blue-100/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                                        )}>
                                            {item.position === 'PARTICIPATION' ? 'Entry' : item.position}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Achievement Detail Modal */}
            <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
                <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-[400px] rounded-[2.5rem] bg-white dark:bg-card border-0 dark:border dark:border-border shadow-2xl p-0 overflow-hidden">
                    {selectedAchievement && (
                        <>
                            <div className="bg-slate-950 p-8 text-white relative">
                                <div className={cn(
                                    "absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -mr-24 -mt-24",
                                    selectedAchievement.position === '1st' ? "bg-yellow-500/20" : "bg-indigo-500/20"
                                )} />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                                        selectedAchievement.position === '1st' ? "bg-yellow-500/20 text-yellow-400" : "bg-indigo-500/20 text-indigo-400"
                                    )}>
                                        <Trophy className="h-8 w-8" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entry ID</p>
                                        <p className="text-xs font-mono text-slate-300 uppercase">{selectedAchievement.id}</p>
                                    </div>
                                </div>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter mt-6 leading-tight">
                                    {selectedAchievement.eventName}
                                </DialogTitle>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Position</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-foreground uppercase italic tracking-tight">{selectedAchievement.position === 'PARTICIPATION' ? 'Entry' : selectedAchievement.position}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight">{new Date(selectedAchievement.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location Coordinates</p>
                                    <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight">
                                        <MapPin className="h-4 w-4 text-indigo-500" />
                                        {selectedAchievement.venue}
                                    </div>
                                </div>
                                {selectedAchievement.hasCertificate && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-border">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Certificate Verified</span>
                                        </div>
                                    </div>
                                )}
                                <Button 
                                    onClick={() => setSelectedAchievement(null)}
                                    className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-muted text-white dark:text-foreground font-black text-xs uppercase tracking-[0.4em] hover:scale-[0.98] transition-all"
                                >
                                    Close Cache
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
