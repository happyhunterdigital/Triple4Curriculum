import React, { useState } from 'react';
import { 
  X, Eye, Compass, Box, Layers, Play, 
  Sparkles, CheckCircle2, ChevronRight, Video, Cpu 
} from 'lucide-react';

interface VirtualCampusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourLocation {
  id: string;
  name: string;
  department: string;
  description: string;
  interactiveFeatures: string[];
  imageUrl: string;
  hotspotsCount: number;
}

export const VirtualCampusModal: React.FC<VirtualCampusModalProps> = ({ isOpen, onClose }) => {
  const locations: TourLocation[] = [
    {
      id: 'lab_ai_cluster',
      name: 'Computing & High-Performance AI Cluster Lab',
      department: 'Department of Computing & Applied AI',
      description: 'Ultra high-density rack clusters with real-time telemetry monitors, neural hardware benchmarks, and student terminal access.',
      interactiveFeatures: ['Interactive Node Rack Diagnostics', 'Real-time FLOPs Telemetry', 'Distributed Consensus Simulator'],
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      hotspotsCount: 6
    },
    {
      id: 'hall_great_senate',
      name: 'Great Academic Senate & Graduation Hall',
      department: 'Academic Senate & Governance',
      description: 'Historical amphitheater configured for international research symposiums, graduation ceremonies, and keynote broadcasts.',
      interactiveFeatures: ['360° Amphitheater View', 'Keynote Stage Holo-Screen', 'Historical Senate Archives'],
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      hotspotsCount: 4
    },
    {
      id: 'lab_health_ward',
      name: 'Health Sciences Clinical Simulation Ward',
      department: 'Department of Health Sciences & Biotech',
      description: 'Hospital simulation ward equipped with automated patient monitoring mannequins, telemetry beds, and sterile procedural pods.',
      interactiveFeatures: ['Patient Biometric Simulator', 'Sterile Suite Walkthrough', 'Pharmacology Station'],
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      hotspotsCount: 8
    }
  ];

  const [activeLocation, setActiveLocation] = useState<TourLocation>(locations[0]);
  const [viewMode, setViewMode] = useState<'360' | 'wireframe' | 'telemetry'>('360');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl h-[88vh] bg-[#0f141c] text-white rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-achievement-gold/10 border border-achievement-gold/30 text-achievement-gold flex items-center justify-center">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WEB 3.0 DIGITAL TWIN
                </span>
                <span className="text-xs text-white/50">• 4K Interactive Campus Tour</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Triple 4C Virtual Campus & Simulation Labs
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-white/5 rounded-xl p-1 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setViewMode('360')}
                className={`px-3 py-1 rounded-lg transition ${viewMode === '360' ? 'bg-achievement-gold text-neutral-950 shadow-xs' : 'text-white/70 hover:text-white'}`}
              >
                360° Photoreal
              </button>
              <button
                onClick={() => setViewMode('wireframe')}
                className={`px-3 py-1 rounded-lg transition ${viewMode === 'wireframe' ? 'bg-achievement-gold text-neutral-950 shadow-xs' : 'text-white/70 hover:text-white'}`}
              >
                3D Spatial Wireframe
              </button>
              <button
                onClick={() => setViewMode('telemetry')}
                className={`px-3 py-1 rounded-lg transition ${viewMode === 'telemetry' ? 'bg-achievement-gold text-neutral-950 shadow-xs' : 'text-white/70 hover:text-white'}`}
              >
                IoT Telemetry
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Main Visualizer Stage */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
            <img 
              src={activeLocation.imageUrl} 
              alt={activeLocation.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                viewMode === 'wireframe' ? 'filter invert hue-rotate-180 opacity-60 contrast-125' : 
                viewMode === 'telemetry' ? 'filter saturate-150 contrast-125' : ''
              }`}
            />

            {/* Grid overlay for spatial feel */}
            {viewMode === 'wireframe' && (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffcc15_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            )}

            {/* Interactive Hotspot Markers */}
            <div className="absolute top-1/3 left-1/4">
              <button
                onClick={() => setActiveHotspot('Rack A-12 Cluster Controller')}
                className="relative group/pin p-2"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-achievement-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-achievement-gold border-2 border-neutral-950" />
                <div className="absolute left-6 top-0 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-achievement-gold/40 text-[11px] font-bold text-achievement-gold whitespace-nowrap shadow-lg opacity-0 group-hover/pin:opacity-100 transition-opacity">
                  Cluster Controller Node 01
                </div>
              </button>
            </div>

            <div className="absolute bottom-1/3 right-1/3">
              <button
                onClick={() => setActiveHotspot('Optic Fiber Core Switch')}
                className="relative group/pin p-2"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-neutral-950" />
                <div className="absolute left-6 top-0 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400/40 text-[11px] font-bold text-emerald-300 whitespace-nowrap shadow-lg opacity-0 group-hover/pin:opacity-100 transition-opacity">
                  100 Gbps Core Backbone Link
                </div>
              </button>
            </div>

            {/* Active Hotspot Banner */}
            {activeHotspot && (
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-neutral-950/90 backdrop-blur-md p-4 rounded-2xl border border-achievement-gold/40 shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-achievement-gold">
                    Inspected Facility Hotspot
                  </span>
                  <button onClick={() => setActiveHotspot(null)} className="text-white/60 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="text-sm font-black text-white">{activeHotspot}</h4>
                <p className="text-xs text-white/70 mt-1">
                  Connected directly to the 444 distributed simulator. Status: Online (99.98% availability, 12ms latency).
                </p>
              </div>
            )}

            {/* Compass / Orientation HUD */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SPATIAL HD: LIVE</span>
            </div>
          </div>

          {/* Location Selector Sidebar */}
          <div className="w-full md:w-80 bg-[#141a24] p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-achievement-gold">
                Select Campus Facility
              </span>

              <div className="space-y-2">
                {locations.map(loc => {
                  const isSelected = loc.id === activeLocation.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setActiveLocation(loc);
                        setActiveHotspot(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition ${
                        isSelected
                          ? 'bg-achievement-gold/15 border-achievement-gold text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-black">{loc.name}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">{loc.department}</p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] text-achievement-gold font-bold">
                        <span>{loc.hotspotsCount} Interactive Hotspots</span>
                        <ChevronRight className="w-3 h-3 ml-auto" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Location Info Box */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                  Interactive Features
                </span>
                <div className="space-y-1.5">
                  {activeLocation.interactiveFeatures.map(feat => (
                    <div key={feat} className="flex items-center gap-2 text-white/80 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-achievement-gold hover:bg-yellow-300 text-neutral-950 font-black text-xs transition shadow-md"
              >
                Return to Campus Portal
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
