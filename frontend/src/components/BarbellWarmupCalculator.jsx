import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, Dumbbell, Play, CheckCircle2, RotateCcw, 
  Sparkles, Flame, ShieldCheck, ArrowRight, Layers, Trophy
} from 'lucide-react'

export default function BarbellWarmupCalculator({ onSendToTracker }) {
  const [targetWeight, setTargetWeight] = useState(120)
  const [workingReps, setWorkingReps] = useState(5)
  const [workingSets, setWorkingSets] = useState(3)
  const [unit, setUnit] = useState('kg') // 'kg' | 'lbs'
  const [barWeight, setBarWeight] = useState(20) // 20 kg or 45 lbs
  const [completedSteps, setCompletedSteps] = useState({})

  const toggleStep = (stepIdx) => {
    setCompletedSteps(prev => ({ ...prev, [stepIdx]: !prev[stepIdx] }))
  }

  // Plate calculation helper for any given weight
  const calculatePlatesForWeight = (weight) => {
    const availablePlates = unit === 'kg' ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5]
    const remaining = Math.max(0, weight - barWeight)
    const perSide = remaining / 2

    let sideRemainder = perSide
    const loaded = []

    availablePlates.forEach((plate) => {
      const count = Math.floor(sideRemainder / plate)
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          loaded.push(plate)
        }
        sideRemainder = Math.round((sideRemainder - count * plate) * 100) / 100
      }
    })

    return { perSide, loaded }
  }

  // Ramping Warmup Protocol Generation
  const generateWarmupRamp = () => {
    const target = parseFloat(targetWeight) || 100
    const step1Weight = barWeight
    const step2Weight = Math.round((target * 0.5) / 2.5) * 2.5
    const step3Weight = Math.round((target * 0.7) / 2.5) * 2.5
    const step4Weight = Math.round((target * 0.9) / 2.5) * 2.5

    return [
      {
        stepNum: 1,
        title: 'Empty Bar Flow',
        pct: 'Bar',
        weight: step1Weight,
        reps: '10 Reps',
        purpose: 'Joint lubrication, motor pattern groove & blood flow',
        rest: '30s Rest',
        plates: calculatePlatesForWeight(step1Weight)
      },
      {
        stepNum: 2,
        title: '50% Threshold Ramp',
        pct: '50%',
        weight: step2Weight,
        reps: '5 Reps',
        purpose: 'Transition to loaded velocity & bar path calibration',
        rest: '60s Rest',
        plates: calculatePlatesForWeight(step2Weight)
      },
      {
        stepNum: 3,
        title: '70% Neuromuscular Prime',
        pct: '70%',
        weight: step3Weight,
        reps: '3 Reps',
        purpose: 'Recruits high-threshold motor units without metabolic fatigue',
        rest: '90s Rest',
        plates: calculatePlatesForWeight(step3Weight)
      },
      {
        stepNum: 4,
        title: '90% Post-Activation Potentiation',
        pct: '90%',
        weight: step4Weight,
        reps: '1 Rep (Single)',
        purpose: 'Acclimates central nervous system to heavy loading sensation',
        rest: '2 mins Rest',
        plates: calculatePlatesForWeight(step4Weight)
      },
      {
        stepNum: 5,
        title: '100% Target Working Sets',
        pct: '100%',
        weight: target,
        reps: `${workingReps} Reps × ${workingSets} Sets`,
        purpose: 'Main hypertrophic & strength progressive overload stimulus',
        rest: '2-3 mins Rest',
        plates: calculatePlatesForWeight(target),
        isWorkSet: true
      }
    ]
  }

  const rampSteps = generateWarmupRamp()

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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Dumbbell className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Neuromuscular Activation & Ramping Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Barbell Warmup Set Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Takes the guesswork out of heavy barbell preparation by calculating exact ramping percentages and plate loads per sleeve.
            </p>
          </div>

          {/* UNIT SELECTOR */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start md:self-auto shadow-xl">
            <button
              type="button"
              onClick={() => { setUnit('kg'); setBarWeight(20); setTargetWeight(120) }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                unit === 'kg' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              KG (20kg Bar)
            </button>
            <button
              type="button"
              onClick={() => { setUnit('lbs'); setBarWeight(45); setTargetWeight(275) }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                unit === 'lbs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              LBS (45lb Bar)
            </button>
          </div>
        </div>
      </div>

      {/* INPUT CONFIGURATION CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
              Target Working Weight ({unit.toUpperCase()})
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-2xl font-black text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
              Target Reps
            </label>
            <input
              type="number"
              value={workingReps}
              onChange={(e) => setWorkingReps(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-2xl font-black text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1 font-bold">
              Working Sets Count
            </label>
            <input
              type="number"
              value={workingSets}
              onChange={(e) => setWorkingSets(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-2xl font-black text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* QUICK PRESET PRELOADS */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-slate-400 font-mono">Quick Weights:</span>
          {(unit === 'kg' ? [80, 100, 120, 140, 160, 180, 200] : [185, 225, 275, 315, 365, 405]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setTargetWeight(w)}
              className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono font-bold rounded-xl transition"
            >
              {w} {unit}
            </button>
          ))}
        </div>
      </div>

      {/* RAMPING STEPS TIMELINE TABLE */}
      <div className="space-y-4">
        {rampSteps.map((step, idx) => {
          const isDone = !!completedSteps[idx]
          return (
            <div
              key={step.stepNum}
              onClick={() => toggleStep(idx)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 group ${
                step.isWorkSet
                  ? 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-indigo-500'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-black text-sm border shrink-0 ${
                  step.isWorkSet
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/40'
                    : isDone
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-950 text-indigo-400 border-slate-800'
                }`}>
                  {step.pct}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-base font-black uppercase ${step.isWorkSet ? 'text-white' : isDone ? 'text-emerald-300 line-through opacity-80' : 'text-white'}`}>
                      {step.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                      {step.rest}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{step.purpose}</p>
                </div>
              </div>

              {/* WEIGHT, REPS & EXACT PLATE BREAKDOWN */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-white font-mono block">
                    {step.weight} <span className="text-sm font-normal text-slate-400">{unit}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-300">{step.reps}</span>
                </div>

                {/* PLATES LIST */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  {step.plates.loaded.map((plate, pIdx) => (
                    <span
                      key={pIdx}
                      className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold shadow-md ${
                        plateColors[plate] || 'bg-slate-800 text-white'
                      }`}
                    >
                      {plate}
                    </span>
                  ))}
                  {step.plates.loaded.length === 0 && (
                    <span className="text-xs text-slate-500 font-mono italic">Empty Bar</span>
                  )}
                </div>

                {/* CHECKBOX */}
                <div className={`p-2.5 rounded-2xl border transition shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-600 group-hover:text-slate-300'
                }`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
