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

  // Sleek, Eye-Comfortable Dark-Mode Gradients
  const buttonThemes = {
    lime: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30 font-bold',
    cyan: 'bg-gradient-to-r from-cyan-600 via-teal-600 to-indigo-600 text-white shadow-cyan-950/50 hover:from-cyan-500 hover:to-indigo-500 border border-cyan-400/30 font-bold',
    purple: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white shadow-indigo-950/50 hover:from-indigo-500 hover:to-violet-600 border border-indigo-400/30 font-bold',
    amber: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-amber-950/50 hover:from-amber-500 hover:to-orange-500 border border-amber-400/30 font-bold',
    teal: 'bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-teal-950/50 hover:from-teal-500 hover:to-cyan-500 border border-teal-400/30 font-bold',
    pink: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-indigo-950/50 hover:from-indigo-500 hover:to-pink-500 border border-indigo-400/30 font-bold',
    crimson: 'bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 text-white shadow-rose-950/50 border border-rose-400/30 font-bold',
    emerald: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-950/50 border border-emerald-400/30 font-bold',
    indigo: 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-indigo-950/50 border border-indigo-400/30 font-bold',
    dark: 'bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-slate-600 shadow-xl font-bold'
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
