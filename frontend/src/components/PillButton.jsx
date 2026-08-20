import React, { forwardRef } from 'react'

const BUTTON_THEMES = {
  lime: {
    border: 'from-lime-400 via-yellow-400 to-emerald-500',
    orb: 'from-lime-400 to-emerald-500',
    glow: 'hover:shadow-lime-500/30',
    ring: 'focus-visible:ring-lime-400',
  },
  cyan: {
    border: 'from-cyan-400 via-sky-400 to-rose-400',
    orb: 'from-cyan-400 to-rose-400',
    glow: 'hover:shadow-cyan-500/30',
    ring: 'focus-visible:ring-cyan-400',
  },
  purple: {
    border: 'from-indigo-500 via-purple-500 to-rose-500',
    orb: 'from-indigo-500 to-rose-500',
    glow: 'hover:shadow-indigo-500/30',
    ring: 'focus-visible:ring-indigo-400',
  },
  amber: {
    border: 'from-purple-500 via-pink-500 to-amber-400',
    orb: 'from-pink-500 to-amber-400',
    glow: 'hover:shadow-amber-500/30',
    ring: 'focus-visible:ring-amber-400',
  },
  teal: {
    border: 'from-teal-400 via-emerald-400 to-cyan-500',
    orb: 'from-teal-400 to-cyan-500',
    glow: 'hover:shadow-teal-500/30',
    ring: 'focus-visible:ring-teal-400',
  },
  pink: {
    border: 'from-purple-600 via-fuchsia-500 to-rose-500',
    orb: 'from-fuchsia-500 to-rose-500',
    glow: 'hover:shadow-fuchsia-500/30',
    ring: 'focus-visible:ring-fuchsia-400',
  },
  crimson: {
    border: 'from-rose-500 via-red-500 to-amber-500',
    orb: 'from-rose-500 to-red-600',
    glow: 'hover:shadow-rose-500/30',
    ring: 'focus-visible:ring-rose-400',
  },
  emerald: {
    border: 'from-emerald-400 via-teal-400 to-cyan-500',
    orb: 'from-emerald-400 to-teal-500',
    glow: 'hover:shadow-emerald-500/30',
    ring: 'focus-visible:ring-emerald-400',
  },
}

const PillButton = forwardRef(function PillButton(
  {
    children,
    onClick,
    type = 'button',
    theme = 'purple',
    icon: Icon,
    iconPosition = 'right',
    className = '',
    disabled = false,
    isLoading = false,
    fullWidth = false,
    size = 'md',
    title,
    'aria-label': ariaLabel,
    ...props
  },
  ref
) {
  const currentTheme = BUTTON_THEMES[theme] || BUTTON_THEMES.purple
  const isButtonDisabled = disabled || isLoading

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-[11px] gap-2',
    md: 'px-5 py-2.5 text-xs gap-3',
    lg: 'px-6 py-3.5 text-xs sm:text-sm gap-4',
  }

  const orbSizes = {
    sm: 'h-5 w-5 min-w-[20px]',
    md: 'h-6 w-6 min-w-[24px]',
    lg: 'h-7 w-7 min-w-[28px]',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  // Play subtle tactile audio tick on click if AudioContext available
  const handleClick = (e) => {
    if (isButtonDisabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        if (ctx.state === 'suspended') ctx.resume()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04)
        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.04)
      }
    } catch (err) {}

    if (onClick) onClick(e)
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={handleClick}
      disabled={isButtonDisabled}
      title={title}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`
        group relative inline-flex items-center justify-between rounded-full p-[2px] 
        bg-gradient-to-r ${currentTheme.border} 
        transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]
        hover:shadow-xl ${currentTheme.glow}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${currentTheme.ring}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
        cursor-pointer ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {/* INNER DARK CAPSULE BODY WITH SHIMMER GLASS REFLECTION */}
      <span
        className={`
          relative overflow-hidden w-full rounded-full bg-slate-950/95 backdrop-blur-md 
          flex items-center justify-between font-black uppercase tracking-wider text-white select-none
          ${sizeClasses[size] || sizeClasses.md}
        `}
      >
        {/* SHIMMER GLASS HIGHLIGHT EFFECT ON HOVER */}
        <span className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

        {/* LEFT ORB (IF POSITION IS LEFT) */}
        {iconPosition === 'left' && (
          <span
            className={`
              shrink-0 rounded-full bg-gradient-to-tr ${currentTheme.orb} 
              flex items-center justify-center text-white shadow-md shadow-black/40 ring-1 ring-white/30
              transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12
              ${orbSizes[size] || orbSizes.md}
            `}
          >
            {isLoading ? (
              <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : Icon ? (
              <Icon className={`${iconSizes[size] || iconSizes.md} text-white drop-shadow`} />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white/90 shadow-inner" />
            )}
          </span>
        )}

        {/* BUTTON LABEL */}
        <span className="truncate px-1 flex-1 text-center font-bold tracking-wider">
          {children}
        </span>

        {/* RIGHT ORB (DEFAULT POSITION) */}
        {iconPosition === 'right' && (
          <span
            className={`
              shrink-0 rounded-full bg-gradient-to-tr ${currentTheme.orb} 
              flex items-center justify-center text-white shadow-md shadow-black/40 ring-1 ring-white/30
              transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12
              ${orbSizes[size] || orbSizes.md}
            `}
          >
            {isLoading ? (
              <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : Icon ? (
              <Icon className={`${iconSizes[size] || iconSizes.md} text-white drop-shadow`} />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white/90 shadow-inner" />
            )}
          </span>
        )}
      </span>
    </button>
  )
})

export default PillButton
