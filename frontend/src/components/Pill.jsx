import React, { forwardRef } from 'react'
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
  ...props
}, ref) => {

  const handleClick = (e) => {
    if (disabled || isLoading) return
    triggerAudioHaptic()
    if (onClick) onClick(e)
  }

  // Theme Gradients
  const themes = {
    lime: 'pill-btn-lime border-lime-400/40 text-lime-300',
    cyan: 'pill-btn-cyan border-cyan-400/40 text-cyan-300',
    purple: 'pill-btn-purple border-purple-400/40 text-purple-300',
    amber: 'pill-btn-amber border-amber-400/40 text-amber-300',
    teal: 'pill-btn-teal border-teal-400/40 text-teal-300',
    pink: 'pill-btn-pink border-pink-400/40 text-pink-300',
    crimson: 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 border-rose-400/40 text-rose-200',
    emerald: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 border-emerald-400/40 text-emerald-200',
    indigo: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 border-indigo-400/40 text-indigo-200'
  }

  const selectedTheme = themes[theme] || themes.indigo

  // Sizes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-5 py-2.5 text-sm'
  }

  // FILTER VARIANT
  if (variant === 'filter') {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={`
          relative inline-flex items-center space-x-2 font-mono font-bold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer border select-none
          ${sizeClasses[size] || sizeClasses.md}
          ${active 
            ? `${selectedTheme} bg-slate-950 shadow-lg` 
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }
          ${className}
        `}
        {...props}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
        {Icon && <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />}
        <span>{children}</span>
        {count !== undefined && count !== null && (
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
            {count}
          </span>
        )}
      </motion.button>
    )
  }

  // BUTTON VARIANT
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.04 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`
        pill-button-wrapper relative inline-flex items-center justify-center font-mono font-black uppercase tracking-wider rounded-full transition-all duration-300 shadow-xl cursor-pointer select-none
        ${sizeClasses[size] || sizeClasses.md}
        ${selectedTheme}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      <span className="pill-button-inner bg-slate-950 rounded-full flex items-center justify-center space-x-2 px-3 py-1 text-white w-full h-full">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
        ) : Icon ? (
          <Icon className="h-3.5 w-3.5 text-indigo-300" />
        ) : null}
        <span>{children}</span>
      </span>
    </motion.button>
  )
})

Pill.displayName = 'Pill'
export default Pill
