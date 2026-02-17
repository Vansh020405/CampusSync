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
    const [formData, setFormData] = useState({
        eventName: '',
        venue: '',
        position: 'PARTICIPATION' as Achievement['position'],
        certificate: null as File | null
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const newAchievement: Achievement = {
            id: Math.random().toString(36).substr(2, 9),
            eventName: formData.eventName,
            venue: formData.venue,
            position: formData.position,
            date: new Date().toISOString().split('T')[0],
            hasCertificate: !!formData.certificate
        }

        setAchievements([newAchievement, ...achievements])
        setIsModalOpen(false)
        setFormData({ eventName: '', venue: '', position: 'PARTICIPATION', certificate: null })

        toast({
            title: "Achievement Logged!",
            description: "Your new milestone has been added to your profile.",
        })
    }

    const positionOptions = [
        { value: '1st', label: '1st Place', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        { value: '2nd', label: '2nd Place', color: 'bg-slate-100 text-slate-700 border-slate-200' },
        { value: '3rd', label: '3rd Place', color: 'bg-orange-100 text-orange-700 border-orange-200' },
        { value: 'PARTICIPATION', label: 'Participation', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-8 px-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Trophy className="h-10 w-10 text-yellow-500" />
                        Achievements
                    </h1>
                    <p className="text-slate-500 font-medium">Your digital trophy cabinet and milestones</p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95">
                            <Plus className="h-5 w-5" />
                            Create New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-slate-100 shadow-2xl p-0 overflow-hidden">
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Log Achievement</DialogTitle>
                            <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                Record your latest victory
                            </DialogDescription>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Name</Label>
                                    <Input
                                        required
                                        placeholder="e.g. Annual Tech Fest 2024"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900 placeholder:text-slate-300"
                                        value={formData.eventName}
                                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Venue</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            required
                                            placeholder="Location details..."
                                            className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900 placeholder:text-slate-300"
                                            value={formData.venue}
                                            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Position / Performance</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {positionOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, position: opt.value as Achievement['position'] })}
                                                className={cn(
                                                    "h-11 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2",
                                                    formData.position === opt.value
                                                        ? opt.color + " shadow-inner scale-[0.98]"
                                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                                )}
                                            >
                                                {formData.position === opt.value && <CheckCircle2 className="h-3 w-3" />}
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Certificate (Optional)</Label>
                                    <div className="relative group/upload">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setFormData({ ...formData, certificate: e.target.files?.[0] || null })}
                                        />
                                        <div className={cn(
                                            "h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group-hover/upload:border-slate-300",
                                            formData.certificate ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"
                                        )}>
                                            {formData.certificate ? (
                                                <>
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                    <p className="text-[10px] font-bold text-emerald-700 uppercase truncate px-4">{formData.certificate.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-6 w-6 text-slate-300" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tap to Upload</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full h-12 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all">
                                    Seal Achievement
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Gold Wins', value: achievements.filter(a => a.position === '1st').length, icon: Trophy, color: 'text-yellow-500' },
                    { label: 'Total Events', value: achievements.length, icon: Award, color: 'text-blue-500' },
                    { label: 'Participation', value: achievements.filter(a => a.position === 'PARTICIPATION').length, icon: Calendar, color: 'text-emerald-500' },
                    { label: 'Top 3', value: achievements.filter(a => ['1st', '2nd', '3rd'].includes(a.position)).length, icon: CheckCircle2, color: 'text-rose-500' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-2">
                        <div className={cn("p-2 rounded-xl w-fit bg-slate-50", stat.color)}>
                            <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Achievements List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Timeline</h3>
                    <div className="flex items-center gap-2">
                        <button className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                            <Search className="h-4 w-4" />
                        </button>
                        <button className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                            <Filter className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {achievements.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden",
                                            item.position === '1st' ? "bg-yellow-50 text-yellow-600" :
                                                item.position === '2nd' ? "bg-slate-50 text-slate-500" :
                                                    item.position === '3rd' ? "bg-orange-50 text-orange-600" :
                                                        "bg-blue-50 text-blue-600"
                                        )}>
                                            <Trophy className="h-8 w-8 stroke-[1.5]" />
                                            <div className="absolute top-0 right-0 p-1">
                                                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                                    {item.eventName}
                                                </h4>
                                                {item.hasCertificate && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                            </div>
                                            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {item.venue}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                            item.position === '1st' ? "bg-yellow-100/50 text-yellow-700 border-yellow-200" :
                                                item.position === '2nd' ? "bg-slate-100/50 text-slate-700 border-slate-200" :
                                                    item.position === '3rd' ? "bg-orange-100/50 text-orange-700 border-orange-200" :
                                                        "bg-blue-100/50 text-blue-700 border-blue-200"
                                        )}>
                                            {item.position === 'PARTICIPATION' ? 'Participation' : `${item.position} Place`}
                                        </div>
                                        <button className="h-10 w-10 md:h-12 md:w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all ml-auto md:ml-0">
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
