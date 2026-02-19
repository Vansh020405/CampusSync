'use client'

import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
    Compass,
    Navigation2,
    Layers,
    Building2,
    MapPin,
    ChevronRight,
    Search,
    Locate,
    Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CampusLocation {
    id: string
    name: string
    category: 'academic' | 'hostel' | 'canteen' | 'admin' | 'main'
    coords: [number, number] // [lng, lat]
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


export default function MapLibreMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const [activeLocation, setActiveLocation] = useState<CampusLocation>(LOCATIONS[0])
    const [isLoaded, setIsLoaded] = useState(false)
    const [isNavigating, setIsNavigating] = useState(false)
    const [mapError, setMapError] = useState<string | null>(null)
    const [initStatus, setInitStatus] = useState<string>('Initializing...')
    const [currentStyle, setCurrentStyle] = useState('https://tiles.openfreemap.org/styles/positron')
    const [routeInfo, setRouteInfo] = useState<{ distance: string, duration: string } | null>(null)
    const isReadyRef = useRef(false)
    const startMarkerRef = useRef<maplibregl.Marker | null>(null)
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Default starting point (main entrance)
    const startPoint: [number, number] = [76.65919385345458, 30.51794484908655]

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        const setupRouteLayers = () => {
            if (!map.current) return
            try {
                if (!map.current.getSource('route')) {
                    map.current.addSource('route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: []
                            }
                        }
                    })
                }

                if (!map.current.getLayer('route-line')) {
                    map.current.addLayer({
                        id: 'route-line',
                        type: 'line',
                        source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': '#10b981',
                            'line-width': 6,
                            'line-opacity': 0.8
                        }
                    })
                }

                if (!map.current.getLayer('route-glow')) {
                    map.current.addLayer({
                        id: 'route-glow',
                        type: 'line',
                        source: 'route',
                        layout: { 'line-join': 'round', 'line-cap': 'round' },
                        paint: {
                            'line-color': '#10b981',
                            'line-width': 12,
                            'line-opacity': 0.3,
                            'line-blur': 4
                        }
                    }, 'route-line')
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
            setInitStatus('Grid Ready')
            setupRouteLayers()

            // Add starting point identity
            startMarkerRef.current = new maplibregl.Marker({ color: '#6366f1', scale: 0.9 })
                .setLngLat(startPoint)
                .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false })
                    .setHTML('<div style="padding: 4px 8px; font-weight: 800; font-size: 10px; color: #1e293b; text-transform: uppercase;">You are here</div>'))
                .addTo(map.current)

            LOCATIONS.forEach(loc => {
                if (!map.current) return
                const marker = new maplibregl.Marker({ color: '#10b981', scale: 0.8 })
                    .setLngLat(loc.coords)
                    .setPopup(new maplibregl.Popup({ offset: 25, closeButton: false })
                        .setHTML(`
                        <div style="padding: 12px; min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
                            <h4 style="margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; font-size: 13px; color: #0f172a; letter-spacing: 0.5px;">${loc.name}</h4>
                            <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.5;">${loc.description}</p>
                            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
                                <span style="display: inline-block; padding: 2px 8px; background: #10b98120; color: #059669; font-size: 9px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${loc.category}</span>
                            </div>
                        </div>
                    `))
                    .addTo(map.current)
                marker.getElement().addEventListener('click', () => flyToLocation(loc))
            })
        }

        try {
            const rect = mapContainer.current.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) console.warn('MapLibreMap: Container size warning')
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: currentStyle,
                center: [76.65919385345458, 30.51794484908655],
                zoom: 16.5,
                pitch: 45,
                bearing: -15,
                trackResize: true,
                attributionControl: false,
                maxBounds: [
                    [76.650, 30.508], // Southwest corner expanded slightly
                    [76.670, 30.528]  // Northeast corner expanded slightly
                ],
                minZoom: 15.5 // Prevent zooming out too far
            })
            setInitStatus('Loading Campus Grid...')
            map.current.on('load', setupMapLayers)
            map.current.on('style.load', setupRouteLayers)
            map.current.on('error', (e) => console.error('MapLibreMap Error:', e))
        } catch (error) {
            console.error('MapLibreMap: Failed to initialize map:', error)
            setMapError(error instanceof Error ? error.message : 'Failed to initialize map')
            setInitStatus('Error: Failed to initialize')
        }


        const safetyTimer = setTimeout(() => {
            if (!isReadyRef.current) setupMapLayers()
        }, 4000)
        const resizeTimer = setTimeout(() => map.current?.resize(), 500)

        return () => {
            clearTimeout(safetyTimer)
            clearTimeout(resizeTimer)
            map.current?.remove()
            map.current = null
        }
    }, [])

    const flyToLocation = (loc: CampusLocation) => {
        setActiveLocation(loc)
        map.current?.flyTo({
            center: loc.coords,
            zoom: 18,
            pitch: 60,
            bearing: -20,
            speed: 1.2,
            curve: 1.5,
            essential: true
        })

        // Automatically trigger navigation when a location is clicked
        startNavigation(loc)
    }

    const startNavigation = async (destination: CampusLocation) => {
        if (!map.current) return

        setIsNavigating(true)
        setInitStatus('Finding Campus Path...')
        setMapError(null)

        try {
            // Ensure we always start from the Main Gate
            const mainGate = LOCATIONS.find(l => l.id === 'main')
            const startCoords = mainGate ? mainGate.coords : startPoint

            // Fetch proper pathway routing (foot profile for walkways)
            // Using FOSSGIS OSRM which often has better pedestrian data
            const response = await fetch(
                `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${startCoords[0]},${startCoords[1]};${destination.coords[0]},${destination.coords[1]}?overview=full&geometries=geojson&steps=true`
            )

            let data
            if (!response.ok) {
                console.warn('Primary routing failed, trying fallback...')
                const fallbackResponse = await fetch(
                    `https://router.project-osrm.org/route/v1/walking/${startCoords[0]},${startCoords[1]};${destination.coords[0]},${destination.coords[1]}?overview=full&geometries=geojson&steps=true`
                )
                if (!fallbackResponse.ok) throw new Error('Routing service unavailable')
                data = await fallbackResponse.json()
            } else {
                data = await response.json()
            }

            if (!data.routes || data.routes.length === 0) {
                throw new Error('No internal pathways detected')
            }

            const route = data.routes[0]
            const fullRoute = route.geometry.coordinates as [number, number][]

            // Set distance and duration from actual route data
            const distInKm = (route.distance / 1000).toFixed(2)
            const timeInMin = Math.ceil(route.duration / 60)

            setRouteInfo({
                distance: `${distInKm} km`,
                duration: `${timeInMin} min`
            })

            // Frame the full route with perspective
            const bounds = new maplibregl.LngLatBounds()
            fullRoute.forEach(coord => bounds.extend(coord))
            map.current.fitBounds(bounds, {
                padding: { top: 120, bottom: 120, left: 120, right: 120 },
                zoom: 17.5,
                pitch: 50,
                bearing: -15,
                duration: 2000,
                essential: true
            })

            // Execute path animation
            animateRoute(fullRoute)
            setInitStatus('Navigator Active')
        } catch (error) {
            console.error('Routing Error:', error)
            setInitStatus('Navigation Restricted')

            // Fallback to direct line if OSRM fails to find a path
            const fallbackRoute: [number, number][] = [startPoint, destination.coords]
            animateRoute(fallbackRoute)
            setRouteInfo(null)
            setMapError('No specific walkway data found for this section. Showing direct path.')
        }
    }

    const animateRoute = (fullRoute: [number, number][]) => {
        if (!map.current) return

        // Clear any existing animation
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current)
        }

        let step = 0
        const animatedRoute: [number, number][] = []
        const interval = Math.max(8, Math.min(40, 1500 / fullRoute.length))

        const animate = () => {
            if (!map.current) return

            if (step < fullRoute.length) {
                animatedRoute.push(fullRoute[step])

                const source = map.current.getSource('route') as maplibregl.GeoJSONSource
                if (source) {
                    source.setData({
                        type: 'Feature',
                        properties: {},
                        geometry: { type: 'LineString', coordinates: animatedRoute }
                    })
                }

                step++
                animationTimerRef.current = setTimeout(animate, interval)
            }
        }

        animate()
    }

    const clearRoute = () => {
        if (!map.current) return

        // Clear any existing animation
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current)
        }

        const source = map.current.getSource('route') as maplibregl.GeoJSONSource
        if (source) {
            source.setData({
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: [] }
            })
        }

        setIsNavigating(false)
        setRouteInfo(null)
        setInitStatus('Grid Ready')
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Map Container */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[3.5rem] shadow-2xl relative overflow-hidden min-h-[500px] lg:min-h-[750px]">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-50 flex-col gap-4">
                        {mapError ? (
                            <>
                                <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                                    <Globe className="h-8 w-8" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-red-600">
                                    Map Retrieval Error
                                </p>
                                <p className="text-xs text-slate-600 max-w-md text-center px-4">
                                    {mapError}
                                </p>
                            </>
                        ) : (
                            <>
                                <Globe className="h-12 w-12 text-emerald-500 animate-pulse" />
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                        {initStatus}
                                    </p>
                                    <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                <div
                    ref={mapContainer}
                    className="w-full h-[500px] lg:h-[750px] z-0 bg-[#F1F5F9] relative rounded-[3.5rem]"
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 md:top-10 md:left-10 z-10 flex flex-col gap-2">
                    <div className="px-3 py-2 md:px-5 md:py-3 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 w-fit">
                        <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-700">
                            {initStatus}
                        </p>
                    </div>

                    {routeInfo && (
                        <div className="px-3 py-2 md:px-5 md:py-3 bg-indigo-600/90 backdrop-blur-xl border border-indigo-400 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-4 text-white animate-in slide-in-from-left-4 duration-500">
                            <div className="flex flex-col">
                                <span className="text-[7px] font-bold uppercase opacity-70">Distance</span>
                                <span className="text-xs font-black">{routeInfo.distance}</span>
                            </div>
                            <div className="w-px h-6 bg-white/20" />
                            <div className="flex flex-col">
                                <span className="text-[7px] font-bold uppercase opacity-70">Walking Time</span>
                                <span className="text-xs font-black">{routeInfo.duration}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 md:top-10 md:right-10 z-10 flex flex-col gap-2 md:gap-3">
                    {[
                        {
                            icon: Layers, label: 'Change Style', onClick: () => {
                                const styles = [
                                    'https://tiles.openfreemap.org/styles/positron',
                                    'https://tiles.openfreemap.org/styles/bright',
                                    'https://tiles.openfreemap.org/styles/liberty',
                                    'https://tiles.openfreemap.org/styles/dark'
                                ]
                                const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length
                                const nextStyle = styles[nextIndex]
                                setCurrentStyle(nextStyle)
                                map.current?.setStyle(nextStyle)
                            }
                        },
                        {
                            icon: Locate, label: 'Locate Active', onClick: () => {
                                flyToLocation(activeLocation)
                            }
                        },
                        {
                            icon: Navigation2, label: 'Reset Orientation', onClick: () => {
                                map.current?.easeTo({
                                    bearing: 0,
                                    pitch: 0,
                                    duration: 1000
                                })
                            }
                        }
                    ].map((item, i) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={i}
                                onClick={item.onClick}
                                title={item.label}
                                className="h-10 w-10 md:h-12 md:w-12 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:scale-110 active:scale-95 transition-all"
                            >
                                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                        )
                    })}
                </div>

            </div>

            {/* Sidebar Control Panel */}
            <div className="w-full lg:w-96 shrink-0 space-y-6 z-10">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <Compass className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                Campus <span className="text-emerald-600 italic">Navigator</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            CHITKARA UNIVERSITY
                        </p>
                    </header>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                placeholder="Search Campus..."
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">
                                Key Landmarks ({LOCATIONS.length})
                            </p>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {LOCATIONS.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => flyToLocation(loc)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-3xl border transition-all group",
                                            activeLocation.id === loc.id
                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-100"
                                                : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                                            activeLocation.id === loc.id
                                                ? "bg-white/20"
                                                : "bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                        )}>
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-[11px] font-black uppercase truncate tracking-tight">
                                                {loc.name}
                                            </p>
                                            <p className={cn(
                                                "text-[9px] font-medium truncate",
                                                activeLocation.id === loc.id ? "text-emerald-50" : "text-slate-400"
                                            )}>
                                                {loc.description}
                                            </p>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-all",
                                            activeLocation.id === loc.id
                                                ? "text-white translate-x-1"
                                                : "text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1"
                                        )} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        {isNavigating && (
                            <div className="pt-6 border-t border-slate-100 space-y-3">
                                <button
                                    onClick={clearRoute}
                                    className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                                >
                                    Clear Route
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}
