import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Play, Pause, RotateCcw, CheckCircle2, 
  Sparkles, Flame, ShieldCheck, Dumbbell, Clock, 
  Volume2, VolumeX, ChevronRight, Activity, Zap
} from 'lucide-react'

// Web Audio synth chime
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(659.25, now) // E5
    osc.frequency.setValueAtTime(880, now + 0.15) // A5
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.5)
  } catch (e) {}
}

const ROUTINES = [
  {
    id: 'bench_upper',
    title: 'Bench & Upper Body Dynamic Warmup',
    duration: '5 Mins',
    target: 'Rotator Cuffs, Anterior Shoulders & Thoracic Spine',
    tag: 'Upper Body Prep',
    color: 'from-indigo-600 to-violet-600',
    movements: [
      { name: 'Rotator Cuff Y-T-W-L Activations', durationSec: 45, reps: '10 reps each letter', cue: 'Pinch shoulder blades tight, rotate external humerus with light control.' },
      { name: 'Resistance Band Pull-Aparts', durationSec: 45, reps: '15-20 reps', cue: 'Keep arms long, pull band apart until it touches upper chest, squeeze rear delts.' },
      { name: 'Arm Circles & Cross-Body Swings', durationSec: 30, reps: '15 forward / 15 back', cue: 'Open up the chest and increase synovial fluid flow in shoulder capsule.' },
      { name: 'Thoracic Extension Over Foam Roller', durationSec: 60, reps: '5 deep breaths per segment', cue: 'Support head with hands, arch upper back over roller, do not hyperextend lumbar.' },
      { name: 'Scapular Push-ups on Floor', durationSec: 45, reps: '12 controlled reps', cue: 'Protact and retract shoulder blades without bending elbows.' }
    ]
  },
  {
    id: 'squat_legs',
    title: 'Squat & Quad Day Hip/Ankle Primer',
    duration: '6 Mins',
    target: 'Hip Capsules, Adductors, Glutes & Ankle Dorsiflexion',
    tag: 'Leg Day Primer',
    color: 'from-emerald-600 to-teal-600',
    movements: [
      { name: "World's Greatest Stretch & T-Spine Rotation", durationSec: 60, reps: '5 reps per side', cue: 'Deep lunge with elbow to inside of instep, then rotate arm straight toward ceiling.' },
      { name: '90/90 Hip Flow & Internal Rotation', durationSec: 60, reps: '6 slow transitions', cue: 'Sit tall, rotate knees side-to-side while keeping heels pinned to the floor.' },
      { name: 'Deep Bodyweight Squat Pry & Hold', durationSec: 45, reps: 'Continuous hold', cue: 'Sit in bottom of deep squat, push elbows against inside of knees, breathe deep.' },
      { name: 'Ankle Dorsiflexion Wall Rocks', durationSec: 45, reps: '12 rocks per leg', cue: 'Drive knee past toes over second toe without letting heel lift off ground.' },
      { name: 'Banded Glute Bridges with Abduction', durationSec: 45, reps: '15 reps', cue: 'Push through heels, flare knees outward against band tension at top lockout.' }
    ]
  },
  {
    id: 'deadlift_pull',
    title: 'Deadlift & Posterior Chain Activation',
    duration: '5 Mins',
    target: 'Hamstrings, Glute Max, Spinal Erectors & Lats',
    tag: 'Posterior Primer',
    color: 'from-amber-600 to-rose-600',
    movements: [
      { name: 'Cat-Cow Spinal Articulation Flow', durationSec: 45, reps: '10 smooth waves', cue: 'Segmentally flex and extend the spine from tailbone up through neck.' },
      { name: 'Dynamic Hamstring Sweeps (Scoops)', durationSec: 45, reps: '10 per leg alternating', cue: 'Heel down, toe up, hinge hips back and sweep hands down toward floor.' },
      { name: 'Single-Leg Glute Bridge Activation', durationSec: 45, reps: '10 reps per side', cue: 'Drive through planted heel to wake up glute max before heavy hinge pulls.' },
      { name: 'Lat & QL Hanging Bar Stretch', durationSec: 60, reps: '30s per side', cue: 'Hang from pull-up bar, shift weight to one side to feel deep stretch along latissimus dorsi.' }
    ]
  },
  {
    id: 'recovery_decompression',
    title: 'Post-Workout Decompression & Foam Rolling',
    duration: '7 Mins',
    target: 'Total Body Recovery, Parasympathetic Nervous System',
    tag: 'Post-Workout Cool Down',
    color: 'from-cyan-600 to-blue-700',
    movements: [
      { name: 'Couch Stretch (Hip Flexor & Quad Opener)', durationSec: 60, reps: '30s each leg', cue: 'Back knee against wall, squeeze rear glute to open anterior hip capsule.' },
      { name: 'Elevated Pigeon Pose', durationSec: 60, reps: '30s each leg', cue: 'Shin flat across bench, lean chest forward to stretch deep piriformis and glute.' },
      { name: 'Doorway / Corner Pectoral Stretch', durationSec: 45, reps: '20s high / 20s low', cue: 'Forearm on doorway, step forward smoothly to open chest fibers.' },
      { name: 'Foam Rolling Quadriceps & IT Band', durationSec: 60, reps: 'Slow passes', cue: 'Roll smooth continuous passes over muscle belly, pause on trigger points.' },
      { name: 'Child’s Pose with Deep Diaphragmatic Breathing', durationSec: 60, reps: 'Long recovery hold', cue: 'Reach arms forward, drop hips to heels, take 5-second belly inhales.' }
    ]
  }
]

