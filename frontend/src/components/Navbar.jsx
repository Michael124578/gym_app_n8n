import React, { useState, useEffect } from 'react'
import { Menu, LogOut, ShieldCheck, Wifi, Dumbbell, Clock, Crown, Zap, Shield, Flame, MapPin } from 'lucide-react'

const LOGO_ICONS = {
  dumbbell: Dumbbell,
  crown: Crown,
  zap: Zap,
  shield: Shield,
  flame: Flame
}

export default function Navbar({ title = 'IRON GYM', subtitle, role, onLogout, onToggleSidebar, onOpenCommandPalette }) {
  const [timeString, setTimeString] = useState('')
  
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem('iron_gym_branding')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      name: title || 'IRON GYM',
      tagline: 'STRENGTH & CONDITIONING',
      activeBranch: 'Cairo Flagship Arena',
      accent: 'indigo',
      iconId: 'dumbbell'
    }
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)

    const handleBrandingUpdate = (e) => {
      if (e.detail) setBranding(e.detail)
    }

    window.addEventListener('gym_branding_updated', handleBrandingUpdate)

    return () => {
      clearInterval(timer)
      window.removeEventListener('gym_branding_updated', handleBrandingUpdate)
    }
  }, [])

  const roleLabel = role === 'admin' ? 'Master Admin' : role === 'trainer' ? 'Certified Coach' : 'Club Athlete'
  const roleBadgeColor = role === 'admin' 
    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
    : role === 'trainer' 
    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' 
    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'

  const LogoIcon = LOGO_ICONS[branding.iconId] || Dumbbell

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xl transition-all">
      
      {/* LEFT: LOGO & MOBILE TOGGLE */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/25">
            <LogoIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">{branding.name}</h1>
              <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
                <MapPin className="h-2.5 w-2.5 text-indigo-400" />
                <span>{branding.activeBranch || branding.tagline}</span>
              </span>
            </div>
            {subtitle && (
              <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CENTER: TELEMETRY & COMMAND PALETTE BUTTON */}
      <div className="hidden md:flex items-center space-x-3">
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 transition cursor-pointer text-xs shadow-inner group"
            title="Open Command Search (Ctrl + K or /)"
          >
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-white">Quick Jump...</span>
            <kbd className="text-[9px] font-mono bg-slate-800/90 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700/80">⌘K</kbd>
          </button>
        )}

        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800/90 px-4 py-1.5 rounded-full shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-1.5">
            <Wifi className="h-3 w-3 text-emerald-400" />
            <span>Turnstile Active</span>
          </span>
          <span className="h-3 w-px bg-slate-800" />
          <span className="text-[10px] font-mono font-bold text-indigo-300 flex items-center space-x-1">
            <Clock className="h-3 w-3 text-indigo-400" />
            <span>{timeString || 'LIVE'}</span>
          </span>
        </div>
      </div>

      {/* RIGHT: ROLE BADGE & LOGOUT */}
      <div className="flex items-center space-x-3">
        {role && (
          <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${roleBadgeColor}`}>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>{roleLabel}</span>
          </span>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 sm:px-3.5 sm:py-2 text-slate-400 hover:text-rose-400 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            title="Sign Out of Session"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold uppercase">Exit</span>
          </button>
        )}
      </div>
    </header>
  )
}