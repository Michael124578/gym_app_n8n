import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Award, Zap, CheckCircle2, UserCheck, Calendar, PlusCircle, Trash2, UserPlus, Sparkles, Users, Clock, XCircle } from 'lucide-react'
import AddTrainerModal from './AddTrainerModal'

export default function TrainerManagement({ session, userRole }) {
  const [trainers, setTrainers] = useState([])
  const [members, setMembers] = useState([])
  const [sessions, setSessions] = useState([])
  const [memberSubscriptions, setMemberSubscriptions] = useState([])
  const [allSubscriptionsList, setAllSubscriptionsList] = useState([])
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
    // 1. Fetch Trainers
    const { data: t } = await supabase.from('trainers').select('*').order('created_at', { ascending: false })
    if (t) setTrainers(t)

    // 2. Fetch Members
    const { data: m } = await supabase.from('members').select('id, full_name, email, auth_id')
    if (m) setMembers(m)

    // 3. Match Current Logged-in Member Profile
    if (session?.user && userRole === 'member') {
      const match = m?.find(mem => mem.auth_id === session.user.id || mem.email === session.user.email)
      if (match) {
        setCurrentMember(match)
        
        // Fetch all active/pending requests for this member
        const { data: memberSubs } = await supabase
          .from('trainer_subscriptions')
          .select('*')
          .eq('member_id', match.id)
          .in('status', ['pending', 'active'])

        if (memberSubs) setMemberSubscriptions(memberSubs)
      }
    }

    // 4. Fetch All Subscriptions for Admin Audit
    if (userRole === 'admin') {
      const { data: allSubs } = await supabase
        .from('trainer_subscriptions')
        .select('*, trainers(full_name, specialty), members(full_name, email)')
        .order('created_at', { ascending: false })

      if (allSubs) setAllSubscriptionsList(allSubs)
    }

    // 5. Fetch PT Sessions (Members only)
    if (userRole === 'member') {
      const { data: s } = await supabase
        .from('pt_sessions')
        .select('*, trainers(full_name, specialty), members(full_name)')
        .order('scheduled_at', { ascending: true })
      if (s) setSessions(s)
    }
  }, [session, userRole])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Member sends a hiring request (status = 'pending')
  const handleSubscribeToTrainer = async (trainer) => {
    if (userRole === 'admin' || userRole === 'trainer') {
      alert("Staff and Coaches cannot request personal trainers.")
      return
    }

    if (!currentMember) {
      alert("Please ensure your member profile is registered before requesting a coach.")
      return
    }

    setSubscribingId(trainer.id)

    const { error } = await supabase.from('trainer_subscriptions').insert([
      {
        trainer_id: trainer.id,
        member_id: currentMember.id,
        plan_type: 'Personal Coaching Monthly',
        price: trainer.monthly_plan_price || 120.00,
        status: 'pending' // Creates a pending request
      }
    ])

    if (!error) {
      playSuccessSound()
      setMsg(`⚡ Request sent to Coach ${trainer.full_name}! Waiting for coach approval.`)
      fetchData()
      setTimeout(() => setMsg(''), 4500)
    } else {
      alert(`Request Error: ${error.message}`)
    }

    setSubscribingId(null)
  }

  // Member withdraws hiring request before acceptance
  const handleWithdrawRequest = async (subscriptionId) => {
    const { error } = await supabase
      .from('trainer_subscriptions')
      .update({ status: 'canceled' })
      .eq('id', subscriptionId)

    if (!error) {
      setMsg('Hiring request withdrawn successfully.')
      fetchData()
      setTimeout(() => setMsg(''), 3000)
    } else {
      alert(`Withdraw Error: ${error.message}`)
    }
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    setLoading(true)

    const targetMember = selectedMember || currentMember?.id

    if (!targetMember) {
      alert('Please select a valid member for this session.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('pt_sessions').insert([
      {
        trainer_id: selectedTrainer,
        member_id: targetMember,
        scheduled_at: new Date(sessionDate).toISOString(),
        notes: sessionNotes
      }
    ])

    if (!error) {
      playSuccessSound()
      setMsg('PT Appointment scheduled successfully!')
      setSessionNotes('')
      fetchData()
      setTimeout(() => setMsg(''), 3500)
    } else {
      alert(`Booking Error: ${error.message}`)
    }
    setLoading(false)
  }

  const handleDeleteTrainer = async (trainer) => {
    if (!window.confirm(`Delete Coach ${trainer.full_name}?`)) return
    await supabase.from('trainers').delete().eq('id', trainer.id)
    fetchData()
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

      {/* COACHING MARKETPLACE & ROSTER */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-violet-600/20 border border-violet-500/30 text-violet-400 rounded-2xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {userRole === 'admin' ? 'Coaches & Trainers Directory' : 'Choose Your Personal Coach'}
              </h3>
              <p className="text-xs text-slate-400">
                {userRole === 'admin' ? 'Manage gym personal trainers & view active subscriptions' : 'Send a hiring request to a trainer for custom programs & 1-on-1 coaching'}
              </p>
            </div>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={() => setIsAddTrainerModalOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-amber-600/20"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register New Trainer</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full py-8 text-center border border-dashed border-slate-800 rounded-2xl font-mono">
              No personal trainers currently listed.
            </p>
          ) : (
            trainers.map((t) => {
              const existingSub = memberSubscriptions.find(s => s.trainer_id === t.id)
              const isPending = existingSub?.status === 'pending'
              const isActive = existingSub?.status === 'active'

              return (
                <div key={t.id} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition shadow-lg relative group">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-black text-white">{t.full_name}</h4>
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        ${t.monthly_plan_price || 120}/mo
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-300 mt-0.5">{t.specialty || 'Pro Coach'}</p>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{t.bio || 'Dedicated certified fitness coach specialized in athletic strength and transformation.'}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* MEMBER REQUEST & WITHDRAW OPTIONS */}
                    {userRole === 'member' && (
                      <div className="w-full flex flex-col space-y-2">
                        {isPending ? (
                          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl">
                            <span className="text-[10px] font-bold text-amber-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1 animate-spin" />
                              <span>Request Pending</span>
                            </span>
                            <button
                              onClick={() => handleWithdrawRequest(existingSub.id)}
                              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-bold rounded-lg transition"
                            >
                              Withdraw
                            </button>
                          </div>
                        ) : isActive ? (
                          <div className="py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl text-center flex items-center justify-center space-x-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Active Coach</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSubscribeToTrainer(t)}
                            disabled={subscribingId === t.id}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center justify-center space-x-1 shadow-indigo-600/20"
                          >
                            <Zap className="h-3.5 w-3.5 mr-1 text-amber-300" />
                            <span>{subscribingId === t.id ? 'Sending...' : 'Send Hire Request'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* ADMIN REMOVE BUTTON */}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDeleteTrainer(t)}
                        className="p-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl transition w-full flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs font-bold">Remove Trainer</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ADMIN ONLY: ALL COACH SUBSCRIPTIONS AUDIT PANEL */}
      {userRole === 'admin' && (
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Active Coach Subscriptions Roster</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total Requests & Subscriptions: {allSubscriptionsList.length}</span>
          </div>

          <div className="space-y-3">
            {allSubscriptionsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-2xl font-mono">
                No active member-to-coach subscriptions found in system.
              </p>
            ) : (
              allSubscriptionsList.map((sub) => (
                <div key={sub.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">Member: {sub.members?.full_name}</span>
                      <span className="text-[10px] text-slate-400">requested</span>
                      <span className="text-xs font-bold text-indigo-400">Coach: {sub.trainers?.full_name}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">
                      Email: {sub.members?.email} | Plan: {sub.plan_type}
                    </p>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                      sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      sub.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {sub.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      ${sub.price || 120}/mo
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MEMBER ONLY: SCHEDULE 1-ON-1 PT SESSION */}
      {userRole === 'member' && (
        <>
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Schedule 1-on-1 PT Session</h3>
                <p className="text-xs text-slate-400">Book personal training slots with your coach</p>
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
                    placeholder="e.g. Squat Form Analysis & Heavy Triples"
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
                <span>{loading ? 'Booking Session...' : 'Confirm Appointment'}</span>
              </button>
            </form>
          </div>

          {/* SCHEDULED SESSIONS HISTORY */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-tight mb-4 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>Scheduled PT Sessions History</span>
            </h3>

            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                  No personal training sessions scheduled.
                </p>
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
                        📅 {new Date(s.scheduled_at).toLocaleString()} ({s.duration_minutes || 60} mins)
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
        </>
      )}

      {/* ADMIN REGISTRATION MODAL */}
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