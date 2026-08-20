import React from 'react'
import { Download, RefreshCw, FileSpreadsheet, Activity, AlertTriangle } from 'lucide-react'

export default function AnalyticsHeader({
  timeRange,
  setTimeRange,
  lastUpdated,
  fetchAnalyticsData,
  isRefreshing,
  exportToCSV
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/60 backdrop-blur-xl border border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-xl">
      <div>
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>EXECUTIVE ANALYTICS</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              LIVE METRICS
            </span>
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time intelligence, revenue flow, and member engagement data
          {lastUpdated && ` • Refreshed ${lastUpdated.toLocaleTimeString()}`}
        </p>
      </div>

      {/* TIMEFRAME TOGGLE & REFRESH */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {[
            { id: '7d', label: '7D' },
            { id: '30d', label: '30D' },
            { id: '90d', label: '90D' },
            { id: 'month', label: 'Month' },
            { id: 'year', label: 'Year' },
            { id: 'all', label: 'All' }
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeRange(tf.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${timeRange === tf.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchAnalyticsData}
          disabled={isRefreshing}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-2xl transition shadow-md disabled:opacity-50 cursor-pointer"
          title="Refresh Live Data"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* EXPORT DROPDOWN BUTTON */}
        <div className="relative group">
          <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition cursor-pointer">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-50">
            <button
              onClick={() => exportToCSV('revenue')}
              className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center space-x-2 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Revenue Ledger</span>
            </button>
            <button
              onClick={() => exportToCSV('attendance')}
              className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center space-x-2 cursor-pointer"
            >
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
              <span>Attendance Logs</span>
            </button>
            <button
              onClick={() => exportToCSV('expiring')}
              className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center space-x-2 cursor-pointer"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Expiring Members List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
