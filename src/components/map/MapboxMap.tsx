'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
    Compass,
    Navigation2,
    Layers,
    Building2,
    MapPin,
    ChevronRight,
    Search,
    Info,
    Locate
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Replace with your actual Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

interface CampusLocation {
    id: string
    name: string
    category: 'academic' | 'hostel' | 'canteen' | 'admin' | 'main'
    coords: [number, number] // [lng, lat] for Mapbox
    description: string
}

const LOCATIONS: CampusLocation[] = [
    { id: 'main', name: 'Chitkara University', category: 'main', coords: [76.65919385345458, 30.51794484908655], description: 'Main University Entrance' },
    { id: 'square-one', name: "Square One", category: 'canteen', coords: [76.659824841262, 30.515175958350476], description: 'Main Cafeteria & Student Hub' },
    { id: 'admission', name: "Admission Block", category: 'admin', coords: [76.65884049772956, 30.517773694865], description: 'University Admissions & Enquiries' },
    { id: 'babbage', name: "Babbage Block", category: 'academic', coords: [76.66012323474585, 30.51744071725377], description: 'Applied Sciences Department' },
    { id: 'corbusier', name: "Le Corbusier", category: 'academic', coords: [76.66041793874132, 30.51712811618798], description: 'Architecture & Design' },
    { id: 'square-two', name: "Square Two", category: 'canteen', coords: [76.66070462358044, 30.517309459470138], description: 'Alternative Dining Area' },
    { id: 'turing', name: "Turing Block", category: 'academic', coords: [76.66051462532121, 30.516426777056175], description: 'Computing Sciences' },
    { id: 'edison', name: "Edison Block", category: 'academic', coords: [76.65975681504716, 30.51641986868414], description: 'Electrical Engineering' },
    { id: 'newton', name: "Newton Block", category: 'academic', coords: [76.65947413978621, 30.516411233218385], description: 'Physics & Research' },
    { id: 'woods', name: "Chitkara Woods", category: 'admin', coords: [76.65914535437466, 30.516058905552892], description: 'Eco-friendly Green Space' },
]

export default function MapboxMap() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [activeLocation, setActiveLocation] = useState<CampusLocation>(LOCATIONS[0])
    const [isNavigating, setIsNavigating] = useState(false)
    const [userLocation, setUserLocation] = useState<[number, number]>([76.6591, 30.5175]) // Default starting point

    useEffect(() => {
        if (!mapContainer.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [76.65919385345458, 30.51794484908655],
            zoom: 16.5,
            pitch: 62,
            bearing: -25,
            antialias: true
        })

        map.current.on('load', () => {
            if (!map.current) return

            // Add 3D buildings layer
            const layers = map.current.getStyle()?.layers
            if (layers) {
                const labelLayerId = layers.find(
                    (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
                )?.id

                map.current.addLayer(
                    {
                        'id': 'add-3d-buildings',
                        'source': 'composite',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                            'fill-extrusion-color': '#aaa',
                            'fill-extrusion-height': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'height']
                            ],
                            'fill-extrusion-base': [
                                'interpolate',
                                ['linear'],
                                ['zoom'],
                                15,
                                0,
                                15.05,
                                ['get', 'min_height']
                            ],
                            'fill-extrusion-opacity': 0.6
                        }
                    },
                    labelLayerId
                )
            }

            // Pulsing Marker Animation logic could go here
        })

        // Cleanup
        return () => map.current?.remove()
    }, [])

    const flyToLocation = (loc: CampusLocation) => {
        setActiveLocation(loc)
        map.current?.flyTo({
            center: loc.coords,
            zoom: 18,
            pitch: 65,
            bearing: -30,
            essential: true,
            duration: 3000
        })
    }

    const startNavigation = async (dest: CampusLocation) => {
        setIsNavigating(true)
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[0]},${userLocation[1]};${dest.coords[0]},${dest.coords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
        const json = await query.json()
        const data = json.routes[0]
        const route = data.geometry.coordinates

        const geojson: any = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        }

        // Add source and layer for navigation line
        if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson)
        } else {
            map.current?.addSource('route', {
                type: 'geojson',
                data: geojson
            })
            map.current?.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#6366f1',
                    'line-width': 8,
                    'line-opacity': 0.75,
                    'line-blur': 2
                }
            })
        }

        // Animate route drawing
        let i = 0
        const timer = setInterval(() => {
            if (i < route.length) {
                geojson.geometry.coordinates.push(route[i])
                if (map.current?.getSource('route')) {
                    (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson)
                }
                i++
            } else {
                clearInterval(timer)
            }
        }, 30)
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Control Panel */}
            <div className="w-full lg:w-96 shrink-0 space-y-6 z-10">
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Navigation2 className="h-24 w-24" />
                    </div>

                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Compass className="h-5 w-5 animate-spin-slow" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                3D Campus <span className="text-indigo-600">Pro</span>
                            </h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Advanced Spatial Engine</p>
                    </header>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Locate Building..."
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">Pinned Locations</p>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {LOCATIONS.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => flyToLocation(loc)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 rounded-3xl border transition-all group relative overflow-hidden",
                                            activeLocation.id === loc.id
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200"
                                                : "bg-white border-slate-50 hover:border-slate-200 text-slate-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                                            activeLocation.id === loc.id ? "bg-white/20" : "bg-slate-50 text-slate-400"
                                        )}>
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-[11px] font-black uppercase truncate tracking-tight">{loc.name}</p>
                                            <p className={cn("text-[9px] font-medium truncate", activeLocation.id === loc.id ? "text-indigo-100" : "text-slate-400")}>
                                                {loc.description}
                                            </p>
                                        </div>
                                        <ChevronRight className={cn("h-4 w-4", activeLocation.id === loc.id ? "text-white" : "text-slate-200")} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => startNavigation(activeLocation)}
                            className="w-full h-14 bg-indigo-600 hover:bg-slate-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Navigation2 className="h-4 w-4 fill-current" />
                            Generate Route
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[500px] lg:min-h-[700px]">
                <div ref={mapContainer} className="absolute inset-0 z-0" />

                {/* HUD Overlays */}
                <div className="absolute top-8 left-8 p-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 text-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest">3D Precision Mode Active</p>
                    </div>
                </div>

                {/* Floating Map Actions */}
                <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
                    {[Layers, Locate].map((Icon, i) => (
                        <button key={i} className="h-12 w-12 bg-white rounded-2xl border border-slate-100 shadow-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:scale-110 transition-all">
                            <Icon className="h-5 w-5" />
                        </button>
                    ))}
                </div>

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-8 right-8 left-8 lg:left-auto z-10">
                    <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 flex flex-col md:flex-row items-center gap-6 max-w-xl ml-auto">
                        <div className="h-16 w-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shrink-0">
                            <MapPin className="h-8 w-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{activeLocation.name}</h3>
                                <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-md uppercase tracking-widest">Verified</div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">{activeLocation.category} Zone</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-3">
                                {activeLocation.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
