import React from 'react'

const FILTER_THEMES = {
  indigo: {
    activeBorder: 'from-indigo-500 via-purple-500 to-rose-500',
    activeOrb: 'from-indigo-500 to-rose-500',
    glow: 'shadow-indigo-500/30',
  },
  emerald: {
    activeBorder: 'from-emerald-400 via-teal-400 to-cyan-500',
    activeOrb: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/30',
  },
  amber: {
    activeBorder: 'from-purple-500 via-pink-500 to-amber-400',
    activeOrb: 'from-pink-500 to-amber-400',
    glow: 'shadow-amber-500/30',
  },
  rose: {
    activeBorder: 'from-rose-500 via-red-500 to-amber-500',
    orb: 'from-rose-500 to-red-600',
    glow: 'shadow-rose-500/30',
  },
  cyan: {
    activeBorder: 'from-cyan-400 via-sky-400 to-rose-400',
    activeOrb: 'from-cyan-400 to-rose-400',
    glow: 'shadow-cyan-500/30',
  },
}

export default function PillFilter({
  children,
  active = false,
  onClick,
  theme = 'indigo',
  count,
  icon: Icon,
  size = 'md',
  className = '',
  ...props
}) {
  const currentTheme = FILTER_THEMES[theme] || FILTER_THEMES.indigo

  const sizeClasses = {
    sm: 'px-3 py-1 text-[11px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-xs font-black gap-2.5',
  }

  const orbSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  // Tactical Audio Tick on filter selection
  const handleClick = (e) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        if (ctx.state === 'suspended') ctx.resume()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.03)
        gain.gain.setValueAtTime(0.04, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.03)
      }
    } catch (err) {}

    if (onClick) onClick(e)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group relative inline-flex items-center rounded-full p-[2px] 
        transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0 select-none
        ${
          active
            ? `bg-gradient-to-r ${currentTheme.activeBorder} shadow-lg ${currentTheme.glow}`
            : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50'
        }
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          w-full rounded-full flex items-center justify-between font-black uppercase tracking-wider transition-colors
          ${
            active
              ? 'bg-slate-950 text-white'
              : 'bg-slate-950/70 text-slate-400 group-hover:text-slate-200'
          }
          ${sizeClasses[size] || sizeClasses.md}
        `}
      >
        {/* OPTIONAL ICON */}
        {Icon && (
          <Icon className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors h-3.5 w-3.5`} />
        )}

        {/* FILTER LABEL */}
        <span>{children}</span>

        {/* COUNT BADGE OR ACTIVE GLOW ORB */}
        {count !== undefined ? (
          <span
            className={`
              ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold transition-colors
              ${
                active
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-500 group-hover:text-slate-400'
              }
            `}
          >
            {count}
          </span>
        ) : (
          active && (
            <span
              className={`
                shrink-0 rounded-full bg-gradient-to-tr ${currentTheme.activeOrb || 'from-indigo-500 to-violet-500'} 
                flex items-center justify-center shadow-sm shadow-black/50 ml-1
                ${orbSizes[size] || orbSizes.md}
              `}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          )
        )}
      </span>
    </button>
  )
}
