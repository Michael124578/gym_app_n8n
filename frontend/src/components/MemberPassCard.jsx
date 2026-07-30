import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { ShieldCheck, Download, RefreshCw } from 'lucide-react'

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
    <div ref={cardRef} className="holo-card p-6 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden w-full">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <span className="text-xs font-black tracking-widest text-indigo-300 uppercase">IRON GYM DIGITAL PASS</span>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {member.status}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-black text-white uppercase tracking-tight">{member.full_name}</p>
          <p className="text-xs text-indigo-300 font-semibold mt-1">{member.plan_name || 'Monthly Pass'}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>

          <div className="mt-3 space-y-1 max-w-[140px]">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <RefreshCw className={`h-2.5 w-2.5 ${timeLeft <= 5 ? 'animate-spin text-rose-400' : 'text-indigo-400'}`} />
                <span>Rotates:</span>
              </span>
              <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-slate-200'}`}>{timeLeft}s</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={onDownload}
            className="mt-4 text-[10px] font-bold text-indigo-400 hover:text-white inline-flex items-center space-x-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Save Pass PNG</span>
          </button>
        </div>

        {/* CLICKABLE QR CODE CONTAINER WITH CLICK EVENT PROPAGATION */}
        <motion.button 
          type="button"
          whileHover={{ scale: 1.08 }} 
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            if (onZoom) onZoom()
          }}
          className="bg-white p-3 rounded-2xl shadow-2xl cursor-pointer relative z-20 pointer-events-auto focus:outline-none"
        >
          <QRCodeSVG value={totpToken || member.qr_code_token || member.id} size={100} bgColor="#ffffff" fgColor="#0f172a" level="H" />
          <span className="block text-[8px] font-bold text-slate-500 mt-1 uppercase text-center">Tap to Zoom</span>
        </motion.button>
      </div>
    </div>
  )
}