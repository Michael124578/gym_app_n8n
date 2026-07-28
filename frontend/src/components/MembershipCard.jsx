import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck, RefreshCw } from 'lucide-react'

export default function MembershipCard({ member }) {
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
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800/80 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden group">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
        <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase flex items-center space-x-1">
          <ShieldCheck className="h-3.5 w-3.5 mr-1 text-indigo-400" />
          Dynamic Digital Pass
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {member.status}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-white p-3 rounded-2xl shadow-inner group-hover:scale-105 transition duration-300">
          <QRCodeSVG 
            value={totpToken || member.qr_code_token || member.id} 
            size={140}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="H"
          />
        </div>

        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <RefreshCw className={`h-3 w-3 ${timeLeft <= 5 ? 'animate-spin text-rose-400' : 'text-indigo-400'}`} />
              <span>Rotates in:</span>
            </span>
            <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-slate-200'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-base font-bold text-white tracking-tight">{member.full_name}</h3>
          <p className="text-xs text-slate-400 font-mono">{member.email}</p>
        </div>
      </div>
    </div>
  )
}