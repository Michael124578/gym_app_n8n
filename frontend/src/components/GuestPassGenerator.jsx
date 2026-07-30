import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { UserPlus, Send } from 'lucide-react'

export default function GuestPassGenerator({ guestName, setGuestName, onGenerate, generatedGuestPass, loading }) {
  return (
    <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between w-full">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <UserPlus className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase">Issue Guest Access Pass</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">Grant a 24-hour single-use QR pass to a workout partner.</p>

        <form onSubmit={onGenerate} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Guest Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center space-x-1 shadow-lg shadow-indigo-600/30"
          >
            <Send className="h-3.5 w-3.5 mr-1" />
            <span>Issue Guest Pass</span>
          </button>
        </form>
      </div>

      {generatedGuestPass && (
        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-200">Guest: {generatedGuestPass.guest_name}</p>
            <p className="text-[10px] text-slate-400 font-mono">Token: {generatedGuestPass.pass_token.substring(0, 8)}...</p>
          </div>
          <div className="bg-white p-1 rounded-lg">
            <QRCodeSVG value={generatedGuestPass.pass_token} size={48} />
          </div>
        </div>
      )}
    </div>
  )
}