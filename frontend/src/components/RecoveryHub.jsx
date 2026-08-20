import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, Zap, ShieldCheck, Clock, Flame, 
  RotateCcw, AlertCircle, CheckCircle2, 
  TrendingUp, BarChart2, Dumbbell, Layers, Heart, Sparkles, RefreshCw
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, CartesianGrid 
} from 'recharts'
import PillButton from './PillButton'
import PillFilter from './PillFilter'

const MOBILITY_ROUTINES = [
  {
    id: 'hip_opener',
    title: 'Squat Mobility & Hip Opener',
    target: 'Hips, Glutes & Ankle Dorsiflexion',
    duration: '8 Mins',
    level: 'Essential Warmup',
    color: 'emerald',
    steps: [
      { name: 'Deep Goblet Squat Hold', duration: '60s', cue: 'Drive knees outward over toes, stay tall through chest' },
      { name: '90/90 Hip Switches', reps: '10 Per Side', cue: 'Keep heels anchored, rotate hips slowly through full ROM' },
      { name: 'World\'s Greatest Stretch', reps: '6 Per Side', cue: 'Step into deep lunge, rotate arm toward ceiling' },
      { name: 'Ankle Mobilizations', reps: '12 Per Side', cue: 'Push knee past toe while maintaining flat heel' }
    ]
  },
  {
    id: 'thoracic_spine',
    title: 'Thoracic Spine & Shoulder Prep',
    target: 'T-Spine Extension & Scapular Control',
    duration: '10 Mins',
    level: 'Upper Day Prep',
    color: 'indigo',
    steps: [
      { name: 'Foam Roller T-Spine Extension', duration: '90s', cue: 'Support head, extend upper back over roller without flaring ribs' },
      { name: 'Quadruped Thread the Needle', reps: '8 Per Side', cue: 'Reach arm deep across floor, open chest smoothly' },
      { name: 'Band Dislocates / Pass-Throughs', reps: '15 Reps', cue: 'Maintain straight elbows, stretch chest at top' },
      { name: 'Scapular Wall Slides', reps: '12 Reps', cue: 'Keep wrists and elbows flat against wall throughout movement' }
    ]
  },
  {
    id: 'posterior_chain',
    title: 'Posterior Chain & Hamstring Decompression',
    target: 'Hamstrings, Lower Back & Calves',
    duration: '12 Mins',
    level: 'Post-Workout Cool Down',
    color: 'purple',
    steps: [
      { name: 'Elevated Hamstring Floss', reps: '10 Per Side', cue: 'Extend knee while flexing foot, release smoothly' },
      { name: 'Jefferson Curl / Spine Roll', reps: '6 Reps', cue: 'Roll down one vertebra at a time with light loading' },
      { name: 'Single-Leg Downward Dog Shift', duration: '90s', cue: 'Pedal heels down, lengthen posterior hamstrings' },
      { name: 'Couch Stretch (Hip Flexor)', duration: '60s Per Side', cue: 'Squeeze trailing glute, maintain upright posture' }
    ]
  }
]

