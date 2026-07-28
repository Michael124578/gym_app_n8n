import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { 
  CheckCircle, XCircle, QrCode, LogOut, Activity, 
  DollarSign, TrendingUp, UserPlus, Trash2, CalendarPlus, Search 
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import AddMemberModal from './AddMemberModal'

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('scanner')
  const [members, setMembers] = useState([])
  const [recentCheckIns, setRecentCheckIns] = useState([])
  const [scanResult, setScanResult] = useState(null)
  
  // Analytics State
  const [hourlyTraffic, setHourlyTraffic] = useState([])
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [retentionStats, setRetentionStats] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)

  // Directory Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Web Audio Sound FX Generators
  const playAccessGrantedSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) {
      console.log('Audio playback prevented')
    }
  }

  const playAccessDeniedSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.log('Audio playback prevented')
    }
  }

  useEffect(() => {
    fetchMembers()
    fetchRecentCheckIns()
    fetchAnalytics()

    const checkInChannel = supabase
      .channel('realtime-checkins')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'check_ins' }, () => {
        fetchRecentCheckIns()
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(checkInChannel)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'scanner') return

    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scanner.render(
      (decodedText) => {
        scanner.pause(true)
        processCheckIn(decodedText).then(() => {
          setTimeout(() => scanner.resume(), 2500)
        })
      },
      () => {}
    )

    return () => {
      scanner.clear().catch((err) => console.error("Scanner clear failure:", err))
    }
  }, [activeTab])

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setMembers(data)
  }

  const fetchRecentCheckIns = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select('*, members(full_name, status)')
      .order('checked_in_at', { ascending: false })
      .limit(6)
    if (data) setRecentCheckIns(data)
  }

  const fetchAnalytics = async () => {
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
      const month = new Date(p.paid_at).toLocaleString('default', { month: 'short' })
      revByMonth[month] = (revByMonth[month] || 0) + Number(p.amount)
    })
    setTotalRevenue(sumRev)
    setMonthlyRevenue(Object.keys(revByMonth).map(month => ({ month, revenue: revByMonth[month] })))

    const { data: memberList } = await supabase.from('members').select('status, membership_end_date')
    let active = 0, expired = 0
    memberList?.forEach((m) => {
      const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
      if (m.status === 'active' && !isExpired) active++
      else expired++
    })
    setRetentionStats([
      { name: 'Active Passes', value: active, color: '#10b981' },
      { name: 'Expired Passes', value: expired, color: '#f43f5e' }
    ])
  }

  const processCheckIn = async (token) => {
    setScanResult(null)
    
    let { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('qr_code_token', token)
      .maybeSingle()

    if (member) {
      const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
      const isEligible = member.status === 'active' && !isExpired

      await supabase.from('check_ins').insert([{
        member_id: member.id,
        access_granted: isEligible,
        notes: isEligible ? 'Access Granted — Member Pass' : 'Denied — Pass Expired'
      }])

      if (isEligible) playAccessGrantedSound()
      else playAccessDeniedSound()

      setScanResult({
        success: isEligible,
        memberName: member.full_name,
        plan: member.plan_name || 'Monthly Pass',
        message: isEligible ? 'Access Granted — Welcome!' : 'Access Denied — Membership Expired'
      })
      fetchRecentCheckIns()
      return
    }

    let { data: guestPass } = await supabase
      .from('guest_passes')
      .select('*, members(full_name)')
      .eq('pass_token', token)
      .maybeSingle()

    if (guestPass) {
      const isValid = !guestPass.is_used && new Date() < new Date(guestPass.valid_until)

      if (isValid) {
        await supabase.from('guest_passes').update({ is_used: true }).eq('id', guestPass.id)
        await supabase.from('check_ins').insert([{
          member_id: guestPass.host_member_id,
          access_granted: true,
          notes: `Guest Pass Granted: ${guestPass.guest_name}`
        }])

        playAccessGrantedSound()
        setScanResult({
          success: true,
          memberName: `Guest: ${guestPass.guest_name}`,
          plan: `Host: ${guestPass.members?.full_name || 'Member'}`,
          message: 'Access Granted — Guest Pass Accepted!'
        })
      } else {
        playAccessDeniedSound()
        setScanResult({
          success: false,
          memberName: `Guest: ${guestPass.guest_name}`,
          plan: '24-Hour Guest Pass',
          message: 'Access Denied — Guest Pass Already Used or Expired'
        })
      }
      fetchRecentCheckIns()
      return
    }

    playAccessDeniedSound()
    setScanResult({ success: false, message: 'Invalid or Unrecognized QR Pass' })
  }

  const handleDeleteMember = async (m) => {
    if (!window.confirm(`Delete ${m.full_name}? This cannot be undone.`)) return

    if (m.auth_id) {
      await supabase.functions.invoke('delete-user', { body: { auth_id: m.auth_id } })
    } else {
      await supabase.from('members').delete().eq('id', m.id)
    }
    fetchMembers()
    fetchAnalytics()
  }

  const handleExtendMember = async (m) => {
    const currentExpiry = new Date(m.membership_end_date || new Date())
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date()
    baseDate.setDate(baseDate.getDate() + 30)

    await supabase.from('members').update({
      status: 'active',
      membership_end_date: baseDate.toISOString()
    }).eq('id', m.id)

    fetchMembers()
    fetchAnalytics()
  }

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">IRON GYM</h1>
            <p className="text-[10px] text-slate-400 font-mono">STAFF ACCESS TERMINAL</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'scanner' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gate Scanner
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'members' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Roster
            </button>
          </div>

          <button
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold mb-4 text-white">Front Desk Access Scanner</h2>
              <div id="reader" className="w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"></div>

              {scanResult && (
                <div className={`mt-6 p-5 rounded-2xl border flex items-center space-x-4 animate-bounce ${
                  scanResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  {scanResult.success ? (
                    <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-8 w-8 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{scanResult.memberName || 'Scan Status'}</h3>
                    <p className="text-xs opacity-90">{scanResult.message}</p>
                    {scanResult.plan && <p className="text-[10px] font-mono mt-1 opacity-75">Plan: {scanResult.plan}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold mb-4 text-white">Live Gate Access Activity</h2>
              <div className="space-y-3">
                {recentCheckIns.map((item) => (
                  <div key={item.id} className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xs text-slate-200">{item.members?.full_name || 'Guest Pass'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{new Date(item.checked_in_at).toLocaleTimeString()}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      item.access_granted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.access_granted ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 font-medium">Total Revenue Logged</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">
                    {retentionStats[0]?.value ? Math.round((retentionStats[0].value / (retentionStats[0].value + retentionStats[1].value)) * 100) : 0}%
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Retention Rate</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-black text-white">
                    {hourlyTraffic.reduce((max, cur) => cur.visits > max.visits ? cur : max, { visits: 0, hourLabel: 'N/A' }).hourLabel}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">Peak Hour Today</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Revenue Trends ($)</h3>
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
                <h3 className="text-sm font-bold text-white mb-2">Member Retention Breakdown</h3>
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
              <h3 className="text-sm font-bold text-white mb-4">Traffic Heatmap By Hour</h3>
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
        )}

        {activeTab === 'members' && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Member Directory</h2>
                <p className="text-xs text-slate-400">{filteredMembers.length} Members Listed</p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
                  />
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-indigo-600/20"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register Member</span>
                </button>
              </div>
            </div>

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
                  {filteredMembers.map((m) => {
                    const isExpired = m.membership_end_date && new Date() > new Date(m.membership_end_date)
                    return (
                      <tr key={m.id} className="hover:bg-slate-900/40 transition">
                        <td className="p-4">
                          <p className="font-medium text-slate-200">{m.full_name}</p>
                          <p className="text-xs font-mono text-slate-500">{m.email}</p>
                        </td>
                        <td className="p-4 text-xs font-semibold text-indigo-400">{m.plan_name || 'Monthly Pass'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            m.status === 'active' && !isExpired
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${m.status === 'active' && !isExpired ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                            <span>{isExpired ? 'Expired' : m.status}</span>
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-400">
                          {m.membership_end_date ? new Date(m.membership_end_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleExtendMember(m)}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white text-xs font-semibold rounded-xl transition inline-flex items-center space-x-1"
                            title="Extend 30 Days"
                          >
                            <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                            <span>Extend 30D</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteMember(m)}
                            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white text-xs font-semibold rounded-xl transition inline-flex items-center"
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
          </div>
        )}
      </main>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={() => {
          fetchMembers()
          fetchAnalytics()
        }}
      />
    </div>
  )
}