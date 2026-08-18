import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Cell 
} from 'recharts'
import { 
  Users, Activity, Radio, Clock, ShieldCheck, 
  AlertCircle, Sparkles, Flame, Dumbbell, Heart, 
  Coffee, RefreshCw
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const HOURLY_TRAFFIC_DATA = [
  { hour: '6 AM', occupancy: 18, label: 'Quiet' },
  { hour: '7 AM', occupancy: 35, label: 'Morning Rush' },
  { hour: '8 AM', occupancy: 42, label: 'Moderate' },
  { hour: '9 AM', occupancy: 28, label: 'Quiet' },
  { hour: '10 AM', occupancy: 22, label: 'Quiet' },
  { hour: '11 AM', occupancy: 25, label: 'Quiet' },
  { hour: '12 PM', occupancy: 48, label: 'Lunch Rush' },
  { hour: '1 PM', occupancy: 40, label: 'Moderate' },
  { hour: '2 PM', occupancy: 24, label: 'Quiet' },
  { hour: '3 PM', occupancy: 32, label: 'Moderate' },
  { hour: '4 PM', occupancy: 55, label: 'Building Up' },
  { hour: '5 PM', occupancy: 88, label: 'Peak Rush' },
  { hour: '6 PM', occupancy: 94, label: 'Max Rush' },
  { hour: '7 PM', occupancy: 85, label: 'Peak Rush' },
  { hour: '8 PM', occupancy: 62, label: 'Moderate' },
  { hour: '9 PM', occupancy: 38, label: 'Wind Down' },
  { hour: '10 PM', occupancy: 20, label: 'Quiet' },
]

export default function GymOccupancyHeatmap({ userRole }) {
  const [liveCount, setLiveCount] = useState(38)
  const [maxCapacity] = useState(100)
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentHour = new Date().getHours()

  const fetchLiveOccupancy = async () => {
    setIsRefreshing(true)
    try {
      const { data } = await supabase
        .from('check_ins')
        .select('id')
        .eq('access_granted', true)
        .is('checked_out_at', null)

      if (data && data.length > 0) {
        setLiveCount(data.length)
      }
      setLastRefreshed(new Date().toLocaleTimeString())
    } catch (e) {
      console.error(e)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLiveOccupancy()
    const interval = setInterval(fetchLiveOccupancy, 30000)
    return () => clearInterval(interval)
  }, [])

  const occupancyPercentage = Math.round((liveCount / maxCapacity) * 100)

  const getStatus = () => {
    if (occupancyPercentage < 40) return { label: 'Quiet / Optimal Training', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' }
    if (occupancyPercentage < 75) return { label: 'Moderate Traffic', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }
    return { label: 'Peak Rush Hour', color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30 text-rose-400' }
  }

  const zones = [
    { name: 'Free Weights & Dumbbells', count: Math.round(liveCount * 0.42), cap: 40, icon: Dumbbell, waitTime: 'No Wait' },
    { name: 'Power Cages & Squat Racks', count: Math.min(6, Math.round(liveCount * 0.12)), cap: 6, icon: ShieldCheck, waitTime: '1-2 mins' },
    { name: 'Cardio Deck & Treadmills', count: Math.round(liveCount * 0.28), cap: 35, icon: Heart, waitTime: 'Open' },
    { name: 'Recovery Lounge & Saunas', count: Math.round(liveCount * 0.18), cap: 20, icon: Coffee, waitTime: 'Open' },
  ]

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Realtime Gate Turnstile Sensor Telemetry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Live Gym Occupancy & Heatmap
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live capacity monitoring, zone-by-zone equipment availability, and historical hourly peak traffic heatmaps.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchLiveOccupancy}
            disabled={isRefreshing}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refreshed: {lastRefreshed}</span>
          </button>
        </div>
      </div>

      {/* TOP ROW: LIVE OCCUPANCY RADIAL GAUGE & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RADIAL / DIAL METER CARD */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              Main Facility Capacity
            </span>
            <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${getStatus().badge}`}>
              {getStatus().label}
            </span>
          </div>

          {/* CIRCULAR GAUGE */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#1e293b"
                strokeWidth="16"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={occupancyPercentage > 75 ? '#f43f5e' : occupancyPercentage > 40 ? '#f59e0b' : '#10b981'}
                strokeWidth="16"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - occupancyPercentage / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{liveCount}</span>
              <span className="text-[11px] font-mono text-slate-400 uppercase">/ {maxCapacity} Inside</span>
              <span className="text-xs font-mono font-bold text-indigo-400 mt-1">{occupancyPercentage}% FULL</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Available Spots</span>
              <span className="text-base font-mono font-bold text-emerald-400">{maxCapacity - liveCount} Slots</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Rack Availability</span>
              <span className="text-base font-mono font-bold text-indigo-400">High</span>
            </div>
          </div>
        </div>

        {/* ZONE-BY-ZONE BREAKDOWN */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Facility Floor Density
            </span>
            <h2 className="text-xl font-black uppercase text-white">Live Zone Density Breakdown</h2>
          </div>

          <div className="space-y-4">
            {zones.map((zone, idx) => {
              const Icon = zone.icon
              const zonePct = Math.min(100, Math.round((zone.count / zone.cap) * 100))
              return (
                <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-xl border border-indigo-500/20">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase text-white">{zone.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500">
                          {zone.count} / {zone.cap} in use
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-indigo-400">{zonePct}%</span>
                      <span className="text-[10px] text-slate-400 block">{zone.waitTime}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${zonePct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        zonePct > 80 ? 'bg-rose-500' : zonePct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* HOURLY PEAK TRAFFIC BAR CHART */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Historical Traffic Patterns
            </span>
            <h2 className="text-xl font-black uppercase text-white">Daily Peak Hours Heatmap</h2>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Quiet (&lt;40%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-slate-400">Moderate</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="text-slate-400">Peak Rush (&gt;75%)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HOURLY_TRAFFIC_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem' }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(val) => [`${val}% Capacity`, 'Expected Occupancy']}
              />
              <Bar dataKey="occupancy" radius={[8, 8, 0, 0]}>
                {HOURLY_TRAFFIC_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.occupancy > 75 ? '#f43f5e' : entry.occupancy > 40 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Best Quiet Windows: <strong className="text-white">9:00 AM – 11:30 AM</strong> and <strong className="text-white">9:00 PM – 11:00 PM</strong></span>
          </div>
          <div className="flex items-center space-x-3">
            <Flame className="h-4 w-4 text-rose-400 shrink-0" />
            <span>Heavy Peak Rush: <strong className="text-white">5:00 PM – 7:30 PM (Expect Waiting)</strong></span>
          </div>
        </div>
      </div>

    </div>
  )
}
