import React from 'react'
import { Menu, QrCode, LogOut, ShieldCheck, Wifi, Radio, Dumbbell, User } from 'lucide-react'

export default function Navbar({ title = 'IRON GYM', subtitle, role, onLogout, onToggleSidebar }) {
  const roleLabel = role === 'admin' ? 'Master Admin' : role === 'trainer' ? 'Certified Coach' : 'Club Athlete'
  const roleBadgeColor = role === 'admin' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : role === 'trainer' ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/85 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xl">
      
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
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">{title}</h1>
              <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">PERFORMANCE CLUB</span>
            </div>
            {subtitle && <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* CENTER: TELEMETRY PULSE GAUGE */}
      <div className="hidden md:flex items-center space-x-2.5 bg-slate-900/90 border border-slate-800/90 px-4 py-1.5 rounded-full shadow-inner">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-1.5">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span>Realtime Turnstile Sync</span>
        </span>
      </div>

      {/* RIGHT: ROLE BADGE & LOGOUT */}
      <div className="flex items-center space-x-3">
        {role && (
          <span className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${roleBadgeColor}`}>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>{roleLabel}</span>
          </span>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 sm:px-3.5 sm:py-2 text-slate-400 hover:text-rose-400 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold uppercase">Exit</span>
          </button>
        )}
      </div>
    </header>
  )
}