'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
    Compass,
    Navigation2,
    Layers,
    Building2,
    MapPin,
    Search,
    Locate,
    Globe,
    BookOpen,
    Coffee,
    CalendarDays,
    Stethoscope,
    Home,
    ChevronRight,
    X,
    ArrowUpRight,
    LocateFixed,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

type Category = 'academic' | 'hostel' | 'canteen' | 'admin' | 'main'
type FilterType = 'all' | 'academic' | 'canteen' | 'admin' | 'hostel'

interface CampusLocation {
    id: string
    name: string
    category: Category
    coords: [number, number]
    description: string
}

const LOCATIONS: CampusLocation[] = [
    { id: 'main', name: 'Chitkara University', category: 'main', coords: [76.65919385345458, 30.51794484908655], description: 'Main University Entrance' },
    { id: 'square-one', name: "Square One", category: 'canteen', coords: [76.659824841262, 30.515175958350476], description: 'Main Cafeteria & Student Hub' },
    { id: 'admission', name: "Admission Block", category: 'admin', coords: [76.65884049772956, 30.517773694865], description: 'University Admissions & Enquiries' },
    { id: 'babbage', name: "Babbage Block", category: 'academic', coords: [76.66012323474585, 30.51744071725377], description: 'Applied Sciences Department' },
    { id: 'corbusier', name: "Le Corbusier", category: 'academic', coords: [76.66041793874132, 30.51712811618798], description: 'Architecture & Design' },
    { id: 'square-two', name: "Square Two", category: 'canteen', coords: [76.66070462358044, 30.517309459470138], description: 'Alternative Dining Area' },
    { id: 'alpha-zone', name: "Alpha Zone", category: 'admin', coords: [76.65949044803615, 30.517175363054424], description: 'Digital Innovation Center' },
    { id: 'turing', name: "Turing Block", category: 'academic', coords: [76.66051462532121, 30.516426777056175], description: 'Computing Sciences' },
    { id: 'edison', name: "Edison Block", category: 'academic', coords: [76.65975681504716, 30.51641986868414], description: 'Electrical Engineering' },
    { id: 'newton', name: "Newton Block", category: 'academic', coords: [76.65947413978621, 30.516411233218385], description: 'Physics & Research' },
    { id: 'woods', name: "Chitkara Woods", category: 'admin', coords: [76.65914535437466, 30.516058905552892], description: 'Eco-friendly Green Space' },
    { id: 'medical', name: "Medical Room", category: 'admin', coords: [76.66033218951283, 30.51600363835364], description: 'Healthcare & First Aid' },
    { id: 'fleming', name: "Fleming Block", category: 'academic', coords: [76.66088130845091, 30.515670933962564], description: 'Biosciences Department' },
    { id: 'law', name: "Law Block", category: 'academic', coords: [76.66088130845091, 30.515670933962564], description: 'Institutional School of Law' },
    { id: 'chairman', name: "Chairman's Office", category: 'admin', coords: [76.66044827400862, 30.515734836877584], description: 'Global Leadership Office' },
    { id: 'omega-zone', name: "Omega Zone", category: 'admin', coords: [76.66079321314245, 30.51508930798686], description: 'Administrative Hub' },
    { id: 'beta-zone', name: "Beta Zone", category: 'admin', coords: [76.65979734807206, 30.515712481381915], description: 'Student Support Services' },
    { id: 'galelio', name: "Galileo Block", category: 'academic', coords: [76.65906902878997, 30.51566553013159], description: 'Aerospace Engineering' },
    { id: 'explore-hub', name: "Explore Hub", category: 'admin', coords: [76.65941580762274, 30.515365235650147], description: 'Innovation & Incubation' },
    { id: 'pythagoras', name: "Pythagoras Block", category: 'academic', coords: [76.65909504136917, 30.515106168533364], description: 'Mathematics Department' },
    { id: 'hospitality', name: "School of Hospitality", category: 'academic', coords: [76.6594779560854, 30.514790105710357], description: 'Culinary & Hotel Management' },
    { id: 'blue-tokai', name: "Blue Tokai", category: 'canteen', coords: [76.65974459303366, 30.514790105710357], description: 'Premium Coffee Shop' },
    { id: 'moon-hall', name: "Moon Hall", category: 'hostel', coords: [76.66003127787278, 30.514788378588307], description: 'Student Assembly Hall' },
    { id: 'rockefeller', name: "Rockefeller Block", category: 'academic', coords: [76.65977466488067, 30.514004261995613], description: 'Economics Department' },
    { id: 'martin-luther', name: "Martin Luther Block", category: 'academic', coords: [76.66058459967093, 30.513933449394226], description: 'Humanities & Social Sciences' },
    { id: 'sportorium', name: "Sportorium", category: 'academic', coords: [76.65804343640403, 30.515819188785123], description: 'Indoor Sports Complex' },
    { id: 'explotorium', name: "Explotorium", category: 'academic', coords: [76.65699802580777, 30.515819188785123], description: 'Science & Discovery Center' },
    { id: 'tesla', name: "Tesla Block", category: 'academic', coords: [76.65644807047038, 30.515819188785123], description: 'Advanced Robotics Lab' },
    { id: 'explore-stars', name: "Explore Stars", category: 'admin', coords: [76.65894346942487, 30.516426072799995], description: 'Astrophysics & Space Center' },
    { id: 'control-room', name: "Control Room", category: 'admin', coords: [76.660544878004, 30.516016983599542], description: 'Campus Security & Systems' },
]

