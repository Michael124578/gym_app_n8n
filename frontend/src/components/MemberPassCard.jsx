import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { ShieldCheck, Download, RefreshCw, QrCode, CheckCircle2 } from 'lucide-react'

export default function MemberPassCard({ member, cardRef, onDownload, onZoom }) {
  const [totpToken, setTotpToken] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)

  useEffect(() => {
    if (!member?.id) return

    const updatePass = () => {
      const epoch = Math.floor(Date.now() / 1000)
      const timeStep = Math.floor(epoch / 30)
      const secretKey = member.qr_code_token || 'IRON_SECRET'
      const rawSeed = `${member.id}-${secretKey}-${timeStep}`

      let hash = 0
      for (let i = 0; i < rawSeed.length; i++) {
        hash = (hash << 5) - hash + rawSeed.charCodeAt(i)
        hash |= 0
      }
      const tokenPart = Math.abs(hash).toString(36).toUpperCase()
      const newToken = `PASS-${member.id.substring(0, 8)}-${timeStep}-${tokenPart}`

      setTotpToken(newToken)
      setTimeLeft(30 - (epoch % 30))
    }

    updatePass()
    const interval = setInterval(updatePass, 1000)
    return () => clearInterval(interval)
  }, [member])

  if (!member) return null

  return (
    <div 
      ref={cardRef} 
      className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden w-full"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* CARD TOP HEADER */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 mb-4 relative z-10">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <span className="text-xs font-black tracking-widest text-white uppercase">IRON GYM DIGITAL GATE PASS</span>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {member.status || 'Active'}
        </span>
      </div>

      {/* CARD BODY */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">{member.full_name}</p>
          <p className="text-xs text-indigo-400 font-bold uppercase">{member.plan_name || 'Annual Titan Pass'}</p>
          <p className="text-xs text-slate-400 font-mono">{member.email}</p>

          <div className="pt-2 space-y-1 max-w-[160px]">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <RefreshCw className={`h-2.5 w-2.5 ${timeLeft <= 5 ? 'animate-spin text-rose-400' : 'text-indigo-400'}`} />
                <span>Dynamic Cycle:</span>
              </span>
              <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-indigo-300'}`}>{timeLeft}s</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={onDownload}
              className="text-[11px] font-bold text-slate-400 hover:text-white inline-flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              <span>Save Pass PNG</span>
            </button>
          </div>
        </div>

        {/* CLICKABLE QR CODE CONTAINER */}
        <motion.button 
          type="button"
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            if (onZoom) onZoom()
          }}
          className="bg-white p-3.5 rounded-2xl shadow-2xl cursor-pointer relative z-20 pointer-events-auto border-2 border-slate-200 shrink-0 self-center sm:self-auto"
        >
          <QRCodeSVG value={totpToken || member.qr_code_token || member.id} size={110} bgColor="#ffffff" fgColor="#090d16" level="H" />
          <span className="block text-[8px] font-bold text-slate-600 mt-1 uppercase text-center font-mono tracking-wider">Tap to Zoom</span>
        </motion.button>
      </div>
    </div>
  )
}