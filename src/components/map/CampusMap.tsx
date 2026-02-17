'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import {
    MapPin,
    Navigation,
    Layers,
    Building2,
    Coffee,
    Car,
    Home,
    ShieldCheck,
    Search,
    ChevronRight,
    Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Fix for default marker icons not showing correctly in Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
})

interface CampusLocation {
    id: string
    name: string
    category: 'academic' | 'hostel' | 'canteen' | 'lab' | 'parking' | 'admin' | 'main'
    coords: [number, number]
    description: string
}

const LOCATIONS: CampusLocation[] = [
    { id: 'main', name: 'Chitkara University', category: 'main', coords: [30.51794484908655, 76.65919385345458], description: 'Main University Entrance' },
    { id: 'square-one', name: "Square One", category: 'canteen', coords: [30.515175958350476, 76.659824841262], description: 'Main Cafeteria & Student Hub' },
    { id: 'admission', name: "Admission Block", category: 'admin', coords: [30.517773694865, 76.65884049772956], description: 'University Admissions & Enquiries' },
    { id: 'babbage', name: "Babbage Block", category: 'academic', coords: [30.51744071725377, 76.66012323474585], description: 'Applied Sciences Department' },
    { id: 'corbusier', name: "Le Corbusier", category: 'academic', coords: [30.51712811618798, 76.66041793874132], description: 'Architecture & Design' },
    { id: 'square-two', name: "Square Two", category: 'canteen', coords: [30.517309459470138, 76.66070462358044], description: 'Alternative Dining Area' },
    { id: 'alpha', name: "Alpha Zone", category: 'admin', coords: [30.517175363054424, 76.65949044803615], description: 'Administrative Hub' },
    { id: 'turing', name: "Turing Block", category: 'academic', coords: [30.516426777056175, 76.66051462532121], description: 'Computing Sciences' },
    { id: 'edison', name: "Edison Block", category: 'academic', coords: [30.51641986868414, 76.65975681504716], description: 'Electrical Engineering' },
    { id: 'newton', name: "Newton Block", category: 'academic', coords: [30.516411233218385, 76.65947413978621], description: 'Physics & Research' },
    { id: 'woods', name: "Chitkara Woods", category: 'admin', coords: [30.516058905552892, 76.65914535437466], description: 'Eco-friendly Green Space' },
    { id: 'medical', name: "Medical Room", category: 'admin', coords: [30.51600363835364, 76.66033218951283], description: 'Healthcare & First Aid' },
    { id: 'fleming', name: "Fleming Block", category: 'academic', coords: [30.515670933962564, 76.66088130845091], description: 'Biosciences Department' },
    { id: 'law', name: "Law Block", category: 'academic', coords: [30.515670933962564, 76.66088130845091], description: 'Institutional School of Law' },
    { id: 'chairman', name: "Chairman’s Office", category: 'admin', coords: [30.515734836877584, 76.66044827400862], description: 'Global Leadership Office' },
    { id: 'explore-hub', name: "Explore Hub", category: 'admin', coords: [30.515365235650147, 76.65941580762274], description: 'Innovation & Incubation' },
    { id: 'pythagoras', name: "Pythagoras Block", category: 'academic', coords: [30.515106168533364, 76.65909504136917], description: 'Mathematics Department' },
    { id: 'hospitality', name: "School of Hospitality", category: 'academic', coords: [30.514790105710357, 76.6594779560854], description: 'Culinary & Hotel Management' },
    { id: 'blue-tokai', name: "Blue Tokai", category: 'canteen', coords: [30.514790105710357, 76.65974459303366], description: 'Premium Coffee Shop' },
    { id: 'moon-hall', name: "Moon Hall", category: 'hostel', coords: [30.514788378588307, 76.66003127787278], description: 'Student Assembly Hall' },
    { id: 'rockefeller', name: "Rockefeller Block", category: 'academic', coords: [30.514004261995613, 76.65977466488067], description: 'Economics Department' },
    { id: 'martin-luther', name: "Martin Luther Block", category: 'academic', coords: [30.513933449394226, 76.66058459967093], description: 'Humanities & Social Sciences' },
    { id: 'omega', name: "Omega Zone", category: 'admin', coords: [30.51508930798686, 76.66079321314245], description: 'Strategy Control Center' },
    { id: 'beta', name: "Beta Zone", category: 'admin', coords: [30.515712481381915, 76.65979734807206], description: 'Operations Management' },
    { id: 'galileo', name: "Galileo Block", category: 'academic', coords: [30.51566553013159, 76.65906902878997], description: 'Astronomy & Aerospace' },
    { id: 'sportorium', name: "Sportorium", category: 'admin', coords: [30.515819188785123, 76.65804343640403], description: 'Indoor Sports Complex' },
    { id: 'explotorium', name: "Explotorium", category: 'admin', coords: [30.515819188785123, 76.65699802580777], description: 'Innovation Showcase Lab' },
    { id: 'tesla', name: "Tesla Block", category: 'academic', coords: [30.515819188785123, 76.65644807047038], description: 'Future Energy Lab' },
    { id: 'explore-stars', name: "Explore Stars", category: 'admin', coords: [30.516426072799995, 76.65894346942487], description: 'Center for Celestial Research' },
    { id: 'control', name: "Control Room", category: 'admin', coords: [30.516016983599542, 76.660544878004], description: 'Security & Campus Control' },
]

