import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Users, Calendar, DollarSign, Clock, Dumbbell, PlusCircle, 
  CheckCircle2, Sparkles, Activity, Zap, FileText
} from 'lucide-react'

export default function TrainerDashboard({ session }) {
  const [trainerProfile, setTrainerProfile] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [assignedPlans, setAssignedPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('clients')

  const [selectedClient, setSelectedClient] = useState('')
  const [programTitle, setProgramTitle] = useState('')
  const [splitDay, setSplitDay] = useState('Push Day')
  const [exerciseName, setExerciseName] = useState('')
  const [targetSets, setTargetSets] = useState('4')
  const [targetReps, setTargetReps] = useState('10')
  const [targetRpe, setTargetRpe] = useState('8.0')
  const [planNotes, setPlanNotes] = useState('')
  const [savingPlan, setSavingPlan] = useState(false)
  const [msg, setMsg] = useState('')

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) {
      console.log('Audio blocked')
    }
  }

  const fetchTrainerData = useCallback(async () => {
    setLoading(true)

    const userEmail = session?.user?.email || ''
    const userId = session?.user?.id || ''

    // Direct lookup in 'trainers' table (Fixes Issue #1)
    const { data: trainer } = await supabase
      .from('trainers')
      .select('*')
      .or(`auth_id.eq.${userId},email.eq.${userEmail}`)
      .maybeSingle()

    if (trainer) {
      setTrainerProfile(trainer)

      const { data: subs } = await supabase
        .from('trainer_subscriptions')
        .select('*, members(id, full_name, email, status, membership_end_date)')
        .eq('trainer_id', trainer.id)
        .eq('status', 'active')

      if (subs) setSubscribers(subs)

      const { data: sessions } = await supabase
        .from('pt_sessions')
        .select('*, members(full_name, email)')
        .eq('trainer_id', trainer.id)
        .order('scheduled_at', { ascending: true })

      if (sessions) setUpcomingSessions(sessions)

      const { data: plans } = await supabase
        .from('trainer_workout_plans')
        .select('*, members(full_name)')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false })

      if (plans) setAssignedPlans(plans)
    }

    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchTrainerData()

    const sessionChannel = supabase
      .channel('realtime-pt-sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pt_sessions' }, () => {
        fetchTrainerData()
      })
      .subscribe()

    return () => {
      sessionChannel.unsubscribe()
    }
  }, [fetchTrainerData])

  const handleAssignWorkoutPlan = async (e) => {
    e.preventDefault()
    if (!selectedClient || !trainerProfile) return
    setSavingPlan(true)

    const { error } = await supabase.from('trainer_workout_plans').insert([
      {
        trainer_id: trainerProfile.id,
        member_id: selectedClient,
        title: programTitle.trim() || 'Custom Strength Protocol',
        split_day: splitDay,
        exercise_name: exerciseName.trim(),
        target_sets: parseInt(targetSets, 10),
        target_reps: parseInt(targetReps, 10),
        target_rpe: parseFloat(targetRpe),
        notes: planNotes.trim()
      }
    ])

    if (!error) {
      playSuccessSound()
      setMsg('Custom workout routine dispatched to client dashboard!')
      setExerciseName('')
      setPlanNotes('')
      fetchTrainerData()
      setTimeout(() => setMsg(''), 4000)
    } else {
      alert(`Error assigning routine: ${error.message}`)
    }
    setSavingPlan(false)
  }

  const markSessionComplete = async (sessionId) => {
    await supabase.from('pt_sessions').update({ status: 'completed' }).eq('id', sessionId)
    playSuccessSound()
    setMsg('PT Session marked completed!')
    fetchTrainerData()
    setTimeout(() => setMsg(''), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500 font-mono font-bold animate-pulse space-y-3">
        <Activity className="h-8 w-8 text-indigo-400 animate-spin" />
        <span>INITIALIZING COACH COMMAND TERMINAL...</span>
      </div>
    )
  }

  const totalMonthlyEarnings = subscribers.length * (trainerProfile?.monthly_plan_price || 120)

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-bounce shadow-xl">
          <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* TRAINER HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-500/30 mb-3">
            <Zap className="h-3 w-3 text-amber-300" />
            <span>Master Coach Command</span>
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">Coach {trainerProfile?.full_name || 'Trainer'}</h2>
          <p className="text-xs text-slate-400 mt-1">Specialization: <strong className="text-indigo-300">{trainerProfile?.specialty || 'Strength & Conditioning'}</strong></p>
        </div>

        <div className="flex items-center space-x-4 relative z-10 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black text-white">${totalMonthlyEarnings.toLocaleString()}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Monthly MRR</p>
            </div>
          </div>

          <div className="flex-1 md:flex-none bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{subscribers.length}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Active Athletes</p>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD TAB SWITCHER */}
      <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 max-w-xl">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Clients Roster ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'builder' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Program Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'sessions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>PT Schedule</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIBED CLIENTS ROSTER */}
      {activeTab === 'clients' && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Subscribed Athlete Roster</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Subscriptions: {subscribers.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscribers.length === 0 ? (
              <p className="text-xs text-slate-500 col-span-full py-8 text-center border border-dashed border-slate-800 rounded-2xl">
                No members currently subscribed to your coaching package.
              </p>
            ) : (
              subscribers.map((sub) => (
                <div key={sub.id} className="p-5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl flex justify-between items-center transition">
                  <div>
                    <h4 className="text-sm font-black text-white">{sub.members?.full_name}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{sub.members?.email}</p>
                    <p className="text-[10px] text-indigo-300 font-mono mt-2">Plan: {sub.plan_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-2">
                      Renews: {new Date(sub.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WORKOUT PROGRAM BUILDER */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-indigo-400" />
              <span>Assign Custom Routine</span>
            </h3>

            <form onSubmit={handleAssignWorkoutPlan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Athlete</label>
                <select
                  required
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Client --</option>
                  {subscribers.map((sub) => (
                    <option key={sub.members?.id} value={sub.members?.id}>
                      {sub.members?.full_name} ({sub.members?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertrophy Block - Week 1"
                  value={programTitle}
                  onChange={(e) => setProgramTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Split Day</label>
                  <select
                    value={splitDay}
                    onChange={(e) => setSplitDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Push Day">Push Day</option>
                    <option value="Pull Day">Pull Day</option>
                    <option value="Leg Day">Leg Day</option>
                    <option value="Upper Body">Upper Body</option>
                    <option value="Lower Body">Lower Body</option>
                    <option value="Full Body">Full Body</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target RPE (1-10)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    required
                    value={targetRpe}
                    onChange={(e) => setTargetRpe(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Bench Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Sets</label>
                  <input
                    type="number"
                    required
                    value={targetSets}
                    onChange={(e) => setTargetSets(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Reps</label>
                  <input
                    type="number"
                    required
                    value={targetReps}
                    onChange={(e) => setTargetReps(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cues / Tempo Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 3-sec eccentric lowering, pause at bottom"
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingPlan}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                <span>{savingPlan ? 'Dispatching...' : 'Dispatch Routine'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span>Assigned Routines History ({assignedPlans.length})</span>
            </h3>

            <div className="space-y-3">
              {assignedPlans.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-2xl">
                  No routines assigned yet. Build a workout on the left panel!
                </p>
              ) : (
                assignedPlans.map((plan) => (
                  <div key={plan.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-white">{plan.title}</span>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {plan.split_day}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-semibold">
                        {plan.exercise_name} — {plan.target_sets} sets × {plan.target_reps} reps @ RPE {plan.target_rpe}
                      </p>
                      {plan.notes && <p className="text-[11px] text-slate-400 mt-0.5">Cue: {plan.notes}</p>}
                      <p className="text-[10px] font-mono text-slate-500 mt-1">Client: {plan.members?.full_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SESSIONS MANAGEMENT */}
      {activeTab === 'sessions' && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <span>Scheduled 1-on-1 PT Appointments</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Pending: {upcomingSessions.filter(s => s.status === 'scheduled').length}
            </span>
          </div>

          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-2xl">
                No personal training sessions scheduled.
              </p>
            ) : (
              upcomingSessions.map((s) => (
                <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-xs font-black text-white">{s.members?.full_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{s.notes || '1-on-1 Coaching Session'}</p>
                    <p className="text-[10px] text-indigo-300 font-mono mt-1">
                      📅 {new Date(s.scheduled_at).toLocaleString()} ({s.duration_minutes || 60} mins)
                    </p>
                  </div>

                  {s.status === 'scheduled' ? (
                    <button
                      onClick={() => markSessionComplete(s.id)}
                      className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                    >
                      Mark Completed
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
      )}
    </div>
  )
}