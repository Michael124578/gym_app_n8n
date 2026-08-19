import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { UserPlus, Send, QrCode, ShieldCheck } from 'lucide-react'

export default function GuestPassGenerator({ guestName, setGuestName, onGenerate, generatedGuestPass, loading }) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-7 rounded-3xl flex flex-col justify-between w-full shadow-2xl space-y-4">
      <div>
        <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3 mb-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Issue Guest Access Pass</h3>
            <p className="text-[11px] text-slate-400">Grant a 24-hour single-use turnstile QR token to a workout partner.</p>
          </div>
        </div>

        <form onSubmit={onGenerate} className="space-y-3 pt-1">
          <div>
            <input
              type="text"
              required
              placeholder="Guest Full Name (e.g. David Miller)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 cursor-pointer disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{loading ? 'Generating...' : 'Issue Guest Pass'}</span>
          </button>
        </form>
      </div>

      {generatedGuestPass && (
        <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              Active Guest Pass
            </span>
            <p className="text-xs font-black text-white uppercase mt-1">{generatedGuestPass.guest_name}</p>
            <p className="text-[10px] text-slate-400 font-mono">Token: {generatedGuestPass.pass_token.substring(0, 14)}...</p>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <QRCodeSVG value={generatedGuestPass.pass_token} size={54} fgColor="#090d16" />
          </div>
        </div>
      )}
    </div>
  )
}