export default function RecoveryHub({ session }) {
  const [activeTab, setActiveTab] = useState('strength_insights') // 'strength_insights' | 'mobility'
  const [viewAngle, setViewAngle] = useState('front') // 'front' | 'back'
  const [selectedMuscle, setSelectedMuscle] = useState('chest')
  const [activeRoutine, setActiveRoutine] = useState(MOBILITY_ROUTINES[0])

  // MUSCLE RECOVERY DATA STATE
  const [muscleStates, setMuscleStates] = useState({
    chest: { name: 'Pectorals (Chest)', status: 'fatigued', readiness: 30, lastTrainedHours: 14, recoveryHoursLeft: 34, weeklySets: 16, volumeKg: 12400, optimalRange: '12-20 sets' },
    lats: { name: 'Latissimus Dorsi (Back)', status: 'recovering', readiness: 75, lastTrainedHours: 42, recoveryHoursLeft: 6, weeklySets: 18, volumeKg: 14800, optimalRange: '14-22 sets' },
    shoulders: { name: 'Deltoids (Shoulders)', status: 'fatigued', readiness: 40, lastTrainedHours: 14, recoveryHoursLeft: 30, weeklySets: 14, volumeKg: 6500, optimalRange: '12-18 sets' },
    biceps: { name: 'Biceps Brachii', status: 'recovered', readiness: 100, lastTrainedHours: 72, recoveryHoursLeft: 0, weeklySets: 10, volumeKg: 3800, optimalRange: '10-16 sets' },
    triceps: { name: 'Triceps Brachii', status: 'fatigued', readiness: 35, lastTrainedHours: 14, recoveryHoursLeft: 32, weeklySets: 12, volumeKg: 4900, optimalRange: '10-16 sets' },
    quads: { name: 'Quadriceps', status: 'recovered', readiness: 100, lastTrainedHours: 96, recoveryHoursLeft: 0, weeklySets: 16, volumeKg: 18200, optimalRange: '12-20 sets' },
    hamstrings: { name: 'Hamstrings & Glutes', status: 'recovered', readiness: 95, lastTrainedHours: 80, recoveryHoursLeft: 0, weeklySets: 14, volumeKg: 13500, optimalRange: '10-18 sets' },
    core: { name: 'Abdominals & Core', status: 'recovered', readiness: 100, lastTrainedHours: 48, recoveryHoursLeft: 0, weeklySets: 8, volumeKg: 2100, optimalRange: '8-14 sets' },
    calves: { name: 'Gastrocnemius (Calves)', status: 'recovered', readiness: 100, lastTrainedHours: 96, recoveryHoursLeft: 0, weeklySets: 8, volumeKg: 4200, optimalRange: '8-14 sets' }
  })

  // WEEKLY VOLUME BREAKDOWN DATA (RECHARTS)
  const volumeData = [
    { muscle: 'Quads/Legs', volume: 18200, sets: 16, targetMin: 12, targetMax: 20 },
    { muscle: 'Back/Lats', volume: 14800, sets: 18, targetMin: 14, targetMax: 22 },
    { muscle: 'Hamstrings', volume: 13500, sets: 14, targetMin: 10, targetMax: 18 },
    { muscle: 'Chest', volume: 12400, sets: 16, targetMin: 12, targetMax: 20 },
    { muscle: 'Shoulders', volume: 6500, sets: 14, targetMin: 12, targetMax: 18 },
    { muscle: 'Triceps', volume: 4900, sets: 12, targetMin: 10, targetMax: 16 },
    { muscle: 'Calves', volume: 4200, sets: 8, targetMin: 8, targetMax: 14 },
    { muscle: 'Biceps', volume: 3800, sets: 10, targetMin: 10, targetMax: 16 },
  ]

  const simulateWorkoutLog = (type) => {
    if (type === 'push') {
      setMuscleStates(prev => ({
        ...prev,
        chest: { ...prev.chest, status: 'fatigued', readiness: 20, lastTrainedHours: 1, recoveryHoursLeft: 47, weeklySets: prev.chest.weeklySets + 4, volumeKg: prev.chest.volumeKg + 3200 },
        shoulders: { ...prev.shoulders, status: 'fatigued', readiness: 25, lastTrainedHours: 1, recoveryHoursLeft: 45, weeklySets: prev.shoulders.weeklySets + 3, volumeKg: prev.shoulders.volumeKg + 1600 },
        triceps: { ...prev.triceps, status: 'fatigued', readiness: 20, lastTrainedHours: 1, recoveryHoursLeft: 46, weeklySets: prev.triceps.weeklySets + 3, volumeKg: prev.triceps.volumeKg + 1200 },
      }))
    } else if (type === 'legs') {
      setMuscleStates(prev => ({
        ...prev,
        quads: { ...prev.quads, status: 'fatigued', readiness: 15, lastTrainedHours: 1, recoveryHoursLeft: 48, weeklySets: prev.quads.weeklySets + 5, volumeKg: prev.quads.volumeKg + 4500 },
        hamstrings: { ...prev.hamstrings, status: 'fatigued', readiness: 20, lastTrainedHours: 1, recoveryHoursLeft: 48, weeklySets: prev.hamstrings.weeklySets + 4, volumeKg: prev.hamstrings.volumeKg + 3600 },
        calves: { ...prev.calves, status: 'recovering', readiness: 60, lastTrainedHours: 1, recoveryHoursLeft: 24, weeklySets: prev.calves.weeklySets + 3, volumeKg: prev.calves.volumeKg + 1200 },
      }))
    }
  }

  const resetReadiness = () => {
    setMuscleStates(prev => {
      const reset = {}
      Object.keys(prev).forEach(k => {
        reset[k] = { ...prev[k], status: 'recovered', readiness: 100, lastTrainedHours: 72, recoveryHoursLeft: 0 }
      })
      return reset
    })
  }

  const getStatusColor = (status) => {
    if (status === 'recovered') return '#10b981' // Green
    if (status === 'recovering') return '#f59e0b' // Amber
    return '#f43f5e' // Red
  }

  const activeMuscleData = muscleStates[selectedMuscle] || muscleStates.chest

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* HUB BANNER & MODE TOGGLE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Unified Recovery & Neuromuscular Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Recovery Hub & Strength Insights
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Data-driven muscle readiness heatmap, weekly volume tonnage tracking, and guided mobility protocols to optimize progressive overload and injury prevention.
            </p>
          </div>

          {/* TAB SEGMENT FILTER */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shrink-0">
            <PillFilter
              active={activeTab === 'strength_insights'}
              onClick={() => setActiveTab('strength_insights')}
              theme="indigo"
              icon={Activity}
              size="md"
            >
              Strength Insights & Heatmap
            </PillFilter>

            <PillFilter
              active={activeTab === 'mobility'}
              onClick={() => setActiveTab('mobility')}
              theme="emerald"
              icon={Sparkles}
              size="md"
            >
              Mobility Protocols
            </PillFilter>
          </div>
        </div>
      </div>

      {activeTab === 'strength_insights' ? (
        <div className="space-y-8">
          
          {/* SIMULATION TEST CONTROLS & LEGEND BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/80 p-4 sm:p-5 rounded-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold px-2">Simulate Load:</span>
              <PillButton onClick={() => simulateWorkoutLog('push')} theme="purple" size="sm">
                + Log Push Day
              </PillButton>
              <PillButton onClick={() => simulateWorkoutLog('legs')} theme="teal" size="sm">
                + Log Leg Day
              </PillButton>
              <button
                type="button"
                onClick={resetReadiness}
                className="p-2 text-slate-500 hover:text-white rounded-xl bg-slate-950 border border-slate-800 transition"
                title="Reset Recovery"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* STATUS LEGEND */}
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Recovered</span>
              </span>
              <span className="flex items-center space-x-1.5 text-amber-400">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span>Recovering</span>
              </span>
              <span className="flex items-center space-x-1.5 text-rose-400">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 animate-pulse" />
                <span>Fatigued</span>
              </span>
            </div>
          </div>

          {/* ANATOMICAL MAP & SELECTED MUSCLE CARD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: SVG ANATOMY HEATMAP */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-2xl space-y-6">
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                    Interactive Biometric Anatomy
                  </span>
                  <span className="text-sm font-black uppercase text-white">Click any muscle to inspect state</span>
                </div>

                {/* VIEW TOGGLE */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewAngle('front')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      viewAngle === 'front' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewAngle('back')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      viewAngle === 'back' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Back View
                  </button>
                </div>
              </div>

              {/* SVG ANATOMY DIAGRAM */}
              <div className="relative w-72 h-96 flex items-center justify-center">
                <svg viewBox="0 0 200 340" className="w-full h-full filter drop-shadow-2xl">
                  {/* HEAD */}
                  <circle cx="100" cy="24" r="16" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

                  {viewAngle === 'front' ? (
                    // FRONT VIEW
                    <g>
                      {/* CHEST */}
                      <path
                        d="M 68 62 L 100 70 L 132 62 L 130 96 L 100 100 L 70 96 Z"
                        fill={getStatusColor(muscleStates.chest.status)}
                        opacity={selectedMuscle === 'chest' ? '1' : '0.8'}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('chest')}
                      />
                      {/* SHOULDERS */}
                      <path
                        d="M 46 60 L 68 62 L 68 90 L 48 85 Z"
                        fill={getStatusColor(muscleStates.shoulders.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('shoulders')}
                      />
                      <path
                        d="M 154 60 L 132 62 L 132 90 L 152 85 Z"
                        fill={getStatusColor(muscleStates.shoulders.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('shoulders')}
                      />
                      {/* BICEPS */}
                      <path
                        d="M 44 88 L 66 92 L 62 128 L 42 120 Z"
                        fill={getStatusColor(muscleStates.biceps.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('biceps')}
                      />
                      <path
                        d="M 156 88 L 134 92 L 138 128 L 158 120 Z"
                        fill={getStatusColor(muscleStates.biceps.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('biceps')}
                      />
                      {/* ABS / CORE */}
                      <path
                        d="M 72 100 L 128 100 L 124 150 L 76 150 Z"
                        fill={getStatusColor(muscleStates.core.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('core')}
                      />
                      {/* QUADS */}
                      <path
                        d="M 68 158 L 98 160 L 96 230 L 66 220 Z"
                        fill={getStatusColor(muscleStates.quads.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('quads')}
                      />
                      <path
                        d="M 132 158 L 102 160 L 104 230 L 134 220 Z"
                        fill={getStatusColor(muscleStates.quads.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('quads')}
                      />
                    </g>
                  ) : (
                    // BACK VIEW
                    <g>
                      {/* LATS / BACK */}
                      <path
                        d="M 64 62 L 100 68 L 136 62 L 128 140 L 72 140 Z"
                        fill={getStatusColor(muscleStates.lats.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('lats')}
                      />
                      {/* TRICEPS */}
                      <path
                        d="M 44 88 L 64 92 L 60 128 L 42 120 Z"
                        fill={getStatusColor(muscleStates.triceps.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('triceps')}
                      />
                      <path
                        d="M 156 88 L 136 92 L 140 128 L 158 120 Z"
                        fill={getStatusColor(muscleStates.triceps.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('triceps')}
                      />
                      {/* HAMSTRINGS & GLUTES */}
                      <path
                        d="M 68 145 L 132 145 L 128 225 L 72 225 Z"
                        fill={getStatusColor(muscleStates.hamstrings.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('hamstrings')}
                      />
                      {/* CALVES */}
                      <path
                        d="M 70 235 L 96 238 L 94 290 L 72 285 Z"
                        fill={getStatusColor(muscleStates.calves.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('calves')}
                      />
                      <path
                        d="M 130 235 L 104 238 L 106 290 L 128 285 Z"
                        fill={getStatusColor(muscleStates.calves.status)}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition hover:opacity-100"
                        onClick={() => setSelectedMuscle('calves')}
                      />
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* RIGHT: SELECTED MUSCLE DETAIL INSPECTOR */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                      Target Inspection
                    </span>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                      {activeMuscleData.name}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                    activeMuscleData.status === 'recovered' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : activeMuscleData.status === 'recovering'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {activeMuscleData.status}
                  </span>
                </div>

                {/* READINESS PROGRESS BAR */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold uppercase">Neuromuscular Readiness</span>
                    <span className="text-white font-extrabold">{activeMuscleData.readiness}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        activeMuscleData.readiness >= 90
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : activeMuscleData.readiness >= 50
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-red-500'
                      }`}
                      style={{ width: `${activeMuscleData.readiness}%` }}
                    />
                  </div>
                </div>

                {/* METRICS GRID */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Last Loaded</span>
                    <span className="text-lg font-black font-mono text-white">{activeMuscleData.lastTrainedHours} Hours Ago</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Full Recovery In</span>
                    <span className="text-lg font-black font-mono text-indigo-400">
                      {activeMuscleData.recoveryHoursLeft === 0 ? 'Fully Primed' : `${activeMuscleData.recoveryHoursLeft} Hours`}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Weekly Volume</span>
                    <span className="text-lg font-black font-mono text-amber-400">{activeMuscleData.weeklySets} Sets</span>
                    <span className="text-[10px] font-mono text-slate-500 block">Target: {activeMuscleData.optimalRange}</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Tonnage</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {activeMuscleData.volumeKg.toLocaleString()} KG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WEEKLY VOLUME TONNAGE CHART */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                Periodization Volume Analysis
              </span>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                Weekly Tonnage Lifted (KG) By Muscle Group
              </h3>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="muscle" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                  />
                  <Bar dataKey="volume" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {volumeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        /* MOBILITY PROTOCOLS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ROUTINE LIST */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Guided Protocol Library</h3>
            <div className="space-y-3">
              {MOBILITY_ROUTINES.map((routine) => (
                <div
                  key={routine.id}
                  onClick={() => setActiveRoutine(routine)}
                  className={`p-5 rounded-3xl border transition cursor-pointer space-y-2 ${
                    activeRoutine.id === routine.id
                      ? 'bg-slate-900 border-indigo-500 shadow-xl'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase">{routine.level}</span>
                    <span className="text-xs font-mono font-bold text-slate-400">{routine.duration}</span>
                  </div>
                  <h4 className="font-black text-white text-base uppercase">{routine.title}</h4>
                  <p className="text-xs text-slate-400">{routine.target}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE ROUTINE STEPS INSPECTOR */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                Active Protocol Execution
              </span>
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                {activeRoutine.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{activeRoutine.target} • {activeRoutine.duration}</p>
            </div>

            <div className="space-y-3">
              {activeRoutine.steps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-start space-x-3">
                  <span className="h-7 w-7 rounded-xl bg-indigo-600/20 text-indigo-400 font-mono font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white uppercase text-sm">{step.name}</p>
                      <span className="text-xs font-mono text-emerald-400 font-bold">{step.duration || step.reps}</span>
                    </div>
                    <p className="text-xs text-slate-400">{step.cue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
