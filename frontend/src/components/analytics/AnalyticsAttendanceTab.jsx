import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Users, Clock, Calendar } from 'lucide-react'

export default function AnalyticsAttendanceTab({
  currentOccupancy,
  peakHour,
  busiestDay,
  hourlyTraffic,
  weekdayTraffic,
  CustomChartTooltip
}) {
  return (
    <motion.div
      key="attendance"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* CAPACITY UTILIZATION & LIVE FLOOR METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{currentOccupancy} Members</p>
            <p className="text-xs text-slate-400 font-medium">Active Floor Occupancy</p>
          </div>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{peakHour}</p>
            <p className="text-xs text-slate-400 font-medium">Prime Rush Hour</p>
          </div>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl flex items-center space-x-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{busiestDay}</p>
            <p className="text-xs text-slate-400 font-medium">Peak Day of the Week</p>
          </div>
        </div>
      </div>

      {/* HOURLY & WEEKDAY FULL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>24-Hour Rush Distribution</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Total gate check-ins logged by hour of the day</p>

          <div className="w-full h-72">
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

        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>Day-of-Week Attendance Profile</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Identify high-volume workout days to optimize coaching</p>

          <div className="w-full h-72">
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
        </div>
      </div>
    </motion.div>
  )
}
