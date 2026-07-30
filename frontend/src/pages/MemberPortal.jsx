import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, Sparkles, Flame, Users, X, KeyRound, Save, FileText } from 'lucide-react'
import { toPng } from 'html-to-image'
import { formatLocalDate } from '../utils/dateUtils'

import MemberPassCard from '../components/MemberPassCard'
import GuestPassGenerator from '../components/GuestPassGenerator'
import WorkoutPRTracker from '../components/WorkoutPRTracker'
import MemberAttendanceCalendar from '../components/MemberAttendanceCalendar'

export default function MemberPortal({ session, onLogout }) {
  const [member, setMember] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [workouts, setWorkouts] = useState([])
  const [assignedRoutines, setAssignedRoutines] = useState([])
  const [guestName, setGuestName] = useState('')
  const [generatedGuestPass, setGeneratedGuestPass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  const [activeOccupancy, setActiveOccupancy] = useState(0)
  const maxCapacity = 100

  const [splitType, setSplitType] = useState('Push')
  const [exerciseName, setExerciseName] = useState('')
  const [weightKg, setWeightKg] = useState('')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  const [toastMessage, setToastMessage] = useState(null)
  const cardRef = useRef(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchMemberData(session.user.email)
      fetchOccupancy()
    }
  }, [session])

  useEffect(() => {
    if (!member?.id) return

    const channel = supabase
      .channel(`realtime-member-portal-${member.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'members', filter: `id=eq.${member.id}` }, (payload) => {
        setMember(payload.new)
        showToast('Membership pass updated!')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts', filter: `member_id=eq.${member.id}` }, () => {
        fetchWorkouts(member.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trainer_workout_plans', filter: `member_id=eq.${member.id}` }, () => {
        fetchAssignedRoutines(member.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
      reps: 1
    }])

    if (!error) {
      setExerciseName('')
      setWeightKg('')
      showToast('⚡ Set logged successfully!')
      fetchWorkouts(member.id)
    }
  }

  const handleDeleteWorkout = async (id) => {
    await supabase.from('workouts').delete().eq('id', id)
    fetchWorkouts(member.id)
  }

  const calculateStreak = () => {
    if (!checkIns.length) return 0
    const dates = [...new Set(checkIns.map(c => formatLocalDate(c.checked_in_at)))]
    let streak = 0
    let today = new Date()

    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === formatLocalDate(today)) {
        streak++
        today.setDate(today.getDate() - 1)
      } else {
        break
      }
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
      console.error(err)
    }
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

  if (loading && !member) return <div className="p-8 text-center text-slate-500 font-mono">Initializing Terminal...</div>
  if (!member) return null

  const streak = calculateStreak()
  const occupancyPercent = Math.min(100, Math.round((activeOccupancy / maxCapacity) * 100))

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto space-y-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2">
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

      {/* OCCUPANCY & STREAK METRICS */}
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

      {/* PASS & GUEST MODULAR CALLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <MemberPassCard 
          member={member} 
          cardRef={cardRef} 
          onDownload={handleDownloadPass} 
          onZoom={() => setIsZoomed(true)} 
        />
        <GuestPassGenerator 
          guestName={guestName} 
          setGuestName={setGuestName} 
          onGenerate={handleGenerateGuestPass} 
          generatedGuestPass={generatedGuestPass} 
          loading={loading} 
        />
      </div>

      {/* ASSIGNED COACH ROUTINES */}
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

      {/* WORKOUT PR TRACKER */}
      <WorkoutPRTracker
        splitType={splitType}
        setSplitType={setSplitType}
        exerciseName={exerciseName}
        setExerciseName={setExerciseName}
        weightKg={weightKg}
        setWeightKg={setWeightKg}
        onLogWorkout={handleLogWorkout}
        onDeleteWorkout={handleDeleteWorkout}
        workouts={workouts}
      />

      {/* ATTENDANCE HEATMAP */}
      <MemberAttendanceCalendar member={member} checkIns={checkIns} />

      {/* EDIT CREDENTIALS MODAL */}
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
                <h3 className="text-lg font-bold text-white">Edit Profile Credentials</h3>
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