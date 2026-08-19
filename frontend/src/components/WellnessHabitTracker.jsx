import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Droplet, CheckCircle2, Flame, Moon, Footprints, 
  Sparkles, Award, RotateCcw, Plus, Utensils, Heart, 
  Pill, ShieldCheck, Zap
} from 'lucide-react'

export default function WellnessHabitTracker({ session }) {
  // WATER TRACKER STATE
  const [waterMl, setWaterMl] = useState(() => {
    const saved = localStorage.getItem('iron_gym_water_ml')
    return saved ? parseInt(saved) : 2250
  })
  const [waterGoal, setWaterGoal] = useState(3500)

  // HABIT CHECKLIST STATE
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('iron_gym_daily_habits')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return [
      { id: 'h1', title: '7.5+ Hours Sleep', desc: 'Optimal central nervous system & hypertrophy recovery', icon: 'Moon', completed: true },
      { id: 'h2', title: '10,000 Daily Steps', desc: 'NEAT (Non-Exercise Activity Thermogenesis) & cardiovascular base', icon: 'Footprints', completed: true },
      { id: 'h3', title: 'Protein Target Met', desc: 'Hit daily goal (1.6 - 2.2g per kg bodyweight)', icon: 'Utensils', completed: false },
      { id: 'h4', title: 'Post-Workout Mobility / Stretch', desc: '10 mins hip opener & thoracic mobility routine', icon: 'Heart', completed: false },
      { id: 'h5', title: 'Creatine & Daily Supplements', desc: '5g Creatine Monohydrate + Omega-3s & D3', icon: 'Pill', completed: true },
      { id: 'h6', title: 'Active Workout Logged', desc: 'Completed scheduled training split or active cardio', icon: 'Flame', completed: true },
    ]
  })

  const [streakDays, setStreakDays] = useState(8)

  useEffect(() => {
    localStorage.setItem('iron_gym_water_ml', waterMl.toString())
  }, [waterMl])

  useEffect(() => {
    localStorage.setItem('iron_gym_daily_habits', JSON.stringify(habits))
  }, [habits])

  const addWater = (amount) => {
    setWaterMl(prev => Math.min(waterGoal * 2, prev + amount))
  }

  const resetWater = () => {
    setWaterMl(0)
  }

  const toggleHabit = (id) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h))
  }

  const completedHabitsCount = habits.filter(h => h.completed).length
  const habitPercentage = Math.round((completedHabitsCount / habits.length) * 100)
  const waterPercentage = Math.min(100, Math.round((waterMl / waterGoal) * 100))

  const getIcon = (name) => {
    switch (name) {
      case 'Moon': return <Moon className="h-4 w-4 text-indigo-400" />
      case 'Footprints': return <Footprints className="h-4 w-4 text-emerald-400" />
      case 'Utensils': return <Utensils className="h-4 w-4 text-amber-400" />
      case 'Heart': return <Heart className="h-4 w-4 text-rose-400" />
      case 'Pill': return <Pill className="h-4 w-4 text-violet-400" />
      default: return <Flame className="h-4 w-4 text-amber-400" />
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Droplet className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>Daily Longevity & Hydration Protocols</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Daily Wellness & Habit Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track optimal water intake, recovery habits, and build unstoppable daily fitness streaks.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-2xl flex items-center space-x-3 self-start sm:self-auto shadow-xl">
            <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
              <Flame className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                Consistency Streak
              </span>
              <span className="text-xl font-black text-white">{streakDays} Consecutive Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SECTION: HYDRATION CYLINDER & QUICK TAP LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* WATER BOTTLE CARD */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold block">
                Hydration Engine
              </span>
              <h2 className="text-lg font-black uppercase text-white">Daily Water Intake</h2>
            </div>
            <button
              type="button"
              onClick={resetWater}
              className="text-slate-500 hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-800 transition"
              title="Reset Water for Today"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* VISUAL FLUID CYLINDER */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-60 bg-slate-950 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-inner p-1 flex flex-col justify-end">
              {/* WATER LEVEL FILL */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${waterPercentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-indigo-500 rounded-2xl relative shadow-lg shadow-cyan-500/30"
              >
                {/* Surface bubble animation */}
                <div className="absolute top-0 inset-x-0 h-2 bg-white/40 rounded-full animate-pulse" />
              </motion.div>

              {/* OVERLAY TEXT */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none drop-shadow-md">
                <span className="text-3xl font-black text-white">{waterMl}</span>
                <span className="text-[10px] font-mono text-slate-300 uppercase">/ {waterGoal} ml</span>
                <span className="text-xs font-mono font-bold text-cyan-300 mt-1">{waterPercentage}% GOAL</span>
              </div>
            </div>
          </div>

          {/* QUICK TAP LOG BUTTONS */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
              Quick Log Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => addWater(250)}
                className="bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-bold py-2 rounded-xl transition"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => addWater(500)}
                className="bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-bold py-2 rounded-xl transition"
              >
                +500ml
              </button>
              <button
                type="button"
                onClick={() => addWater(750)}
                className="bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-bold py-2 rounded-xl transition"
              >
                +750ml
              </button>
              <button
                type="button"
                onClick={() => addWater(1000)}
                className="bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs font-bold py-2 rounded-xl transition"
              >
                +1000ml
              </button>
            </div>
          </div>
        </div>

        {/* HABIT CHECKLIST CARD */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                Daily Non-Negotiables
              </span>
              <h2 className="text-xl font-black uppercase text-white">Daily Habit Checklist</h2>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">{completedHabitsCount} / {habits.length} Complete</span>
              <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  style={{ width: `${habitPercentage}%` }}
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* HABITS LIST */}
          <div className="space-y-2.5">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  habit.completed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`p-2 rounded-xl border ${
                    habit.completed ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-900 border-slate-800'
                  }`}>
                    {getIcon(habit.icon)}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase transition ${habit.completed ? 'text-white line-through opacity-80' : 'text-white'}`}>
                      {habit.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{habit.desc}</p>
                  </div>
                </div>

                <div className={`p-2 rounded-xl transition ${
                  habit.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-900 text-slate-600 group-hover:text-slate-300'
                }`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>

          {/* 100% COMPLETE CELEBRATION BADGE */}
          {habitPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 p-4 rounded-2xl flex items-center space-x-3 text-xs text-emerald-300"
            >
              <Award className="h-5 w-5 text-emerald-400 shrink-0" />
              <span><strong>Perfect Day Achieved!</strong> All recovery and nutritional targets completed for today.</span>
            </motion.div>
          )}

        </div>

      </div>

    </div>
  )
}
