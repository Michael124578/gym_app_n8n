import React, { useRef } from 'react'
import { Flame, Download, CalendarCheck } from 'lucide-react'
import { toPng } from 'html-to-image'

export default function MemberAttendanceCalendar({ member, checkIns = [] }) {
  const cardRef = useRef(null)

  const formatLocalDate = (dateObj) => {
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const calculateStreak = () => {
    if (!checkIns.length) return 0
    const setOfDates = new Set(checkIns.map(c => formatLocalDate(new Date(c.checked_in_at))))
    
    let streak = 0
    let curr = new Date()

    while (true) {
      const dateStr = formatLocalDate(curr)
      if (setOfDates.has(dateStr)) {
        streak++
        curr.setDate(curr.getDate() - 1)
      } else if (streak === 0) {
        // Check if yesterday had a checkin to allow streak continuity prior to today's visit
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
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true })
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
      checkIns.map(c => formatLocalDate(new Date(c.checked_in_at)))
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
          className={`h-7 w-7 rounded-lg flex items-center justify-center text-[9px] font-bold transition ${
            hasCheckedIn
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-600'
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
    <div className="space-y-6" ref={cardRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl text-amber-400">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{streak} Days</p>
              <p className="text-xs text-slate-400 font-medium">Active Gym Streak 🔥</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {streak > 3 ? 'On Fire!' : 'Keep Going!'}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
            <h4 className="text-sm font-bold text-white">Offline Pass Card</h4>
            <p className="text-xs text-slate-400">Save pass image to device gallery</p>
          </div>
          <button
            onClick={handleDownloadPass}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-indigo-600/20"
          >
            <Download className="h-4 w-4" />
            <span>Save Pass Image</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">30-Day Attendance Grid</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-between">
          {render30DayHeatmap()}
        </div>
      </div>
    </div>
  )
}