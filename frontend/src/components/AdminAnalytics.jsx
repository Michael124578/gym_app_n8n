import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, Activity } from 'lucide-react'

export default function AdminAnalytics() {
  const [hourlyTraffic, setHourlyTraffic] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [retentionStats, setRetentionStats] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)

    const { data: checkIns } = await supabase.from('check_ins').select('checked_in_at')
    const hoursCount = Array(24).fill(0)
    checkIns?.forEach((ci) => {
      const hour = new Date(ci.checked_in_at).getHours()
      hoursCount[hour] += 1
    })
    
    setHourlyTraffic(hoursCount.map((count, hour) => ({
      hourLabel: `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`,
      visits: count
    })))

    const { data: payments } = await supabase.from('payments').select('amount, paid_at')
    let sumRev = 0
    const revByMonth = {}

    payments?.forEach((p) => {
      sumRev += Number(p.amount)
      const dateKey = new Date(p.paid_at).toLocaleString('default', { month: 'short' })
      revByMonth[dateKey] = (revByMonth[dateKey] || 0) + Number(p.amount)
    })

    setTotalRevenue(sumRev)
    setMonthlyRevenue(Object.keys(revByMonth).map(month => ({ month, revenue: revByMonth[month] })))

    const { data: members } = await supabase.from('members').select('status, membership_end_date')
    let active = 0, expired = 0

    members?.forEach((m) => {
      const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
      if (m.status === 'active' && !isExpired) active++
      else expired++
    })

    setRetentionStats([
      { name: 'Active Passes', value: active, color: '#10b981' },
      { name: 'Expired Passes', value: expired, color: '#f43f5e' }
    ])

    setLoading(false)
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading Analytics Matrix...</div>
  }

  const activeCount = retentionStats[0]?.value || 0
  const totalMembers = activeCount + (retentionStats[1]?.value || 0)
  const retentionPercent = totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0
  const peakHour = hourlyTraffic.reduce((max, cur) => cur.visits > max.visits ? cur : max, { visits: 0, hourLabel: 'N/A' }).hourLabel

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-medium">Total Revenue Logged</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{retentionPercent}%</p>
            <p className="text-xs text-slate-400 font-medium">Member Retention Rate</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4 shadow-xl">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{peakHour}</p>
            <p className="text-xs text-slate-400 font-medium">Peak Gate Hour</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Revenue Growth ($)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white mb-2">Member Retention Ratio</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={retentionStats} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                  {retentionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Expired</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Check-In Traffic Heatmap</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyTraffic}>
              <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} interval={1} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}