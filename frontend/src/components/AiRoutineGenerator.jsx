import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell, Target, Calendar, CheckCircle2,
  Flame, ArrowRight, RotateCcw, ShieldCheck, Zap,
  Printer, Play, Layers, User, Award, Activity,
  TrendingUp, BarChart2, CheckSquare
} from 'lucide-react'

const GOALS = [
  {
    id: 'hypertrophy',
    label: 'Hypertrophy & Muscle Density',
    badge: 'Mass & Sarcoplasmic Volume',
    desc: 'Engineered for maximal myofibrillar hypertrophy with moderate 8-12 rep ranges, high mechanical tension, and strict 3-second eccentric control.',
    icon: Flame,
    color: 'from-amber-500/20 to-rose-500/20 border-amber-500/40 text-amber-400'
  },
  {
    id: 'strength',
    label: 'Maximum Strength & CNS Power',
    badge: 'Heavy Barbell Compound Focus',
    desc: 'Prioritizes high neuromuscular recruitment through low-rep (1-5 reps) heavy compound lifts with 3-5 minute rest periods for maximal power output.',
    icon: Award,
    color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/40 text-indigo-400'
  },
  {
    id: 'fat_loss',
    label: 'Athletic Conditioning & Recomp',
    badge: 'High-Density Metabolic Stress',
    desc: 'High-density supersets, reduced rest intervals, and athletic compound intervals designed to maintain lean muscle while optimizing metabolic conditioning.',
    icon: Zap,
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/40 text-cyan-400'
  },
  {
    id: 'athletic',
    label: 'Functional Agility & Explosive Power',
    badge: 'Multi-Planar Athletic Performance',
    desc: 'Unilateral strength, rotational power, and plyometric potentiation drills to develop high-level athletic performance and joint resilience.',
    icon: Target,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400'
  },
]

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Novice / Foundational (0 - 1 Year)',
    badge: 'Linear Progression Protocol',
    desc: 'Emphasizes motor unit recruitment, mastering barbell trajectories, and consistent session-to-session linear weight progression.'
  },
  {
    id: 'intermediate',
    label: 'Intermediate Lifter (1 - 3 Years)',
    badge: 'Undulating Wave Periodization',
    desc: 'Integrates volume wave cycling, double progression models, and targeted muscle group specializations.'
  },
  {
    id: 'advanced',
    label: 'Advanced Titan (3+ Years)',
    badge: 'High-Threshold Overload',
    desc: 'High-volume periodization with advanced intensity multipliers (drop sets, rest-pause sets, and post-activation potentiation).'
  },
]

const FREQUENCIES = [
  {
    id: '3_days',
    days: 3,
    label: '3 Days / Week',
    split: 'Full Body Compound Rotation (A / B / C)',
    desc: 'Optimal 48-hour recovery between high-intensity multi-joint training sessions.'
  },
  {
    id: '4_days',
    days: 4,
    label: '4 Days / Week',
    split: 'Upper / Lower Power & Hypertrophy Split',
    desc: 'The gold standard periodization framework balancing volume frequency and joint recovery.'
  },
  {
    id: '5_days',
    days: 5,
    label: '5 Days / Week',
    split: 'Push / Pull / Legs + Upper / Lower Hybrid',
    desc: 'High-frequency hypertrophic loading for dedicated bodybuilding athletes.'
  },
  {
    id: '6_days',
    days: 6,
    label: '6 Days / Week',
    split: 'Push / Pull / Legs (x2 High Volume Split)',
    desc: 'Maximum weekly stimulus with 1 dedicated CNS systemic recovery day.'
  },
]

const EQUIPMENT_OPTIONS = [
  {
    id: 'commercial',
    label: 'Full Commercial Gym Facility',
    desc: 'Olympic barbells, heavy dumbbells, plate-loaded machines, cables, and power cages.'
  },
  {
    id: 'dumbbells_only',
    label: 'Dumbbells & Adjustable Bench Only',
    desc: 'Heavy dumbbell pairs, incline/flat bench, and resistance bands.'
  },
  {
    id: 'calisthenics',
    label: 'Bodyweight & Calisthenics Rig',
    desc: 'Pull-up bars, parallel dip bars, gymnastic rings, and weighted vests.'
  },
]

