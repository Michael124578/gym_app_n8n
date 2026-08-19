import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, Zap, ShieldCheck, Clock, Flame, 
  RotateCcw, Sparkles, AlertCircle, CheckCircle2, 
  TrendingUp, BarChart2, Dumbbell, Layers
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, CartesianGrid 
} from 'recharts'

export default function MuscleRecoveryInsights({ session }) {
  const [viewAngle, setViewAngle] = useState('front') // 'front' | 'back'
  const [selectedMuscle, setSelectedMuscle] = useState('chest')

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

  // SIMULATE LOGGING A WORKOUT (E.G. PUSH DAY)
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
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Hypertrophy & Neuromuscular Recovery Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Muscle Recovery & Volume Heatmap
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time anatomical readiness tracking showing when each muscle group is primed for progressive overload vs recovering from muscle protein synthesis.
            </p>
          </div>

          {/* SIMULATION TEST BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2">Simulate:</span>
            <button
              type="button"
              onClick={() => simulateWorkoutLog('push')}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition"
            >
              + Log Push Day
            </button>
            <button
              type="button"
              onClick={() => simulateWorkoutLog('legs')}
              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition"
            >
              + Log Leg Day
            </button>
            <button
              type="button"
              onClick={resetReadiness}
              className="p-1.5 text-slate-500 hover:text-white"
              title="Reset Recovery"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HEATMAP LEGEND BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse" />
          <div>
            <span className="text-xs font-black uppercase text-white block">Fully Recovered (90-100%)</span>
            <span className="text-[10px] text-slate-400">Optimal window for maximum progressive overload</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40" />
          <div>
            <span className="text-xs font-black uppercase text-white block">Recovering (50-89%)</span>
            <span className="text-[10px] text-slate-400">Moderate fatigue, suitable for light accessory volume</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/40 animate-pulse" />
          <div>
            <span className="text-xs font-black uppercase text-white block">Fatigued / MPS Active (0-49%)</span>
            <span className="text-[10px] text-slate-400">Active repair state; rest & protein synthesis needed</span>
          </div>
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
                    d="M75,56 Q100,60 125,56 L128,88 Q100,98 72,88 Z"
                    fill={getStatusColor(muscleStates.chest.status)}
                    stroke={selectedMuscle === 'chest' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'chest' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('chest')}
                  />
                  {/* SHOULDERS */}
                  <circle
                    cx="60"
                    cy="66"
                    r="12"
                    fill={getStatusColor(muscleStates.shoulders.status)}
                    stroke={selectedMuscle === 'shoulders' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'shoulders' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('shoulders')}
                  />
                  <circle
                    cx="140"
                    cy="66"
                    r="12"
                    fill={getStatusColor(muscleStates.shoulders.status)}
                    stroke={selectedMuscle === 'shoulders' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'shoulders' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('shoulders')}
                  />
                  {/* BICEPS */}
                  <rect
                    x="48"
                    y="84"
                    width="12"
                    height="32"
                    rx="6"
                    fill={getStatusColor(muscleStates.biceps.status)}
                    stroke={selectedMuscle === 'biceps' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'biceps' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('biceps')}
                  />
                  <rect
                    x="140"
                    y="84"
                    width="12"
                    height="32"
                    rx="6"
                    fill={getStatusColor(muscleStates.biceps.status)}
                    stroke={selectedMuscle === 'biceps' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'biceps' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('biceps')}
                  />
                  {/* ABS / CORE */}
                  <rect
                    x="82"
                    y="96"
                    width="36"
                    height="50"
                    rx="6"
                    fill={getStatusColor(muscleStates.core.status)}
                    stroke={selectedMuscle === 'core' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'core' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('core')}
                  />
                  {/* QUADS */}
                  <path
                    d="M74,152 L94,152 L90,230 L70,230 Z"
                    fill={getStatusColor(muscleStates.quads.status)}
                    stroke={selectedMuscle === 'quads' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'quads' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('quads')}
                  />
                  <path
                    d="M106,152 L126,152 L130,230 L110,230 Z"
                    fill={getStatusColor(muscleStates.quads.status)}
                    stroke={selectedMuscle === 'quads' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'quads' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('quads')}
                  />
                  {/* CALVES */}
                  <rect
                    x="68"
                    y="244"
                    width="16"
                    height="54"
                    rx="6"
                    fill={getStatusColor(muscleStates.calves.status)}
                    stroke={selectedMuscle === 'calves' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'calves' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('calves')}
                  />
                  <rect
                    x="116"
                    y="244"
                    width="16"
                    height="54"
                    rx="6"
                    fill={getStatusColor(muscleStates.calves.status)}
                    stroke={selectedMuscle === 'calves' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'calves' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('calves')}
                  />
                </g>
              ) : (
                // BACK VIEW
                <g>
                  {/* BACK / LATS */}
                  <path
                    d="M68,54 L132,54 L118,140 L82,140 Z"
                    fill={getStatusColor(muscleStates.lats.status)}
                    stroke={selectedMuscle === 'lats' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'lats' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('lats')}
                  />
                  {/* TRICEPS */}
                  <rect
                    x="46"
                    y="84"
                    width="12"
                    height="36"
                    rx="6"
                    fill={getStatusColor(muscleStates.triceps.status)}
                    stroke={selectedMuscle === 'triceps' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'triceps' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('triceps')}
                  />
                  <rect
                    x="142"
                    y="84"
                    width="12"
                    height="36"
                    rx="6"
                    fill={getStatusColor(muscleStates.triceps.status)}
                    stroke={selectedMuscle === 'triceps' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'triceps' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('triceps')}
                  />
                  {/* GLUTES & HAMSTRINGS */}
                  <path
                    d="M72,148 L128,148 L124,232 L76,232 Z"
                    fill={getStatusColor(muscleStates.hamstrings.status)}
                    stroke={selectedMuscle === 'hamstrings' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'hamstrings' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('hamstrings')}
                  />
                  {/* CALVES */}
                  <rect
                    x="68"
                    y="244"
                    width="16"
                    height="54"
                    rx="6"
                    fill={getStatusColor(muscleStates.calves.status)}
                    stroke={selectedMuscle === 'calves' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'calves' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('calves')}
                  />
                  <rect
                    x="116"
                    y="244"
                    width="16"
                    height="54"
                    rx="6"
                    fill={getStatusColor(muscleStates.calves.status)}
                    stroke={selectedMuscle === 'calves' ? '#ffffff' : '#0f172a'}
                    strokeWidth={selectedMuscle === 'calves' ? '2.5' : '1'}
                    className="cursor-pointer transition-all hover:opacity-80"
                    onClick={() => setSelectedMuscle('calves')}
                  />
                </g>
              )}
            </svg>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Selected: <strong className="text-white uppercase">{activeMuscleData.name}</strong> ({activeMuscleData.readiness}% Readiness)
          </span>
        </div>

        {/* RIGHT: SELECTED MUSCLE DRILLDOWN CARD */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  Biochemical Status
                </span>
                <h2 className="text-2xl font-black uppercase text-white">{activeMuscleData.name}</h2>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                activeMuscleData.status === 'recovered'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : activeMuscleData.status === 'recovering'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {activeMuscleData.status === 'recovered' ? '100% Ready' : `${activeMuscleData.readiness}% Readiness`}
              </span>
            </div>

            {/* PROGRESS GAUGE */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Recovery Trajectory</span>
                <span className="text-white font-bold">{activeMuscleData.readiness}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  style={{ width: `${activeMuscleData.readiness}%` }}
                  className={`h-full rounded-full transition-all duration-700 ${
                    activeMuscleData.status === 'recovered'
                      ? 'bg-emerald-500'
                      : activeMuscleData.status === 'recovering'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Last Trained</span>
                <span className="text-lg font-black text-white">{activeMuscleData.lastTrainedHours}h ago</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Recovery Countdown</span>
                <span className="text-lg font-black text-indigo-400">
                  {activeMuscleData.recoveryHoursLeft > 0 ? `${activeMuscleData.recoveryHoursLeft}h left` : 'Fully Ready 🎉'}
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Weekly Volume Tonnage</span>
                <span className="text-lg font-black text-white">{activeMuscleData.volumeKg.toLocaleString()} kg</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Weekly Direct Sets</span>
                <span className="text-lg font-black text-emerald-400">{activeMuscleData.weeklySets} sets <span className="text-[10px] text-slate-500 font-normal">({activeMuscleData.optimalRange})</span></span>
              </div>
            </div>
          </div>

          {/* TRAINING RECOMMENDATION CUE */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs leading-relaxed space-y-1">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold block">
              💡 Hypertrophy Protocol Recommendation
            </span>
            <p className="text-slate-300">
              {activeMuscleData.status === 'recovered'
                ? 'Muscle is fully recovered with glycogen stores replenished. Ideal window to perform heavy multi-joint compound movements (e.g. 80-85% 1RM).'
                : activeMuscleData.status === 'recovering'
                ? 'Muscle is in the late stages of repair. If training today, keep intensity under RPE 7 or focus on high-rep isolation movements.'
                : 'Muscle is actively undergoing structural myofibrillar protein synthesis. Training this muscle today is counter-productive. Prioritize sleep and protein intake.'}
            </p>
          </div>

        </div>

      </div>

      {/* WEEKLY VOLUME TONNAGE CHART (RECHARTS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Volume Load Tonnage Analytics
            </span>
            <h2 className="text-xl font-black uppercase text-white">Weekly Direct Tonnage per Muscle Group (kg)</h2>
          </div>

          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300">
            Total Weekly Volume: <strong className="text-white font-black">{volumeData.reduce((a, b) => a + b.volume, 0).toLocaleString()} kg</strong>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="muscle" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '1rem', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Bar dataKey="volume" radius={[8, 8, 0, 0]}>
                {volumeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
