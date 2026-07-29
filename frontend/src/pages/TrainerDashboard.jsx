import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, Calendar, DollarSign, Clock, Dumbbell } from 'lucide-react'

export default function TrainerDashboard({ session }) {
  const [trainerProfile, setTrainerProfile] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrainerData()
  }, [session])

  const fetchTrainerData = async () => {
    setLoading(true)

    // 1. Fetch current logged-in trainer profile
    const { data: trainer } = await supabase
      .from('trainers')
      .select('*')
      .or(`auth_id.eq.${session?.user?.id},email.eq.${session?.user?.email}`)
      .maybeSingle()

    if (trainer) {
      setTrainerProfile(trainer)

      // 2. Fetch subscribed athletes
      const { data: subs } = await supabase
        .from('trainer_subscriptions')
        .select('*, members(full_name, email, status)')
        .eq('trainer_id', trainer.id)
        .eq('status', 'active')

      if (subs) setSubscribers(subs)

      // 3. Fetch trainer sessions
      const { data: sessions } = await supabase
        .from('pt_sessions')
        .select('*, members(full_name, email)')
        .eq('trainer_id', trainer.id)
        .order('scheduled_at', { ascending: true })

      if (sessions) setUpcomingSessions(sessions)
    }

    setLoading(false)
  }

  const markSessionComplete = async (sessionId) => {
    await supabase.from('pt_sessions').update({ status: 'completed' }).eq('id', sessionId)
    fetchTrainerData()
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading Trainer Terminal...</div>
  }

  const totalMonthlyEarnings = subscribers.length * (trainerProfile?.monthly_plan_price || 120)

  return (
    <div className="space-y-6">
      {/* TRAINER HEADER BANNER */}
      <div className="bg-gradient-to-r from-violet-900/40 via-slate-900 to-indigo-900/40 border border-indigo-500/30 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Coach Terminal
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Welcome Back, {trainerProfile?.full_name || 'Coach'}!</h2>
          <p className="text-xs text-slate-400">Specialty: <strong className="text-indigo-300">{trainerProfile?.specialty || 'Personal Fitness'}</strong></p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800">
          <DollarSign className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="text-lg font-black text-white">${totalMonthlyEarnings.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Active Monthly MRR</p>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{subscribers.length}</p>
            <p className="text-xs text-slate-400">Subscribed Athletes</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-white">{upcomingSessions.filter(s => s.status === 'scheduled').length}</p>
            <p className="text-xs text-slate-400">Pending PT Sessions</p>
          </div>
        </div>
      </div>

      {/* SUBSCRIBED MEMBERS LIST */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Dumbbell className="h-4 w-4 text-indigo-400" />
          <span>My Subscribed Clients ({subscribers.length})</span>
        </h3>

        <div className="space-y-3">
          {subscribers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No members subscribed to your coaching plan yet.</p>
          ) : (
            subscribers.map((sub) => (
              <div key={sub.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{sub.members?.full_name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{sub.members?.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Active Sub
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Renews: {new Date(sub.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SESSION MANAGEMENT */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <span>Scheduled Client Sessions</span>
        </h3>

        <div className="space-y-3">
          {upcomingSessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No sessions scheduled.</p>
          ) : (
            upcomingSessions.map((s) => (
              <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-bold text-white">{s.members?.full_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.notes || '1-on-1 Personal Training'}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    📅 {new Date(s.scheduled_at).toLocaleString()}
                  </p>
                </div>

                {s.status === 'scheduled' ? (
                  <button
                    onClick={() => markSessionComplete(s.id)}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold rounded-xl transition"
                  >
                    Complete Session
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Completed
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}