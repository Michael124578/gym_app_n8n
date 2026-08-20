import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Flame, Info, Eye } from 'lucide-react'

export default function MuscleHeatmap({ 
  selectedMuscle = 'all', 
  onSelectMuscle, 
  activeMuscles = [], 
  secondaryMuscles = [], 
  compact = false,
  title = "Anatomical Target Heatmap"
}) {
  const [hoveredMuscle, setHoveredMuscle] = useState(null)
  const [viewAngle, setViewAngle] = useState('front') // 'front' | 'back' | 'both'

  // Helper to determine muscle status
  const getMuscleStatus = (muscleId) => {
    const normId = muscleId.toLowerCase()
    
    // Exact or normalized match for selected muscle
    if (selectedMuscle && selectedMuscle !== 'all') {
      const normSel = selectedMuscle.toLowerCase()
      if (normSel === normId || normSel.includes(normId) || normId.includes(normSel)) {
        return 'primary'
      }
    }

    // Active session muscles check
    if (activeMuscles.length > 0) {
      const isPrimary = activeMuscles.some(m => m.toLowerCase().includes(normId) || normId.includes(m.toLowerCase()))
      if (isPrimary) return 'primary'

      const isSecondary = secondaryMuscles.some(m => m.toLowerCase().includes(normId) || normId.includes(m.toLowerCase()))
      if (isSecondary) return 'secondary'
    }

    return 'inactive'
  }

  // Get fill color & filter based on muscle status
  const getMuscleStyle = (muscleId) => {
    const status = getMuscleStatus(muscleId)
    const isHovered = hoveredMuscle === muscleId

    if (status === 'primary' || isHovered) {
      return {
        fill: 'url(#gradient-primary)',
        stroke: '#818cf8',
        strokeWidth: '1.5',
        filter: 'drop-shadow(0px 0px 6px rgba(99, 102, 241, 0.9))',
        opacity: 1
      }
    }

    if (status === 'secondary') {
      return {
        fill: 'url(#gradient-secondary)',
        stroke: '#f59e0b',
        strokeWidth: '1.2',
        filter: 'drop-shadow(0px 0px 4px rgba(245, 158, 11, 0.7))',
        opacity: 0.95
      }
    }

    return {
      fill: '#1e293b',
      stroke: '#334155',
      strokeWidth: '1',
      opacity: 0.65
    }
  }

  const handleMuscleClick = (muscleId) => {
    if (onSelectMuscle) {
      onSelectMuscle(selectedMuscle === muscleId ? 'all' : muscleId)
    }
  }

  return (
    <div className={`bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden ${compact ? 'max-w-md' : 'w-full'}`}>
      
      {/* SVG GRADIENT DEFINITIONS */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>

      {/* HEADER BAR */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">{title}</h3>
            <p className="text-[10px] text-slate-400">
              {hoveredMuscle ? `Hovering: ${hoveredMuscle.toUpperCase()}` : selectedMuscle && selectedMuscle !== 'all' ? `Selected: ${selectedMuscle.toUpperCase()}` : 'Click muscle paths to filter'}
            </p>
          </div>
        </div>

        {/* ANGLE VIEW SWITCHER */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-[10px] font-mono font-bold">
          <button
            onClick={() => setViewAngle('front')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${viewAngle === 'front' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Front
          </button>
          <button
            onClick={() => setViewAngle('back')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${viewAngle === 'back' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Back
          </button>
          <button
            onClick={() => setViewAngle('both')}
            className={`hidden sm:block px-2.5 py-1 rounded-lg transition cursor-pointer ${viewAngle === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Both
          </button>
        </div>
      </div>

      {/* ANATOMICAL BODY VECTOR MAP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-items-center py-2">
        
        {/* FRONT BODY SILHOUETTE */}
        {(viewAngle === 'front' || viewAngle === 'both') && (
          <div className="relative flex flex-col items-center group">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
              Anterior (Front)
            </span>
            <svg viewBox="0 0 200 400" className="w-44 h-72 sm:w-52 sm:h-80 transition-transform duration-300">
              
              {/* BODY BASE OUTLINE */}
              <g className="transition-all duration-300">
                {/* Head & Neck */}
                <path d="M100 20 C110 20 115 30 115 45 C115 60 108 65 100 65 C92 65 85 60 85 45 C85 30 90 20 100 20 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <path d="M92 65 L90 80 L110 80 L108 65 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />

                {/* CHEST (Pectorals) */}
                <path 
                  d="M72 90 Q100 95 100 120 Q80 125 68 110 Z" 
                  {...getMuscleStyle('chest')}
                  onClick={() => handleMuscleClick('chest')}
                  onMouseEnter={() => setHoveredMuscle('chest')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M128 90 Q100 95 100 120 Q120 125 132 110 Z" 
                  {...getMuscleStyle('chest')}
                  onClick={() => handleMuscleClick('chest')}
                  onMouseEnter={() => setHoveredMuscle('chest')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* SHOULDERS (Front Deltoids) */}
                <path 
                  d="M58 85 Q70 85 72 95 Q60 115 54 95 Z" 
                  {...getMuscleStyle('shoulders')}
                  onClick={() => handleMuscleClick('shoulders')}
                  onMouseEnter={() => setHoveredMuscle('shoulders')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M142 85 Q130 85 128 95 Q140 115 146 95 Z" 
                  {...getMuscleStyle('shoulders')}
                  onClick={() => handleMuscleClick('shoulders')}
                  onMouseEnter={() => setHoveredMuscle('shoulders')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* BICEPS */}
                <path 
                  d="M52 100 Q62 115 48 140 Q40 125 52 100 Z" 
                  {...getMuscleStyle('biceps')}
                  onClick={() => handleMuscleClick('biceps')}
                  onMouseEnter={() => setHoveredMuscle('biceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M148 100 Q138 115 152 140 Q160 125 148 100 Z" 
                  {...getMuscleStyle('biceps')}
                  onClick={() => handleMuscleClick('biceps')}
                  onMouseEnter={() => setHoveredMuscle('biceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* ABS / CORE */}
                <path 
                  d="M80 125 L120 125 Q115 180 100 195 Q85 180 80 125 Z" 
                  {...getMuscleStyle('abs')}
                  onClick={() => handleMuscleClick('abs')}
                  onMouseEnter={() => setHoveredMuscle('abs')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* QUADS (Legs Front) */}
                <path 
                  d="M74 200 Q98 200 96 280 L70 275 Q66 230 74 200 Z" 
                  {...getMuscleStyle('quads')}
                  onClick={() => handleMuscleClick('quads')}
                  onMouseEnter={() => setHoveredMuscle('quads')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M126 200 Q102 200 104 280 L130 275 Q134 230 126 200 Z" 
                  {...getMuscleStyle('quads')}
                  onClick={() => handleMuscleClick('quads')}
                  onMouseEnter={() => setHoveredMuscle('quads')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* CALVES (Front) */}
                <path 
                  d="M68 290 Q92 290 86 360 L72 360 Z" 
                  {...getMuscleStyle('calves')}
                  onClick={() => handleMuscleClick('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M132 290 Q108 290 114 360 L128 360 Z" 
                  {...getMuscleStyle('calves')}
                  onClick={() => handleMuscleClick('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
              </g>
            </svg>
          </div>
        )}

        {/* BACK BODY SILHOUETTE */}
        {(viewAngle === 'back' || viewAngle === 'both') && (
          <div className="relative flex flex-col items-center group">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
              Posterior (Back)
            </span>
            <svg viewBox="0 0 200 400" className="w-44 h-72 sm:w-52 sm:h-80 transition-transform duration-300">
              <g className="transition-all duration-300">
                {/* Head & Neck */}
                <path d="M100 20 C110 20 115 30 115 45 C115 60 108 65 100 65 C92 65 85 60 85 45 C85 30 90 20 100 20 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

                {/* TRAPS / UPPER BACK */}
                <path 
                  d="M85 65 Q100 75 115 65 L135 85 Q100 105 65 85 Z" 
                  {...getMuscleStyle('back')}
                  onClick={() => handleMuscleClick('back')}
                  onMouseEnter={() => setHoveredMuscle('back')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* LATS (Latissimus Dorsi) */}
                <path 
                  d="M68 90 Q100 110 132 90 Q125 155 100 170 Q75 155 68 90 Z" 
                  {...getMuscleStyle('back')}
                  onClick={() => handleMuscleClick('back')}
                  onMouseEnter={() => setHoveredMuscle('back')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* TRICEPS */}
                <path 
                  d="M52 95 Q62 110 46 138 Q38 120 52 95 Z" 
                  {...getMuscleStyle('triceps')}
                  onClick={() => handleMuscleClick('triceps')}
                  onMouseEnter={() => setHoveredMuscle('triceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M148 95 Q138 110 154 138 Q162 120 148 95 Z" 
                  {...getMuscleStyle('triceps')}
                  onClick={() => handleMuscleClick('triceps')}
                  onMouseEnter={() => setHoveredMuscle('triceps')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* GLUTES */}
                <path 
                  d="M72 175 Q100 165 128 175 Q130 210 100 215 Q70 210 72 175 Z" 
                  {...getMuscleStyle('glutes')}
                  onClick={() => handleMuscleClick('glutes')}
                  onMouseEnter={() => setHoveredMuscle('glutes')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* HAMSTRINGS */}
                <path 
                  d="M72 220 Q98 220 96 280 L70 275 Q66 240 72 220 Z" 
                  {...getMuscleStyle('hamstrings')}
                  onClick={() => handleMuscleClick('hamstrings')}
                  onMouseEnter={() => setHoveredMuscle('hamstrings')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M128 220 Q102 220 104 280 L130 275 Q134 240 128 220 Z" 
                  {...getMuscleStyle('hamstrings')}
                  onClick={() => handleMuscleClick('hamstrings')}
                  onMouseEnter={() => setHoveredMuscle('hamstrings')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />

                {/* CALVES (Back) */}
                <path 
                  d="M68 290 Q92 290 86 360 L72 360 Z" 
                  {...getMuscleStyle('calves')}
                  onClick={() => handleMuscleClick('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
                <path 
                  d="M132 290 Q108 290 114 360 L128 360 Z" 
                  {...getMuscleStyle('calves')}
                  onClick={() => handleMuscleClick('calves')}
                  onMouseEnter={() => setHoveredMuscle('calves')}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  className="cursor-pointer transition-all duration-200"
                />
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* HEATMAP LEGEND */}
      <div className="mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-1.5 shadow-sm shadow-indigo-500" />
            Primary Target
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 shadow-sm shadow-amber-500" />
            Synergist / Secondary
          </span>
        </div>
        <span className="text-slate-400">Click path to filter</span>
      </div>
    </div>
  )
}