export default function AiRoutineGenerator({ onLaunchRoutineInTracker }) {
  // WIZARD STATE
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState('hypertrophy')
  const [selectedExperience, setSelectedExperience] = useState('intermediate')
  const [selectedFrequency, setSelectedFrequency] = useState('4_days')
  const [selectedEquipment, setSelectedEquipment] = useState('commercial')

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoutine, setGeneratedRoutine] = useState(null)

  const handleBuildProgram = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const routine = generateProgram(selectedGoal, selectedExperience, selectedFrequency, selectedEquipment)
      setGeneratedRoutine(routine)
      setIsGenerating(false)
      setCurrentStep(5) // Results view
    }, 600)
  }

  const generateProgram = (goal, exp, freq, equip) => {
    let days = []

    if (freq === '4_days') {
      days = [
        {
          day: 'Day 1',
          name: 'Upper Body Power & Horizontal Press/Pull',
          focus: 'Pectorals, Latissimus Dorsi, Deltoids & Triceps',
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: '4 Sets', reps: '6-8 Reps', rpe: 'RPE 8.5', rest: '2-3 mins', tip: 'Retract scapulae, 3s eccentric, explosive press' },
            { name: 'Bent-Over Barbell Row (Pendlay)', sets: '4 Sets', reps: '6-8 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Drive elbows back toward hips, parallel torso' },
            { name: 'Standing Overhead Barbell Press (OHP)', sets: '3 Sets', reps: '8-10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Glutes and core braced tight at lockout' },
            { name: 'Wide-Grip Lat Pulldown', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Drive elbows into back pockets, squeeze lats' },
            { name: 'Incline Dumbbell Bicep Curl', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Supinate wrists at peak contraction' },
            { name: 'Cable Tricep Rope Pushdown', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Flare ropes outward at full lockout' }
          ]
        },
        {
          day: 'Day 2',
          name: 'Lower Body Strength & Posterior Hinge',
          focus: 'Quadriceps, Hamstrings, Glutes & Spinal Erectors',
          exercises: [
            { name: 'Barbell Back Squat (High Bar)', sets: '4 Sets', reps: '6-8 Reps', rpe: 'RPE 8.5', rest: '3 mins', tip: 'Break hips and knees together, hit parallel depth' },
            { name: 'Romanian Deadlift (RDL)', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Hinge hips backward until deep hamstring stretch' },
            { name: 'Angled Leg Press (45°)', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Control descent, do not bounce out of bottom' },
            { name: 'Barbell Hip Thrust', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '90s', tip: '2s pause at top contraction with locked pelvis' },
            { name: 'Standing Calf Raises on Step', sets: '4 Sets', reps: '15 Reps', rpe: 'RPE 9.5', rest: '60s', tip: 'Full 2s pause in deep bottom stretch' }
          ]
        },
        {
          day: 'Day 3',
          name: 'Upper Body Hypertrophy & Incline/Width',
          focus: 'Clavicular Pecs, Lateral Deltoids & Upper Back',
          exercises: [
            { name: 'Incline Dumbbell Press (30°)', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Deep clavicular stretch, tuck elbows 45 degrees' },
            { name: 'Seated Cable Row (Neutral Grip)', sets: '4 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Drive elbows back with proud upright chest' },
            { name: 'Cable Standing Lateral Raises', sets: '4 Sets', reps: '12-15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Lead with elbows in scapular plane' },
            { name: 'High-to-Low Cable Flyes', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Continuous tension on inner pectorals' },
            { name: 'Hanging Leg Raises', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 8.5', rest: '60s', tip: 'Curl pelvis up toward ribs without swinging' }
          ]
        },
        {
          day: 'Day 4',
          name: 'Lower Body Hypertrophy & Unilateral Volume',
          focus: 'Quad Sweep, Hamstrings, Adductors & Core',
          exercises: [
            { name: 'Barbell Front Squat / Hack Squat', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Upright torso posture with quad emphasis' },
            { name: 'Lying Hamstring Leg Curl', sets: '4 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '90s', tip: 'Control 3-second negative descent' },
            { name: 'Bulgarian Split Squats (Dumbbells)', sets: '3 Sets', reps: '10 Reps/leg', rpe: 'RPE 9', rest: '90s', tip: 'Drive through front heel, deep hip drop' },
            { name: 'Cable Woodchoppers', sets: '3 Sets', reps: '12 Reps/side', rpe: 'RPE 8', rest: '60s', tip: 'Initiate explosive rotation from hips and obliques' }
          ]
        }
      ]
    } else {
      days = [
        {
          day: 'Day 1',
          name: 'Push (Chest, Shoulders & Triceps)',
          focus: 'Horizontal & Vertical Pressing Compounds',
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: '4 Sets', reps: '8 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Explosive drive off chest on concentric' },
            { name: 'Incline Dumbbell Press', sets: '3 Sets', reps: '10 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Deep chest stretch at bottom' },
            { name: 'Overhead Barbell Press', sets: '3 Sets', reps: '8-10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Glutes and quads locked tight' },
            { name: 'Cable Lateral Raise', sets: '4 Sets', reps: '15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Strict tempo with zero momentum' },
            { name: 'Cable Tricep Pushdown', sets: '3 Sets', reps: '12 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Full elbow lockout squeeze' }
          ]
        },
        {
          day: 'Day 2',
          name: 'Pull (Back, Rear Delts & Biceps)',
          focus: 'Vertical & Horizontal Pulling Velocity',
          exercises: [
            { name: 'Conventional Barbell Deadlift', sets: '3 Sets', reps: '5 Reps', rpe: 'RPE 8.5', rest: '3 mins', tip: 'Pull slack out of bar, drive floor away' },
            { name: 'Wide-Grip Lat Pulldown', sets: '4 Sets', reps: '10 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Full overhead lat stretch' },
            { name: 'Bent-Over Barbell Row', sets: '4 Sets', reps: '8 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Keep lumbar spine completely neutral' },
            { name: 'Incline Dumbbell Bicep Curl', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Long-head bicep stretch' },
            { name: 'Face Pulls with External Rotation', sets: '3 Sets', reps: '15 Reps', rpe: 'RPE 8.5', rest: '60s', tip: 'Shoulder capsule health' }
          ]
        },
        {
          day: 'Day 3',
          name: 'Legs & Core Power',
          focus: 'Quads, Hamstrings, Glutes & Abs',
          exercises: [
            { name: 'Barbell Back Squat', sets: '4 Sets', reps: '8 Reps', rpe: 'RPE 8.5', rest: '3 mins', tip: 'Track knees over second toe' },
            { name: 'Romanian Deadlift (RDL)', sets: '4 Sets', reps: '10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Hinge hips backward' },
            { name: '45-Degree Leg Press', sets: '3 Sets', reps: '12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Controlled 3s descent' },
            { name: 'Hanging Leg Raises', sets: '3 Sets', reps: '15 Reps', rpe: 'RPE 8.5', rest: '60s', tip: 'Avoid swinging legs' }
          ]
        }
      ]
    }

    return {
      title: `${GOALS.find(g => g.id === goal)?.label}`,
      splitName: FREQUENCIES.find(f => f.id === freq)?.split,
      daysCount: FREQUENCIES.find(f => f.id === freq)?.days,
      experience: EXPERIENCE_LEVELS.find(e => e.id === exp)?.label,
      equipment: EQUIPMENT_OPTIONS.find(eq => eq.id === equip)?.label,
      days
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* PROFESSIONAL ATHLETIC BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-slate-300 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Strength & Conditioning Periodization Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Iron Program Architect
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Configure target hypertrophic stimuli, training frequencies, and equipment setups to architect an athlete-grade periodized training split with exact set, rep, and RPE prescriptions.
          </p>
        </div>
      </div>

      {/* GENERATOR WIZARD CONTAINER */}
      {currentStep <= 4 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">

          {/* STEP PROGRESS BAR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-600 text-white font-mono text-xs font-black h-7 w-7 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/30">
                0{currentStep}
              </span>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  ARCHITECT PROTOCOL // PHASE 0{currentStep} OF 04
                </span>
                <h3 className="text-base font-black uppercase text-white">
                  {currentStep === 1 && 'Define Primary Hypertrophy / Strength Goal'}
                  {currentStep === 2 && 'Athlete Experience & Neuromuscular Baseline'}
                  {currentStep === 3 && 'Weekly Frequency & Split Architecture'}
                  {currentStep === 4 && 'Equipment & Facility Availability'}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${s === currentStep ? 'w-8 bg-indigo-500' : s < currentStep ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: GOALS */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.id
                const Icon = goal.icon
                return (
                  <div
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${isSelected
                        ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-2xl border ${goal.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-black uppercase text-white">{goal.label}</h4>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{goal.badge}</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-600'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                      {goal.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* STEP 2: EXPERIENCE */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXPERIENCE_LEVELS.map((exp) => {
                const isSelected = selectedExperience === exp.id
                return (
                  <div
                    key={exp.id}
                    onClick={() => setSelectedExperience(exp.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${isSelected
                        ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">{exp.badge}</span>
                        <h4 className="text-sm font-black uppercase text-white mt-1">{exp.label}</h4>
                      </div>
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{exp.desc}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* STEP 3: FREQUENCY */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FREQUENCIES.map((freq) => {
                const isSelected = selectedFrequency === freq.id
                return (
                  <div
                    key={freq.id}
                    onClick={() => setSelectedFrequency(freq.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${isSelected
                        ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">{freq.label}</span>
                        <h4 className="text-base font-black uppercase text-white mt-0.5">{freq.split}</h4>
                      </div>
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{freq.desc}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* STEP 4: EQUIPMENT */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EQUIPMENT_OPTIONS.map((equip) => {
                const isSelected = selectedEquipment === equip.id
                return (
                  <div
                    key={equip.id}
                    onClick={() => setSelectedEquipment(equip.id)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${isSelected
                        ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-black uppercase text-white">{equip.label}</h4>
                      <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600'}`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{equip.desc}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBuildProgram}
                disabled={isGenerating}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <Layers className="h-4 w-4" />
                <span>{isGenerating ? 'Synthesizing Architecture...' : 'Architect Complete Program'}</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* RESULTS: ARCHITECTED PROGRAM VIEW */}
      {currentStep === 5 && generatedRoutine && (
        <div className="space-y-8">
          {/* HEADER SUMMARY CARD */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  PERIODIZED TRAINING SCHEDULE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
                  {generatedRoutine.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {generatedRoutine.splitName} • {generatedRoutine.daysCount} Days/Week • {generatedRoutine.experience}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Re-Configure</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold p-2.5 rounded-xl transition"
                  title="Print Program"
                >
                  <Printer className="h-4 w-4" />
                </button>

                {onLaunchRoutineInTracker && (
                  <button
                    type="button"
                    onClick={onLaunchRoutineInTracker}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Launch in Live Tracker</span>
                  </button>
                )}
              </div>
            </div>

            {/* DAY-BY-DAY BREAKDOWN */}
            <div className="space-y-6">
              {generatedRoutine.days.map((dayItem, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold px-3 py-1 rounded-xl border border-indigo-500/30 uppercase">
                        {dayItem.day}
                      </span>
                      <h3 className="text-base font-black uppercase text-white">{dayItem.name}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{dayItem.focus}</span>
                  </div>

                  {/* EXERCISES TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800/60 pb-2">
                          <th className="py-2.5 px-3">Movement</th>
                          <th className="py-2.5 px-3">Sets</th>
                          <th className="py-2.5 px-3">Rep Range</th>
                          <th className="py-2.5 px-3">Intensity (RPE)</th>
                          <th className="py-2.5 px-3">Rest Interval</th>
                          <th className="py-2.5 px-3">Execution Directive</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {dayItem.exercises.map((ex, exIdx) => (
                          <tr key={exIdx} className="hover:bg-slate-900/40 transition">
                            <td className="py-3 px-3 font-bold text-white uppercase">{ex.name}</td>
                            <td className="py-3 px-3 font-mono text-indigo-300 font-semibold">{ex.sets}</td>
                            <td className="py-3 px-3 font-mono text-slate-200">{ex.reps}</td>
                            <td className="py-3 px-3 font-mono text-amber-400 font-bold">{ex.rpe}</td>
                            <td className="py-3 px-3 font-mono text-slate-400">{ex.rest}</td>
                            <td className="py-3 px-3 text-[11px] text-slate-400 italic">{ex.tip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
