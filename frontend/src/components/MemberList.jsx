import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, UserCheck, Activity, CalendarCheck } from 'lucide-react'

export default function MemberList({ refreshTrigger }) {
  const [members, setMembers] = useState([])
  const [todayCheckInsCount, setTodayCheckInsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchMembersAndStats = async () => {
    setLoading(true)

    // 1. Fetch member roster
    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (memberData) {
      setMembers(memberData)
    }

    // 2. Fetch today's check-ins count
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('checked_in_at', startOfToday.toISOString())

    setTodayCheckInsCount(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchMembersAndStats()

    // Real-time subscription for members table
    const memberChannel = supabase
      .channel('realtime-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembersAndStats()
      })
      .subscribe()

    // Real-time subscription for check_ins table
    const checkInChannel = supabase
      .channel('realtime-checkins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, () => {
        fetchMembersAndStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(memberChannel)
      supabase.removeChannel(checkInChannel)
    }
  }, [refreshTrigger])

  const activeMembers = members.filter((m) => m.status === 'active').length

  return (
    <div className="space-y-6">
      {/* ANALYTICS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4 shadow-xl">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-xl text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{loading ? '...' : members.length}</p>
            <p className="text-xs text-slate-400">Total Members</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4 shadow-xl">
          <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-xl text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{loading ? '...' : activeMembers}</p>
            <p className="text-xs text-slate-400">Active Memberships</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4 shadow-xl">
          <div className="bg-sky-500/20 border border-sky-500/30 p-3 rounded-xl text-sky-400">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{loading ? '...' : todayCheckInsCount}</p>
            <p className="text-xs text-slate-400">Today's Check-Ins</p>
          </div>
        </div>
      </div>

      {/* MEMBER DIRECTORY TABLE */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-lg text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Member Directory</h2>
              <p className="text-xs text-slate-400">Live synchronized database roster</p>
            </div>
          </div>
        </div>

        {loading ? (
          /* TABLE SKELETON LOADER */
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-900 border border-slate-800/80 rounded-xl w-full" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
            No members registered yet. Click "Register Member" to add your first member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-slate-300 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-medium text-slate-200">{member.full_name}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{member.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        member.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}