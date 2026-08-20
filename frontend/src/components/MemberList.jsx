import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { QRCodeSVG } from 'qrcode.react'
import { 
  Users, UserCheck, Activity, CalendarCheck, Clock, Search, 
  RefreshCw, X, CheckCircle, Trash2, Plus, Download, Filter, 
  ChevronRight, ArrowUpRight, ShieldCheck, AlertTriangle, 
  CreditCard, Calendar, Mail, Phone, ExternalLink, QrCode, Sparkles
} from 'lucide-react'
import { formatReadableDate } from '../utils/dateUtils'
import PillButton from './PillButton'
import PillFilter from './PillFilter'

export default function MemberList({ refreshTrigger, onOpenAddMemberModal }) {
  const [members, setMembers] = useState([])
  const [todayCheckInsCount, setTodayCheckInsCount] = useState(0)
  const [peakHour, setPeakHour] = useState('N/A')
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'expired' | 'expiring_soon'
  const [planFilter, setPlanFilter] = useState('all')
  
  const [editingMember, setEditingMember] = useState(null)
  const [inspectingMember, setInspectingMember] = useState(null)
  const [renewPlan, setRenewPlan] = useState('Monthly Pass')
  const [renewAmount, setRenewAmount] = useState('1200')
  const [renewDays, setRenewDays] = useState(30)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchMembersAndStats = useCallback(async (isInitial = false) => {
    if (isInitial && members.length === 0) {
      setLoading(true)
    }

    try {
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (memberData) setMembers(memberData)

      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)

      const { data: todayCheckIns } = await supabase
        .from('check_ins')
        .select('checked_in_at')
        .gte('checked_in_at', startOfToday.toISOString())

      if (todayCheckIns) {
        setTodayCheckInsCount(todayCheckIns.length)

        const hoursCount = {}
        todayCheckIns.forEach((item) => {
          const hour = new Date(item.checked_in_at).getHours()
          hoursCount[hour] = (hoursCount[hour] || 0) + 1
        })

        let maxHour = null
        let maxCount = 0
        Object.keys(hoursCount).forEach((h) => {
          if (hoursCount[h] > maxCount) {
            maxCount = hoursCount[h]
            maxHour = h
          }
        })

        if (maxHour !== null) {
          setPeakHour(`${maxHour % 12 || 12}:00 ${maxHour >= 12 ? 'PM' : 'AM'}`)
        }
      }
    } catch (err) {
      console.error('Error fetching members:', err)
    } finally {
      setLoading(false)
    }
  }, [members.length])

  useEffect(() => {
    fetchMembersAndStats(true)

    const memberChannel = supabase
      .channel('realtime-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembersAndStats(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(memberChannel)
    }
  }, [refreshTrigger, fetchMembersAndStats])

  const [memberToDelete, setMemberToDelete] = useState(null)

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return

    if (memberToDelete.auth_id) {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { auth_id: memberToDelete.auth_id }
      })

      if (error) {
        console.warn(`Auth User Delete warning: ${error.message}`)
      }
    }

    // Always ensure database row cleanup
    await supabase.from('members').delete().eq('id', memberToDelete.id)

    showToast(`Permanently deleted athlete: ${memberToDelete.full_name}`)
    setMemberToDelete(null)
    fetchMembersAndStats()
  }

  const handleRenewSubscription = async (e) => {
    e.preventDefault()
    if (!editingMember) return

    setIsProcessing(true)

    const currentExpiry = new Date(editingMember.membership_end_date || new Date())
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()
    baseDate.setDate(baseDate.getDate() + parseInt(renewDays, 10))

    await supabase
      .from('members')
      .update({
        status: 'active',
        plan_name: renewPlan,
        membership_end_date: baseDate.toISOString(),
        last_payment_amount: parseFloat(renewAmount)
      })
      .eq('id', editingMember.id)

    await supabase.from('payments').insert([
      {
        member_id: editingMember.id,
        amount: parseFloat(renewAmount),
        plan_name: renewPlan
      }
    ])

    setIsProcessing(false)
    showToast(`Renewed pass for ${editingMember.full_name} (+${renewDays} Days)`)
    setEditingMember(null)
    fetchMembersAndStats()
  }

  const exportMembersCSV = () => {
    if (!members.length) return
    const headers = ['Full Name', 'Email', 'Phone', 'Plan', 'Status', 'Expires', 'Created At']
    const rows = members.map(m => [
      `"${m.full_name || ''}"`,
      `"${m.email || ''}"`,
      `"${m.phone || ''}"`,
      `"${m.plan_name || ''}"`,
      `"${m.status || ''}"`,
      `"${m.membership_end_date || ''}"`,
      `"${m.created_at || ''}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `IronGym_Member_Roster_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported Member Directory CSV')
  }

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
      const now = new Date()
      const in7Days = new Date()
      in7Days.setDate(now.getDate() + 7)
      const isExpiringSoon = m.membership_end_date && new Date(m.membership_end_date) > now && new Date(m.membership_end_date) <= in7Days

      const query = searchQuery.toLowerCase().trim()
      const matchesSearch = !query || 
        (m.full_name && m.full_name.toLowerCase().includes(query)) ||
        (m.email && m.email.toLowerCase().includes(query)) ||
        (m.phone && m.phone.toLowerCase().includes(query)) ||
        (m.id && m.id.toLowerCase().includes(query))

      const matchesPlan = planFilter === 'all' || m.plan_name === planFilter

      if (!matchesSearch || !matchesPlan) return false

      if (statusFilter === 'active') return m.status === 'active' && !isExpired
      if (statusFilter === 'expired') return m.status !== 'active' || isExpired
      if (statusFilter === 'expiring_soon') return isExpiringSoon
      return true
    })
  }, [members, searchQuery, statusFilter, planFilter])

  const activeMembersCount = useMemo(() => {
    return members.filter((m) => {
      const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
      return m.status === 'active' && !isExpired
    }).length
  }, [members])

  const expiringSoonCount = useMemo(() => {
    const now = new Date()
    const in7Days = new Date()
    in7Days.setDate(now.getDate() + 7)
    return members.filter(m => m.membership_end_date && new Date(m.membership_end_date) > now && new Date(m.membership_end_date) <= in7Days).length
  }, [members])

  const getPlanBadgeStyle = (planName) => {
    const p = (planName || '').toLowerCase()
    if (p.includes('annual') || p.includes('titan')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    }
    if (p.includes('vip') || p.includes('3-month')) {
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30'
    }
    if (p.includes('day')) {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
    }
    return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* EXECUTIVE TITANIUM STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TOTAL ROSTER */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 hover:border-indigo-500/40 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Live Database
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{loading ? '...' : members.length}</p>
            <p className="text-xs text-slate-400 font-medium">Total Registered Athletes</p>
          </div>
        </div>

        {/* ACTIVE PASSES */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {members.length > 0 ? `${Math.round((activeMembersCount / members.length) * 100)}% Active` : '0%'}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">{loading ? '...' : activeMembersCount}</p>
            <p className="text-xs text-slate-400 font-medium">Active Gate Passes</p>
          </div>
        </div>

        {/* TODAY'S VISITS */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 hover:border-cyan-500/40 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Today's Flow
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{loading ? '...' : todayCheckInsCount}</p>
            <p className="text-xs text-slate-400 font-medium">Turnstile Check-Ins</p>
          </div>
        </div>

        {/* PEAK GATE HOUR */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300 hover:border-amber-500/40 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Rush Velocity
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">{loading ? '...' : peakHour}</p>
            <p className="text-xs text-slate-400 font-medium">Peak Floor Density</p>
          </div>
        </div>

      </div>

      {/* ATHLETE DIRECTORY CONTAINER */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* DIRECTORY HEADER & PRIMARY ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Athlete Directory & Access Control
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Showing <span className="text-white font-bold font-mono">{filteredMembers.length}</span> of <span className="text-slate-300 font-mono">{members.length}</span> athlete passes in database.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenAddMemberModal && (
              <PillButton
                onClick={onOpenAddMemberModal}
                theme="lime"
                icon={Plus}
                size="sm"
              >
                Register Athlete
              </PillButton>
            )}

            <PillButton
              onClick={exportMembersCSV}
              theme="teal"
              icon={Download}
              size="sm"
            >
              Export CSV
            </PillButton>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* SEARCH BAR */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* SEGMENTED FILTER CAPSULE TABS */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0">
            <PillFilter
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              theme="indigo"
              count={members.length}
              size="sm"
            >
              All Athletes
            </PillFilter>

            <PillFilter
              active={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
              theme="emerald"
              count={activeMembersCount}
              size="sm"
            >
              Active
            </PillFilter>

            <PillFilter
              active={statusFilter === 'expiring_soon'}
              onClick={() => setStatusFilter('expiring_soon')}
              theme="amber"
              count={expiringSoonCount}
              size="sm"
            >
              Expiring Soon
            </PillFilter>

            <PillFilter
              active={statusFilter === 'expired'}
              onClick={() => setStatusFilter('expired')}
              theme="rose"
              size="sm"
            >
              Expired Pass
            </PillFilter>
          </div>

        </div>

        {/* ROSTER TABLE */}
        {loading ? (
          <div className="space-y-3 animate-pulse py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-950 border border-slate-800/80 rounded-2xl w-full" />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-800 rounded-3xl font-mono space-y-3 bg-slate-950/40">
            <Users className="h-8 w-8 text-slate-600 mx-auto" />
            <div>
              <p className="font-bold text-slate-300">No matching athlete records found</p>
              <p className="text-xs text-slate-600 mt-1">Try resetting your search filters or add a new athlete pass.</p>
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-xs font-bold rounded-xl transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800/70">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="text-[10px] font-mono uppercase text-slate-400 bg-slate-950/80 border-b border-slate-800">
                  <th className="py-3.5 px-4 font-bold">Athlete Profile</th>
                  <th className="py-3.5 px-4 font-bold">Membership Tier</th>
                  <th className="py-3.5 px-4 font-bold">Gate Status</th>
                  <th className="py-3.5 px-4 font-bold">Pass Expiration</th>
                  <th className="py-3.5 px-4 text-right font-bold">Command Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                {filteredMembers.map((member) => {
                  const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
                  const daysRemaining = member.membership_end_date
                    ? Math.ceil((new Date(member.membership_end_date) - new Date()) / (1000 * 60 * 60 * 24))
                    : 0

                  const initials = member.full_name
                    ? member.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'AT'

                  return (
                    <tr 
                      key={member.id} 
                      className="hover:bg-slate-800/30 transition duration-150 group"
                    >
                      {/* PROFILE */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setInspectingMember(member)}
                            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 text-indigo-200 font-mono font-black flex items-center justify-center text-xs shrink-0 shadow-inner group-hover:border-indigo-400/60 transition cursor-pointer"
                            title="Inspect Athlete Gate Pass"
                          >
                            {initials}
                          </button>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-black text-white uppercase text-sm tracking-tight group-hover:text-indigo-300 transition">
                                {member.full_name}
                              </p>
                            </div>
                            <p className="text-[11px] font-mono text-slate-400">{member.email}</p>
                            {member.phone && (
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{member.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PLAN */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block font-mono font-bold text-[11px] uppercase px-3 py-1 rounded-xl border ${getPlanBadgeStyle(member.plan_name)}`}>
                          {member.plan_name || 'Monthly Pass'}
                        </span>
                      </td>
                      
                      {/* GATE STATUS */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase font-mono ${
                          member.status === 'active' && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' && !isExpired ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          <span>{isExpired ? 'Expired' : 'Active'}</span>
                        </span>
                      </td>

                      {/* EXPIRATION */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-mono text-slate-200 text-xs font-semibold">
                            {formatReadableDate(member.membership_end_date)}
                          </p>
                          <span className={`text-[10px] font-mono font-bold ${
                            daysRemaining <= 0
                              ? 'text-rose-400'
                              : daysRemaining <= 7
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}>
                            {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days remaining`}
                          </span>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setInspectingMember(member)}
                          className="p-2 bg-slate-950 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-200 rounded-xl transition inline-flex items-center cursor-pointer shadow-sm"
                          title="View Digital QR Pass"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-200 hover:text-white text-xs font-bold rounded-xl transition inline-flex items-center space-x-1.5 shadow-md cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Renew / Extend</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(member)}
                          className="p-2 bg-slate-950 hover:bg-rose-600 border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-white rounded-xl transition inline-flex items-center cursor-pointer shadow-sm"
                          title="Delete Athlete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECT ATHLETE DIGITAL PASS MODAL */}
      {inspectingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 relative space-y-6">
            <button
              onClick={() => setInspectingMember(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
            >
              ESC
            </button>

            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-400 text-[10px] font-mono font-bold uppercase mb-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified Turnstile Pass</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase">{inspectingMember.full_name}</h3>
              <p className="text-xs text-indigo-400 font-bold uppercase font-mono">{inspectingMember.plan_name || 'Monthly Pass'}</p>
            </div>

            <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner">
              <QRCodeSVG 
                value={inspectingMember.qr_code_token || inspectingMember.id}
                size={160}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
              />
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Gate ID:</span>
                <span className="text-slate-300 font-bold">{inspectingMember.id.substring(0, 13)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{inspectingMember.status || 'Active'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expires:</span>
                <span className="text-slate-200">{formatReadableDate(inspectingMember.membership_end_date)}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setEditingMember(inspectingMember)
                  setInspectingMember(null)
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer shadow-lg"
              >
                Renew Subscription
              </button>
              <button
                type="button"
                onClick={() => setInspectingMember(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENEW MEMBERSHIP MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 relative space-y-6">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
            >
              ESC
            </button>

            <div>
              <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-400 text-[10px] font-mono font-bold uppercase mb-2">
                <CreditCard className="h-3 w-3" />
                <span>Subscription Renewal Terminal</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Renew Membership Pass</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Updating gate pass for <strong className="text-white">{editingMember.full_name}</strong>
              </p>
            </div>

            <form onSubmit={handleRenewSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Select Tier Plan</label>
                <select
                  value={renewPlan}
                  onChange={(e) => {
                    setRenewPlan(e.target.value)
                    if (e.target.value === 'Day Pass') { setRenewAmount('250'); setRenewDays(1) }
                    else if (e.target.value === 'Monthly Pass') { setRenewAmount('1200'); setRenewDays(30) }
                    else if (e.target.value === '3-Month VIP') { setRenewAmount('3000'); setRenewDays(90) }
                    else if (e.target.value === 'Annual Pass') { setRenewAmount('9600'); setRenewDays(365) }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Day Pass">24-Hour Day Pass (250 EGP / 1 Day)</option>
                  <option value="Monthly Pass">Monthly Pass (1,200 EGP / 30 Days)</option>
                  <option value="3-Month VIP">3-Month VIP Pass (3,000 EGP / 90 Days)</option>
                  <option value="Annual Pass">Annual Titan Pass (9,600 EGP / 365 Days)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Payment Amount (EGP)</label>
                  <input
                    type="number"
                    required
                    value={renewAmount}
                    onChange={(e) => setRenewAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Days Extended</label>
                  <input
                    type="number"
                    required
                    value={renewDays}
                    onChange={(e) => setRenewDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
                <p>Current Status: <strong className="text-white">{editingMember.status}</strong></p>
                <p>Current Expiry: <strong className="text-white">{formatReadableDate(editingMember.membership_end_date)}</strong></p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{isProcessing ? 'Processing...' : 'Confirm Renewal & Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DELETE ATHLETE CONFIRMATION MODAL */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-black text-white uppercase">Confirm Athlete Deletion</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete athlete record for <strong className="text-white">{memberToDelete.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}