import React from 'react'
import { Award, DollarSign, Users, TrendingUp, ShieldCheck, Flame } from 'lucide-react'

export default function TrainerStatsBanner({ trainerProfile, subscribers = [] }) {
  const planPrice = trainerProfile?.monthly_plan_price || 2500
  const totalMonthlyEarnings = subscribers.length * planPrice

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1 rounded-full text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-widest">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>Certified Head Coach Command</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Coach {trainerProfile?.full_name || 'Staff Instructor'}
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Specialization: <span className="text-amber-400 font-bold uppercase">{trainerProfile?.specialty || 'Strength & Conditioning'}</span> • {planPrice.toLocaleString()} EGP/mo Rate
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10 w-full lg:w-auto">
        <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-white font-mono">{totalMonthlyEarnings.toLocaleString()} EGP</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Monthly MRR</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-white font-mono">{subscribers.length}</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Roster Clients</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-black text-amber-400 font-mono">100%</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Client Retention</p>
          </div>
        </div>
      </div>
    </div>
  )
}