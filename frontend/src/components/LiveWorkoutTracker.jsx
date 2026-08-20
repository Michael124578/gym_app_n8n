import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, RotateCcw, Plus, Trash2, CheckCircle2, 
  Flame, Trophy, Dumbbell, Timer, Calculator, Layers, 
  ChevronRight, Award, Zap, Volume2, VolumeX, ShieldAlert,
  ArrowRight, Check, X
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import PrCelebrationModal from './PrCelebrationModal'

// Web Audio API Synth Chime for Rest Timer Alert
const playChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    // Play a friendly 2-tone melodic beep
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.setValueAtTime(880, now + 0.15) // A5
    
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    
    osc1.start(now)
    osc1.stop(now + 0.6)
  } catch (e) {
    console.error('Audio playback error', e)
  }
}

export default function LiveWorkoutTracker({ session, initialExercise }) {
  // WORKOUT SESSION STATE
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [workoutTitle, setWorkoutTitle] = useState('Push Hypertrophy Day')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // ACTIVE EXERCISES & SETS
  const [exercises, setExercises] = useState([
    {
      id: 'ex-1',
      name: 'Barbell Flat Bench Press',
      targetSets: 4,
      sets: [
        { id: 's1', setNum: 1, weight: 80, reps: 10, rpe: 8, completed: false, isPR: false },
        { id: 's2', setNum: 2, weight: 85, reps: 8, rpe: 8.5, completed: false, isPR: false },
        { id: 's3', setNum: 3, weight: 90, reps: 6, rpe: 9, completed: false, isPR: true },
        { id: 's4', setNum: 4, weight: 90, reps: 6, rpe: 9.5, completed: false, isPR: false },
      ]
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      targetSets: 3,
      sets: [
        { id: 's5', setNum: 1, weight: 32, reps: 10, rpe: 8, completed: false, isPR: false },
        { id: 's6', setNum: 2, weight: 34, reps: 8, rpe: 9, completed: false, isPR: false },
        { id: 's7', setNum: 3, weight: 34, reps: 8, rpe: 9.5, completed: false, isPR: false },
      ]
    }
  ])

  // REST INTERVAL TIMER STATE
  const [restDuration, setRestDuration] = useState(90)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [isRestActive, setIsRestActive] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)

  // ACTIVE TOOL TAB: 'workout' | 'plates' | 'one_rm'
  const [activeTab, setActiveTab] = useState('workout')

  // BARBELL PLATE CALCULATOR STATE
  const [targetWeight, setTargetWeight] = useState(225)
  const [unit, setUnit] = useState('lbs') // 'lbs' | 'kg'
  const [barWeight, setBarWeight] = useState(45) // 45 lbs or 20 kg

  // 1RM CALCULATOR STATE
  const [calcLiftWeight, setCalcLiftWeight] = useState(100)
  const [calcReps, setCalcReps] = useState(5)
  const [calcExerciseType, setCalcExerciseType] = useState('bench')
  const [userBodyweight, setUserBodyweight] = useState(80)

  // SUMMARY MODAL
  const [summaryData, setSummaryData] = useState(null)

  // Handle incoming initial exercise from ExerciseLibrary
  useEffect(() => {
    if (initialExercise) {
      addExerciseToSession(initialExercise.name)
    }
  }, [initialExercise])

  // STOPWATCH TIMER EFFECT
  useEffect(() => {
    let interval = null
    if (isSessionActive && isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSessionActive, isTimerRunning])

  // REST COUNTDOWN EFFECT
  useEffect(() => {
    let restInterval = null
    if (isRestActive && restTimeLeft > 0) {
      restInterval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            if (audioEnabled) playChimeSound()
            setIsRestActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(restInterval)
  }, [isRestActive, restTimeLeft, audioEnabled])

  const formatStopwatch = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const startSession = () => {
    setIsSessionActive(true)
    setIsTimerRunning(true)
    setElapsedSeconds(0)
  }

  const pauseResumeSession = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const startRestTimer = (seconds = restDuration) => {
    setRestTimeLeft(seconds)
    setIsRestActive(true)
  }

  const toggleSetComplete = (exId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s
          const willBeCompleted = !s.completed
          if (willBeCompleted) {
            startRestTimer(restDuration)
            if (s.isPR || s.weight >= 85) {
              setPrModalData({
                exerciseName: ex.name,
                weight: s.weight,
                reps: s.reps
              })
            }
          }
          return { ...s, completed: willBeCompleted }
        })
      }
    }))
  }

  const updateSetField = (exId, setId, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      }
    }))
  }

  const addSetToExercise = (exId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      const lastSet = ex.sets[ex.sets.length - 1]
      const newSetNum = ex.sets.length + 1
      const newSet = {
        id: `s-${Date.now()}-${newSetNum}`,
        setNum: newSetNum,
        weight: lastSet ? lastSet.weight : 50,
        reps: lastSet ? lastSet.reps : 10,
        rpe: 8,
        completed: false,
        isPR: false
      }
      return { ...ex, sets: [...ex.sets, newSet] }
    }))
  }

  const removeSet = (exId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
    }))
  }

  const addExerciseToSession = (name = 'New Exercise') => {
    const newEx = {
      id: `ex-${Date.now()}`,
      name,
      targetSets: 3,
      sets: [
        { id: `s-${Date.now()}-1`, setNum: 1, weight: 60, reps: 10, rpe: 8, completed: false, isPR: false },
        { id: `s-${Date.now()}-2`, setNum: 2, weight: 60, reps: 10, rpe: 8, completed: false, isPR: false },
        { id: `s-${Date.now()}-3`, setNum: 3, weight: 60, reps: 10, rpe: 8.5, completed: false, isPR: false },
      ]
    }
    setExercises(prev => [...prev, newEx])
  }

  const removeExercise = (exId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exId))
  }

  // Calculate session stats
  const totalSetsCompleted = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)
  const totalSetsCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const totalVolumeLifted = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter(s => s.completed).reduce((sAcc, s) => sAcc + (Number(s.weight) * Number(s.reps)), 0)
  }, 0)

  const finishSession = async () => {
    setIsSessionActive(false)
    setIsTimerRunning(false)
    setIsRestActive(false)

    const summary = {
      title: workoutTitle,
      duration: formatStopwatch(elapsedSeconds),
      totalVolume: Math.round(totalVolumeLifted),
      completedSets: totalSetsCompleted,
      exercisesCount: exercises.length,
      date: new Date().toLocaleDateString()
    }
    setSummaryData(summary)

    // Save to Supabase if session exists
    if (session?.user) {
      try {
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('email', session.user.email.toLowerCase())
          .maybeSingle()

        if (member?.id) {
          await supabase.from('workouts').insert([{
            member_id: member.id,
            split_type: workoutTitle,
            exercise_name: `Full Routine: ${exercises.length} Exercises`,
            weight_kg: totalVolumeLifted,
            reps: totalSetsCompleted
          }])
        }
      } catch (err) {
        console.error('Error saving workout', err)
      }
    }
  }

  // ----------------------------------------------------
  // BARBELL PLATE CALCULATOR LOGIC
  // ----------------------------------------------------
  const calculatePlates = () => {
    const availablePlatesLbs = [45, 35, 25, 10, 5, 2.5]
    const availablePlatesKg = [25, 20, 15, 10, 5, 2.5, 1.25]
    const platesList = unit === 'lbs' ? availablePlatesLbs : availablePlatesKg

    const remainingWeight = Math.max(0, targetWeight - barWeight)
    const weightPerSide = remainingWeight / 2

    let sideRemainder = weightPerSide
    const loadedPlates = []

    platesList.forEach((plate) => {
      const count = Math.floor(sideRemainder / plate)
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          loadedPlates.push(plate)
        }
        sideRemainder = Math.round((sideRemainder - count * plate) * 100) / 100
      }
    })

    return {
      weightPerSide,
      loadedPlates,
      unaccounted: sideRemainder * 2
    }
  }

  const plateColors = {
    45: 'bg-rose-600 border-rose-400 text-white',
    35: 'bg-amber-500 border-amber-300 text-slate-950',
    25: 'bg-emerald-600 border-emerald-400 text-white',
    10: 'bg-slate-200 border-white text-slate-950',
    5: 'bg-blue-600 border-blue-400 text-white',
    2.5: 'bg-slate-700 border-slate-500 text-white',
    // KG
    20: 'bg-blue-600 border-blue-400 text-white',
    15: 'bg-amber-500 border-amber-300 text-slate-950',
    1.25: 'bg-slate-600 border-slate-400 text-white',
  }

  // ----------------------------------------------------
  // 1RM CALCULATOR LOGIC (Epley & Brzycki)
  // ----------------------------------------------------
  const calculate1RM = () => {
    const w = parseFloat(calcLiftWeight) || 0
    const r = parseInt(calcReps) || 1
    if (r === 1) return w
    // Epley Formula: 1RM = w * (1 + r / 30)
    const epley = w * (1 + r / 30)
    // Brzycki Formula: 1RM = w * (36 / (37 - r))
    const brzycki = r < 37 ? w * (36 / (37 - r)) : epley
    return Math.round((epley + brzycki) / 2)
  }

  const oneRepMax = calculate1RM()

  // Percentage breakdown
  const percentageTable = [
    { pct: 100, reps: '1 Rep Max', weight: Math.round(oneRepMax) },
    { pct: 95, reps: '2 Reps (Strength)', weight: Math.round(oneRepMax * 0.95) },
    { pct: 90, reps: '3-4 Reps (Power)', weight: Math.round(oneRepMax * 0.90) },
    { pct: 85, reps: '5-6 Reps (Hypertrophy/Strength)', weight: Math.round(oneRepMax * 0.85) },
    { pct: 80, reps: '7-8 Reps (Hypertrophy)', weight: Math.round(oneRepMax * 0.80) },
    { pct: 75, reps: '10 Reps (Volume)', weight: Math.round(oneRepMax * 0.75) },
    { pct: 70, reps: '12 Reps (Endurance/Burn)', weight: Math.round(oneRepMax * 0.70) }
  ]

  // Strength tier classification (relative to bodyweight)
  const getStrengthTier = () => {
    const ratio = oneRepMax / (parseFloat(userBodyweight) || 75)
    let tier = 'Beginner'
    let color = 'text-slate-400'

    if (calcExerciseType === 'bench') {
      if (ratio >= 1.75) { tier = 'Elite Titan'; color = 'text-violet-400' }
      else if (ratio >= 1.4) { tier = 'Advanced Lifter'; color = 'text-indigo-400' }
      else if (ratio >= 1.0) { tier = 'Intermediate'; color = 'text-emerald-400' }
      else if (ratio >= 0.75) { tier = 'Novice'; color = 'text-amber-400' }
    } else if (calcExerciseType === 'squat') {
      if (ratio >= 2.25) { tier = 'Elite Titan'; color = 'text-violet-400' }
      else if (ratio >= 1.8) { tier = 'Advanced Lifter'; color = 'text-indigo-400' }
      else if (ratio >= 1.3) { tier = 'Intermediate'; color = 'text-emerald-400' }
      else if (ratio >= 1.0) { tier = 'Novice'; color = 'text-amber-400' }
    } else { // deadlift
      if (ratio >= 2.5) { tier = 'Elite Titan'; color = 'text-violet-400' }
      else if (ratio >= 2.0) { tier = 'Advanced Lifter'; color = 'text-indigo-400' }
      else if (ratio >= 1.5) { tier = 'Intermediate'; color = 'text-emerald-400' }
      else if (ratio >= 1.1) { tier = 'Novice'; color = 'text-amber-400' }
    }
    return { tier, color, ratio: ratio.toFixed(2) }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Flame className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Live Terminal & Progressive Overload Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Live Workout Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Active set-by-set progressive overload logging with integrated rest intervals, barbell plate calculator, and 1RM benchmark analytics.
            </p>
          </div>

          {/* ACTIVE WORKOUT CONTROLS */}
          <div className="flex items-center space-x-3">
            {!isSessionActive ? (
              <button
                type="button"
                onClick={startSession}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start Live Session</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={pauseResumeSession}
                  className={`p-3 rounded-2xl border font-bold text-xs transition flex items-center space-x-1.5 ${
                    isTimerRunning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                </button>

                <button
                  type="button"
                  onClick={finishSession}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Finish Workout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LIVE WORKOUT METRICS BAR (VISIBLE WHEN ACTIVE) */}
        {isSessionActive && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block flex items-center space-x-1">
                <Timer className="h-3 w-3 text-indigo-400" />
                <span>Elapsed Time</span>
              </span>
              <span className="text-xl font-mono font-black text-white">
                {formatStopwatch(elapsedSeconds)}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Sets Completed</span>
              </span>
              <span className="text-xl font-mono font-black text-emerald-400">
                {totalSetsCompleted} / {totalSetsCount}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block flex items-center space-x-1">
                <Flame className="h-3 w-3 text-amber-400" />
                <span>Total Volume</span>
              </span>
              <span className="text-xl font-mono font-black text-amber-400">
                {totalVolumeLifted.toLocaleString()} kg
              </span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Rest Chime</span>
                <span className="text-xs font-bold text-slate-200">{audioEnabled ? 'Audio Sound ON' : 'Muted'}</span>
              </div>
              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white"
              >
                {audioEnabled ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REST TIMER FLOATING DOCKED BAR (WHEN RESTING) */}
      <AnimatePresence>
        {isRestActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/50 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-4">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-950 shadow-inner">
                  <span className="text-lg font-mono font-black text-indigo-400">{restTimeLeft}s</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
                    Active Rest Interval
                  </span>
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Catch your breath, hydrate, and prepare for optimal progressive overload.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setRestTimeLeft(prev => prev + 30)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => setIsRestActive(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
              >
                Skip Rest
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION TABS: TRACKER / PLATE CALCULATOR / 1RM CALCULATOR */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit max-w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('workout')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'workout'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Active Workout Logger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plates')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'plates'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Barbell Plate Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('one_rm')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'one_rm'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>1RM & Strength Standards</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE WORKOUT LOGGER */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          
          {/* WORKOUT TITLE & REST CONFIG */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-5">
            <div className="flex-1 max-w-md">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Routine / Split Title
              </label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Default Rest Timer
                </label>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[45, 60, 90, 120, 180].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setRestDuration(sec)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition ${
                        restDuration === sec ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => addExerciseToSession('New Exercise')}
                className="self-end bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Exercise</span>
              </button>
            </div>
          </div>

          {/* EXERCISE LOG CARDS */}
          {exercises.map((ex, exIdx) => (
            <div
              key={ex.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-2xl border border-indigo-500/20">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => {
                        const newName = e.target.value
                        setExercises(prev => prev.map(item => item.id === ex.id ? { ...item, name: newName } : item))
                      }}
                      className="bg-transparent text-lg font-black uppercase text-white focus:outline-none focus:border-b border-indigo-500"
                    />
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      Exercise #{exIdx + 1} • {ex.sets.length} Sets Total
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => addSetToExercise(ex.id)}
                    className="bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Set</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* SETS TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800/60 pb-2">
                      <th className="py-2 px-3 w-14">Set</th>
                      <th className="py-2 px-3">Weight (kg/lbs)</th>
                      <th className="py-2 px-3">Reps</th>
                      <th className="py-2 px-3">RPE / Intensity</th>
                      <th className="py-2 px-3 text-center">Complete</th>
                      <th className="py-2 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {ex.sets.map((set) => (
                      <tr 
                        key={set.id}
                        className={`transition ${set.completed ? 'bg-emerald-950/20' : 'hover:bg-slate-950/40'}`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                          #{set.setNum}
                          {set.isPR && (
                            <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded uppercase">
                              PR
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => updateSetField(ex.id, set.id, 'weight', e.target.value)}
                            className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSetField(ex.id, set.id, 'reps', e.target.value)}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={set.rpe}
                            onChange={(e) => updateSetField(ex.id, set.id, 'rpe', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="7">RPE 7 (3 in tank)</option>
                            <option value="8">RPE 8 (2 in tank)</option>
                            <option value="8.5">RPE 8.5 (1-2 in tank)</option>
                            <option value="9">RPE 9 (1 in tank)</option>
                            <option value="9.5">RPE 9.5 (Maybe 1)</option>
                            <option value="10">RPE 10 (Max Effort / Failure)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(ex.id, set.id)}
                            className={`p-2 rounded-xl transition ${
                              set.completed
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-white'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeSet(ex.id, set.id)}
                            className="text-slate-600 hover:text-rose-400 p-1"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* TAB 2: BARBELL PLATE CALCULATOR */}
      {activeTab === 'plates' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                Olympic Barbell Loader
              </span>
              <h2 className="text-2xl font-black uppercase text-white">Barbell Plate Calculator</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your target working weight to visualize the exact color-coded plate arrangement per sleeve.
              </p>
            </div>

            {/* UNIT & BAR WEIGHT TOGGLE */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setUnit('lbs'); setBarWeight(45); setTargetWeight(225) }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    unit === 'lbs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LBS (45lb Bar)
                </button>
                <button
                  type="button"
                  onClick={() => { setUnit('kg'); setBarWeight(20); setTargetWeight(100) }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    unit === 'kg' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  KG (20kg Bar)
                </button>
              </div>
            </div>
          </div>

          {/* TARGET WEIGHT INPUT & QUICK PILLS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <label className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block mb-2 font-bold">
                Target Lift Weight ({unit.toUpperCase()})
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={targetWeight}
                  step={unit === 'lbs' ? '5' : '2.5'}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-2xl font-black text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="text-base font-bold text-slate-400">{unit}</span>
              </div>

              {/* QUICK SELECT PRESETS */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(unit === 'lbs' ? [135, 185, 225, 275, 315, 405] : [60, 80, 100, 120, 140, 180]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTargetWeight(w)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold rounded-lg border border-slate-800"
                  >
                    {w}{unit}
                  </button>
                ))}
              </div>
            </div>

            {/* BREAKDOWN RESULTS */}
            <div className="md:col-span-7 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">
                  Loading Instructions Per Side
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Load <span className="text-indigo-400">{calculatePlates().weightPerSide} {unit}</span> on each side
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {calculatePlates().loadedPlates.map((plate, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-black shadow-lg ${
                      plateColors[plate] || 'bg-slate-800 text-white'
                    }`}
                  >
                    {plate} {unit}
                  </div>
                ))}
                {calculatePlates().loadedPlates.length === 0 && (
                  <span className="text-xs text-slate-500 italic">Empty bar (no plates needed)</span>
                )}
              </div>
            </div>
          </div>

          {/* VISUAL BARBELL GRAPHIC */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800/80 flex flex-col items-center justify-center overflow-x-auto shadow-inner">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-6">
              Barbell Sleeve Schematic Diagram
            </span>

            {/* VISUAL BAR */}
            <div className="flex items-center min-w-[500px] h-36 relative">
              {/* Left Sleeve (Loaded Plates) */}
              <div className="flex items-center space-x-1 mr-2">
                {[...calculatePlates().loadedPlates].reverse().map((plate, idx) => (
                  <div
                    key={`l-${idx}`}
                    style={{ height: `${Math.min(130, 45 + plate * 1.8)}px` }}
                    className={`w-6 rounded-md border flex items-center justify-center text-[10px] font-mono font-bold shadow-2xl ${
                      plateColors[plate] || 'bg-slate-700'
                    }`}
                  >
                    <span className="-rotate-90">{plate}</span>
                  </div>
                ))}
              </div>

              {/* Collar Stop */}
              <div className="w-4 h-24 bg-slate-400 rounded-sm shadow-md" />
              
              {/* Central Shaft */}
              <div className="flex-1 h-6 bg-gradient-to-r from-slate-600 via-slate-300 to-slate-600 rounded-sm flex items-center justify-center shadow-lg">
                <span className="text-[9px] font-mono text-slate-950 font-black tracking-widest uppercase">
                  {barWeight} {unit} BAR
                </span>
              </div>

              {/* Collar Stop */}
              <div className="w-4 h-24 bg-slate-400 rounded-sm shadow-md" />

              {/* Right Sleeve (Loaded Plates) */}
              <div className="flex items-center space-x-1 ml-2">
                {calculatePlates().loadedPlates.map((plate, idx) => (
                  <div
                    key={`r-${idx}`}
                    style={{ height: `${Math.min(130, 45 + plate * 1.8)}px` }}
                    className={`w-6 rounded-md border flex items-center justify-center text-[10px] font-mono font-bold shadow-2xl ${
                      plateColors[plate] || 'bg-slate-700'
                    }`}
                  >
                    <span className="-rotate-90">{plate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: 1RM & STRENGTH STANDARDS */}
      {activeTab === 'one_rm' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
          
          <div className="border-b border-slate-800 pb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Epley & Brzycki Biomechanical Formulas
            </span>
            <h2 className="text-2xl font-black uppercase text-white">1-Rep Max & Strength Standard Benchmark</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* INPUTS COLUMN */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                    Movement Pattern
                  </label>
                  <select
                    value={calcExerciseType}
                    onChange={(e) => setCalcExerciseType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="bench">Barbell Bench Press (Chest)</option>
                    <option value="squat">Barbell Back Squat (Quads/Legs)</option>
                    <option value="deadlift">Conventional Deadlift (Back/Posterior)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Weight Lifted (kg)
                    </label>
                    <input
                      type="number"
                      value={calcLiftWeight}
                      onChange={(e) => setCalcLiftWeight(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      Reps Performed
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={calcReps}
                      onChange={(e) => setCalcReps(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                    Your Bodyweight (kg)
                  </label>
                  <input
                    type="number"
                    value={userBodyweight}
                    onChange={(e) => setUserBodyweight(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* ESTIMATED 1RM BADGE */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-950 p-6 rounded-2xl border border-indigo-500/30 flex items-center justify-between shadow-xl">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block font-bold">
                    Calculated 1-Rep Max
                  </span>
                  <span className="text-4xl font-black text-white mt-1 block">
                    {oneRepMax} <span className="text-base font-normal text-slate-400">kg</span>
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    Strength Standard
                  </span>
                  <span className={`text-base font-black uppercase ${getStrengthTier().color}`}>
                    {getStrengthTier().tier}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {getStrengthTier().ratio}x Bodyweight
                  </span>
                </div>
              </div>
            </div>

            {/* PERCENTAGE & REP TABLE */}
            <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold mb-4">
                Target Percentages & Rep Max Reference
              </h3>

              <div className="space-y-2">
                {percentageTable.map((row) => (
                  <div
                    key={row.pct}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-indigo-400 w-12">{row.pct}%</span>
                      <span className="text-slate-300">{row.reps}</span>
                    </div>
                    <span className="font-mono font-black text-white text-sm">
                      {row.weight} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* FINISHED WORKOUT CELEBRATION SUMMARY MODAL */}
      <AnimatePresence>
        {summaryData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-emerald-500/30">
                <Trophy className="h-8 w-8 animate-bounce" />
              </div>

              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Workout Completed!
              </span>
              <h2 className="text-2xl font-black uppercase text-white mt-1 mb-2">
                {summaryData.title}
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Outstanding effort! Progressive overload recorded and synced to your profile.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Duration</span>
                  <span className="text-base font-mono font-bold text-white">{summaryData.duration}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Volume Lifted</span>
                  <span className="text-base font-mono font-bold text-amber-400">{summaryData.totalVolume.toLocaleString()} kg</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Sets Done</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{summaryData.completedSets} Sets</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Exercises</span>
                  <span className="text-base font-mono font-bold text-indigo-400">{summaryData.exercisesCount} Movements</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSummaryData(null)}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg transition"
              >
                Done & Return to Terminal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PR CELEBRATION MODAL */}
      <PrCelebrationModal
        isOpen={!!prModalData}
        onClose={() => setPrModalData(null)}
        exerciseName={prModalData?.exerciseName}
        weight={prModalData?.weight}
        reps={prModalData?.reps}
      />

    </div>
  )
}
