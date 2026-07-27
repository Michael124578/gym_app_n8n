import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, UserCheck } from 'lucide-react'

export default function MemberList({ refreshTrigger }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMembers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        Loading member directory...
      </div>
    )
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-lg text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Member Directory</h2>
            <p className="text-xs text-slate-400">{members.length} Registered Members</p>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
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
  )
}