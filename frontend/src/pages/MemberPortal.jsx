import React, { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, LogOut, Flame, Users, X, KeyRound, Save, 
  FileText, Target, Dumbbell, Scale, Droplet, Headphones, 
  ArrowRight, Play, Activity, Radio, Heart, MessageSquare, 
  Receipt, Layers, Utensils, Award, ShieldCheck, CheckCircle2,
  TrendingUp, Calendar, Zap
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { formatLocalDate } from '../utils/dateUtils'

import MembershipCard from '../components/MembershipCard'
import GuestPassGenerator from '../components/GuestPassGenerator'
import MemberAttendanceCalendar from '../components/MemberAttendanceCalendar'

function WorkoutPRTracker({
  splitType,
  setSplitType,
  exerciseName,
  setExerciseName,
  weightKg,
  setWeightKg,
  onLogWorkout,
  onDeleteWorkout,
  workouts = []
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl text-amber-400">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Personal Records & Strength Vault</h3>
            <p className="text-xs text-slate-400">Log hypertrophy PRs, 1RM milestones, and track session volume load.</p>
          </div>
        </div>

        {/* SPLIT TYPE SELECTOR PILLS */}
        <div className="flex space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {['Push', 'Pull', 'Legs', 'Full Body'].map((split) => (
            <button
              key={split}
              type="button"
              onClick={() => setSplitType(split)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                splitType === split ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {split}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK LOG FORM */}
      <form onSubmit={onLogWorkout} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          required
          placeholder="Exercise (e.g. Incline DB Bench)"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
        />
        <input
          type="number"
          required
          step="0.5"
          placeholder="Weight (kg)"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
        >
          <Dumbbell className="h-4 w-4" />
          <span>Record PR Milestone</span>
        </button>
      </form>

      {/* RECENT LOGGED PRs LIST */}
      {workouts.length > 0 ? (
        <div className="space-y-2 pt-2">
          {workouts.slice(0, 5).map((w) => (
            <div key={w.id} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-indigo-300 border border-slate-700">
                  {w.split_type || splitType}
                </span>
                <span className="font-bold text-white">{w.exercise_name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-amber-400 font-extrabold text-sm">{w.weight_kg} kg</span>
                <button
                  type="button"
                  onClick={() => onDeleteWorkout(w.id)}
                  className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 font-mono italic text-center py-2">
          No personal records logged yet. Use the form above to record your top lifts!
        </p>
      )}
    </div>
  )
}

export default function MemberPortal({ session, onLogout, onNavigateTab }) {
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

  const handleDeleteWorkout = async (workoutId) => {
    await supabase.from('workouts').delete().eq('id', workoutId)
    showToast('Logged set removed')
    fetchWorkouts(member.id)
  }

  const calculateStreak = () => {
    if (!checkIns.length) return 0
    const today = new Date().toDateString()
    const lastCheckIn = new Date(checkIns[0].checked_in_at).toDateString()

    let streakCount = 1
    for (let i = 1; i < checkIns.length; i++) {
      const prevDate = new Date(checkIns[i - 1].checked_in_at)
      const currDate = new Date(checkIns[i].checked_in_at)
      const diffTime = Math.abs(prevDate - currDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        streakCount++
      } else if (diffDays > 1) {
        break
      }
    }
    return streakCount
  }

  const handleDownloadPass = async () => {
    if (cardRef.current) {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 })
      const link = document.createElement('a')
      link.download = `IronGym-Pass-${member.full_name}.png`
      link.href = dataUrl
      link.click()
      showToast('Pass image downloaded!')
    }
  }

  const handleGenerateGuestPass = async (e) => {
    e.preventDefault()
    if (!guestName.trim() || !member) return
    setLoading(true)

    const qrToken = `GUEST-${member.id.substring(0, 5)}-${Date.now()}`
    const { data, error } = await supabase
      .from('guest_passes')
      .insert([{
        member_id: member.id,
        guest_name: guestName.trim(),
        qr_code_token: qrToken,
        status: 'active'
      }])
      .select()
      .single()

    if (!error && data) {
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

  if (loading && !member) return <div className="p-12 text-center text-slate-500 font-mono">INITIALIZING ATHLETE PORTAL...</div>
  if (!member) return null

  const streak = calculateStreak()
  const occupancyPercent = Math.min(100, Math.round((activeOccupancy / maxCapacity) * 100))

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2">
            <Award className="h-4 w-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEMBER EXECUTIVE HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{member.full_name}</h2>
            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase">
              {member.plan_name || 'Annual Titan Pass'}
            </span>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              {member.status || 'Active'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {member.email} • Member ID: <span className="text-slate-300 font-bold">{member.id?.substring(0, 8).toUpperCase()}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto relative z-10">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-3 rounded-2xl transition cursor-pointer"
          >
            <Settings className="h-4 w-4 text-indigo-400" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/30 px-4 py-3 rounded-2xl transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Portal</span>
          </button>
        </div>
      </div>

      {/* OCCUPANCY & STREAK METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div 
          onClick={() => onNavigateTab && onNavigateTab('occupancy')}
          className="md:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition group shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider group-hover:text-indigo-300 transition">
                LIVE FLOOR OCCUPANCY • CLICK FOR HEATMAP
              </h4>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">{activeOccupancy} / {maxCapacity} ({occupancyPercent}%)</span>
          </div>

          <div className="w-full bg-slate-950 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercent}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${
                occupancyPercent > 80 ? 'bg-rose-500' : occupancyPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
              }`}
            />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-amber-400">
              <Flame className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <p className="text-3xl font-black text-white font-mono">{streak}</p>
              <p className="text-xs text-slate-400 font-medium">Day Workout Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK-LAUNCH WORKOUT ECOSYSTEM CARDS */}
      {onNavigateTab && (
        <div className="w-full space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block px-1">
            ⚡ Quick Launch Terminal
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('workout_tracker')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition">
                <Flame className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Live Logger</span>
              <span className="text-[10px] font-mono text-slate-500">Sets & 1RM</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('warmup_calc')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 group-hover:scale-110 transition">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Warmup Ramp</span>
              <span className="text-[10px] font-mono text-slate-500">Barbell Plates</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('mobility')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 group-hover:scale-110 transition">
                <Heart className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Mobility & Prep</span>
              <span className="text-[10px] font-mono text-slate-500">Timer Flows</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('nutrition')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition">
                <Utensils className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Food Diary</span>
              <span className="text-[10px] font-mono text-slate-500">Meals & Macros</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('coaching_chat')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 group-hover:scale-110 transition">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Coach Chat</span>
              <span className="text-[10px] font-mono text-slate-500">1-on-1 Messages</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('exercises')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Exercise Atlas</span>
              <span className="text-[10px] font-mono text-slate-500">Form & Anatomy</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('ai_generator')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Program Architect</span>
              <span className="text-[10px] font-mono text-slate-500">Periodization</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('body_vault')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition">
                <Scale className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Body Vault</span>
              <span className="text-[10px] font-mono text-slate-500">Metrics & Slider</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('wellness')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 group-hover:scale-110 transition">
                <Droplet className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Hydration</span>
              <span className="text-[10px] font-mono text-slate-500">Daily Habits</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('recovery_insights')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">Recovery Hub</span>
              <span className="text-[10px] font-mono text-slate-500">Volume Load</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('invoices')}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition group shadow-xl cursor-pointer"
            >
              <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:scale-110 transition">
                <Receipt className="h-5 w-5" />
              </div>
              <span className="text-xs font-black uppercase text-white">POS Receipts</span>
              <span className="text-[10px] font-mono text-slate-500">PDF Invoices</span>
            </button>
          </div>
        </div>
      )}

      {/* PASS & GUEST MODULAR CALLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <MembershipCard 
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
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <FileText className="h-5 w-5 text-indigo-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Assigned Programs by Coach</h3>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {assignedRoutines.length} Active Protocols
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedRoutines.map((routine) => (
              <div key={routine.id} className="p-5 bg-slate-950 border border-slate-800/80 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-white uppercase">{routine.title}</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase">
                      {routine.split_day}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold mt-1">
                    {routine.exercise_name} — <span className="font-mono text-indigo-300">{routine.target_sets} Sets</span> × <span className="font-mono text-slate-300">{routine.target_reps} Reps</span> @ <span className="font-mono text-amber-400 font-bold">RPE {routine.target_rpe}</span>
                  </p>
                  {routine.notes && <p className="text-[11px] text-slate-400 italic">Cue: {routine.notes}</p>}
                </div>
                <p className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
                  Assigned by: <strong className="text-slate-400">{routine.trainers?.full_name || 'Head Coach'}</strong> ({routine.trainers?.specialty})
                </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative text-slate-100">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl text-indigo-400">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Edit Profile Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">Update display name and password</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">New Password (Optional)</label>
                <div className="relative">
                  <input
                    type="password"
                    minLength={6}
                    placeholder="Leave blank to keep current password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-600" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN QR MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-6" onClick={() => setIsZoomed(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-slate-950 font-black text-lg uppercase tracking-tight">{member.full_name}</h3>
            <div className="flex justify-center p-2">
              <QRCodeSVG value={member.qr_code_token || member.id} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>
            <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Hold directly to turnstile scanner</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}