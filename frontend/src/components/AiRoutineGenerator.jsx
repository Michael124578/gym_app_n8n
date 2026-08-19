import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dumbbell, Target, Calendar, CheckCircle2, 
  Flame, ArrowRight, RotateCcw, ShieldCheck, Zap, 
  Printer, Play, Layers, User, Award, Activity, 
  TrendingUp, BarChart2, CheckSquare, Sliders, 
  ChevronRight, RefreshCw, Clock, Sparkles, Plus, 
  Eye, Check, Save, Share2, Compass, Cpu, FileText
} from 'lucide-react'

// PROGRAM SCHEMAS
const PROGRAM_GOALS = [
  {
    id: 'hypertrophy',
    name: 'Hypertrophy & Density',
    subtitle: 'Mechanical Tension & Sarcoplasmic Volume',
    repRange: '8 - 12 Reps',
    rpeRange: 'RPE 7.5 - 9.0',
    rest: '90s - 120s',
    focus: 'Maximal cross-sectional muscle fiber growth and metabolic stress.',
    accent: 'from-amber-500 to-rose-600',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  {
    id: 'strength',
    name: 'Max Strength & Power',
    subtitle: 'High-Threshold Motor Unit Recruitment',
    repRange: '3 - 6 Reps',
    rpeRange: 'RPE 8.0 - 9.5',
    rest: '3 - 5 Mins',
    focus: 'CNS neurological adaptation, rate of force development, and heavy barbell mastery.',
    accent: 'from-indigo-500 to-blue-600',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
  },
  {
    id: 'recomp',
    name: 'Athletic Conditioning & Recomp',
    subtitle: 'High-Density Metabolic Work Capacity',
    repRange: '10 - 15 Reps',
    rpeRange: 'RPE 8.0 - 9.0',
    rest: '45s - 75s',
    focus: 'Elevated caloric expenditure, superset pacing, and lean mass preservation.',
    accent: 'from-cyan-500 to-teal-600',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  {
    id: 'functional',
    name: 'Unilateral & Functional Power',
    subtitle: 'Rotational Torque & Joint Integrity',
    repRange: '6 - 10 Reps',
    rpeRange: 'RPE 7.0 - 8.5',
    rest: '60s - 90s',
    focus: 'Multi-planar mobility, explosive plyometrics, and bulletproof core stabilization.',
    accent: 'from-emerald-500 to-teal-600',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  }
]

const SPLIT_PRESETS = [
  { id: '3_day', days: 3, label: '3-Day Full Body', desc: 'Mon / Wed / Fri Total Body Stimulation' },
  { id: '4_day', days: 4, label: '4-Day Upper / Lower', desc: 'Power & Hypertrophy Wave Split' },
  { id: '5_day', days: 5, label: '5-Day PPL Hybrid', desc: 'Push / Pull / Legs + Upper / Lower' },
  { id: '6_day', days: 6, label: '6-Day High Volume PPL', desc: 'Push / Pull / Legs (x2 Dual Rotation)' }
]

const EQUIPMENT_FACILITIES = [
  { id: 'full', label: 'Commercial Facility', desc: 'Olympic Barbells, Cable Stations, Selectorized Machines' },
  { id: 'dumbbells', label: 'Dumbbell & Bench', desc: 'Adjustable Dumbbells, Incline Bench, Pull-up Bar' },
  { id: 'calisthenics', label: 'Calisthenics Rig', desc: 'Bodyweight Bars, Gymnastic Rings, Dip Stations' }
]

const MASTER_EXERCISE_POOL = {
  push: [
    { name: 'Barbell Flat Bench Press', target: 'Chest', pattern: 'Horizontal Press', sets: 4, reps: '6-8', rpe: 8.5, rest: '2-3m', cue: 'Retract scaps, 3s eccentric tempo, drive feet into floor' },
    { name: 'Incline Dumbbell Press (30°)', target: 'Upper Chest', pattern: 'Incline Press', sets: 3, reps: '8-10', rpe: 8.5, rest: '90s', cue: '45° elbow flare, deep clavicular stretch at bottom' },
    { name: 'Standing Overhead Barbell Press', target: 'Shoulders', pattern: 'Vertical Press', sets: 3, reps: '6-8', rpe: 8.0, rest: '2m', cue: 'Brace glutes and core, head through the window at lockout' },
    { name: 'Cable Standing Lateral Raises', target: 'Side Delts', pattern: 'Isolation', sets: 4, reps: '12-15', rpe: 9.0, rest: '60s', cue: 'Lead with elbows in scapular plane, 1s peak hold' },
    { name: 'Overhead Cable Tricep Extension', target: 'Triceps', pattern: 'Isolation', sets: 3, reps: '10-12', rpe: 9.0, rest: '60s', cue: 'Full elbow extension behind neck, flare out' }
  ],
  pull: [
    { name: 'Conventional Barbell Deadlift', target: 'Back / Posterior', pattern: 'Hip Hinge', sets: 3, reps: '5', rpe: 8.5, rest: '3m', cue: 'Pull slack out of bar, push floor away through heels' },
    { name: 'Chest-Supported T-Bar Row', target: 'Mid-Back / Rhomboids', pattern: 'Horizontal Pull', sets: 4, reps: '8-10', rpe: 8.5, rest: '90s', cue: 'Drive elbows back, pinch shoulder blades for 1s' },
    { name: 'Wide-Grip Lat Pulldown', target: 'Lats', pattern: 'Vertical Pull', sets: 3, reps: '10-12', rpe: 8.5, rest: '90s', cue: 'Drive elbows down toward back pockets' },
    { name: 'Incline Dumbbell Bicep Curl', target: 'Biceps', pattern: 'Isolation', sets: 3, reps: '10-12', rpe: 9.0, rest: '60s', cue: 'Supinate wrists at top, full extension at bottom' },
    { name: 'Face Pulls with External Rotation', target: 'Rear Delts', pattern: 'Isolation', sets: 4, reps: '15', rpe: 8.5, rest: '60s', cue: 'Pull rope toward eyes, rotate thumbs backward' }
  ],
  legs: [
    { name: 'Barbell Back Squat (High Bar)', target: 'Quads & Glutes', pattern: 'Squat', sets: 4, reps: '6-8', rpe: 8.5, rest: '3m', cue: 'Chest upright, break hips/knees together, hit parallel' },
    { name: 'Romanian Deadlift (RDL)', target: 'Hamstrings', pattern: 'Hip Hinge', sets: 4, reps: '8-10', rpe: 8.0, rest: '2m', cue: 'Push hips backward until deep hamstring stretch' },
    { name: 'Angled Leg Press (45°)', target: 'Quads', pattern: 'Compound', sets: 3, reps: '10-12', rpe: 8.5, rest: '90s', cue: 'Control 3-second descent, no knee bounce at top' },
    { name: 'Seated Hamstring Leg Curl', target: 'Hamstrings', pattern: 'Isolation', sets: 3, reps: '12-15', rpe: 9.0, rest: '60s', cue: 'Slow negative, keep hips pinned into seat' },
    { name: 'Standing Calf Raise on Step', target: 'Calves', pattern: 'Isolation', sets: 4, reps: '15', rpe: 9.5, rest: '60s', cue: '2s pause in bottom stretch, explode up on big toes' }
  ]
}

export default function AiRoutineGenerator({ onLaunchRoutineInTracker }) {
  // CONFIGURATION STATE
  const [selectedGoal, setSelectedGoal] = useState('hypertrophy')
  const [selectedSplit, setSelectedSplit] = useState('4_day')
  const [selectedEquip, setSelectedEquip] = useState('full')
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [savedNotification, setSavedNotification] = useState(false)

  // DERIVE WORKOUT DAYS DYNAMICALLY
  const currentGoalData = useMemo(() => 
    PROGRAM_GOALS.find(g => g.id === selectedGoal) || PROGRAM_GOALS[0]
  , [selectedGoal])

  const scheduleDays = useMemo(() => {
    if (selectedSplit === '4_day') {
      return [
        {
          id: 'd1',
          name: 'Day 01: Upper Body Power & Horizontal Load',
          focus: 'Pectorals, Lats, Anterior Deltoids & Triceps',
          type: 'Upper Body Compound',
          exercises: MASTER_EXERCISE_POOL.push
        },
        {
          id: 'd2',
          name: 'Day 02: Lower Body Strength & Quad Bias',
          focus: 'Quadriceps, Hamstrings, Gluteus & Calves',
          type: 'Lower Body Strength',
          exercises: MASTER_EXERCISE_POOL.legs
        },
        {
          id: 'd3',
          name: 'Day 03: Upper Body Hypertrophy & Density',
          focus: 'Incline Chest, Upper Back Width & Arms',
          type: 'Upper Body Volume',
          exercises: MASTER_EXERCISE_POOL.pull
        },
        {
          id: 'd4',
          name: 'Day 04: Posterior Chain & Hamstring Overload',
          focus: 'Deadlift Velocity, Hip Thrusts & Adductors',
          type: 'Posterior Chain',
          exercises: [
            ...MASTER_EXERCISE_POOL.legs.slice(1),
            { name: 'Barbell Hip Thrust', target: 'Glutes', pattern: 'Hinge', sets: 3, reps: '10-12', rpe: 9.0, rest: '90s', cue: 'Lock out hips with 2s hold at peak contraction' }
          ]
        }
      ]
    } else if (selectedSplit === '3_day') {
      return [
        {
          id: 'd1',
          name: 'Day 01: Full Body Compound Blitz (A)',
          focus: 'Squat, Bench Press, Rows & Core',
          type: 'Full Body Heavy',
          exercises: [MASTER_EXERCISE_POOL.legs[0], MASTER_EXERCISE_POOL.push[0], MASTER_EXERCISE_POOL.pull[1], MASTER_EXERCISE_POOL.push[3]]
        },
        {
          id: 'd2',
          name: 'Day 02: Full Body Posterior & Overhead (B)',
          focus: 'Deadlift, Overhead Press, Pull-ups & Hamstrings',
          type: 'Full Body Hinge',
          exercises: [MASTER_EXERCISE_POOL.pull[0], MASTER_EXERCISE_POOL.push[2], MASTER_EXERCISE_POOL.pull[2], MASTER_EXERCISE_POOL.legs[1]]
        },
        {
          id: 'd3',
          name: 'Day 03: Full Body Hypertrophy Volume (C)',
          focus: 'Incline Press, Leg Press, Rows & Arms',
          type: 'Full Body Density',
          exercises: [MASTER_EXERCISE_POOL.legs[2], MASTER_EXERCISE_POOL.push[1], MASTER_EXERCISE_POOL.pull[1], MASTER_EXERCISE_POOL.push[4]]
        }
      ]
    } else {
      // 5 or 6 day split (PPL)
      return [
        { id: 'd1', name: 'Day 01: Push Power (Chest & Shoulders)', focus: 'Bench, OHP & Triceps', type: 'Push', exercises: MASTER_EXERCISE_POOL.push },
        { id: 'd2', name: 'Day 02: Pull Power (Deadlifts & Lats)', focus: 'Deadlifts, Rows & Biceps', type: 'Pull', exercises: MASTER_EXERCISE_POOL.pull },
        { id: 'd3', name: 'Day 03: Legs Hypertrophy (Squats & Quads)', focus: 'Squats, RDLs & Calves', type: 'Legs', exercises: MASTER_EXERCISE_POOL.legs },
        { id: 'd4', name: 'Day 04: Push Volume (Incline & Deltoids)', focus: 'Incline DB, Flyes & Lateral Raises', type: 'Push Volume', exercises: MASTER_EXERCISE_POOL.push },
        { id: 'd5', name: 'Day 05: Pull Volume (Back Thickness & Arms)', focus: 'Pulldowns, T-Bar & Arm Superset', type: 'Pull Volume', exercises: MASTER_EXERCISE_POOL.pull }
      ]
    }
  }, [selectedSplit])

  const activeDay = scheduleDays[activeDayIndex] || scheduleDays[0]

  const totalWeeklySets = useMemo(() => {
    return scheduleDays.reduce((acc, day) => {
      return acc + day.exercises.reduce((sAcc, ex) => sAcc + ex.sets, 0)
    }, 0)
  }, [scheduleDays])

  const handleSaveProgram = () => {
    setSavedNotification(true)
    setTimeout(() => setSavedNotification(false), 3000)
  }

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* COMMAND CENTER HEADER */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>Program Architect & Periodization Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Periodized Training Blueprint
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Precision strength & hypertrophy architecture. Adjust stimulus vectors, frequency splits, and facility parameters to synthesize an elite progressive overload blueprint.
            </p>
          </div>

          {/* TOP ACTION HUBS */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-bold px-4 py-3 rounded-2xl transition flex items-center space-x-2 shadow-lg"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sheet</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProgram}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 text-xs font-mono font-bold px-4 py-3 rounded-2xl transition flex items-center space-x-2 shadow-lg"
            >
              <Save className="h-4 w-4" />
              <span>Save Blueprint</span>
            </button>

            {onLaunchRoutineInTracker && (
              <button
                type="button"
                onClick={onLaunchRoutineInTracker}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs font-mono uppercase tracking-wider px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Launch Live Session</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOAST CONFIRMATION */}
      <AnimatePresence>
        {savedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold font-mono flex items-center space-x-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>Blueprint Saved to Athlete Profile!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WORKSPACE: CONTROL DECK (LEFT) + BLUEPRINT MATRIX (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: TACTICAL CONTROL DECK (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. TRAINING GOAL SELECTOR */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center space-x-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-400" />
                <span>01 // Hypertrophic Stimulus Target</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${currentGoalData.badgeColor}`}>
                {currentGoalData.repRange}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PROGRAM_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.id
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/20'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-white tracking-tight">{goal.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{goal.rpeRange}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">{goal.focus}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. FREQUENCY SPLIT SELECTOR */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center space-x-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                <span>02 // Weekly Split Frequency</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {scheduleDays.length} Active Days
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SPLIT_PRESETS.map((split) => {
                const isSelected = selectedSplit === split.id
                return (
                  <button
                    key={split.id}
                    type="button"
                    onClick={() => { setSelectedSplit(split.id); setActiveDayIndex(0) }}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black uppercase block">{split.label}</span>
                    <span className="text-[10px] font-mono block opacity-80 mt-0.5">{split.days} Sessions/Wk</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. FACILITY HARDWARE CONFIG */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center space-x-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-indigo-400" />
                <span>03 // Facility Equipment Setup</span>
              </span>
            </div>

            <div className="space-y-2">
              {EQUIPMENT_FACILITIES.map((equip) => {
                const isSelected = selectedEquip === equip.id
                return (
                  <div
                    key={equip.id}
                    onClick={() => setSelectedEquip(equip.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{equip.label}</span>
                    <div className={`w-3.5 h-3.5 rounded-full border ${
                      isSelected ? 'bg-indigo-500 border-indigo-300' : 'border-slate-700'
                    }`} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* VOLUME METRICS GAUGE */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 uppercase">Total Weekly Workload:</span>
              <span className="text-indigo-400 font-black">{totalWeeklySets} Total Sets</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                style={{ width: `${Math.min(100, (totalWeeklySets / 40) * 100)}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>MEV (12 Sets)</span>
              <span>MAV Sweet Spot (20-25 Sets)</span>
              <span>MRV (35+ Sets)</span>
            </div>
          </div>

        </div>

        {/* RIGHT: INTERACTIVE BLUEPRINT VIEW (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* DAY SELECTION TABS */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {scheduleDays.map((day, idx) => {
              const isActive = activeDayIndex === idx
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-3 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-2 border shadow-lg ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>Day 0{idx + 1}</span>
                </button>
              )
            })}
          </div>

          {/* ACTIVE DAY BLUEPRINT CARD */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            {/* DAY HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  {activeDay.type} // SESSION PRESCRIPTION
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white mt-0.5">
                  {activeDay.name}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">{activeDay.focus}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-indigo-300 font-bold">
                  {activeDay.exercises.length} Movements
                </span>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
                  ~60-70 Mins
                </span>
              </div>
            </div>

            {/* EXERCISES DIRECTIVE STACK */}
            <div className="space-y-4">
              {activeDay.exercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 font-mono font-black text-xs flex items-center justify-center border border-indigo-500/20">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-black uppercase text-white">{ex.name}</h4>
                        <span className="text-[10px] font-mono text-indigo-300">{ex.target} • {ex.pattern}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-white font-bold">
                        {ex.sets} Sets × {ex.reps} Reps
                      </span>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl font-bold">
                        @ RPE {ex.rpe}
                      </span>
                      <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-400">
                        ⏱️ {ex.rest}
                      </span>
                    </div>
                  </div>

                  {/* CUE & EXECUTION DIRECTIVE */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-indigo-400 font-bold">Execution Directive:</span>
                    <span className="italic">{ex.cue}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK BRIDGE ACTIONS */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <span className="text-slate-400">Ready to execute this session?</span>
              {onLaunchRoutineInTracker && (
                <button
                  type="button"
                  onClick={onLaunchRoutineInTracker}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Live Workout Tracker</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