const getCategoryIcon = (category: Category) => {
    switch (category) {
        case 'academic': return BookOpen
        case 'canteen': return Coffee
        case 'admin': return Building2
        case 'hostel': return Home
        case 'main': return MapPin
    }
}

const getCategoryColor = (category: Category) => {
    switch (category) {
        case 'academic': return { bg: 'bg-blue-100 dark:bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400', dot: '#3b82f6' }
        case 'canteen': return { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', dot: '#f59e0b' }
        case 'admin': return { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', dot: '#10b981' }
        case 'hostel': return { bg: 'bg-purple-100 dark:bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', dot: '#a855f7' }
        case 'main': return { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-600 dark:text-rose-400', dot: '#f43f5e' }
    }
}

const FILTERS: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Academic', value: 'academic' },
    { label: 'Food', value: 'canteen' },
    { label: 'Services', value: 'admin' },
    { label: 'Hostels', value: 'hostel' },
]

export default function MapLibreMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const { resolvedTheme } = useTheme()
    const [activeLocation, setActiveLocation] = useState<CampusLocation | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const [initStatus, setInitStatus] = useState<string>('Initializing...')
    const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')
    const isReadyRef = useRef(false)
    const startMarkerRef = useRef<maplibregl.Marker | null>(null)
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null)
    const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})

    const isDark = resolvedTheme === 'dark'
    const defaultStyle = isDark ? 'https://tiles.openfreemap.org/styles/dark' : 'https://tiles.openfreemap.org/styles/positron'

    const startPoint: [number, number] = [76.65919385345458, 30.51794484908655]

    const filteredLocations = LOCATIONS.filter(loc => {
        const matchesFilter = activeFilter === 'all' || loc.category === activeFilter
        const matchesSearch = searchQuery === '' || loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        const setupRouteLayers = () => {
            if (!map.current) return
            try {
                if (!map.current.getSource('route')) {
                    map.current.addSource('route', {
                        type: 'geojson',
                        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
                    })
                }
                if (!map.current.getLayer('route-glow')) {
                    map.current.addLayer({
                        id: 'route-glow', type: 'line', source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: { 'line-color': '#10b981', 'line-width': 14, 'line-opacity': 0.15, 'line-blur': 6 }
                    })
                }
                if (!map.current.getLayer('route-line')) {
                    map.current.addLayer({
                        id: 'route-line', type: 'line', source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: { 'line-color': '#10b981', 'line-width': 4, 'line-opacity': 0.9 }
                    })
                }
            } catch (error) {
                console.warn('Layer initialization skipped:', error)
            }
        }

        const setupMapLayers = () => {
            if (!map.current || isReadyRef.current) return
            isReadyRef.current = true
            map.current.resize()
            setIsLoaded(true)
            setInitStatus('Ready')
            setupRouteLayers()

            startMarkerRef.current = new maplibregl.Marker({ color: '#6366f1', scale: 0.8 })
                .setLngLat(startPoint)
                .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false })
                    .setHTML('<div style="padding:4px 10px;font-weight:700;font-size:11px;color:#334155;border-radius:8px;">You are here</div>'))
                .addTo(map.current)

            LOCATIONS.forEach(loc => {
                if (!map.current) return
                const colors = getCategoryColor(loc.category)
                const marker = new maplibregl.Marker({ color: colors.dot, scale: 0.7 })
                    .setLngLat(loc.coords)
                    .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false })
                        .setHTML(`
                        <div style="padding:10px 14px;min-width:160px;border-radius:12px;font-family:system-ui,-apple-system,sans-serif;">
                            <h4 style="margin:0 0 4px;font-weight:800;font-size:12px;color:#1e293b;letter-spacing:0.3px;">${loc.name}</h4>
                            <p style="margin:0;color:#64748b;font-size:10px;line-height:1.4;">${loc.description}</p>
                        </div>
                    `))
                    .addTo(map.current)
                marker.getElement().addEventListener('click', () => flyToLocation(loc))
            })
        }

        try {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: defaultStyle,
                center: [76.65919385345458, 30.51794484908655],
                zoom: 16.5,
                pitch: 45,
                bearing: -15,
                trackResize: true,
                attributionControl: false,
                maxBounds: [[76.650, 30.508], [76.670, 30.528]],
                minZoom: 15.5
            })
            setInitStatus('Loading...')
            map.current.on('load', setupMapLayers)
            map.current.on('style.load', setupRouteLayers)
            map.current.on('error', (e) => console.error('Map Error:', e))
        } catch (error) {
            console.error('Failed to initialize map:', error)
            setMapError(error instanceof Error ? error.message : 'Failed to initialize map')
        }

        const safetyTimer = setTimeout(() => { if (!isReadyRef.current) setupMapLayers() }, 4000)
        const resizeTimer = setTimeout(() => map.current?.resize(), 500)

        return () => {
            clearTimeout(safetyTimer)
            clearTimeout(resizeTimer)
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Sync map style with theme changes
    useEffect(() => {
        if (!map.current || !isLoaded) return
        const style = isDark ? 'https://tiles.openfreemap.org/styles/dark' : 'https://tiles.openfreemap.org/styles/positron'
        map.current.setStyle(style)
    }, [isDark, isLoaded])

    const flyToLocation = useCallback((loc: CampusLocation) => {
        setActiveLocation(loc)
        map.current?.flyTo({
            center: loc.coords, zoom: 18, pitch: 60, bearing: -20,
            speed: 1.2, curve: 1.5, essential: true
        })
        cardRefs.current[loc.id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        startNavigation(loc)
    }, [])

    const startNavigation = async (destination: CampusLocation) => {
        if (!map.current) return
        setIsNavigating(true)
        setMapError(null)

        try {
            const mainGate = LOCATIONS.find(l => l.id === 'main')
            const startCoords = mainGate ? mainGate.coords : startPoint
            const response = await fetch(
                `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${startCoords[0]},${startCoords[1]};${destination.coords[0]},${destination.coords[1]}?overview=full&geometries=geojson&steps=true`
            )

            let data
            if (!response.ok) {
                const fallbackResponse = await fetch(
                    `https://router.project-osrm.org/route/v1/walking/${startCoords[0]},${startCoords[1]};${destination.coords[0]},${destination.coords[1]}?overview=full&geometries=geojson&steps=true`
                )
                if (!fallbackResponse.ok) throw new Error('Routing unavailable')
                data = await fallbackResponse.json()
            } else {
                data = await response.json()
            }

            if (!data.routes || data.routes.length === 0) throw new Error('No route found')

            const route = data.routes[0]
            const fullRoute = route.geometry.coordinates as [number, number][]
            setRouteInfo({
                distance: `${(route.distance / 1000).toFixed(2)} km`,
                duration: `${Math.ceil(route.duration / 60)} min`
            })

            const bounds = new maplibregl.LngLatBounds()
            fullRoute.forEach(coord => bounds.extend(coord))
            map.current.fitBounds(bounds, {
                padding: { top: 100, bottom: 100, left: 100, right: 100 },
                zoom: 17.5, pitch: 50, bearing: -15, duration: 2000, essential: true
            })
            animateRoute(fullRoute)
        } catch (error) {
            const fallbackRoute: [number, number][] = [startPoint, destination.coords]
            animateRoute(fallbackRoute)
            setRouteInfo(null)
        }
    }

    const animateRoute = (fullRoute: [number, number][]) => {
        if (!map.current) return
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current)

        let step = 0
        const animatedRoute: [number, number][] = []
        const interval = Math.max(8, Math.min(40, 1500 / fullRoute.length))

        const animate = () => {
            if (!map.current || step >= fullRoute.length) return
            animatedRoute.push(fullRoute[step])
            const source = map.current.getSource('route') as maplibregl.GeoJSONSource
            if (source) {
                source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: animatedRoute } })
            }
            step++
            animationTimerRef.current = setTimeout(animate, interval)
        }
        animate()
    }

    const clearRoute = () => {
        if (!map.current) return
        if (animationTimerRef.current) clearTimeout(animationTimerRef.current)
        const source = map.current.getSource('route') as maplibregl.GeoJSONSource
        if (source) {
            source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } })
        }
        setIsNavigating(false)
        setRouteInfo(null)
        setActiveLocation(null)
    }

    return (
        <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#0A0A0A]">
            {/* Map Section — top ~55% */}
            <div className="relative w-full" style={{ height: '55%' }}>
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-50 dark:bg-[#0A0A0A] flex-col gap-3">
                        {mapError ? (
                            <>
                                <Globe className="h-10 w-10 text-red-500" />
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">{mapError}</p>
                            </>
                        ) : (
                            <>
                                <Globe className="h-10 w-10 text-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-neutral-500">{initStatus}</p>
                            </>
                        )}
                    </div>
                )}
                <div ref={mapContainer} className="w-full h-full" />

                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    {[
                        {
                            icon: Layers, label: 'Style', onClick: () => {
                                const darkStyles = [
                                    'https://tiles.openfreemap.org/styles/dark',
                                    'https://tiles.openfreemap.org/styles/liberty',
                                ]
                                const lightStyles = [
                                    'https://tiles.openfreemap.org/styles/positron',
                                    'https://tiles.openfreemap.org/styles/bright',
                                    'https://tiles.openfreemap.org/styles/liberty',
                                ]
                                const styles = isDark ? darkStyles : lightStyles
                                const currentMapStyle = map.current?.getStyle()?.name || ''
                                // Cycle through styles
                                const currentIdx = styles.findIndex(s => map.current?.getStyle() && true) 
                                const nextStyle = styles[(currentIdx + 1) % styles.length]
                                map.current?.setStyle(nextStyle)
                            }
                        },
                        {
                            icon: LocateFixed, label: 'Center', onClick: () => {
                                map.current?.flyTo({ center: startPoint, zoom: 16.5, pitch: 45, bearing: -15, speed: 1.2 })
                            }
                        },
                        {
                            icon: Navigation2, label: 'Reset', onClick: () => {
                                map.current?.easeTo({ bearing: 0, pitch: 0, duration: 800 })
                            }
                        }
                    ].map((item, i) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={i}
                                onClick={item.onClick}
                                title={item.label}
                                className="h-10 w-10 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#2A2A2A] transition-all active:scale-95 shadow-sm dark:shadow-none"
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        )
                    })}
                </div>

                {/* Route Info Badge */}
                {routeInfo && (
                    <div className="absolute bottom-4 left-4 z-10 px-4 py-2.5 bg-white/90 dark:bg-[#1E1E1E]/90 backdrop-blur-sm rounded-xl flex items-center gap-4 shadow-sm dark:shadow-none animate-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <p className="text-[8px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Distance</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{routeInfo.distance}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-[#2A2A2A]" />
                        <div>
                            <p className="text-[8px] font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Walk</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{routeInfo.duration}</p>
                        </div>
                        <button onClick={clearRoute} className="ml-1 h-7 w-7 rounded-lg bg-slate-100 dark:bg-[#2A2A2A] flex items-center justify-center text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Panel */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-[#0A0A0A]">
                {/* Search Bar */}
                <div className="px-4 pt-4 pb-2 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
                        <input
                            placeholder="Search campus locations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1E1E1E] rounded-xl text-sm font-medium text-slate-900 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-neutral-600 transition-colors shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
                    <div className="flex items-center gap-2 pr-4">
                    {FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setActiveFilter(f.value)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                                activeFilter === f.value
                                    ? "bg-slate-900 dark:bg-white text-white dark:text-[#0A0A0A]"
                                    : "bg-white dark:bg-[#1E1E1E] text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300 shadow-sm dark:shadow-none"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                    </div>
                </div>

                {/* Location Cards */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                    {filteredLocations.map(loc => {
                        const Icon = getCategoryIcon(loc.category)
                        const colors = getCategoryColor(loc.category)
                        const isActive = activeLocation?.id === loc.id

                        return (
                            <button
                                key={loc.id}
                                ref={(el) => { cardRefs.current[loc.id] = el }}
                                onClick={() => flyToLocation(loc)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left group",
                                    isActive
                                        ? "bg-white dark:bg-[#1E1E1E] shadow-md dark:shadow-none"
                                        : "bg-white/60 dark:bg-[#141414] hover:bg-white dark:hover:bg-[#1A1A1A] shadow-sm dark:shadow-none"
                                )}
                            >
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", colors.bg)}>
                                    <Icon className={cn("h-4 w-4", colors.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-semibold truncate",
                                        isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-neutral-300"
                                    )}>
                                        {loc.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 dark:text-neutral-600 truncate">{loc.description}</p>
                                </div>
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                    isActive
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-[#0A0A0A]"
                                        : "bg-slate-100 dark:bg-[#1E1E1E] text-slate-400 dark:text-neutral-600 group-hover:text-slate-600 dark:group-hover:text-neutral-400"
                                )}>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </div>
                            </button>
                        )
                    })}

                    {filteredLocations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-neutral-600">
                            <Search className="h-8 w-8 mb-3" />
                            <p className="text-sm font-medium">No locations found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
