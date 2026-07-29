import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { UserCheck, Calendar, Award, PlusCircle, CheckCircle2, Zap, Sparkles, Trash2, UserPlus } from 'lucide-react'
import AddTrainerModal from './AddTrainerModal'

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
  const [isAddTrainerModalOpen, setIsAddTrainerModalOpen] = useState(false)
  const [msg, setMsg] = useState('')

  const playSuccessSound = () => {
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
      console.log('Audio blocked')
    }
  }

  const fetchData = useCallback(async () => {
    const { data: t } = await supabase.from('trainers').select('*').order('created_at', { ascending: false })
    if (t) setTrainers(t)

    const { data: m } = await supabase.from('members').select('id, full_name, email, auth_id')
    if (m) setMembers(m)

    if (session?.user) {
      const match = m?.find(mem => mem.auth_id === session.user.id || mem.email === session.user.email)
      if (match) setCurrentMember(match)
    }

    const { data: s } = await supabase
      .from('pt_sessions')
      .select('*, trainers(full_name, specialty), members(full_name)')
      .order('scheduled_at', { ascending: true })
    if (s) setSessions(s)
  }, [session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteTrainer = async (trainer) => {
    if (!window.confirm(`Delete Coach ${trainer.full_name}?`)) return

    await supabase.from('trainers').delete().eq('id', trainer.id)
    setMsg(`Trainer ${trainer.full_name} removed.`)
    fetchData()
    setTimeout(() => setMsg(''), 3000)
  }

  const handleSubscribeToTrainer = async (trainer) => {
    if (!currentMember) {
      alert("Please ensure your member profile is fully registered before subscribing to a coach.")
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
      playSuccessSound()
      setMsg(`⚡ Subscription confirmed! You are now training under Coach ${trainer.full_name}.`)
      fetchData()
      setTimeout(() => setMsg(''), 4500)
    } else {
      alert(`Subscription Error: ${error.message}`)
    }

    setSubscribingId(null)
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    setLoading(true)

    const selectedTime = new Date(sessionDate)
    const startTimeWindow = new Date(selectedTime.getTime() - 45 * 60 * 1000).toISOString()
    const endTimeWindow = new Date(selectedTime.getTime() + 45 * 60 * 1000).toISOString()

    // Check for existing active bookings within 45 minutes
    const { data: conflict } = await supabase
        .from('pt_sessions')
        .select('id')
        .eq('trainer_id', selectedTrainer)
        .neq('status', 'canceled')
        .gte('scheduled_at', startTimeWindow)
        .lte('scheduled_at', endTimeWindow)
        .maybeSingle()

    if (conflict) {
        alert('Booking Conflict: This trainer already has an active session within this time window.')
        setLoading(false)
        return
    }

    // Proceed with session insertion...
    const { error } = await supabase.from('pt_sessions').insert([
        {
        trainer_id: selectedTrainer,
        member_id: selectedMember || currentMember?.id,
        scheduled_at: selectedTime.toISOString(),
        notes: sessionNotes
        }
    ])

    if (!error) {
        setMsg('PT Appointment scheduled successfully!')
        fetchData()
    }
    setLoading(false)
    }

  const markSessionComplete = async (sessionId) => {
    await supabase.from('pt_sessions').update({ status: 'completed' }).eq('id', sessionId)
    playSuccessSound()
    fetchData()
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center space-x-3 text-xs font-bold animate-bounce shadow-xl">
          <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* COACHING MARKETPLACE & ADMIN REGISTRATION TILES */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-2xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">Personal Trainers Roster</h3>
              <p className="text-xs text-slate-400">Hire a coach or register new trainers</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddTrainerModalOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-amber-600/20"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New Trainer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full py-8 text-center border border-dashed border-slate-800 rounded-2xl">
              No personal trainers currently listed. Click "Add New Trainer" to register one!
            </p>
          ) : (
            trainers.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition shadow-lg relative group">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black text-white">{t.full_name}</h4>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      ${t.monthly_plan_price || 120}/mo
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-300 mt-0.5">{t.specialty || 'Pro Coach'}</p>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{t.bio || 'Dedicated elite fitness trainer specialized in strength and transformation.'}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSubscribeToTrainer(t)}
                    disabled={subscribingId === t.id}
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-1"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1 text-amber-300" />
                    <span>{subscribingId === t.id ? 'Subscribing...' : 'Hire & Subscribe'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTrainer(t)}
                    className="p-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition"
                    title="Remove Trainer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOOK PT SESSION APPOINTMENT */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-tight">Schedule PT Appointment</h3>
            <p className="text-xs text-slate-400">Book 1-on-1 coaching slots</p>
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
                <option value="">-- Choose Coach --</option>
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
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            <span>{loading ? 'Booking Session...' : 'Confirm PT Appointment'}</span>
          </button>
        </form>
      </div>

      <AddTrainerModal
        isOpen={isAddTrainerModalOpen}
        onClose={() => setIsAddTrainerModalOpen(false)}
        onTrainerAdded={() => {
          setMsg('New trainer account created!')
          fetchData()
          setTimeout(() => setMsg(''), 3000)
        }}
      />
    </div>
  )
}