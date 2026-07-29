import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, LogOut, ShieldCheck, UserPlus, Send, 
  X, Settings, Save, KeyRound, AlertCircle, Clock,
  Flame, Download, CalendarCheck, Users, Dumbbell, Plus, Trash2, Zap, Sparkles, FileText
} from 'lucide-react'
import { toPng } from 'html-to-image'

export default function MemberPortal({ session, onLogout }) {
  const [member, setMember] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [assignedRoutines, setAssignedRoutines] = useState([])
  const [guestName, setGuestName] = useState('')
  const [generatedGuestPass, setGeneratedGuestPass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // Live Occupancy
  const [activeOccupancy, setActiveOccupancy] = useState(0)
  const maxCapacity = 100

  // Workout Logger Form State
  const [splitType, setSplitType] = useState('Push')
  const [exerciseName, setExerciseName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [reps, setReps] = useState('')

  // Edit Profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Toasts
  const [toastMessage, setToastMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const cardRef = useRef(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('IRON GYM', { body: msg })
    }
  }

  const showError = (msg) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 4000)
  }

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      fetchMemberData(session.user.email)
      fetchOccupancy()
    }
  }, [session])

  useEffect(() => {
    if (!member?.id) return

    const profileChannel = supabase
      .channel(`realtime-member-${member.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'members', filter: `id=eq.${member.id}` }, (payload) => {
        setMember(payload.new)
        showToast('Membership pass updated!')
      })
      .subscribe()

    const workoutChannel = supabase
      .channel(`realtime-workouts-${member.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `member_id=eq.${member.id}` }, () => {
        fetchWorkouts(member.id)
      })
      .subscribe()

    const planChannel = supabase
      .channel(`realtime-assigned-plans-${member.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainer_workout_plans', filter: `member_id=eq.${member.id}` }, () => {
        fetchAssignedRoutines(member.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(workoutChannel)
      supabase.removeChannel(planChannel)
    }
  }, [member?.id])

  const fetchMemberData = async (userEmail) => {
    setLoading(true)
    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .eq('email', userEmail.toLowerCase())
      .maybeSingle()

    if (memberData) {
      setMember(memberData)
      setEditName(memberData.full_name)

      const { data: checkInData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('member_id', memberData.id)
        .order('checked_in_at', { ascending: false })

      if (checkInData) setCheckIns(checkInData)
      fetchWorkouts(memberData.id)
      fetchAssignedRoutines(memberData.id)
    }
    setLoading(false)
  }

  const fetchOccupancy = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select('id')
      .eq('access_granted', true)
      .is('checked_out_at', null)

    if (data) setActiveOccupancy(data.length)
  }

  const fetchWorkouts = async (memberId) => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('member_id', memberId)
      .order('logged_at', { ascending: false })

    if (data) setWorkouts(data)
  }

  const fetchAssignedRoutines = async (memberId) => {
    const { data } = await supabase
      .from('trainer_workout_plans')
      .select('*, trainers(full_name, specialty)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (data) setAssignedRoutines(data)
  }

  const handleLogWorkout = async (e) => {
    e.preventDefault()
    if (!exerciseName.trim() || !weightKg) return

    const { error } = await supabase.from('workouts').insert([{
      member_id: member.id,
      split_type: splitType,
      exercise_name: exerciseName.trim(),
      weight_kg: parseFloat(weightKg),
      reps: parseInt(reps || '1')
    }])

    if (error) {
      showError(`Workout Log Error: ${error.message}`)
      return
    }

    setExerciseName('')
    setWeightKg('')
    setReps('')
    showToast('⚡ Set logged successfully!')
    fetchWorkouts(member.id)
  }

  const handleDeleteWorkout = async (id) => {
    await supabase.from('workouts').delete().eq('id', id)
    fetchWorkouts(member.id)
  }

  const calculateStreak = () => {
    if (!checkIns.length) return 0
    const dates = [...new Set(checkIns.map(c => new Date(c.checked_in_at).toDateString()))]
    let streak = 0
    let today = new Date()

    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(dates[i])
      const diffDays = Math.floor((today - checkDate) / (1000 * 60 * 60 * 24))
      if (diffDays <= streak + 1) streak++
      else break
    }
    return streak
  }

  const handleDownloadPass = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true })
      const link = document.createElement('a')
      link.download = `${member.full_name.replace(/\s+/g, '_')}_IronGym_Pass.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      showError('Failed to export pass image.')
    }
  }

  const render30DayHeatmap = () => {
    const days = []
    const checkInDates = new Set(checkIns.map(c => new Date(c.checked_in_at).toISOString().split('T')[0]))

    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const hasCheckedIn = checkInDates.has(dateStr)

      days.push(
        <motion.div
          key={dateStr}
          whileHover={{ scale: 1.2 }}
          title={`${dateStr}: ${hasCheckedIn ? 'Checked In' : 'No visit'}`}
          className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition ${
            hasCheckedIn
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/30'
              : 'bg-slate-900 border border-slate-800/80 text-slate-600'
          }`}
        >
          {d.getDate()}
        </motion.div>
      )
    }
    return days
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    if (editName.trim() && editName.trim() !== member.full_name) {
      await supabase.from('members').update({ full_name: editName.trim() }).eq('id', member.id)
      setMember({ ...member, full_name: editName.trim() })
    }

    if (newPassword) {
      await supabase.auth.updateUser({ password: newPassword })
      setNewPassword('')
    }

    setIsSaving(false)
    setIsEditModalOpen(false)
    showToast('Profile updated!')
  }

  const handleGenerateGuestPass = async (e) => {
    e.preventDefault()
    if (!guestName.trim() || !member) return

    setLoading(true)
    const { data } = await supabase
      .from('guest_passes')
      .insert([{ host_member_id: member.id, guest_name: guestName.trim() }])
      .select()
      .maybeSingle()

    if (data) {
      setGeneratedGuestPass(data)
      setGuestName('')
      showToast(`Guest pass created for ${data.guest_name}`)
    }
    setLoading(false)
  }

  if (loading && !member) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-sm font-mono animate-pulse w-full">
        Initializing Member Terminal...
      </div>
    )
  }

  if (!member) return null

  const streak = calculateStreak()
  const occupancyPercent = Math.min(100, Math.round((activeOccupancy / maxCapacity) * 100))

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* TOAST ALERTS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 text-xs font-bold flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMBER HEADER */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{member.full_name}</h2>
            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase">
              {member.plan_name || 'Member Pass'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">TOKEN ID: {member.id}</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 px-4 py-3 rounded-2xl transition"
          >
            <Settings className="h-4 w-4" />
            <span>Edit Credentials</span>
          </button>

          <button
            onClick={onLogout}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/30 px-4 py-3 rounded-2xl transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* METRICS & LIVE CAPACITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="md:col-span-2 glass-panel p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">LIVE GYM OCCUPANCY</h4>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">{activeOccupancy} / {maxCapacity} ({occupancyPercent}%)</span>
          </div>

          <div className="w-full bg-slate-950 border border-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercent}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${
                occupancyPercent > 80 ? 'bg-rose-500' : occupancyPercent > 50 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">Real-time gate entry and exit synchronization</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-amber-400">
              <Flame className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{streak}</p>
              <p className="text-xs text-slate-400 font-medium">Day Workout Streak 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOLOGRAPHIC DIGITAL PASS & GUEST GENERATOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div ref={cardRef} className="holo-card p-6 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden w-full">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <span className="text-xs font-black tracking-widest text-indigo-300 uppercase">IRON GYM DIGITAL PASS</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {member.status}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-white uppercase tracking-tight">{member.full_name}</p>
              <p className="text-xs text-indigo-300 font-semibold mt-1">{member.plan_name || 'Monthly Pass'}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>
              <button
                onClick={handleDownloadPass}
                className="mt-4 text-[10px] font-bold text-indigo-400 hover:text-white inline-flex items-center space-x-1"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save Pass PNG</span>
              </button>
            </div>

            <motion.div 
              whileHover={{ scale: 1.08 }} 
              onClick={() => setIsZoomed(true)}
              className="bg-white p-3 rounded-2xl shadow-2xl cursor-pointer"
            >
              <QRCodeSVG value={member.qr_code_token || member.id} size={100} bgColor="#ffffff" fgColor="#0f172a" level="H" />
              <span className="block text-[8px] font-bold text-slate-500 mt-1 uppercase text-center">Tap to Zoom</span>
            </motion.div>
          </div>
        </div>

        {/* GUEST PASS GENERATOR */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase">Issue Guest Access Pass</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Grant a 24-hour single-use QR pass to a workout partner.</p>

            <form onSubmit={handleGenerateGuestPass} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Guest Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center space-x-1 shadow-lg shadow-indigo-600/30"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                <span>Issue Guest Pass</span>
              </button>
            </form>
          </div>

          {generatedGuestPass && (
            <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-200">Guest: {generatedGuestPass.guest_name}</p>
                <p className="text-[10px] text-slate-400 font-mono">Token: {generatedGuestPass.pass_token.substring(0, 8)}...</p>
              </div>
              <div className="bg-white p-1 rounded-lg">
                <QRCodeSVG value={generatedGuestPass.pass_token} size={48} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNED COACH WORKOUT ROUTINES */}
      {assignedRoutines.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 w-full">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-black text-white uppercase">Assigned Programs by Personal Trainer</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignedRoutines.map((routine) => (
              <div key={routine.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white">{routine.title}</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {routine.split_day}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300 font-bold mt-1">
                    {routine.exercise_name} — {routine.target_sets} sets × {routine.target_reps} reps @ RPE {routine.target_rpe}
                  </p>
                  {routine.notes && <p className="text-[11px] text-slate-400 mt-1">Cue: {routine.notes}</p>}
                </div>
                <p className="text-[10px] font-mono text-slate-500">Coach: {routine.trainers?.full_name || 'Personal Trainer'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKOUT SPLIT & PR TRACKER */}
      <div className="glass-panel p-6 rounded-3xl space-y-6 w-full">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-black text-white uppercase">Personal Record (PR) Tracker</h3>
        </div>

        <form onSubmit={handleLogWorkout} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Push">Push</option>
            <option value="Pull">Pull</option>
            <option value="Legs">Legs</option>
            <option value="Cardio">Cardio</option>
            <option value="Full Body">Full Body</option>
          </select>

          <input
            type="text"
            required
            placeholder="Exercise (e.g. Bench Press)"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <input
            type="number"
            required
            placeholder="Weight (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="h-4 w-4" />
            <span>Log PR</span>
          </button>
        </form>

        {workouts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-2xl font-mono">
            No personal best sets logged yet. Log your top lift above!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Split</th>
                  <th className="p-3">Exercise</th>
                  <th className="p-3">Top Weight</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                        {w.split_type}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{w.exercise_name}</td>
                    <td className="p-3 font-mono text-emerald-400 font-bold">{w.weight_kg} kg</td>
                    <td className="p-3 font-mono text-slate-500">{new Date(w.logged_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteWorkout(w.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 30-DAY ATTENDANCE GRID */}
      <div className="glass-panel p-6 rounded-3xl w-full">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase">30-Day Check-In Heatmap</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-between">
          {render30DayHeatmap()}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-600/20 border border-indigo-500/30 p-2.5 rounded-xl text-indigo-400">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Profile & Credentials</h3>
                <p className="text-xs text-slate-400">Update display name and password</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password (Optional)</label>
                <div className="relative">
                  <input
                    type="password"
                    minLength={6}
                    placeholder="Leave blank to keep current password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <KeyRound className="absolute right-3.5 top-2.5 h-4 w-4 text-slate-600" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1"
                >
                  <Save className="h-4 w-4 mr-1" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN QR MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setIsZoomed(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-slate-900 font-bold text-lg uppercase">{member.full_name}</h3>
            <div className="flex justify-center p-2">
              <QRCodeSVG value={member.qr_code_token || member.id} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hold directly to scanner</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}