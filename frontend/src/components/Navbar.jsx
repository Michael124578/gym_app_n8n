import React from 'react'
import { Menu, QrCode, LogOut, ShieldCheck, Wifi } from 'lucide-react'

export default function Navbar({ title = 'IRON GYM', subtitle, role, onLogout, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl shadow-md shadow-indigo-600/20">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-[10px] text-slate-400 font-mono">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
          <Wifi className="h-3 w-3 text-emerald-400 mr-1" />
          <span>Realtime Gate Link</span>
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {role && (
          <span className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{role}</span>
          </span>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition flex items-center space-x-1.5"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Exit</span>
          </button>
        )}
      </div>
    </header>
  )
}