export default function MobilityRecoveryGuide() {
  const [selectedRoutine, setSelectedRoutine] = useState(ROUTINES[0])
  const [activeMovementIdx, setActiveMovementIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUTINES[0].movements[0].durationSec)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentMovement = selectedRoutine.movements[activeMovementIdx]

  useEffect(() => {
    setTimeLeft(selectedRoutine.movements[0].durationSec)
    setActiveMovementIdx(0)
    setIsTimerRunning(false)
    setIsCompleted(false)
  }, [selectedRoutine])

  useEffect(() => {
    let interval = null
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (audioEnabled) playChime()
            
            // Advance to next movement
            if (activeMovementIdx < selectedRoutine.movements.length - 1) {
              const nextIdx = activeMovementIdx + 1
              setActiveMovementIdx(nextIdx)
              return selectedRoutine.movements[nextIdx].durationSec
            } else {
              setIsTimerRunning(false)
              setIsCompleted(true)
              return 0
            }
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft, activeMovementIdx, selectedRoutine, audioEnabled])

  const handleNextMovement = () => {
    if (activeMovementIdx < selectedRoutine.movements.length - 1) {
      const nextIdx = activeMovementIdx + 1
      setActiveMovementIdx(nextIdx)
      setTimeLeft(selectedRoutine.movements[nextIdx].durationSec)
    }
  }

  const handlePrevMovement = () => {
    if (activeMovementIdx > 0) {
      const prevIdx = activeMovementIdx - 1
      setActiveMovementIdx(prevIdx)
      setTimeLeft(selectedRoutine.movements[prevIdx].durationSec)
    }
  }

  const resetCurrentRoutine = () => {
    setActiveMovementIdx(0)
    setTimeLeft(selectedRoutine.movements[0].durationSec)
    setIsTimerRunning(false)
    setIsCompleted(false)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="h-4 w-4 text-rose-400 animate-pulse" />
            <span>Injury Prevention & Joint Longevity Protocols</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Guided Mobility & Warmup Guide
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Follow structured, timer-guided joint preparation flows designed to lubricate capsules, optimize movement mechanics, and accelerate post-workout recovery.
          </p>
        </div>
      </div>

      {/* ROUTINE SELECTION TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROUTINES.map((routine) => {
          const isSelected = selectedRoutine.id === routine.id
          return (
            <div
              key={routine.id}
              onClick={() => setSelectedRoutine(routine)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-600/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}>
                  {routine.tag}
                </span>
                <h3 className="text-sm font-black uppercase text-white mt-2">
                  {routine.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {routine.duration}</span>
                <span className="font-mono text-indigo-400 font-bold">{routine.movements.length} Steps</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ACTIVE ROUTINE WORKOUT PLAYER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Step {activeMovementIdx + 1} of {selectedRoutine.movements.length} • {selectedRoutine.title}
            </span>
            <h2 className="text-2xl font-black uppercase text-white mt-0.5">
              {currentMovement.name}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              title="Toggle Audio Beeps"
            >
              {audioEnabled ? <Volume2 className="h-4 w-4 text-indigo-400" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={resetCurrentRoutine}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              title="Reset Routine"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* TIMER & COACHING CUE DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* LARGE CIRCULAR COUNTDOWN TIMER */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-3xl border border-slate-800/80 shadow-inner">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="#1e293b"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="72"
                  stroke="#6366f1"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 72}
                  strokeDashoffset={2 * Math.PI * 72 * (1 - (timeLeft / currentMovement.durationSec))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-mono font-black text-white">{timeLeft}</span>
                <span className="text-[10px] font-mono uppercase text-slate-400">Seconds Left</span>
              </div>
            </div>

            {/* PLAYER CONTROLS */}
            <div className="flex items-center space-x-3 mt-6">
              <button
                type="button"
                onClick={handlePrevMovement}
                disabled={activeMovementIdx === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-xl transition ${
                  isTimerRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white'
                }`}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                <span>{isTimerRunning ? 'Pause' : 'Start Flow'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextMovement}
                disabled={activeMovementIdx === selectedRoutine.movements.length - 1}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
              >
                Skip
              </button>
            </div>
          </div>

          {/* MOVEMENT DETAILS & BIOMECHANICAL CUE */}
          <div className="md:col-span-7 space-y-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Prescription Target
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  {currentMovement.reps}
                </span>
              </div>
              <h3 className="text-lg font-black text-white uppercase">{currentMovement.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                💡 <strong className="text-indigo-400">Execution Cue:</strong> {currentMovement.cue}
              </p>
            </div>

            {/* PROGRESS LIST */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {selectedRoutine.movements.map((mov, idx) => (
                <div
                  key={idx}
                  onClick={() => { setActiveMovementIdx(idx); setTimeLeft(mov.durationSec) }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    idx === activeMovementIdx
                      ? 'bg-indigo-950/40 border-indigo-500 text-white font-bold'
                      : idx < activeMovementIdx
                      ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                      : 'bg-slate-950/80 border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-[10px]">{idx + 1}.</span>
                    <span>{mov.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{mov.durationSec}s</span>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* COMPLETION CELEBRATION */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-950/40 border border-emerald-500/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase text-white">Routine Completed!</h4>
                  <p className="text-xs text-emerald-200">Joints lubricated and neuromuscular pathways primed for heavy sets.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetCurrentRoutine}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition"
              >
                Restart Routine
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  )
}
