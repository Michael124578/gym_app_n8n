import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { UserCheck, Calendar, Clock, Award, PlusCircle, CheckCircle2 } from 'lucide-react'

export default function TrainerManagement() {
  const [trainers, setTrainers] = useState([])
  const [members, setMembers] = useState([])
  const [sessions, setSessions] = useState([])
  
  const [selectedTrainer, setSelectedTrainer] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: t } = await supabase.from('trainers').select('*')
    if (t) setTrainers(t)

    const { data: m } = await supabase.from('members').select('id, full_name, email')
    if (m) setMembers(m)

    const { data: s } = await supabase
      .from('pt_sessions')
      .select('*, trainers(full_name, specialty), members(full_name)')
      .order('scheduled_at', { ascending: true })
    if (s) setSessions(s)
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('pt_sessions').insert([
      {
        trainer_id: selectedTrainer,
        member_id: selectedMember,
        scheduled_at: new Date(sessionDate).toISOString(),
        notes: sessionNotes
      }
    ])

    if (!error) {
      setMsg('PT Session Successfully Scheduled!')
      setSessionNotes('')
      fetchData()
      setTimeout(() => setMsg(''), 3500)
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

      {/* BOOK PT SESSION */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Book Personal Training Session</h3>
            <p className="text-xs text-slate-400">Assign trainers to members and schedule coaching slots</p>
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
                    {t.full_name} ({t.specialty}) - ${t.hourly_rate}/hr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Select Member</label>
              <select
                required
                value={selectedMember}
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