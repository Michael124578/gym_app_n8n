import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { 
  CheckCircle, LogOut, ShieldCheck, UserPlus, Send, 
  X, Settings, Save, KeyRound, AlertCircle, Clock,
  Flame, Download, CalendarCheck, Users, Dumbbell, Plus, Trash2, Bell
} from 'lucide-react'
import { toPng } from 'html-to-image'

export default function MemberPortal({ session, onLogout }) {
  const [member, setMember] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [guestName, setGuestName] = useState('')
  const [generatedGuestPass, setGeneratedGuestPass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // Occupancy State
  const [activeOccupancy, setActiveOccupancy] = useState(0)
  const maxCapacity = 100

  // Workout Logger Form State
  const [splitType, setSplitType] = useState('Push')
  const [exerciseName, setExerciseName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [reps, setReps] = useState('')

  // Profile Edit Modal
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
    
    // Request & Dispatch Web Push Notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('IRON GYM Alert', { body: msg, icon: '/favicon.ico' })
    }
  }

  const showError = (msg) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 4000)
  }

  // Request Web Push Permission on Load
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

    // Realtime member changes
    const profileChannel = supabase
      .channel(`realtime-member-${member.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'members', filter: `id=eq.${member.id}` },
        (payload) => {
          setMember(payload.new)
          showToast(' Your membership pass or profile details were updated!')
        }
      )
      .subscribe()

    // Realtime workouts
    const workoutChannel = supabase
      .channel(`realtime-workouts-${member.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workouts', filter: `member_id=eq.${member.id}` },
        () => fetchWorkouts(member.id)
      )
      .subscribe()

    // Realtime checkins for occupancy
    const checkInChannel = supabase
      .channel('realtime-occupancy-member')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, () => {
        fetchOccupancy()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(workoutChannel)
      supabase.removeChannel(checkInChannel)
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
    }
    setLoading(false)
  }

  const fetchOccupancy = async () => {
    const ninetyMinsAgo = new Date(Date.now() - 90 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('check_ins')
      .select('id')
      .eq('access_granted', true)
      .is('checked_out_at', null)
      .gte('checked_in_at', ninetyMinsAgo)

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
    showToast('New PR/Workout logged successfully!')
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
    const checkInDates = new Set(
      checkIns.map(c => new Date(c.checked_in_at).toISOString().split('T')[0])
    )

    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const hasCheckedIn = checkInDates.has(dateStr)

      days.push(
        <div
          key={dateStr}
          title={`${dateStr}: ${hasCheckedIn ? 'Checked In' : 'No visit'}`}
          className={`h-7 w-7 rounded-lg flex items-center justify-center text-[9px] font-bold transition ${
            hasCheckedIn
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-600'
          }`}
        >
          {d.getDate()}
        </div>
      )
    }
    return days
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    let hasChanges = false

    if (editName.trim() && editName.trim() !== member.full_name) {
      const { error: nameError } = await supabase
        .from('members')
        .update({ full_name: editName.trim() })
        .eq('id', member.id)

      if (nameError) {
        showError(`Failed to update name: ${nameError.message}`)
        setIsSaving(false)
        return
      }
      setMember({ ...member, full_name: editName.trim() })
      hasChanges = true
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        showError('Password must be at least 6 characters.')
        setIsSaving(false)
        return
      }

      const { error: passError } = await supabase.auth.updateUser({ password: newPassword })

      if (passError) {
        showError(`Failed to update password: ${passError.message}`)
        setIsSaving(false)
        return
      }
      setNewPassword('')
      hasChanges = true
    }

    setIsSaving(false)
    setIsEditModalOpen(false)
    if (hasChanges) showToast('Profile & security updated successfully!')
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
      showToast(`Guest pass issued for ${data.guest_name}`)
    }
    setLoading(false)
  }

  if (loading && !member) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-sm font-medium animate-pulse">
        Loading member pass credentials...
      </div>
    )
  }

  if (!member) return null

  const streak = calculateStreak()
  const occupancyPercent = Math.min(100, Math.round((activeOccupancy / maxCapacity) * 100))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* FLOATING TOASTS */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 text-xs font-bold animate-bounce flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rose-400/30 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-200" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-black text-white tracking-tight">{member.full_name}</h2>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              {member.plan_name || 'Member'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">ID: {member.id.substring(0, 8)}...</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 px-4 py-2.5 rounded-xl transition-all"
          >
            <Settings className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onLogout}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/30 px-4 py-2.5 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* LIVE OCCUPANCY & STREAK BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Occupancy Card */}
        <div className="md:col-span-2 bg-slate-950 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Live Gym Capacity</h4>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">{activeOccupancy} / {maxCapacity} ({occupancyPercent}%)</span>
          </div>
          <div className="w-full bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercent > 80 ? 'bg-rose-500' : occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">Auto-updated via gate check-ins & 90m decay</p>
        </div>

        {/* Gym Streak */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-amber-400">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{streak} Days</p>
              <p className="text-xs text-slate-400 font-medium">Gym Streak 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* DIGITAL PASS CARD & GUEST GENERATOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div ref={cardRef} className="group relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 border border-slate-800/80 p-6 rounded-3xl shadow-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-extrabold text-indigo-400 tracking-widest uppercase">IRON GYM DIGITAL PASS</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {member.status}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{member.full_name}</p>
              <p className="text-xs text-indigo-300 font-semibold mt-1">{member.plan_name || 'Monthly Pass'}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>
              <button
                onClick={handleDownloadPass}
                className="mt-4 text-[10px] font-bold text-indigo-400 hover:text-white inline-flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>Save Image</span>
              </button>
            </div>

            <div className="bg-white p-2.5 rounded-2xl shadow-xl text-center cursor-pointer hover:scale-105 transition" onClick={() => setIsZoomed(true)}>
              <QRCodeSVG value={member.qr_code_token || member.id} size={100} bgColor="#ffffff" fgColor="#0f172a" level="H" />
              <span className="block text-[8px] font-bold text-slate-500 mt-1 uppercase">Tap to Zoom</span>
            </div>
          </div>
        </div>

        {/* GUEST PASS GENERATOR */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Generate 24-Hour Guest Pass</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Invite a workout partner. Valid for 1-time gate access.</p>

            <form onSubmit={handleGenerateGuestPass} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Guest Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
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

      {/* WORKOUT SPLIT & PR LOGGER SECTION */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Personal Best & Workout Logger</h3>
        </div>

        <form onSubmit={handleLogWorkout} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <input
            type="number"
            required
            placeholder="Weight (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Log Set</span>
          </button>
        </form>

        {/* WORKOUT PR LOG TABLE */}
        {workouts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-xl">
            No PRs logged yet. Start tracking your lifts above!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-900 text-slate-300 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Split</th>
                  <th className="p-3">Exercise</th>
                  <th className="p-3">Weight (kg)</th>
                  <th className="p-3">Logged Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workouts.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md font-bold">
                        {w.split_type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{w.exercise_name}</td>
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

      {/* 30-DAY ATTENDANCE HEATMAP */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">30-Day Attendance Grid</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-between">
          {render30DayHeatmap()}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-1 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-1" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN QR ZOOM MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setIsZoomed(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-slate-900 font-bold text-lg">{member.full_name}</h3>
            <div className="flex justify-center p-2">
              <QRCodeSVG value={member.qr_code_token || member.id} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>
            <p className="text-xs text-slate-500 font-semibold">Max Brightness • Hold directly to scanner laser</p>
          </div>
        </div>
      )}
    </div>
  )
}