import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react'

export default function AnalyticsOverviewTab({
  totalRevenue,
  revenueTrendData,
  retentionPieData,
  activeCount,
  expiringCount,
  expiredCount,
  peakHour,
  hourlyTraffic,
  weekdayTraffic,
  busiestDay,
  CustomChartTooltip
}) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* REVENUE TIMELINE & RETENTION PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* REVENUE TIMELINE CHART */}
        <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-indigo-400" />
                <span>Revenue Trajectory (EGP)</span>
              </h3>
              <p className="text-xs text-slate-400">Chronological gross revenue generated over the period</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
              {totalRevenue.toLocaleString()} EGP Total
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={val => `${val} EGP`} />
                <Tooltip content={<CustomChartTooltip suffix=" EGP" />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RETENTION RATIO DONUT */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Roster Health Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">Active vs Expiring vs Lapsed members</p>
          </div>

          <div className="w-full h-52 flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={retentionPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {retentionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip suffix=" members" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
            <div>
              <p className="text-xs text-slate-400">Active</p>
              <p className="text-sm font-bold text-emerald-400">{activeCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expiring</p>
              <p className="text-sm font-bold text-amber-400">{expiringCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Lapsed</p>
              <p className="text-sm font-bold text-rose-400">{expiredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CHECK-IN HEATMAP & WEEKDAY DENSITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 24-HOUR TRAFFIC BAR */}
        <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>24-Hour Gate Check-In Heatmap</span>
              </h3>
              <p className="text-xs text-slate-400">Visits categorized by hour of the day</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              Peak: {peakHour}
            </span>
          </div>

          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} interval={1} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomChartTooltip suffix=" check-ins" />} />
                <Bar dataKey="visits" name="Visits" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WEEKDAY DENSITY */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Peak Workout Days</span>
            </h3>
            <p className="text-xs text-slate-400">Weekly attendance distribution</p>
          </div>

          <div className="w-full h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomChartTooltip suffix=" check-ins" />} />
                <Bar dataKey="visits" name="Visits" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
            <span>Busiest Gym Day:</span>
            <span className="font-bold text-amber-400">{busiestDay}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
