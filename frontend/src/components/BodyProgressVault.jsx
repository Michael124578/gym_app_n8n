import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, LineChart, Line 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Scale, Activity, Plus, 
  Trash2, Sparkles, Image, CheckCircle2, ChevronLeft, 
  ChevronRight, Calendar, Ruler, Award, ShieldCheck
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const PRESET_TRANSFORMATIONS = [
  {
    title: '12-Week Lean Hypertrophy Recomp',
    beforeImg: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800',
    stats: '-6.5 kg Fat • +3.2 kg Muscle • -5.4% Body Fat'
  },
  {
    title: '6-Month Athletic Conditioning',
    beforeImg: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
    afterImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    stats: '+5 kg Lean Mass • 180kg Squat PR Achieved'
  }
]

export default function BodyProgressVault({ session }) {
  // LOGGED ENTRIES STATE (with realistic defaults)
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('iron_gym_body_metrics')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return [
      { id: '1', date: '2026-06-01', weight: 88.5, bodyFat: 21.2, waist: 92, chest: 104, bicep: 36, thigh: 60 },
      { id: '2', date: '2026-06-15', weight: 87.0, bodyFat: 20.0, waist: 90, chest: 104.5, bicep: 36.5, thigh: 59.5 },
      { id: '3', date: '2026-07-01', weight: 85.8, bodyFat: 18.5, waist: 88, chest: 105, bicep: 37, thigh: 59 },
      { id: '4', date: '2026-07-15', weight: 84.5, bodyFat: 17.2, waist: 86.5, chest: 105.5, bicep: 37.5, thigh: 58.5 },
      { id: '5', date: '2026-08-01', weight: 83.2, bodyFat: 15.8, waist: 85, chest: 106, bicep: 38, thigh: 58 },
      { id: '6', date: '2026-08-15', weight: 82.0, bodyFat: 14.5, waist: 83.5, chest: 106.5, bicep: 38.5, thigh: 57.5 },
    ]
  })

  // NEW ENTRY FORM STATE
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newWeight, setNewWeight] = useState('81.5')
  const [newBodyFat, setNewBodyFat] = useState('14.0')
  const [newWaist, setNewWaist] = useState('83.0')
  const [newChest, setNewChest] = useState('107.0')
  const [newBicep, setNewBicep] = useState('39.0')
  const [newThigh, setNewThigh] = useState('57.0')
  const [isAddingMetric, setIsAddingMetric] = useState(false)

  // BEFORE & AFTER COMPARISON SLIDER STATE
  const [sliderPos, setSliderPos] = useState(50)
  const [activeTransformationIdx, setActiveTransformationIdx] = useState(0)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const sliderContainerRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('iron_gym_body_metrics', JSON.stringify(entries))
  }, [entries])

  const handleAddMetric = (e) => {
    e.preventDefault()
    if (!newWeight) return

    const newEntry = {
      id: `entry-${Date.now()}`,
      date: newDate,
      weight: parseFloat(newWeight) || 0,
      bodyFat: parseFloat(newBodyFat) || 0,
      waist: parseFloat(newWaist) || 0,
      chest: parseFloat(newChest) || 0,
      bicep: parseFloat(newBicep) || 0,
      thigh: parseFloat(newThigh) || 0
    }

    setEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date)))
    setIsAddingMetric(false)
  }

  const handleDeleteMetric = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  // Calculate high-level progress stats
  const firstEntry = entries[0]
  const latestEntry = entries[entries.length - 1]
  const weightChange = latestEntry && firstEntry ? (latestEntry.weight - firstEntry.weight).toFixed(1) : 0
  const bfChange = latestEntry && firstEntry ? (latestEntry.bodyFat - firstEntry.bodyFat).toFixed(1) : 0
  const bicepChange = latestEntry && firstEntry ? (latestEntry.bicep - firstEntry.bicep).toFixed(1) : 0
  const waistChange = latestEntry && firstEntry ? (latestEntry.waist - firstEntry.waist).toFixed(1) : 0

  // Slider Mouse/Touch movement handlers
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percentage)
  }

  const handleMouseMove = (e) => {
    if (isDraggingSlider) handleSliderMove(e.clientX)
  }

  const handleTouchMove = (e) => {
    if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX)
  }

  return (
    <div 
      className="space-y-8 animate-fadeIn"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDraggingSlider(false)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDraggingSlider(false)}
    >
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="h-4 w-4" />
            <span>Biometric Composition & Physique Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Body Composition & Progress Vault
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Record anthropometric circumference measurements, track fat-loss & lean muscle gain trends with interactive charts, and compare visual transformation progress.
          </p>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
            Current Weight
          </span>
          <span className="text-2xl font-black text-white block">
            {latestEntry?.weight || '--'} <span className="text-xs text-slate-400">kg</span>
          </span>
          <span className={`text-[11px] font-bold flex items-center mt-1 ${
            Number(weightChange) <= 0 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {Number(weightChange) <= 0 ? <TrendingDown className="h-3.5 w-3.5 mr-1" /> : <TrendingUp className="h-3.5 w-3.5 mr-1" />}
            {weightChange > 0 ? `+${weightChange}` : weightChange} kg total
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
            Body Fat %
          </span>
          <span className="text-2xl font-black text-indigo-400 block">
            {latestEntry?.bodyFat || '--'} <span className="text-xs text-slate-400">%</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center mt-1">
            <TrendingDown className="h-3.5 w-3.5 mr-1" />
            {bfChange > 0 ? `+${bfChange}` : bfChange}% reduction
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
            Waistline Delta
          </span>
          <span className="text-2xl font-black text-white block">
            {latestEntry?.waist || '--'} <span className="text-xs text-slate-400">cm</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-400 flex items-center mt-1">
            <TrendingDown className="h-3.5 w-3.5 mr-1" />
            {waistChange > 0 ? `+${waistChange}` : waistChange} cm
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
            Arm / Bicep Size
          </span>
          <span className="text-2xl font-black text-amber-400 block">
            {latestEntry?.bicep || '--'} <span className="text-xs text-slate-400">cm</span>
          </span>
          <span className="text-[11px] font-bold text-indigo-400 flex items-center mt-1">
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            {bicepChange > 0 ? `+${bicepChange}` : bicepChange} cm gain
          </span>
        </div>
      </div>

      {/* BEFORE / AFTER PHOTO COMPARISON SLIDER & TRANSFORMATION CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Visual Transformation Proof
            </span>
            <h2 className="text-xl font-black uppercase text-white">
              Interactive Before / After Comparison Slider
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {PRESET_TRANSFORMATIONS.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTransformationIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTransformationIdx === idx
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Transformation #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* DRAGGABLE COMPARISON SLIDER */}
        <div
          ref={sliderContainerRef}
          onMouseDown={() => setIsDraggingSlider(true)}
          onTouchStart={() => setIsDraggingSlider(true)}
          className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden border border-slate-800 select-none cursor-ew-resize shadow-2xl bg-slate-950"
        >
          {/* AFTER IMAGE (UNDERNEATH FULL VIEW) */}
          <img
            src={PRESET_TRANSFORMATIONS[activeTransformationIdx].afterImg}
            alt="After"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <span className="absolute top-4 right-4 bg-indigo-600/90 text-white font-mono text-xs uppercase font-bold px-3 py-1 rounded-full backdrop-blur-md z-10 shadow-lg">
            AFTER // Current Form
          </span>

          {/* BEFORE IMAGE (CLIPPED ON LEFT) */}
          <div
            style={{ width: `${sliderPos}%` }}
            className="absolute inset-0 h-full overflow-hidden z-20 pointer-events-none"
          >
            <img
              src={PRESET_TRANSFORMATIONS[activeTransformationIdx].beforeImg}
              alt="Before"
              style={{ width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%' }}
              className="absolute inset-0 h-full max-w-none object-cover"
            />
            <span className="absolute top-4 left-4 bg-slate-950/90 text-slate-300 font-mono text-xs uppercase font-bold px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md shadow-lg">
              BEFORE // Baseline
            </span>
          </div>

          {/* SLIDER DIVIDER LINE & HANDLE */}
          <div
            style={{ left: `${sliderPos}%` }}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-30 pointer-events-none -translate-x-1/2 flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full bg-white text-slate-950 shadow-2xl flex items-center justify-center border-2 border-indigo-600">
              <ChevronLeft className="h-4 w-4 -mr-1" />
              <ChevronRight className="h-4 w-4 -ml-1" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 gap-2">
          <span>✨ <strong className="text-white">{PRESET_TRANSFORMATIONS[activeTransformationIdx].title}</strong></span>
          <span className="font-mono text-indigo-400 font-bold">{PRESET_TRANSFORMATIONS[activeTransformationIdx].stats}</span>
        </div>
      </div>

      {/* INTERACTIVE PROGRESS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* WEIGHT PROGRESSION CHART */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                Scale Weight Trajectory
              </span>
              <h3 className="text-lg font-black uppercase text-white">Body Mass (kg)</h3>
            </div>
            <Scale className="h-5 w-5 text-indigo-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entries}>
                <defs>
                  <linearGradient id="weightGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} fill="url(#weightGlow)" name="Weight (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BODY FAT % CHART */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                Adipose Tissue Percentage
              </span>
              <h3 className="text-lg font-black uppercase text-white">Body Fat % Trend</h3>
            </div>
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={entries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="bodyFat" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Body Fat %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* METRIC LOGGING FORM & HISTORY TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Biometric Data Table
            </span>
            <h2 className="text-xl font-black uppercase text-white">Circumference & Weight Log</h2>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingMetric(!isAddingMetric)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>{isAddingMetric ? 'Cancel' : 'Log New Measurements'}</span>
          </button>
        </div>

        {/* LOG FORM MODAL/INLINE ACCORDION */}
        <AnimatePresence>
          {isAddingMetric && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddMetric}
              className="bg-slate-950 p-6 rounded-2xl border border-indigo-500/40 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase text-white">Add Biometric Check-in</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Bicep / Arm (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBicep}
                    onChange={(e) => setNewBicep(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Thigh (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newThigh}
                    onChange={(e) => setNewThigh(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* LOGS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Weight (kg)</th>
                <th className="py-2.5 px-3">Body Fat %</th>
                <th className="py-2.5 px-3">Waist</th>
                <th className="py-2.5 px-3">Chest</th>
                <th className="py-2.5 px-3">Bicep</th>
                <th className="py-2.5 px-3">Thigh</th>
                <th className="py-2.5 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition">
                  <td className="py-3 px-3 font-mono text-slate-300 font-bold">{item.date}</td>
                  <td className="py-3 px-3 font-bold text-white">{item.weight} kg</td>
                  <td className="py-3 px-3 text-indigo-400 font-semibold">{item.bodyFat}%</td>
                  <td className="py-3 px-3 text-slate-300">{item.waist} cm</td>
                  <td className="py-3 px-3 text-slate-300">{item.chest} cm</td>
                  <td className="py-3 px-3 text-slate-300">{item.bicep} cm</td>
                  <td className="py-3 px-3 text-slate-300">{item.thigh} cm</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteMetric(item.id)}
                      className="p-1 text-slate-600 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
