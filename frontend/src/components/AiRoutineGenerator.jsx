import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Dumbbell, Target, Calendar, CheckCircle2, 
  Flame, ArrowRight, RotateCcw, ShieldCheck, Zap, 
  Printer, Play, Layers, User, Award
} from 'lucide-react'

const GOALS = [
  { id: 'hypertrophy', label: 'Hypertrophy & Muscle Growth', desc: 'Maximal muscle mass, moderate 8-12 rep ranges, high metabolic stress & mechanical tension', icon: 'Flame' },
  { id: 'strength', label: 'Maximum Strength & Power', desc: 'Heavy barbell compounds (1-5 reps), longer rest periods, CNS strength adaptation', icon: 'Award' },
  { id: 'fat_loss', label: 'Fat Loss & Conditioning', desc: 'High-density supersets, elevated heart rate, athletic cardio intervals', icon: 'Zap' },
  { id: 'athletic', label: 'Athletic Agility & Speed', desc: 'Explosive plyometrics, rotational core, unilateral leg strength and mobility', icon: 'Target' },
]

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner (0 - 1 Year)', desc: 'Focus on linear progression and mastering fundamental movement patterns' },
  { id: 'intermediate', label: 'Intermediate (1 - 3 Years)', desc: 'Wave periodization, progressive overload, and targeted hypertrophy volume' },
  { id: 'advanced', label: 'Advanced Lifter (3+ Years)', desc: 'High-volume splits, specialized intensity techniques (drop sets, rest-pause)' },
]

const FREQUENCIES = [
  { id: '3_days', days: 3, label: '3 Days / Week', split: 'Full Body A/B/C Rotation', desc: 'Optimal for busy schedules with 48h full recovery between workouts' },
  { id: '4_days', days: 4, label: '4 Days / Week', split: 'Upper / Lower Power & Hypertrophy', desc: 'The gold standard 4-day split balancing frequency and intensity' },
  { id: '5_days', days: 5, label: '5 Days / Week', split: 'Push / Pull / Legs + Upper / Lower', desc: 'High frequency split for serious bodybuilders & athletes' },
  { id: '6_days', days: 6, label: '6 Days / Week', split: 'Push / Pull / Legs (x2 Double Rotation)', desc: 'Maximum training volume with 1 dedicated rest day per week' },
]

