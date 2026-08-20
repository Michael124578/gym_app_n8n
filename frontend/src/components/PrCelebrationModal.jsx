import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, Award, Zap, Check, Flame } from 'lucide-react'
import PillButton from './PillButton'

// Web Audio Fanfare Synth
const playPrFanfare = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Triumphant 3-tone arpeggio chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.1)
      gain.gain.setValueAtTime(0.25, now + idx * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + idx * 0.1)
      osc.stop(now + idx * 0.1 + 0.6)
    })
  } catch (e) {
    console.warn('Fanfare sound blocked', e)
  }
}

export default function PrCelebrationModal({ isOpen, onClose, exerciseName, weight, reps }) {
  useEffect(() => {
    if (isOpen) {
      playPrFanfare()
    }
  }, [isOpen])

  if (!isOpen) return null

  const estimatedOneRepMax = Math.round(weight * (1 + reps / 30))

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        
        {/* BACKGROUND AMBIENT PARTICLES & GLOW */}
        <div className="absolute w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-6 overflow-hidden"
        >
          {/* GOLD SHIMMER CORNER ACCENTS */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

          {/* TROPHY ICON WITH GLOWING BADGE */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Trophy className="h-10 w-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
              ⚡ NEW PERSONAL RECORD UNLOCKED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight pt-2">
              {exerciseName || 'Bench Press'}
            </h2>
            <p className="text-xs text-slate-400">
              Congratulations! You broke your previous 1RM threshold.
            </p>
          </div>

          {/* PR METRICS METRIC CARDS */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-mono">
            <div className="border-r border-slate-800 pr-2">
              <span className="text-[10px] text-slate-500 uppercase block">Log Weight & Reps</span>
              <span className="text-xl font-black text-amber-400">{weight} KG × {reps}</span>
            </div>
            <div className="pl-2">
              <span className="text-[10px] text-slate-500 uppercase block">Est. 1RM Potential</span>
              <span className="text-xl font-black text-emerald-400">{estimatedOneRepMax} KG</span>
            </div>
          </div>

          <div className="pt-2">
            <PillButton
              onClick={onClose}
              theme="amber"
              icon={Sparkles}
              size="md"
              className="w-full justify-center"
            >
              Claim PR Badge & Continue
            </PillButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