// Component to handle map center updates
function RecenterMap({ coords }: { coords: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        map.setView(coords, 17)
    }, [coords, map])
    return null
}

const categoryIcons = {
    academic: Building2,
    hostel: Home,
    canteen: Coffee,
    lab: Navigation,
    parking: Car,
    admin: ShieldCheck,
    main: MapPin
}

export default function CampusMap() {
    const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
    const [activeLocation, setActiveLocation] = useState<CampusLocation>(LOCATIONS[0])
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return (
        <div className="w-full h-[600px] bg-slate-50 flex items-center justify-center rounded-[2.5rem] border border-slate-100 italic text-slate-400">
            Initializing Campus Grid...
        </div>
    )

    const filteredLocations = selectedCategory === 'all'
        ? LOCATIONS
        : LOCATIONS.filter(l => l.category === selectedCategory)

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 font-sans">
            {/* Sidebar / Navigation */}
            <div className="w-full lg:w-80 shrink-0 space-y-6">
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Explorer</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Smart Campus Map</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1 mb-3">Categories</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['all', 'academic', 'hostel', 'canteen', 'admin'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight border transition-all truncate",
                                        selectedCategory === cat
                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200"
                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1 mb-4">Discover</p>
                    <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                        {filteredLocations.map((loc) => {
                            const Icon = categoryIcons[loc.category]
                            return (
                                <button
                                    key={loc.id}
                                    onClick={() => setActiveLocation(loc)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-3xl border transition-all group",
                                        activeLocation.id === loc.id
                                            ? "bg-slate-50 border-slate-200"
                                            : "bg-white border-transparent hover:bg-slate-50/50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                                        activeLocation.id === loc.id
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "bg-slate-50 text-slate-400 group-hover:bg-white"
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-900 uppercase truncate tracking-tight">{loc.name}</p>
                                        <p className="text-[10px] font-medium text-slate-400 truncate">{loc.description}</p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "h-3 w-3 transition-transform",
                                        activeLocation.id === loc.id ? "text-indigo-600 translate-x-1" : "text-slate-200"
                                    )} />
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden min-h-[500px] lg:min-h-[600px]">
                <MapContainer
                    center={activeLocation.coords}
                    zoom={17}
                    className="w-full h-full z-0"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredLocations.map((loc) => (
                        <Marker
                            key={loc.id}
                            position={loc.coords}
                            icon={defaultIcon}
                            eventHandlers={{
                                click: () => setActiveLocation(loc)
                            }}
                        >
                            <Popup className="rounded-2xl overflow-hidden">
                                <div className="p-2 min-w-[150px]">
                                    <h4 className="text-xs font-black text-slate-900 uppercase mb-1">{loc.name}</h4>
                                    <p className="text-[10px] font-medium text-slate-500 leading-tight">{loc.description}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <RecenterMap coords={activeLocation.coords} />
                </MapContainer>

                {/* Floating Map Controls */}
                <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                    <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50 space-y-2">
                        <button className="h-10 w-10 flex items-center justify-center text-slate-900 hover:bg-white rounded-xl transition-all">
                            <Layers className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Info Card Overlay (Mobile View) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] md:w-auto md:left-6 md:translate-x-0">
                    <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{activeLocation.name}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{activeLocation.category}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
