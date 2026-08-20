import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AnimatePresence } from 'framer-motion'
import { BarChart3, DollarSign, Activity, ShieldAlert, AlertTriangle } from 'lucide-react'

import AnalyticsHeader from './analytics/AnalyticsHeader'
import AnalyticsStatCards from './analytics/AnalyticsStatCards'
import AnalyticsOverviewTab from './analytics/AnalyticsOverviewTab'
import AnalyticsRevenueTab from './analytics/AnalyticsRevenueTab'
import AnalyticsAttendanceTab from './analytics/AnalyticsAttendanceTab'
import AnalyticsRetentionTab from './analytics/AnalyticsRetentionTab'

const PLAN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e']

// Custom Recharts Tooltip
function CustomChartTooltip({ active, payload, label, suffix = '' }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-2xl shadow-2xl backdrop-blur-xl text-xs space-y-1">
        <p className="font-mono font-bold text-slate-400 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="font-mono text-white flex items-center justify-between space-x-4">
            <span style={{ color: entry.color || entry.fill }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-black text-emerald-400">
              {entry.value.toLocaleString()}{suffix}
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

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

  // Member Status & Health Intelligence
  const { activeCount, expiringCount, expiredCount, totalMembers, retentionRate, arpu, expiringMembersList } = useMemo(() => {
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
    const userArpu = active > 0 ? Math.round(totalRevenue / active) : 0

    expiringList.sort((a, b) => a.daysLeft - b.daysLeft)

    return {
      activeCount: active,
      expiringCount: expiring,
      expiredCount: expired,
      totalMembers: total,
      retentionRate: retRate,
      arpu: userArpu,
      expiringMembersList: expiringList
    }
  }, [rawMembers, totalRevenue])

  // Hourly Heatmap Traffic
  const { hourlyTraffic, peakHour, currentOccupancy } = useMemo(() => {
    const hours = Array(24).fill(0)
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    let liveCount = 0

    filteredCheckIns.forEach(ci => {
      const d = new Date(ci.checked_in_at)
      hours[d.getHours()]++
      if (d >= twoHoursAgo) {
        liveCount++
      }
    })

    let maxVisits = -1
    let peakH = 18

    const trafficData = hours.map((v, h) => {
      if (v > maxVisits) {
        maxVisits = v
        peakH = h
      }
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayHour = h % 12 === 0 ? 12 : h % 12
      return {
        hour: h,
        hourLabel: `${displayHour}${ampm}`,
        visits: v
      }
    })

    const peakAmPm = peakH >= 12 ? 'PM' : 'AM'
    const peakDisplay = peakH % 12 === 0 ? 12 : peakH % 12
    const peakFormatted = `${peakDisplay}:00 ${peakAmPm}`

    return {
      hourlyTraffic: trafficData,
      peakHour: peakFormatted,
      currentOccupancy: liveCount
    }
  }, [filteredCheckIns])

  // Weekday Traffic
  const { weekdayTraffic, busiestDay } = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = [0, 0, 0, 0, 0, 0, 0]

    filteredCheckIns.forEach(ci => {
      const d = new Date(ci.checked_in_at)
      counts[d.getDay()]++
    })

    let maxCount = -1
    let maxIdx = 1

    const data = days.map((day, idx) => {
      if (counts[idx] > maxCount) {
        maxCount = counts[idx]
        maxIdx = idx
      }
      return {
        day,
        visits: counts[idx]
      }
    })

    return {
      weekdayTraffic: data,
      busiestDay: days[maxIdx]
    }
  }, [filteredCheckIns])

  // Plan Distribution Breakdown
  const planBreakdown = useMemo(() => {
    const planMap = {}
    filteredPayments.forEach(p => {
      const pName = p.plan_name || 'Standard Pass'
      planMap[pName] = (planMap[pName] || 0) + (Number(p.amount) || 0)
    })

    return Object.keys(planMap).map((name, idx) => ({
      name,
      revenue: planMap[name],
      color: PLAN_COLORS[idx % PLAN_COLORS.length]
    })).sort((a, b) => b.revenue - a.revenue)
  }, [filteredPayments])

  // Revenue Chronological Trend Data
  const revenueTrendData = useMemo(() => {
    const trend = {}
    filteredPayments.forEach(p => {
      if (!p.paid_at) return
      const dateKey = new Date(p.paid_at).toISOString().split('T')[0]
      trend[dateKey] = (trend[dateKey] || 0) + (Number(p.amount) || 0)
    })

    const sortedDates = Object.keys(trend).sort()
    return sortedDates.map(date => ({
      date,
      label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      revenue: trend[date]
    }))
  }, [filteredPayments])

  // Retention Donut Pie Chart Data
  const retentionPieData = useMemo(() => {
    return [
      { name: 'Active Members', value: activeCount, color: '#10b981' },
      { name: 'Expiring Soon', value: expiringCount, color: '#f59e0b' },
      { name: 'Lapsed / Expired', value: expiredCount, color: '#f43f5e' }
    ]
  }, [activeCount, expiringCount, expiredCount])

  // Filtered Payments for Transaction Ledger
  const filteredTransactions = useMemo(() => {
    return filteredPayments.filter(tx => {
      const member = membersMap[tx.member_id]
      const nameMatch = member?.full_name?.toLowerCase().includes(txSearch.toLowerCase()) || false
      const emailMatch = member?.email?.toLowerCase().includes(txSearch.toLowerCase()) || false
      const planMatch = (tx.plan_name || '').toLowerCase().includes(txSearch.toLowerCase())

      const matchesSearch = !txSearch || nameMatch || emailMatch || planMatch
      const matchesPlan = txPlanFilter === 'all' || (tx.plan_name || 'Standard Pass') === txPlanFilter

      return matchesSearch && matchesPlan
    })
  }, [filteredPayments, membersMap, txSearch, txPlanFilter])

  // CSV Exporter Helper
  const exportToCSV = (type) => {
    let headers = []
    let rows = []
    let filename = `iron_gym_${type}_${new Date().toISOString().split('T')[0]}.csv`

    if (type === 'revenue') {
      headers = ['Payment ID', 'Member Name', 'Member Email', 'Plan Name', 'Amount (EGP)', 'Paid At']
      rows = filteredPayments.map(p => {
        const m = membersMap[p.member_id]
        return [
          p.id,
          `"${m?.full_name || 'N/A'}"`,
          `"${m?.email || 'N/A'}"`,
          `"${p.plan_name || 'N/A'}"`,
          p.amount || 0,
          `"${p.paid_at ? new Date(p.paid_at).toLocaleString() : 'N/A'}"`
        ]
      })
    } else if (type === 'attendance') {
      headers = ['CheckIn ID', 'Member Name', 'Checked In At', 'Access Granted', 'Notes']
      rows = filteredCheckIns.map(ci => {
        const m = membersMap[ci.member_id]
        return [
          ci.id,
          `"${m?.full_name || 'N/A'}"`,
          `"${ci.checked_in_at ? new Date(ci.checked_in_at).toLocaleString() : 'N/A'}"`,
          ci.access_granted ? 'YES' : 'NO',
          `"${ci.notes || ''}"`
        ]
      })
    } else if (type === 'expiring') {
      headers = ['Member ID', 'Full Name', 'Email', 'Phone', 'Plan Name', 'Expiry Date', 'Days Left']
      rows = expiringMembersList.map(m => [
        m.id,
        `"${m.full_name || ''}"`,
        `"${m.email || ''}"`,
        `"${m.phone || ''}"`,
        `"${m.plan_name || ''}"`,
        `"${m.membership_end_date ? new Date(m.membership_end_date).toLocaleDateString() : ''}"`,
        m.daysLeft
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Aggregating Executive Intelligence...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* TOP HEADER CONTROLS */}
      <AnalyticsHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        lastUpdated={lastUpdated}
        fetchAnalyticsData={fetchAnalyticsData}
        isRefreshing={isRefreshing}
        exportToCSV={exportToCSV}
      />

      {/* EXECUTIVE KPI COMMAND CARDS */}
      <AnalyticsStatCards
        revenueGrowthPct={revenueGrowthPct}
        totalRevenue={totalRevenue}
        timeRange={timeRange}
        priorRevenue={priorRevenue}
        activeCount={activeCount}
        retentionRate={retentionRate}
        totalMembers={totalMembers}
        currentOccupancy={currentOccupancy}
        filteredCheckIns={filteredCheckIns}
        peakHour={peakHour}
        expiringCount={expiringCount}
        arpu={arpu}
        busiestDay={busiestDay}
      />

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-800 flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
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
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <AnalyticsOverviewTab
            totalRevenue={totalRevenue}
            revenueTrendData={revenueTrendData}
            retentionPieData={retentionPieData}
            activeCount={activeCount}
            expiringCount={expiringCount}
            expiredCount={expiredCount}
            peakHour={peakHour}
            hourlyTraffic={hourlyTraffic}
            weekdayTraffic={weekdayTraffic}
            busiestDay={busiestDay}
            CustomChartTooltip={CustomChartTooltip}
          />
        )}

        {activeTab === 'revenue' && (
          <AnalyticsRevenueTab
            totalRevenue={totalRevenue}
            filteredPayments={filteredPayments}
            planBreakdown={planBreakdown}
            revenueTrendData={revenueTrendData}
            txSearch={txSearch}
            setTxSearch={setTxSearch}
            txPlanFilter={txPlanFilter}
            setTxPlanFilter={setTxPlanFilter}
            filteredTransactions={filteredTransactions}
            membersMap={membersMap}
            CustomChartTooltip={CustomChartTooltip}
          />
        )}

        {activeTab === 'attendance' && (
          <AnalyticsAttendanceTab
            currentOccupancy={currentOccupancy}
            peakHour={peakHour}
            busiestDay={busiestDay}
            hourlyTraffic={hourlyTraffic}
            weekdayTraffic={weekdayTraffic}
            CustomChartTooltip={CustomChartTooltip}
          />
        )}

        {activeTab === 'retention' && (
          <AnalyticsRetentionTab
            activeCount={activeCount}
            expiringCount={expiringCount}
            expiredCount={expiredCount}
            retentionRate={retentionRate}
            expiringMembersList={expiringMembersList}
            exportToCSV={exportToCSV}
          />
        )}
      </AnimatePresence>
    </div>
  )
}