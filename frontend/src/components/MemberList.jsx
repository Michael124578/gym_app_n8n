import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, UserCheck, Activity, CalendarCheck, Clock, Search, RefreshCw, X, CheckCircle, Trash2 } from 'lucide-react'

export default function MemberList({ refreshTrigger }) {
  const [members, setMembers] = useState([])
  const [todayCheckInsCount, setTodayCheckInsCount] = useState(0)
  const [peakHour, setPeakHour] = useState('N/A')
  const [loading, setLoading] = useState(true)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'expired'
  
  // Edit & Renew Modal State
  const [editingMember, setEditingMember] = useState(null)
  const [renewPlan, setRenewPlan] = useState('Monthly Pass')
  const [renewAmount, setRenewAmount] = useState('50')
  const [renewDays, setRenewDays] = useState(30)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const fetchMembersAndStats = async () => {
    setLoading(true)

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

    setLoading(false)
  }

  useEffect(() => {
    fetchMembersAndStats()

    const memberChannel = supabase
      .channel('realtime-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembersAndStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(memberChannel)
    }
  }, [refreshTrigger])

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Are you sure you want to delete ${member.full_name}? This will remove their credentials and history.`)) return

    if (member.auth_id) {
      // Calls the Supabase Edge Function to delete user from auth.users (cascading to public.members)
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { auth_id: member.auth_id }
      })

      if (error) {
        alert(`Failed to delete user: ${error.message}`)
        return
      }
    } else {
      // Fallback: Delete directly from members table if auth_id was missing
      await supabase.from('members').delete().eq('id', member.id)
    }

    showToast(`Deleted ${member.full_name}`)
    fetchMembersAndStats()
  }

  const handleRenewSubscription = async (e) => {
    e.preventDefault()
    if (!editingMember) return

    setIsProcessing(true)

    const currentExpiry = new Date(editingMember.membership_end_date || new Date())
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()
    baseDate.setDate(baseDate.getDate() + parseInt(renewDays))

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
    showToast(`Successfully renewed pass for ${editingMember.full_name}!`)
    setEditingMember(null)
    fetchMembersAndStats()
  }

  const filteredMembers = members.filter((m) => {
    const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
    const matchesSearch = m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (statusFilter === 'active') return matchesSearch && m.status === 'active' && !isExpired
    if (statusFilter === 'expired') return matchesSearch && (m.status !== 'active' || isExpired)
    return matchesSearch
  })

  const activeMembersCount = members.filter((m) => {
    const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
    return m.status === 'active' && !isExpired
  }).length

  return (
    <div className="space-y-6">
      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 text-xs font-bold animate-bounce flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ANALYTICS STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950/90 border border-slate-800/80 hover:border-indigo-500/30 rounded-2xl p-5 flex items-center space-x-4 shadow-xl transition-all duration-300">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-2xl text-indigo-400 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white tracking-tight">{loading ? '...' : members.length}</p>
            <p className="text-xs text-slate-400 font-medium">Total Roster</p>
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-5 flex items-center space-x-4 shadow-xl transition-all duration-300">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-emerald-400 shadow-inner">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white tracking-tight">{loading ? '...' : activeMembersCount}</p>
            <p className="text-xs text-slate-400 font-medium">Active Passes</p>
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/80 hover:border-sky-500/30 rounded-2xl p-5 flex items-center space-x-4 shadow-xl transition-all duration-300">
          <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-2xl text-sky-400 shadow-inner">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white tracking-tight">{loading ? '...' : todayCheckInsCount}</p>
            <p className="text-xs text-slate-400 font-medium">Today's Visits</p>
          </div>
        </div>

        <div className="bg-slate-950/90 border border-slate-800/80 hover:border-amber-500/30 rounded-2xl p-5 flex items-center space-x-4 shadow-xl transition-all duration-300">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-amber-400 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black text-white tracking-tight">{loading ? '...' : peakHour}</p>
            <p className="text-xs text-slate-400 font-medium">Peak Hour Today</p>
          </div>
        </div>
      </div>

      {/* MEMBER DIRECTORY CONTAINER */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-lg text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Member Directory</h2>
              <p className="text-xs text-slate-400">{filteredMembers.length} Members Listed</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search name/email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition w-full sm:w-60"
              />
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === 'expired' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-900 border border-slate-800/80 rounded-xl w-full" />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
            No matching members found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-slate-300 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expires</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMembers.map((member) => {
                  const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
                  return (
                    <tr key={member.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-4">
                        <p className="font-medium text-slate-200">{member.full_name}</p>
                        <p className="text-xs font-mono text-slate-500">{member.email}</p>
                      </td>
                      <td className="p-4 text-xs font-semibold text-indigo-400">{member.plan_name || 'Monthly Pass'}</td>
                      
                      <td className="p-4">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'active' && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' && !isExpired ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                          <span>{isExpired ? 'Expired' : member.status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-xs font-mono text-slate-400">
                        {member.membership_end_date ? new Date(member.membership_end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-200 hover:text-white text-xs font-semibold rounded-lg transition inline-flex items-center space-x-1"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          <span>Renew / Edit</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteMember(member)}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white text-xs font-semibold rounded-lg transition inline-flex items-center"
                          title="Delete Member"
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

      {/* RENEW MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Renew Membership</h3>
            <p className="text-xs text-slate-400 mb-4">Updating pass for <strong className="text-white">{editingMember.full_name}</strong></p>

            <form onSubmit={handleRenewSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Renewal Plan</label>
                <select
                  value={renewPlan}
                  onChange={(e) => {
                    setRenewPlan(e.target.value)
                    if (e.target.value === 'Monthly Pass') { setRenewAmount('50'); setRenewDays(30) }
                    else if (e.target.value === '3-Month VIP') { setRenewAmount('130'); setRenewDays(90) }
                    else if (e.target.value === 'Annual Pass') { setRenewAmount('450'); setRenewDays(365) }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Monthly Pass">Monthly Pass ($50 / 30 Days)</option>
                  <option value="3-Month VIP">3-Month VIP ($130 / 90 Days)</option>
                  <option value="Annual Pass">Annual Pass ($450 / 365 Days)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Renewal Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={renewAmount}
                    onChange={(e) => setRenewAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Days Added</label>
                  <input
                    type="number"
                    required
                    value={renewDays}
                    onChange={(e) => setRenewDays(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  <span>{isProcessing ? 'Updating...' : 'Confirm Renewal & Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}