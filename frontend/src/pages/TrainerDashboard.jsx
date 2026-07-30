import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Users, Calendar, Dumbbell, Sparkles, Activity, Clock, CheckCircle2, XCircle } from 'lucide-react'

import TrainerStatsBanner from '../components/TrainerStatsBanner'
import TrainerProgramBuilder from '../components/TrainerProgramBuilder'

export default function TrainerDashboard({ session }) {
  const [trainerProfile, setTrainerProfile] = useState(null)
  const [subscribers, setSubscribers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
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

      const { data: pending } = await supabase
        .from('trainer_subscriptions')
        .select('*, members(id, full_name, email)')
        .eq('trainer_id', trainer.id)
        .eq('status', 'pending')

      if (pending) setPendingRequests(pending)

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

    const channel = supabase
      .channel('realtime-trainer-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pt_sessions' }, fetchTrainerData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainer_subscriptions' }, fetchTrainerData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTrainerData])

  const handleAcceptRequest = async (subscriptionId) => {
    const { error } = await supabase
      .from('trainer_subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId)

    if (!error) {
      playSuccessSound()
      setMsg('Client hiring request accepted!')
      fetchTrainerData()
      setTimeout(() => setMsg(''), 3500)
    }
  }

  const handleRejectRequest = async (subscriptionId) => {
    const { error } = await supabase
      .from('trainer_subscriptions')
      .update({ status: 'rejected' })
      .eq('id', subscriptionId)

    if (!error) {
      setMsg('Client hiring request rejected.')
      fetchTrainerData()
      setTimeout(() => setMsg(''), 3000)
    }
  }

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

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-bounce shadow-xl">
          <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* STATS BANNER */}
      <TrainerStatsBanner trainerProfile={trainerProfile} subscribers={subscribers} />

      {/* DASHBOARD TAB SWITCHER */}
      <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 max-w-xl">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
            activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Clients ({subscribers.length})</span>
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

      {/* TAB 1: CLIENTS & PENDING QUEUE */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {pendingRequests.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/30 p-6 rounded-3xl shadow-2xl space-y-4">
              <h3 className="text-sm font-black text-amber-300 uppercase tracking-tight flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                <span>Pending Client Hiring Requests ({pendingRequests.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-900 border border-amber-500/30 rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black text-white">{req.members?.full_name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">{req.members?.email}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold rounded-xl transition flex items-center space-x-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
                <Users className="h-5 w-5 text-indigo-400" />
                <span>Active Subscribed Athletes</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Total Active: {subscribers.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscribers.length === 0 ? (
                <p className="text-xs text-slate-500 col-span-full py-8 text-center border border-dashed border-slate-800 rounded-2xl font-mono">
                  No active members currently subscribed to your coaching package.
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
        </div>
      )}

      {/* TAB 2: PROGRAM BUILDER MODULAR CALL */}
      {activeTab === 'builder' && (
        <TrainerProgramBuilder
          subscribers={subscribers}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          programTitle={programTitle}
          setProgramTitle={setProgramTitle}
          splitDay={splitDay}
          setSplitDay={setSplitDay}
          targetRpe={targetRpe}
          setTargetRpe={setTargetRpe}
          exerciseName={exerciseName}
          setExerciseName={setExerciseName}
          targetSets={targetSets}
          setTargetSets={setTargetSets}
          targetReps={targetReps}
          setTargetReps={setTargetReps}
          planNotes={planNotes}
          setPlanNotes={setPlanNotes}
          onAssignWorkoutPlan={handleAssignWorkoutPlan}
          savingPlan={savingPlan}
          assignedPlans={assignedPlans}
        />
      )}

      {/* TAB 3: PT SESSIONS */}
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
              <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-2xl font-mono">
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