import React, { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Web Audio press haptic
const triggerAudioHaptic = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  } catch (e) {
    // Silent fail if blocked
  }
}

const Pill = forwardRef(({
  variant = 'button', // 'button' | 'filter'
  active = false,
  theme = 'indigo',
  size = 'md',
  icon: Icon,
  count,
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}, ref) => {

  const handleClick = (e) => {
    if (disabled || isLoading) return
    triggerAudioHaptic()
    if (onClick) onClick(e)
  }

  // Modern Solid & Vibrant Gradient Capsule Themes
  const buttonThemes = {
    lime: 'bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-300 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-lime-300/50 font-black',
    cyan: 'bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-300/50 font-black',
    purple: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 border border-purple-400/30',
    amber: 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 border border-amber-300/50 font-black',
    teal: 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 text-slate-950 shadow-teal-500/25 hover:shadow-teal-500/40 border border-teal-300/50 font-black',
    pink: 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-pink-500/25 hover:shadow-pink-500/40 border border-pink-400/30 font-black',
    crimson: 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white shadow-rose-500/25 hover:shadow-rose-500/40 border border-rose-400/30',
    emerald: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 shadow-emerald-500/25 hover:shadow-emerald-500/40 border border-emerald-300/50 font-black',
    indigo: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 border border-indigo-400/30',
    dark: 'bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-slate-600 shadow-xl'
  }

  const selectedTheme = buttonThemes[theme] || buttonThemes.indigo

  // Sizes
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-[11px] space-x-1.5',
    md: 'px-5 py-2.5 text-xs space-x-2',
    lg: 'px-6 py-3 text-sm space-x-2.5'
  }

  // FILTER VARIANT
  if (variant === 'filter') {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: disabled ? 1 : 1.04 }}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={`
          relative inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer border select-none backdrop-blur-md shadow-md
          ${sizeClasses[size] || sizeClasses.md}
          ${active 
            ? `${selectedTheme} shadow-lg scale-[1.02]` 
            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shrink-0" />}
        {Icon && <Icon className={`h-3.5 w-3.5 ${active ? 'text-current' : 'text-slate-400'}`} />}
        <span>{children}</span>
        {count !== undefined && count !== null && (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${active ? 'bg-black/20 text-current' : 'bg-slate-800 text-slate-400'}`}>
            {count}
          </span>
        )}
      </motion.button>
    )
  }

  // BUTTON VARIANT (SLEEK FULL-BLEED GRADIENT CAPSULE)
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.03, y: disabled || isLoading ? 0 : -1 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97, y: 0 }}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center font-mono font-extrabold uppercase tracking-wider rounded-full transition-all duration-300 shadow-xl cursor-pointer select-none backdrop-blur-md overflow-hidden group
        ${sizeClasses[size] || sizeClasses.md}
        ${selectedTheme}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Subtle shine overlay effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
      
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 text-current shrink-0" />
      ) : null}
      <span className="relative z-10 leading-none">{children}</span>
    </motion.button>
  )
})

Pill.displayName = 'Pill'
export default memo(Pill)
