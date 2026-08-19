import React, { useRef } from 'react'
import { Flame, Download, CalendarCheck, CheckCircle2, Award } from 'lucide-react'
import { toPng } from 'html-to-image'
import { formatLocalDate } from '../utils/dateUtils'

export default function MemberAttendanceCalendar({ member, checkIns = [] }) {
  const passCardRef = useRef(null)

  const calculateStreak = () => {
    if (!checkIns.length) return 0
    const setOfDates = new Set(checkIns.map(c => formatLocalDate(c.checked_in_at)))
    
    let streak = 0
    let curr = new Date()

    while (true) {
      const dateStr = formatLocalDate(curr)
      if (setOfDates.has(dateStr)) {
        streak++
        curr.setDate(curr.getDate() - 1)
      } else if (streak === 0) {
        curr.setDate(curr.getDate() - 1)
        if (setOfDates.has(formatLocalDate(curr))) {
          streak++
          curr.setDate(curr.getDate() - 1)
        } else {
          break
        }
      } else {
        break
      }
    }
    return streak
  }

  const handleDownloadPass = async () => {
    if (!passCardRef.current) return
    try {
      const dataUrl = await toPng(passCardRef.current, { cacheBust: true })
      const link = document.createElement('a')
      link.download = `${(member?.full_name || 'Member').replace(/\s+/g, '_')}_IronGym_Pass.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export pass image:', err)
    }
  }

  const render30DayHeatmap = () => {
    const days = []
    const checkInDates = new Set(
      checkIns.map(c => formatLocalDate(c.checked_in_at))
    )

    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = formatLocalDate(d)
      const hasCheckedIn = checkInDates.has(dateStr)

      days.push(
        <div
          key={dateStr}
          title={`${dateStr}: ${hasCheckedIn ? 'Checked In' : 'No visit'}`}
          className={`h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-[10px] font-mono font-bold transition ${
            hasCheckedIn
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'bg-slate-950 border border-slate-800/80 text-slate-500'
          }`}
        >
          {d.getDate()}
        </div>
      )
    }
    return days
  }

  const streak = calculateStreak()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* STREAK WIDGET */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-amber-400">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{streak} Consecutive Days</p>
              <p className="text-xs text-slate-400 font-medium">Training Consistency Streak</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {streak > 3 ? 'Elite Momentum' : 'Active'}
          </span>
        </div>

        {/* OFFLINE PASS BACKUP */}
        <div 
          ref={passCardRef} 
          className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl"
        >
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Offline Gate Pass Backup</h4>
            <p className="text-xs text-slate-400 mt-0.5">Export high-resolution pass to phone gallery</p>
          </div>
          <button
            onClick={handleDownloadPass}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition shadow-lg shadow-indigo-600/20 border border-indigo-400/30 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Pass</span>
          </button>
        </div>
      </div>

      {/* 30-DAY ATTENDANCE HEATMAP */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <CalendarCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-black text-white uppercase tracking-tight">30-Day Turnstile Attendance Matrix</h3>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {checkIns.length} Total Visits
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
          {render30DayHeatmap()}
        </div>

        <div className="flex items-center space-x-4 pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-md bg-emerald-500" />
            <span>Check-in Verified</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-md bg-slate-950 border border-slate-800" />
            <span>Rest Day</span>
          </div>
        </div>
      </div>
    </div>
  )
}