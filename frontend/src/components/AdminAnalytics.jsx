import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell, CartesianGrid, Legend 
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Users, Calendar, 
  Clock, ArrowUpRight, ArrowDownRight, Download, RefreshCw, Zap, 
  ShieldAlert, CheckCircle2, Sparkles, Filter, BarChart3, CreditCard, 
  Search, FileSpreadsheet, Phone, Mail, ChevronRight, AlertTriangle
} from 'lucide-react'
import { formatReadableDate } from '../utils/dateUtils'

const PLAN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e']

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d') // '7d', '30d', '90d', 'month', 'year', 'all'
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'revenue', 'attendance', 'retention'
  
  const [rawCheckIns, setRawCheckIns] = useState([])
  const [rawPayments, setRawPayments] = useState([])
  const [rawMembers, setRawMembers] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  const [txSearch, setTxSearch] = useState('')
  const [txPlanFilter, setTxPlanFilter] = useState('all')

  const fetchAnalyticsData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [{ data: checkIns }, { data: payments }, { data: members }] = await Promise.all([
        supabase.from('check_ins').select('id, member_id, checked_in_at, access_granted, notes').order('checked_in_at', { ascending: false }),
        supabase.from('payments').select('id, member_id, amount, plan_name, paid_at').order('paid_at', { ascending: false }),
        supabase.from('members').select('id, full_name, email, phone, status, plan_name, last_payment_amount, membership_end_date, created_at')
      ])

      setRawCheckIns(checkIns || [])
      setRawPayments(payments || [])
      setRawMembers(members || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching analytics data:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Member Lookup Map for fast relation resolution
  const membersMap = useMemo(() => {
    const map = {}
    rawMembers.forEach(m => {
      map[m.id] = m
    })
    return map
  }, [rawMembers])

  // Time Window Boundaries
  const { startDate, priorStartDate, priorEndDate } = useMemo(() => {
    const now = new Date()
    let start = new Date()
    let priorStart = new Date()
    let priorEnd = new Date()

    if (timeRange === '7d') {
      start.setDate(now.getDate() - 7)
      priorStart.setDate(start.getDate() - 7)
      priorEnd.setDate(now.getDate() - 7)
    } else if (timeRange === '30d') {
      start.setDate(now.getDate() - 30)
      priorStart.setDate(start.getDate() - 30)
      priorEnd.setDate(now.getDate() - 30)
    } else if (timeRange === '90d') {
      start.setDate(now.getDate() - 90)
      priorStart.setDate(start.getDate() - 90)
      priorEnd.setDate(now.getDate() - 90)
    } else if (timeRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      priorStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      priorEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    } else if (timeRange === 'year') {
      start = new Date(now.getFullYear(), 0, 1)
      priorStart = new Date(now.getFullYear() - 1, 0, 1)
      priorEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
    } else {
      // 'all'
      start = new Date(2000, 0, 1)
      priorStart = new Date(1990, 0, 1)
      priorEnd = new Date(1999, 11, 31)
    }

    return { startDate: start, priorStartDate: priorStart, priorEndDate: priorEnd }
  }, [timeRange])

  // Filtered Payments & Check-Ins
  const filteredPayments = useMemo(() => {
    return rawPayments.filter(p => {
      if (!p.paid_at) return false
      const paidDate = new Date(p.paid_at)
      return paidDate >= startDate
    })
  }, [rawPayments, startDate])

  const priorPeriodPayments = useMemo(() => {
    return rawPayments.filter(p => {
      if (!p.paid_at) return false
      const paidDate = new Date(p.paid_at)
      return paidDate >= priorStartDate && paidDate < priorEndDate
    })
  }, [rawPayments, priorStartDate, priorEndDate])

  const filteredCheckIns = useMemo(() => {
    return rawCheckIns.filter(ci => {
      if (!ci.checked_in_at) return false
      const checkInDate = new Date(ci.checked_in_at)
      return checkInDate >= startDate
    })
  }, [rawCheckIns, startDate])

  const priorPeriodCheckIns = useMemo(() => {
    return rawCheckIns.filter(ci => {
      if (!ci.checked_in_at) return false
      const checkInDate = new Date(ci.checked_in_at)
      return checkInDate >= priorStartDate && checkInDate < priorEndDate
    })
  }, [rawCheckIns, priorStartDate, priorEndDate])

  // Revenue Calculations
  const totalRevenue = useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
  }, [filteredPayments])

  const priorRevenue = useMemo(() => {
    return priorPeriodPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
  }, [priorPeriodPayments])

  const revenueGrowthPct = useMemo(() => {
    if (priorRevenue === 0) return totalRevenue > 0 ? 100 : 0
    return Math.round(((totalRevenue - priorRevenue) / priorRevenue) * 100)
  }, [totalRevenue, priorRevenue])

  // Check-In Growth
  const checkInGrowthPct = useMemo(() => {
    const currentCount = filteredCheckIns.length
    const priorCount = priorPeriodCheckIns.length
    if (priorCount === 0) return currentCount > 0 ? 100 : 0
    return Math.round(((currentCount - priorCount) / priorCount) * 100)
  }, [filteredCheckIns, priorPeriodCheckIns])

  // Member Status & Health Intelligence
  const { activeCount, expiringCount, expiredCount, totalMembers, retentionRate, churnRate, arpu, expiringMembersList } = useMemo(() => {
    const now = new Date()
    const in7Days = new Date()
    in7Days.setDate(now.getDate() + 7)

    let active = 0
    let expiring = 0
    let expired = 0
    const expiringList = []

    rawMembers.forEach(m => {
      const endDate = m.membership_end_date ? new Date(m.membership_end_date) : null
      const isPast = endDate && now > endDate
      const isExpiringSoon = endDate && !isPast && endDate <= in7Days

      if (m.status === 'active' && !isPast) {
        active++
        if (isExpiringSoon) {
          expiring++
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
          expiringList.push({
            ...m,
            daysLeft: Math.max(0, diffDays)
          })
        }
      } else {
        expired++
      }
    })

    const total = rawMembers.length
    const retRate = total > 0 ? Math.round((active / total) * 100) : 0
    const chRate = total > 0 ? Math.round((expired / total) * 100) : 0
    const userArpu = active > 0 ? Math.round(totalRevenue / active) : 0

    expiringList.sort((a, b) => a.daysLeft - b.daysLeft)

    return {
      activeCount: active,
      expiringCount: expiring,
      expiredCount: expired,
      totalMembers: total,
      retentionRate: retRate,
      churnRate: chRate,
      arpu: userArpu,
      expiringMembersList: expiringList
    }
  }, [rawMembers, totalRevenue])

  // Live Floor Occupancy (check-ins in the last 90 minutes)
  const currentOccupancy = useMemo(() => {
    const ninetyMinutesAgo = new Date(Date.now() - 90 * 60 * 1000)
    return rawCheckIns.filter(ci => {
      if (!ci.checked_in_at) return false
      return new Date(ci.checked_in_at) >= ninetyMinutesAgo && ci.access_granted !== false
    }).length
  }, [rawCheckIns])

  // Revenue Chronological Trend
  const revenueTrendData = useMemo(() => {
    if (timeRange === '7d' || timeRange === '30d') {
      // Group by Day
      const dailyMap = {}
      const daysCount = timeRange === '7d' ? 7 : 30
      
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const label = d.toLocaleDateString('default', { month: 'short', day: 'numeric' })
        dailyMap[key] = { key, label, revenue: 0, count: 0 }
      }

      filteredPayments.forEach(p => {
        const key = new Date(p.paid_at).toISOString().split('T')[0]
        if (dailyMap[key]) {
          dailyMap[key].revenue += Number(p.amount) || 0
          dailyMap[key].count += 1
        }
      })

      return Object.values(dailyMap)
    } else {
      // Group by Month
      const monthlyMap = {}
      filteredPayments.forEach(p => {
        const d = new Date(p.paid_at)
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('default', { month: 'short', year: '2-digit' })
        
        if (!monthlyMap[yearMonth]) {
          monthlyMap[yearMonth] = { yearMonth, label, revenue: 0, count: 0 }
        }
        monthlyMap[yearMonth].revenue += Number(p.amount) || 0
        monthlyMap[yearMonth].count += 1
      })

      return Object.keys(monthlyMap)
        .sort()
        .map(k => monthlyMap[k])
    }
  }, [filteredPayments, timeRange])

  // Revenue Breakdown by Plan
  const planBreakdown = useMemo(() => {
    const counts = {}
    filteredPayments.forEach(p => {
      const plan = p.plan_name || 'Standard Pass'
      counts[plan] = (counts[plan] || 0) + (Number(p.amount) || 0)
    })

    return Object.keys(counts).map((plan, idx) => ({
      name: plan,
      revenue: counts[plan],
      color: PLAN_COLORS[idx % PLAN_COLORS.length]
    })).sort((a, b) => b.revenue - a.revenue)
  }, [filteredPayments])

  // Check-In Traffic: 24-Hour Distribution
  const hourlyTraffic = useMemo(() => {
    const hoursCount = Array(24).fill(0)
    filteredCheckIns.forEach(ci => {
      const h = new Date(ci.checked_in_at).getHours()
      hoursCount[h] += 1
    })

    return hoursCount.map((count, hour) => ({
      hour,
      hourLabel: `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`,
      visits: count
    }))
  }, [filteredCheckIns])

  // Check-In Traffic: Weekday Distribution (Monday - Sunday)
  const weekdayTraffic = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayCounts = Array(7).fill(0)

    filteredCheckIns.forEach(ci => {
      const d = new Date(ci.checked_in_at).getDay()
      dayCounts[d] += 1
    })

    // Reorder Mon (1) to Sun (0)
    const orderedIndices = [1, 2, 3, 4, 5, 6, 0]
    return orderedIndices.map(idx => ({
      day: dayNames[idx],
      visits: dayCounts[idx]
    }))
  }, [filteredCheckIns])

  // Peak Hour and Busiest Day
  const peakHour = useMemo(() => {
    return hourlyTraffic.reduce((max, cur) => cur.visits > max.visits ? cur : max, { visits: 0, hourLabel: 'N/A' }).hourLabel
  }, [hourlyTraffic])

  const busiestDay = useMemo(() => {
    return weekdayTraffic.reduce((max, cur) => cur.visits > max.visits ? cur : max, { visits: 0, day: 'N/A' }).day
  }, [weekdayTraffic])

  // Retention Pie Data
  const retentionPieData = useMemo(() => {
    return [
      { name: 'Active Members', value: activeCount, color: '#10b981' },
      { name: 'Expiring Soon', value: expiringCount, color: '#f59e0b' },
      { name: 'Expired / Lapsed', value: Math.max(0, expiredCount - expiringCount), color: '#f43f5e' }
    ].filter(item => item.value > 0)
  }, [activeCount, expiringCount, expiredCount])

  // Filtered Transactions for Table
  const filteredTransactions = useMemo(() => {
    return rawPayments.filter(p => {
      const member = membersMap[p.member_id]
      const memberName = member?.full_name || 'Anonymous'
      const matchesSearch = memberName.toLowerCase().includes(txSearch.toLowerCase()) ||
                            (p.plan_name || '').toLowerCase().includes(txSearch.toLowerCase())
      const matchesPlan = txPlanFilter === 'all' || p.plan_name === txPlanFilter
      return matchesSearch && matchesPlan
    })
  }, [rawPayments, membersMap, txSearch, txPlanFilter])

  // CSV Report Exporter
  const exportToCSV = (type = 'revenue') => {
    let headers = []
    let rows = []
    const nowStr = new Date().toISOString().split('T')[0]
    let filename = `iron-gym-${type}-report-${nowStr}.csv`

    if (type === 'revenue') {
      headers = ['Payment ID', 'Member Name', 'Member Email', 'Plan Name', 'Amount ($)', 'Date']
      rows = rawPayments.map(p => {
        const m = membersMap[p.member_id]
        return [
          p.id,
          `"${m?.full_name || 'N/A'}"`,
          `"${m?.email || 'N/A'}"`,
          `"${p.plan_name || 'Standard'}"`,
          p.amount,
          p.paid_at ? new Date(p.paid_at).toLocaleString() : 'N/A'
        ]
      })
    } else if (type === 'attendance') {
      headers = ['Check-In ID', 'Member Name', 'Timestamp', 'Status', 'Notes']
      rows = rawCheckIns.map(ci => {
        const m = membersMap[ci.member_id]
        return [
          ci.id,
          `"${m?.full_name || 'Guest / Visitor'}"`,
          ci.checked_in_at ? new Date(ci.checked_in_at).toLocaleString() : 'N/A',
          ci.access_granted !== false ? 'Granted' : 'Denied',
          `"${ci.notes || ''}"`
        ]
      })
    } else if (type === 'expiring') {
      headers = ['Member Name', 'Email', 'Phone', 'Plan', 'Days Left', 'Expiry Date']
      rows = expiringMembersList.map(m => [
        `"${m.full_name}"`,
        `"${m.email || ''}"`,
        `"${m.phone || ''}"`,
        `"${m.plan_name || 'Monthly Pass'}"`,
        m.daysLeft,
        m.membership_end_date ? new Date(m.membership_end_date).toLocaleDateString() : 'N/A'
      ])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Custom Glassmorphic Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 p-3 rounded-2xl shadow-2xl text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between space-x-3 py-0.5">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span>{entry.name || 'Value'}:</span>
              </span>
              <span className="font-extrabold text-white">
                {prefix}{Number(entry.value).toLocaleString()}{suffix}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Activity className="h-6 w-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-bold text-slate-400 font-mono tracking-wider animate-pulse">
          INITIALIZING REVENUE & TRAFFIC MATRIX...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>EXECUTIVE ANALYTICS</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                LIVE METRICS
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time intelligence, revenue flow, and member engagement data
            {lastUpdated && ` • Refreshed ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>

        {/* TIMEFRAME TOGGLE & REFRESH */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center space-x-1">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'month', label: 'Month' },
              { id: 'year', label: 'Year' },
              { id: 'all', label: 'All' }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeRange(tf.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  timeRange === tf.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalyticsData}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl transition shadow-md disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* EXPORT DROPDOWN BUTTON */}
          <div className="relative group">
            <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-50">
              <button
                onClick={() => exportToCSV('revenue')}
                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Revenue Ledger</span>
              </button>
              <button
                onClick={() => exportToCSV('attendance')}
                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center space-x-2"
              >
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                <span>Attendance Logs</span>
              </button>
              <button
                onClick={() => exportToCSV('expiring')}
                className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center space-x-2"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Expiring Members List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE KPI COMMAND CARDS */}
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
            <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${
              revenueGrowthPct >= 0 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}>
              {revenueGrowthPct >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
              {Math.abs(revenueGrowthPct)}%
            </span>
          </div>
          <div>
            <p className="text-3xl font-black text-white tracking-tight">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center space-x-1">
              <span>Gross Volume</span>
              <span className="text-[10px] text-slate-500 uppercase">({timeRange})</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Prior: ${priorRevenue.toLocaleString()}
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
            <p className="text-3xl font-black text-white tracking-tight">${arpu}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ARPU (Rev / Active Member)</p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Peak Day: <span className="text-violet-400 font-bold">{busiestDay}</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Intelligence Overview', icon: BarChart3 },
          { id: 'revenue', label: 'Revenue & Economics', icon: DollarSign },
          { id: 'attendance', label: 'Attendance & Traffic Heatmap', icon: Activity },
          { id: 'retention', label: 'Retention & Expiry Watchlist', icon: ShieldAlert, badge: expiringCount > 0 ? expiringCount : null }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <AnimatePresence mode="wait">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
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
                      <span>Revenue Trajectory ($)</span>
                    </h3>
                    <p className="text-xs text-slate-400">Chronological gross revenue generated over the period</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                    ${totalRevenue.toLocaleString()} Total
                  </span>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevOverview" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={val => `$${val}`} />
                      <Tooltip content={<CustomChartTooltip prefix="$" />} />
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

                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs flex items-center justify-between">
                  <span className="text-slate-400">Busiest Gym Day:</span>
                  <span className="font-bold text-amber-400">{busiestDay} Rush</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. REVENUE & FINANCIALS TAB */}
        {activeTab === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* PLAN REVENUE BREAKDOWN & SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PLAN REVENUE DONUT */}
              <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
                    <CreditCard className="h-4 w-4 text-violet-400" />
                    <span>Revenue by Membership Plan</span>
                  </h3>
                  <p className="text-xs text-slate-400">Share of revenue per subscription package</p>
                </div>

                <div className="w-full h-56 my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={planBreakdown} 
                        dataKey="revenue" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={75} 
                        paddingAngle={5}
                      >
                        {planBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip prefix="$" />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {planBreakdown.map(p => (
                    <div key={p.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                      <div className="flex items-center space-x-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-slate-300 font-medium">{p.name}</span>
                      </div>
                      <span className="font-bold text-white font-mono">${p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVENUE VELOCITY CHART */}
              <div className="lg:col-span-2 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-indigo-400" />
                      <span>Volume & Cash Flow Speed</span>
                    </h3>
                    <p className="text-xs text-slate-400">Total payments processed in timeframe</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-400">Avg Transaction</p>
                    <p className="text-sm font-bold text-white">
                      ${filteredPayments.length > 0 ? Math.round(totalRevenue / filteredPayments.length) : 0}
                    </p>
                  </div>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={val => `$${val}`} />
                      <Tooltip content={<CustomChartTooltip prefix="$" />} />
                      <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* LIVE TRANSACTIONS LEDGER */}
            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    <span>Real-Time Payment Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400">Live feed of membership payments and renewals</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search member or plan..."
                      value={txSearch}
                      onChange={e => setTxSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <select
                    value={txPlanFilter}
                    onChange={e => setTxPlanFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Plans</option>
                    {planBreakdown.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TRANSACTIONS TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Membership Plan</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.slice(0, 10).map((tx) => {
                        const member = membersMap[tx.member_id]
                        return (
                          <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                            <td className="py-3 px-4 font-bold text-white">
                              {member?.full_name || 'Anonymous Member'}
                              <div className="text-[10px] font-normal text-slate-500 font-mono">{member?.email || 'No email'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl font-medium">
                                {tx.plan_name || 'Standard Pass'}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-black text-emerald-400 font-mono text-sm">
                              +${Number(tx.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono">
                              {tx.paid_at ? new Date(tx.paid_at).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-0.5" />
                                Paid
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. ATTENDANCE & TRAFFIC TAB */}
        {activeTab === 'attendance' && (
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
        )}

        {/* 4. RETENTION & EXPIRING WATCHLIST TAB */}
        {activeTab === 'retention' && (
          <motion.div
            key="retention"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* RETENTION HEALTH BANNER */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
                <p className="text-xs text-slate-400 font-medium">Active Member Base</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">{activeCount}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Current Paid Passes</p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
                <p className="text-xs text-slate-400 font-medium">Expiring in &le; 7 Days</p>
                <p className="text-3xl font-black text-amber-400 mt-1">{expiringCount}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Needs Renewal Outreach</p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
                <p className="text-xs text-slate-400 font-medium">Lapsed / Inactive</p>
                <p className="text-3xl font-black text-rose-400 mt-1">{expiredCount}</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Past Expiry Date</p>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
                <p className="text-xs text-slate-400 font-medium">Retention Ratio</p>
                <p className="text-3xl font-black text-indigo-400 mt-1">{retentionRate}%</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Loyalty Index</p>
              </div>
            </div>

            {/* EXPIRING MEMBERS ACTION LIST */}
            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Expiring Soon Watchlist (Next 7 Days)</span>
                  </h3>
                  <p className="text-xs text-slate-400">Proactively engage members before their pass expires to maintain 90%+ retention</p>
                </div>
                <button
                  onClick={() => exportToCSV('expiring')}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center space-x-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Watchlist</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Current Plan</th>
                      <th className="py-3 px-4">Expiry Date</th>
                      <th className="py-3 px-4">Days Left</th>
                      <th className="py-3 px-4 text-right">Quick Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expiringMembersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                          🎉 No memberships expiring in the next 7 days!
                        </td>
                      </tr>
                    ) : (
                      expiringMembersList.map(m => (
                        <tr key={m.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-4 font-bold text-white">
                            {m.full_name}
                            <div className="text-[10px] font-normal text-slate-500 font-mono">{m.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl font-medium">
                              {m.plan_name || 'Monthly Pass'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono">
                            {m.membership_end_date ? formatReadableDate(m.membership_end_date) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                              m.daysLeft <= 2
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {m.daysLeft === 0 ? 'Expires Today' : `${m.daysLeft} Day${m.daysLeft > 1 ? 's' : ''} Left`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {m.phone && (
                                <a
                                  href={`tel:${m.phone}`}
                                  className="p-1.5 bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-xl transition"
                                  title="Call Member"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {m.email && (
                                <a
                                  href={`mailto:${m.email}?subject=Iron Gym Membership Renewal&body=Hi ${m.full_name}, your Iron Gym pass is expiring soon!`}
                                  className="p-1.5 bg-slate-900 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 border border-slate-800 rounded-xl transition"
                                  title="Email Member"
                                >
                                  <Mail className="h-3.5 w-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}