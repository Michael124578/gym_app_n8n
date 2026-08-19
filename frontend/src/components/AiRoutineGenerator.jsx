import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dumbbell, Target, Calendar, CheckCircle2, 
  Flame, ArrowRight, RotateCcw, ShieldCheck, Zap, 
  Printer, Play, Layers, User, Award, Activity, 
  TrendingUp, BarChart2, CheckSquare, Sliders, 
  ChevronRight, RefreshCw, Clock, Sparkles, Plus, 
  Eye, Check, Save, Share2, Compass, Cpu, FileText,
  Crosshair, Gauge, CornerDownRight, Box, Terminal
} from 'lucide-react'

// PROGRAM SCHEMAS
const PROGRAM_GOALS = [
  {
    id: 'hypertrophy',
    name: 'HYPERTROPHY & DENSITY',
    code: 'STIM-01',
    subtitle: 'Mechanical Tension & Sarcoplasmic Volume',
    repRange: '8 - 12 REPS',
    rpeRange: 'RPE 7.5 - 9.0',
    rest: '90s - 120s',
    focus: 'Maximal cross-sectional myofibrillar recruitment with strict 3-second eccentric tempo.',
    accentColor: 'border-amber-400 text-amber-400 bg-amber-400/10',
    dotColor: 'bg-amber-400'
  },
  {
    id: 'strength',
    name: 'MAX STRENGTH & POWER',
    code: 'STIM-02',
    subtitle: 'High-Threshold Motor Unit Recruitment',
    repRange: '3 - 6 REPS',
    rpeRange: 'RPE 8.0 - 9.5',
    rest: '3 - 5 MINS',
    focus: 'Neuromuscular CNS adaptation, rate of force development, and heavy barbell mastery.',
    accentColor: 'border-cyan-400 text-cyan-400 bg-cyan-400/10',
    dotColor: 'bg-cyan-400'
  },
  {
    id: 'recomp',
    name: 'METABOLIC CONDITIONING',
    code: 'STIM-03',
    subtitle: 'High-Density Work Capacity & Caloric Burn',
    repRange: '10 - 15 REPS',
    rpeRange: 'RPE 8.0 - 9.0',
    rest: '45s - 75s',
    focus: 'Elevated work capacity, antagonist superset density, and lean mass preservation.',
    accentColor: 'border-emerald-400 text-emerald-400 bg-emerald-400/10',
    dotColor: 'bg-emerald-400'
  },
  {
    id: 'functional',
    name: 'UNILATERAL & ATHLETIC',
    code: 'STIM-04',
    subtitle: 'Multi-Planar Torque & Joint Integrity',
    repRange: '6 - 10 REPS',
    rpeRange: 'RPE 7.0 - 8.5',
    rest: '60s - 90s',
    focus: 'Rotational agility, explosive plyometrics, and bulletproof joint resilience.',
    accentColor: 'border-rose-400 text-rose-400 bg-rose-400/10',
    dotColor: 'bg-rose-400'
  }
]

const SPLIT_PRESETS = [
  { id: '3_day', days: 3, label: '3-DAY FULL BODY', code: 'SPLIT-3D', sub: 'Mon / Wed / Fri Total Compound Loading' },
  { id: '4_day', days: 4, label: '4-DAY UPPER / LOWER', code: 'SPLIT-4D', sub: 'Power & Hypertrophy Wave Split' },
  { id: '5_day', days: 5, label: '5-DAY PPL HYBRID', code: 'SPLIT-5D', sub: 'Push / Pull / Legs + Upper / Lower' },
  { id: '6_day', days: 6, label: '6-DAY HIGH VOLUME', code: 'SPLIT-6D', sub: 'Dual Rotation Push / Pull / Legs' }
]

const EQUIPMENT_FACILITIES = [
  { id: 'full', label: 'Commercial Gym Hardware', tag: 'BARBELLS • MACHINES • CABLES' },
  { id: 'dumbbells', label: 'Dumbbells & Bench Suite', tag: 'ADJUSTABLE DB • BENCH • BANDS' },
  { id: 'calisthenics', label: 'Calisthenics & Rig Setup', tag: 'PULL-UP BARS • RINGS • DIPS' }
]