const EQUIPMENT_OPTIONS = [
  { id: 'commercial', label: 'Full Commercial Gym', desc: 'Barbells, dumbbells, cable stacks, and selectorized machines' },
  { id: 'dumbbells_only', label: 'Dumbbells & Bench Only', desc: 'Adjustable dumbbells, incline bench, and resistance bands' },
  { id: 'calisthenics', label: 'Bodyweight & Pull-up Bar', desc: 'Calisthenics bars, dip stations, and gymnastic rings' },
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

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      // Build dynamic routine based on choices
      const routine = generateProgram(selectedGoal, selectedExperience, selectedFrequency, selectedEquipment)
      setGeneratedRoutine(routine)
      setIsGenerating(false)
      setCurrentStep(5) // Results view
    }, 800)
  }

  const generateProgram = (goal, exp, freq, equip) => {
    let days = []

    if (freq === '4_days') {
      days = [
        {
          day: 'Day 1',
          name: 'Upper Body Power & Chest/Back Focus',
          focus: 'Pectorals, Lats, Deltoids & Arms',
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: '4 Sets', reps: '6-8 Reps', rpe: 'RPE 8.5', rest: '2-3 mins', tip: 'Retract scapulae and control 3s eccentric' },
            { name: 'Bent-Over Barbell Row', sets: '4 Sets', reps: '6-8 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Pull elbows back toward hips' },
            { name: 'Overhead Barbell Press (OHP)', sets: '3 Sets', reps: '8-10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Lock out fully with active traps' },
            { name: 'Lat Pulldown (Wide-Grip)', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Squeeze lats at bottom for 1 sec' },
            { name: 'Incline Dumbbell Bicep Curl', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Supinate wrists at top' },
            { name: 'Cable Tricep Rope Pushdown', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Flare ropes at peak contraction' }
          ]
        },
        {
          day: 'Day 2',
          name: 'Lower Body Strength & Posterior Chain',
          focus: 'Quadriceps, Hamstrings & Glutes',
          exercises: [
            { name: 'Barbell Back Squat', sets: '4 Sets', reps: '6-8 Reps', rpe: 'RPE 8.5', rest: '3 mins', tip: 'Break at hips and knees, hit parallel depth' },
            { name: 'Romanian Deadlift (RDL)', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Push hips backward until deep hamstring stretch' },
            { name: '45-Degree Leg Press', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Do not lock out knees at top' },
            { name: 'Barbell Hip Thrust', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '90s', tip: '2s pause at top contraction' },
            { name: 'Standing Calf Raises', sets: '4 Sets', reps: '15 Reps', rpe: 'RPE 9.5', rest: '60s', tip: 'Full deep stretch at bottom' }
          ]
        },
        {
          day: 'Day 3',
          name: 'Upper Body Hypertrophy & Volume',
          focus: 'Upper Chest, Deltoids, Arms & Mid-Back',
          exercises: [
            { name: 'Incline Dumbbell Press', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Set bench to 30 degrees incline' },
            { name: 'Seated Cable Row', sets: '4 Sets', reps: '10-12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Drive elbows back with proud chest' },
            { name: 'Cable Lateral Raises', sets: '4 Sets', reps: '12-15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Lead with elbows in scapular plane' },
            { name: 'High-to-Low Cable Flyes', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Continuous pectoral tension' },
            { name: 'Hanging Leg / Knee Raises', sets: '3 Sets', reps: '12-15 Reps', rpe: 'RPE 8.5', rest: '60s', tip: 'Curl pelvis up toward ribs' }
          ]
        },
        {
          day: 'Day 4',
          name: 'Lower Body Hypertrophy & Quads/Glutes',
          focus: 'Quad Isolation, Hamstrings & Core',
          exercises: [
            { name: 'Barbell Front Squat / Hack Squat', sets: '4 Sets', reps: '8-10 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Maintain upright torso posture' },
            { name: 'Lying Hamstring Leg Curl', sets: '4 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '90s', tip: 'Control 3-second negative' },
            { name: 'Bulgarian Split Squats', sets: '3 Sets', reps: '10 Reps/leg', rpe: 'RPE 9', rest: '90s', tip: 'Drive through front heel' },
            { name: 'Cable Woodchoppers', sets: '3 Sets', reps: '12 Reps/side', rpe: 'RPE 8', rest: '60s', tip: 'Initiate rotation through obliques' }
          ]
        }
      ]
    } else {
      // 3 or 5 or 6 days template
      days = [
        {
          day: 'Day 1',
          name: 'Push (Chest, Shoulders & Triceps)',
          focus: 'Horizontal & Vertical Pressing',
          exercises: [
            { name: 'Barbell Flat Bench Press', sets: '4 Sets', reps: '8 Reps', rpe: 'RPE 8.5', rest: '2 mins', tip: 'Explosive drive on concentric' },
            { name: 'Incline Dumbbell Press', sets: '3 Sets', reps: '10 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Deep clavicular stretch' },
            { name: 'Overhead Barbell Press', sets: '3 Sets', reps: '8-10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Glutes clenched tight' },
            { name: 'Cable Lateral Raise', sets: '4 Sets', reps: '15 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Strict tempo' },
            { name: 'Cable Tricep Rope Pushdown', sets: '3 Sets', reps: '12 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Full lockout squeeze' }
          ]
        },
        {
          day: 'Day 2',
          name: 'Pull (Back, Rear Delts & Biceps)',
          focus: 'Vertical & Horizontal Pulling',
          exercises: [
            { name: 'Barbell Deadlift', sets: '3 Sets', reps: '5 Reps', rpe: 'RPE 8.5', rest: '3 mins', tip: 'Pull slack out of bar' },
            { name: 'Wide-Grip Lat Pulldown', sets: '4 Sets', reps: '10 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Full overhead stretch' },
            { name: 'Bent-Over Barbell Row', sets: '4 Sets', reps: '8 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Keep spine neutral' },
            { name: 'Incline Dumbbell Bicep Curl', sets: '3 Sets', reps: '10-12 Reps', rpe: 'RPE 9', rest: '60s', tip: 'Long-head bicep focus' },
            { name: 'Face Pulls with External Rotation', sets: '3 Sets', reps: '15 Reps', rpe: 'RPE 8.5', rest: '60s', tip: 'Rotator cuff health' }
          ]
        },
        {
          day: 'Day 3',
          name: 'Legs & Core Power',
          focus: 'Quads, Hamstrings, Glutes & Abs',
          exercises: [
            { name: 'Barbell Back Squat', sets: '4 Sets', reps: '8 Reps', rpe: 'RPE 8.5', rest: '3 mins', tip: 'Track knees over toes' },
            { name: 'Romanian Deadlift', sets: '4 Sets', reps: '10 Reps', rpe: 'RPE 8', rest: '2 mins', tip: 'Hinge hips backward' },
            { name: '45-Degree Leg Press', sets: '3 Sets', reps: '12 Reps', rpe: 'RPE 8.5', rest: '90s', tip: 'Smooth controlled tempo' },
            { name: 'Hanging Leg Raises', sets: '3 Sets', reps: '15 Reps', rpe: 'RPE 8.5', rest: '60s', tip: 'Avoid swinging legs' }
          ]
        }
      ]
    }

    return {
      title: `${GOALS.find(g => g.id === goal)?.label} Engine`,
      splitName: FREQUENCIES.find(f => f.id === freq)?.split,
      daysCount: FREQUENCIES.find(f => f.id === freq)?.days,
      experience: EXPERIENCE_LEVELS.find(e => e.id === exp)?.label,
      equipment: EQUIPMENT_OPTIONS.find(eq => eq.id === equip)?.label,
      days
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>AI Periodization Engine & Routine Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            AI Workout Routine Generator
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Select your training ambition, weekly frequency, and equipment access to automatically architect a periodized, progressive-overload workout routine.
          </p>
        </div>
      </div>

      {/* GENERATOR WIZARD CONTAINER */}
      {currentStep <= 4 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          
          {/* STEP PROGRESS BAR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <span className="bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold h-7 w-7 rounded-full flex items-center justify-center border border-indigo-500/30">
                {currentStep}
              </span>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Configuration Step {currentStep} of 4
                </span>
                <h3 className="text-base font-black uppercase text-white">
                  {currentStep === 1 && 'Select Primary Training Ambition'}
                  {currentStep === 2 && 'Select Your Experience Level'}
                  {currentStep === 3 && 'Choose Weekly Schedule & Frequency'}
                  {currentStep === 4 && 'Equipment & Facility Availability'}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4].map(s => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === currentStep ? 'w-8 bg-indigo-500' : s < currentStep ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: GOALS */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOALS.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedGoal === goal.id
                      ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black uppercase text-white">{goal.label}</h4>
                    <div className={`p-2 rounded-xl ${selectedGoal === goal.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{goal.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: EXPERIENCE */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXPERIENCE_LEVELS.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExperience(exp.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedExperience === exp.id
                      ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase text-white">{exp.label}</h4>
                    <div className={`p-1.5 rounded-xl ${selectedExperience === exp.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{exp.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: FREQUENCY */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FREQUENCIES.map((freq) => (
                <div
                  key={freq.id}
                  onClick={() => setSelectedFrequency(freq.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedFrequency === freq.id
                      ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">{freq.label}</span>
                      <h4 className="text-sm font-black uppercase text-white mt-0.5">{freq.split}</h4>
                    </div>
                    <div className={`p-2 rounded-xl ${selectedFrequency === freq.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{freq.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: EQUIPMENT */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EQUIPMENT_OPTIONS.map((equip) => (
                <div
                  key={equip.id}
                  onClick={() => setSelectedEquipment(equip.id)}
                  className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedEquipment === equip.id
                      ? 'bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase text-white">{equip.label}</h4>
                    <div className={`p-1.5 rounded-xl ${selectedEquipment === equip.id ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{equip.desc}</p>
                </div>
              ))}
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
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isGenerating ? 'Synthesizing Routine...' : 'Generate Periodized Routine'}</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* RESULTS: GENERATED ROUTINE VIEW */}
      {currentStep === 5 && generatedRoutine && (
        <div className="space-y-8">
          {/* HEADER SUMMARY CARD */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                  AI Periodized Program
                </span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1">
                  {generatedRoutine.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {generatedRoutine.splitName} • {generatedRoutine.daysCount} Training Days/Week • {generatedRoutine.experience}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Configure New</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold p-2.5 rounded-xl transition"
                  title="Print Program"
                >
                  <Printer className="h-4 w-4" />
                </button>
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
                          <th className="py-2.5 px-3">Target Intensity</th>
                          <th className="py-2.5 px-3">Rest Interval</th>
                          <th className="py-2.5 px-3">Coaching Cue</th>
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
