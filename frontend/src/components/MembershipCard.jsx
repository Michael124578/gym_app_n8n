import React from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function MembershipCard({ member }) {
  if (!member) return null

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-slate-800/80 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden group">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
        <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">
          Digital Gym Pass
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {member.status}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white tracking-tight">{member.full_name}</h3>
          <p className="text-xs text-slate-400 font-mono">{member.email}</p>
          <p className="text-[10px] text-slate-500 pt-2 font-mono">
            ID: {member.id ? `${member.id.substring(0, 8)}...` : 'N/A'}
          </p>
        </div>

        <div className="bg-white p-2.5 rounded-2xl shadow-inner group-hover:scale-105 transition duration-300">
          <QRCodeSVG 
            value={member.qr_code_token || member.id || ''} 
            size={96}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="H"
          />
        </div>
      </div>
    </div>
  )
}