const MASTER_EXERCISE_POOL = {
  push: [
    { name: 'Barbell Flat Bench Press', target: 'Pectorals', pattern: 'Horizontal Press', sets: 4, reps: '6-8', rpe: 8.5, rest: '2-3m', cue: 'Retract scaps, 3s eccentric, explosive bar drive' },
    { name: 'Incline Dumbbell Press (30°)', target: 'Upper Chest', pattern: 'Incline Press', sets: 3, reps: '8-10', rpe: 8.5, rest: '90s', cue: '45° elbow flare, deep clavicular stretch at bottom' },
    { name: 'Standing Overhead Barbell Press', target: 'Deltoids', pattern: 'Vertical Press', sets: 3, reps: '6-8', rpe: 8.0, rest: '2m', cue: 'Brace glutes and core, lock out directly overhead' },
    { name: 'Cable Standing Lateral Raises', target: 'Side Delts', pattern: 'Isolation', sets: 4, reps: '12-15', rpe: 9.0, rest: '60s', cue: 'Lead with elbows in scapular plane, 1s peak hold' },
    { name: 'Overhead Cable Tricep Extension', target: 'Triceps', pattern: 'Isolation', sets: 3, reps: '10-12', rpe: 9.0, rest: '60s', cue: 'Full elbow flexion behind neck, flare out at lockout' }
  ],
  pull: [
    { name: 'Conventional Barbell Deadlift', target: 'Posterior Chain', pattern: 'Hip Hinge', sets: 3, reps: '5', rpe: 8.5, rest: '3m', cue: 'Pull slack out of bar, drive the platform away' },
    { name: 'Chest-Supported T-Bar Row', target: 'Mid-Back', pattern: 'Horizontal Pull', sets: 4, reps: '8-10', rpe: 8.5, rest: '90s', cue: 'Drive elbows backward, pinch rhomboids for 1s' },
    { name: 'Wide-Grip Lat Pulldown', target: 'Latissimus', pattern: 'Vertical Pull', sets: 3, reps: '10-12', rpe: 8.5, rest: '90s', cue: 'Drive elbows down into rear pockets' },
    { name: 'Incline Dumbbell Bicep Curl', target: 'Biceps Long-Head', pattern: 'Isolation', sets: 3, reps: '10-12', rpe: 9.0, rest: '60s', cue: 'Supinate wrists at top, control the full negative' },
    { name: 'Face Pulls with External Rotation', target: 'Rear Delts', pattern: 'Isolation', sets: 4, reps: '15', rpe: 8.5, rest: '60s', cue: 'Pull rope toward nose, rotate thumbs backward' }
  ],
  legs: [
    { name: 'Barbell Back Squat (High Bar)', target: 'Quads & Glutes', pattern: 'Squat Compound', sets: 4, reps: '6-8', rpe: 8.5, rest: '3m', cue: 'Chest tall, break hips and knees simultaneously' },
    { name: 'Romanian Deadlift (RDL)', target: 'Hamstrings', pattern: 'Hip Hinge', sets: 4, reps: '8-10', rpe: 8.0, rest: '2m', cue: 'Push pelvis backward until deep hamstring tension' },
    { name: 'Angled Leg Press (45°)', target: 'Quadriceps', pattern: 'Machine Compound', sets: 3, reps: '10-12', rpe: 8.5, rest: '90s', cue: 'Strict 3-second descent, no bouncing out of the hole' },
    { name: 'Seated Hamstring Leg Curl', target: 'Hamstrings', pattern: 'Isolation', sets: 3, reps: '12-15', rpe: 9.0, rest: '60s', cue: 'Slow negative, keep hips pinned hard into seat' },
    { name: 'Standing Calf Raise on Step', target: 'Calves & Soleus', pattern: 'Isolation', sets: 4, reps: '15', rpe: 9.5, rest: '60s', cue: '2-second dead pause at bottom stretch, explode up' }
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
          code: 'BLOCK-01',
          name: 'Upper Body Power & Horizontal Drive',
          focus: 'Pectorals, Lats, Anterior Deltoids & Triceps',
          type: 'UPPER HEAVY',
          exercises: MASTER_EXERCISE_POOL.push
        },
        {
          id: 'd2',
          code: 'BLOCK-02',
          name: 'Lower Body Strength & Quad Bias',
          focus: 'Quadriceps, Hamstrings, Glutes & Calves',
          type: 'LOWER HEAVY',
          exercises: MASTER_EXERCISE_POOL.legs
        },
        {
          id: 'd3',
          code: 'BLOCK-03',
          name: 'Upper Body Hypertrophy & Density',
          focus: 'Incline Chest, Upper Back Width & Arms',
          type: 'UPPER VOLUME',
          exercises: MASTER_EXERCISE_POOL.pull
        },
        {
          id: 'd4',
          code: 'BLOCK-04',
          name: 'Posterior Chain & Unilateral Overload',
          focus: 'Deadlift Velocity, Hip Thrusts & Adductors',
          type: 'POSTERIOR VOLUME',
          exercises: [
            ...MASTER_EXERCISE_POOL.legs.slice(1),
            { name: 'Barbell Hip Thrust', target: 'Glute Max', pattern: 'Hinge', sets: 3, reps: '10-12', rpe: 9.0, rest: '90s', cue: 'Lock out hips with 2s hold at peak contraction' }
          ]
        }
      ]
    } else if (selectedSplit === '3_day') {
      return [
        {
          id: 'd1',
          code: 'BLOCK-01',
          name: 'Full Body Compound Blitz (A)',
          focus: 'Squat, Bench Press, Rows & Core',
          type: 'FULL BODY A',
          exercises: [MASTER_EXERCISE_POOL.legs[0], MASTER_EXERCISE_POOL.push[0], MASTER_EXERCISE_POOL.pull[1], MASTER_EXERCISE_POOL.push[3]]
        },
        {
          id: 'd2',
          code: 'BLOCK-02',
          name: 'Full Body Posterior & Overhead (B)',
          focus: 'Deadlift, Overhead Press, Pull-ups & Hamstrings',
          type: 'FULL BODY B',
          exercises: [MASTER_EXERCISE_POOL.pull[0], MASTER_EXERCISE_POOL.push[2], MASTER_EXERCISE_POOL.pull[2], MASTER_EXERCISE_POOL.legs[1]]
        },
        {
          id: 'd3',
          code: 'BLOCK-03',
          name: 'Full Body Hypertrophy Volume (C)',
          focus: 'Incline Press, Leg Press, Rows & Arms',
          type: 'FULL BODY C',
          exercises: [MASTER_EXERCISE_POOL.legs[2], MASTER_EXERCISE_POOL.push[1], MASTER_EXERCISE_POOL.pull[1], MASTER_EXERCISE_POOL.push[4]]
        }
      ]
    } else {
      // 5 or 6 day split (PPL)
      return [
        { id: 'd1', code: 'BLOCK-01', name: 'Push Power (Chest & Shoulders)', focus: 'Bench, OHP & Triceps', type: 'PUSH 01', exercises: MASTER_EXERCISE_POOL.push },
        { id: 'd2', code: 'BLOCK-02', name: 'Pull Power (Deadlifts & Lats)', focus: 'Deadlifts, Rows & Biceps', type: 'PULL 01', exercises: MASTER_EXERCISE_POOL.pull },
        { id: 'd3', code: 'BLOCK-03', name: 'Legs Hypertrophy (Squats & Quads)', focus: 'Squats, RDLs & Calves', type: 'LEGS 01', exercises: MASTER_EXERCISE_POOL.legs },
        { id: 'd4', code: 'BLOCK-04', name: 'Push Volume (Incline & Deltoids)', focus: 'Incline DB, Flyes & Lateral Raises', type: 'PUSH 02', exercises: MASTER_EXERCISE_POOL.push },
        { id: 'd5', code: 'BLOCK-05', name: 'Pull Volume (Back Thickness & Arms)', focus: 'Pulldowns, T-Bar & Arm Superset', type: 'PULL 02', exercises: MASTER_EXERCISE_POOL.pull }
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
    <div className="space-y-6 animate-fadeIn font-sans text-zinc-100 selection:bg-amber-400 selection:text-zinc-950">
      
      {/* TACTICAL TELEMETRY BANNER */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-700/70 px-3 py-1 rounded-md text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                <span>ARCHITECT OS // V3.8</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                STATUS: <span className="text-emerald-400 font-bold">ONLINE</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase text-zinc-100 tracking-tight flex items-center space-x-3">
              <span>Program Architect Studio</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
              Synthesize periodized, high-threshold strength and hypertrophy programs. Configure stimulus objectives, volume allocations, and facility hardware below.
            </p>
          </div>

          {/* ACTION BUTTONS (HIGH CONTRAST TACTICAL STYLING) */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md hover:border-zinc-500"
            >
              <Printer className="h-4 w-4 text-zinc-400" />
              <span>Print Spec</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProgram}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md hover:border-amber-400/60"
            >
              <Save className="h-4 w-4 text-amber-400" />
              <span>Save Spec</span>
            </button>

            {onLaunchRoutineInTracker && (
              <button
                type="button"
                onClick={onLaunchRoutineInTracker}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-xs font-mono uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xl shadow-amber-500/20 transition flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-zinc-950" />
                <span>Launch in Live Logger</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOAST CONFIRMATION */}
      <AnimatePresence>
        {savedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-amber-400 text-zinc-950 px-5 py-3 rounded-xl shadow-2xl text-xs font-black font-mono flex items-center space-x-2 border border-amber-300"
          >
            <CheckCircle2 className="h-4 w-4 text-zinc-950" />
            <span>SPECIFICATION COMMITTED TO ATHLETE PROFILE!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TWO-COLUMN COMMAND WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CONTROL DECK (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 1. STIMULUS MATRIX */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-1.5">
                <Target className="h-3.5 w-3.5 text-amber-400" />
                <span>01 // STIMULUS PROTOCOL</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${currentGoalData.accentColor}`}>
                {currentGoalData.code}
              </span>
            </div>

            <div className="space-y-2">
              {PROGRAM_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.id
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 shadow-md shadow-amber-400/10'
                        : 'bg-zinc-900/40 border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? goal.dotColor : 'bg-zinc-600'}`} />
                        <span className={`text-xs font-black uppercase tracking-tight ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                          {goal.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 font-bold">{goal.repRange}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 pl-4 leading-relaxed line-clamp-2">
                      {goal.focus}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. SPLIT FREQUENCY DIAL */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                <span>02 // FREQUENCY ARCHITECTURE</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                {scheduleDays.length} DAYS / WEEK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SPLIT_PRESETS.map((split) => {
                const isSelected = selectedSplit === split.id
                return (
                  <button
                    key={split.id}
                    type="button"
                    onClick={() => { setSelectedSplit(split.id); setActiveDayIndex(0) }}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-400/20'
                        : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] font-mono block opacity-80">{split.code}</span>
                    <span className="text-xs font-bold uppercase block mt-0.5">{split.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. HARDWARE FACILITY SETUP */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-amber-400" />
                <span>03 // HARDWARE PROFILE</span>
              </span>
            </div>

            <div className="space-y-2">
              {EQUIPMENT_FACILITIES.map((equip) => {
                const isSelected = selectedEquip === equip.id
                return (
                  <div
                    key={equip.id}
                    onClick={() => setSelectedEquip(equip.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-400 text-zinc-100 font-bold'
                        : 'bg-zinc-900/30 border-zinc-800/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <span className="block font-medium">{equip.label}</span>
                      <span className="text-[10px] font-mono text-zinc-500 block">{equip.tag}</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-sm border ${
                      isSelected ? 'bg-amber-400 border-amber-300' : 'border-zinc-700'
                    }`} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. TOTAL VOLUME METRIC GAUGE */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400 uppercase font-bold">Total Prescribed Volume:</span>
              <span className="text-amber-400 font-black">{totalWeeklySets} Working Sets</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div 
                style={{ width: `${Math.min(100, (totalWeeklySets / 40) * 100)}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-medium">
              <span>MEV (12 Sets)</span>
              <span>MAV (20-25 Sets)</span>
              <span>MRV (35+ Sets)</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE SPECIFICATION MATRIX (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* DAY SELECTION BUTTONS (TACTICAL PILL STRIP) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {scheduleDays.map((day, idx) => {
              const isActive = activeDayIndex === idx
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition whitespace-nowrap flex items-center space-x-2 border shadow-sm ${
                    isActive
                      ? 'bg-zinc-100 border-zinc-100 text-zinc-950 shadow-zinc-100/20'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500' : 'bg-zinc-600'}`} />
                  <span>{day.code}</span>
                </button>
              )
            })}
          </div>

          {/* ACTIVE DAY BLUEPRINT PANEL */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-2xl">
            
            {/* PANEL HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black">
                    {activeDay.code} // {activeDay.type}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black uppercase text-zinc-100 mt-0.5">
                  {activeDay.name}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{activeDay.focus}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono self-start sm:self-auto">
                <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-amber-400 font-bold">
                  {activeDay.exercises.length} EXERCISES
                </span>
                <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400">
                  ~60 MINS
                </span>
              </div>
            </div>

            {/* MOVEMENT ROWS */}
            <div className="space-y-3">
              {activeDay.exercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2.5 hover:border-zinc-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 font-mono font-black text-xs flex items-center justify-center border border-zinc-700">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold uppercase text-zinc-100">{ex.name}</h4>
                        <span className="text-[10px] font-mono text-zinc-400">{ex.target} • {ex.pattern}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 text-zinc-200 font-bold">
                        {ex.sets} Sets × {ex.reps}
                      </span>
                      <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-1 rounded-md font-bold">
                        @ RPE {ex.rpe}
                      </span>
                      <span className="bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800 text-zinc-400">
                        ⏱️ {ex.rest}
                      </span>
                    </div>
                  </div>

                  {/* EXECUTION DIRECTIVE */}
                  <div className="bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800/60 text-xs text-zinc-300 flex items-start space-x-2">
                    <span className="text-amber-400 font-bold font-mono text-[11px] shrink-0">DIRECTIVE:</span>
                    <span className="italic text-zinc-400 text-[11px]">{ex.cue}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK BRIDGE ACTION FOOTER */}
            <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <span className="text-zinc-400 text-[11px]">Ready to begin today's assigned training block?</span>
              {onLaunchRoutineInTracker && (
                <button
                  type="button"
                  onClick={onLaunchRoutineInTracker}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-400/20"
                >
                  <Play className="h-4 w-4 fill-zinc-950" />
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
