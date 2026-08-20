import React from 'react'

const BUTTON_THEMES = {
  lime: {
    border: 'from-lime-400 via-yellow-400 to-emerald-500',
    orb: 'from-lime-400 to-emerald-500',
    glow: 'hover:shadow-lime-500/30',
  },
  cyan: {
    border: 'from-cyan-400 via-sky-400 to-rose-400',
    orb: 'from-cyan-400 to-rose-400',
    glow: 'hover:shadow-cyan-500/30',
  },
  purple: {
    border: 'from-indigo-500 via-purple-500 to-rose-500',
    orb: 'from-indigo-500 to-rose-500',
    glow: 'hover:shadow-indigo-500/30',
  },
  amber: {
    border: 'from-purple-500 via-pink-500 to-amber-400',
    orb: 'from-pink-500 to-amber-400',
    glow: 'hover:shadow-amber-500/30',
  },
  teal: {
    border: 'from-teal-400 via-emerald-400 to-cyan-500',
    orb: 'from-teal-400 to-cyan-500',
    glow: 'hover:shadow-teal-500/30',
  },
  pink: {
    border: 'from-purple-600 via-fuchsia-500 to-rose-500',
    orb: 'from-fuchsia-500 to-rose-500',
    glow: 'hover:shadow-fuchsia-500/30',
  },
}

export default function PillButton({
  children,
  onClick,
  type = 'button',
  theme = 'purple',
  icon: Icon,
  className = '',
  disabled = false,
  fullWidth = false,
  size = 'md',
  ...props
}) {
  const currentTheme = BUTTON_THEMES[theme] || BUTTON_THEMES.purple

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-[11px] gap-2',
    md: 'px-5 py-2.5 text-xs gap-3',
    lg: 'px-6 py-3.5 text-xs sm:text-sm gap-4',
  }

  const orbSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-between rounded-full p-[2px] 
        bg-gradient-to-r ${currentTheme.border} 
        transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]
        hover:shadow-xl ${currentTheme.glow}
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        cursor-pointer ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {/* INNER DARK CONTAINER */}
      <span
        className={`
          w-full rounded-full bg-slate-950/95 backdrop-blur-md 
          flex items-center justify-between font-black uppercase tracking-wider text-white
          ${sizeClasses[size] || sizeClasses.md}
        `}
      >
        {/* BUTTON LABEL */}
        <span className="truncate pr-1">{children}</span>

        {/* GRADIENT ORB ACCENT */}
        <span
          className={`
            shrink-0 rounded-full bg-gradient-to-tr ${currentTheme.orb} 
            flex items-center justify-center text-white shadow-md shadow-black/40
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12
            ${orbSizes[size] || orbSizes.md}
          `}
        >
          {Icon ? (
            <Icon className={`${iconSizes[size] || iconSizes.md} text-white drop-shadow`} />
          ) : (
            <span className="h-2 w-2 rounded-full bg-white/80 shadow-inner" />
          )}
        </span>
      </span>
    </button>
  )
}
