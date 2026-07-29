import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { UserCheck, Calendar, Award, PlusCircle, CheckCircle2, Zap, ShieldAlert } from 'lucide-react'

export default function TrainerManagement({ session }) {
  const [trainers, setTrainers] = useState([])
  const [members, setMembers] = useState([])
  const [sessions, setSessions] = useState([])
  const [currentMember, setCurrentMember] = useState(null)
  
  const [selectedTrainer, setSelectedTrainer] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribingId, setSubscribingId] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    // Fetch Trainers
    const { data: t } = await supabase.from('trainers').select('*')
    if (t) setTrainers(t)

    // Fetch Members
    const { data: m } = await supabase.from('members').select('id, full_name, email, auth_id')
    if (m) setMembers(m)

    // Match current user member record
    if (session?.user) {
      const match = m?.find(mem => mem.auth_id === session.user.id || mem.email === session.user.email)
      if (match) setCurrentMember(match)
    }

    // Fetch PT Sessions
    const { data: s } = await supabase
      .from('pt_sessions')
      .select('*, trainers(full_name, specialty), members(full_name)')
      .order('scheduled_at', { ascending: true })
    if (s) setSessions(s)
  }

  const handleSubscribeToTrainer = async (trainer) => {
    if (!currentMember) {
      alert("Please ensure your member record is configured before subscribing.")
      return
    }

    setSubscribingId(trainer.id)

    const { error } = await supabase.from('trainer_subscriptions').insert([
      {
        trainer_id: trainer.id,
        member_id: currentMember.id,
        plan_type: 'Personal Coaching Monthly',
        price: trainer.monthly_plan_price || 120.00
      }
    ])

    if (!error) {
      setMsg(`Successfully subscribed to Coach ${trainer.full_name}!`)
      fetchData()
      setTimeout(() => setMsg(''), 4000)
    } else {
      alert(`Subscription Error: ${error.message}`)
    }

    setSubscribingId(null)
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    setLoading(true)

    const targetMember = selectedMember || currentMember?.id

    const { error } = await supabase.from('pt_sessions').insert([
      {
        trainer_id: selectedTrainer,
        member_id: targetMember,
        scheduled_at: new Date(sessionDate).toISOString(),
        notes: sessionNotes
      }
    ])

    if (!error) {
      setMsg('PT Session Successfully Scheduled!')
      setSessionNotes('')
      fetchData()
      setTimeout(() => setMsg(''), 3500)
    } else {
      alert(`Booking Error: ${error.message}`)
    }
    setLoading(false)
  }

  const markSessionComplete = async (sessionId) => {
    await supabase.from('pt_sessions').update({ status: 'completed' }).eq('id', sessionId)
    fetchData()
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* DIRECT MEMBER COACHING SUBSCRIPTION TILES */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Hire a Personal Trainer</h3>
            <p className="text-xs text-slate-400">Subscribe for custom workout plans & 1-on-1 coaching</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full py-4 text-center">No trainers available in roster.</p>
          ) : (
            trainers.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-white">{t.full_name}</h4>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      ${t.monthly_plan_price || 120}/mo
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-300 mt-0.5">{t.specialty || 'Pro Coach'}</p>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{t.bio || 'Dedicated elite fitness trainer specialized in strength and transformation.'}</p>
                </div>

                <button
                  onClick={() => handleSubscribeToTrainer(t)}
                  disabled={subscribingId === t.id}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-1"
                >
                  <Zap className="h-3.5 w-3.5 mr-1 text-amber-300" />
                  <span>{subscribingId === t.id ? 'Subscribing...' : 'Subscribe to Coach'}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOOK PT SESSION SCHEDULER */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Book PT Session</h3>
            <p className="text-xs text-slate-400">Schedule 1-on-1 coaching slots</p>
          </div>
        </div>

        <form onSubmit={handleBookSession} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Select Coach</label>
              <select
                required
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Personal Trainer --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Select Member</label>
              <select
                required={!currentMember}
                value={selectedMember || currentMember?.id || ''}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Session Date & Time</label>
              <input
                type="datetime-local"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Session Focus / Notes</label>
              <input
                type="text"
                placeholder="e.g. Hypertrophy - Leg Day & Squat Form Check"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            <span>{loading ? 'Booking Session...' : 'Confirm PT Appointment'}</span>
          </button>
        </form>
      </div>

      {/* SCHEDULED SESSIONS MATRIX */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-indigo-400" />
          <span>Scheduled PT Sessions Schedule</span>
        </h3>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No personal training sessions scheduled.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{s.members?.full_name}</span>
                    <span className="text-[10px] text-slate-400">with Coach</span>
                    <span className="text-xs font-bold text-indigo-400">{s.trainers?.full_name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{s.notes || 'General Fitness Workout'}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    📅 {new Date(s.scheduled_at).toLocaleString()} ({s.duration_minutes} mins)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {s.status === 'scheduled' ? (
                    <button
                      onClick={() => markSessionComplete(s.id)}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                    >
                      Complete Session
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Completed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}