import React from 'react'
import { Zap, DollarSign, Users } from 'lucide-react'

export default function TrainerStatsBanner({ trainerProfile, subscribers = [] }) {
  const totalMonthlyEarnings = subscribers.length * (trainerProfile?.monthly_plan_price || 120)

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      <div className="relative z-10">
        <span className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-500/30 mb-3">
          <Zap className="h-3 w-3 text-amber-300" />
          <span>Master Coach Command</span>
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight">Coach {trainerProfile?.full_name || 'Trainer'}</h2>
        <p className="text-xs text-slate-400 mt-1">Specialization: <strong className="text-indigo-300">{trainerProfile?.specialty || 'Strength & Conditioning'}</strong></p>
      </div>

      <div className="flex items-center space-x-4 relative z-10 w-full md:w-auto">
        <div className="flex-1 md:flex-none bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black text-white">${totalMonthlyEarnings.toLocaleString()}</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Monthly MRR</p>
          </div>
        </div>

        <div className="flex-1 md:flex-none bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black text-white">{subscribers.length}</p>
            <p className="text-[10px] font-mono text-slate-400 uppercase">Active Athletes</p>
          </div>
        </div>
      </div>
    </div>
  )
}