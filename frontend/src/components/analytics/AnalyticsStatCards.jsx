import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, TrendingUp, Users, Activity, Zap, 
  CreditCard, ArrowUpRight, ArrowDownRight 
} from 'lucide-react'

const AnalyticsStatCards = memo(function AnalyticsStatCards({
  revenueGrowthPct,
  totalRevenue,
  timeRange,
  priorRevenue,
  activeCount,
  retentionRate,
  totalMembers,
  currentOccupancy,
  filteredCheckIns,
  peakHour,
  expiringCount,
  arpu,
  busiestDay
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* REVENUE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/30 p-5 rounded-3xl shadow-xl relative overflow-hidden transition-all group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-emerald-400">
          <DollarSign className="h-20 w-20" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shadow-sm">
            <DollarSign className="h-6 w-6" />
          </div>
          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${revenueGrowthPct >= 0
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
            {revenueGrowthPct >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {Math.abs(revenueGrowthPct)}%
          </span>
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight">{totalRevenue.toLocaleString()} EGP</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center space-x-1">
            <span>Gross Volume</span>
            <span className="text-[10px] text-slate-500 uppercase">({timeRange})</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Prior: {priorRevenue.toLocaleString()} EGP
          </p>
        </div>
      </motion.div>

      {/* ACTIVE MEMBERSHIP & RETENTION CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/30 p-5 rounded-3xl shadow-xl relative overflow-hidden transition-all group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-indigo-400">
          <Users className="h-20 w-20" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shadow-sm">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
            {activeCount} Active
          </span>
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight">{retentionRate}%</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Retention Health Score</p>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Total Roster: {totalMembers} Members
          </p>
        </div>
      </motion.div>

      {/* CHECK-IN VELOCITY & CURRENT OCCUPANCY */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/30 p-5 rounded-3xl shadow-xl relative overflow-hidden transition-all group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-amber-400">
          <Activity className="h-20 w-20" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shadow-sm">
            <Zap className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border text-amber-400 bg-amber-500/10 border-amber-500/20">
            {currentOccupancy} On Floor
          </span>
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight">{filteredCheckIns.length.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Total Check-Ins</p>
          <p className="text-[11px] text-slate-500 mt-2 font-mono flex items-center space-x-1">
            <span>Peak Gate:</span>
            <span className="text-amber-400 font-bold">{peakHour}</span>
          </p>
        </div>
      </motion.div>

      {/* ARPU / UNIT ECONOMICS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 hover:border-violet-500/30 p-5 rounded-3xl shadow-xl relative overflow-hidden transition-all group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-violet-400">
          <CreditCard className="h-20 w-20" />
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 shadow-sm">
            <CreditCard className="h-6 w-6" />
          </div>
          <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border text-violet-400 bg-violet-500/10 border-violet-500/20">
            {expiringCount} Expiring Soon
          </span>
        </div>
        <div>
          <p className="text-3xl font-black text-white tracking-tight">{arpu} EGP</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">ARPU (Rev / Active Member)</p>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Peak Day: <span className="text-violet-400 font-bold">{busiestDay}</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
})

export default AnalyticsStatCards
