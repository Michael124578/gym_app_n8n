import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { User, CheckCircle, Calendar, LogOut, Search, Activity, ShieldCheck, UserPlus, Send, Maximize2, X } from 'lucide-react'

export default function MemberPortal() {
  const [emailInput, setEmailInput] = useState('')
  const [member, setMember] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [guestName, setGuestName] = useState('')
  const [generatedGuestPass, setGeneratedGuestPass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingPass, setFetchingPass] = useState(false)
  const [error, setError] = useState('')
  
  // Fullscreen High-Contrast Zoom Modal State
  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('gym_member_email')
    if (savedEmail) {
      fetchMemberData(savedEmail)
    }
  }, [])

  const fetchMemberData = async (emailToFetch) => {
    setFetchingPass(true)
    setError('')

    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('email', emailToFetch.trim().toLowerCase())
      .single()

    if (memberError || !memberData) {
      setError('Member profile not found. Please verify your email address.')
      setFetchingPass(false)
      return
    }

    setMember(memberData)
    localStorage.setItem('gym_member_email', memberData.email)

    const { data: checkInData } = await supabase
      .from('check_ins')
      .select('*')
      .eq('member_id', memberData.id)
      .order('checked_in_at', { ascending: false })

    if (checkInData) setCheckIns(checkInData)
    setFetchingPass(false)
  }

  const handleGenerateGuestPass = async (e) => {
    e.preventDefault()
    if (!guestName.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('guest_passes')
      .insert([{
        host_member_id: member.id,
        guest_name: guestName.trim()
      }])
      .select()
      .single()

    if (!error && data) {
      setGeneratedGuestPass(data)
      setGuestName('')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('gym_member_email')
    setMember(null)
    setCheckIns([])
    setEmailInput('')
  }

  if (!member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl w-fit mx-auto mb-4 text-indigo-400">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Member Portal</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">Enter your registered email to access your digital pass</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); if (emailInput) fetchMemberData(emailInput) }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="registered@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={fetchingPass}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {fetchingPass ? 'Retrieving Pass...' : 'Access My Digital Pass'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Welcome, {member.full_name}!</h2>
          <p className="text-xs text-slate-400">Member ID: {member.id.substring(0, 8)}...</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HOLOGRAPHIC GYM PASS CARD */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 border border-slate-800/80 hover:border-indigo-500/40 p-6 rounded-3xl shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-extrabold text-indigo-400 tracking-widest uppercase">IRON GYM PASS</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {member.status}
            </span>
          </div>

          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{member.full_name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>
              <p className="text-[10px] text-slate-500 mt-4 font-mono">
                Expires: {member.membership_end_date ? new Date(member.membership_end_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-2xl shadow-xl text-center cursor-pointer hover:scale-105 transition" onClick={() => setIsZoomed(true)}>
              <QRCodeSVG 
                value={member.qr_code_token || member.id} 
                size={100}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
              />
              <span className="block text-[8px] font-bold text-slate-500 mt-1 uppercase">Tap to Zoom</span>
            </div>
          </div>
        </div>

        {/* GUEST PASS GENERATOR */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <UserPlus className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Generate 24-Hour Guest Pass</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Invite a workout partner. Valid for 1-time gate access.</p>

            <form onSubmit={handleGenerateGuestPass} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Guest Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
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
      </div>

      {/* FULLSCREEN HIGH-CONTRAST QR ZOOM MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setIsZoomed(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsZoomed(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-slate-900 font-bold text-lg">{member.full_name}</h3>
            <div className="flex justify-center p-2">
              <QRCodeSVG value={member.qr_code_token || member.id} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>
            <p className="text-xs text-slate-500 font-semibold">Max Brightness • Hold directly to scanner laser</p>
            <button 
              onClick={() => setIsZoomed(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition"
            >
              Close Terminal View
            </button>
          </div>
        </div>
      )}

      {/* CHECK-IN HISTORY */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <span>Attendance Log</span>
        </h3>

        {checkIns.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-800 rounded-xl">
            No check-ins recorded yet. Show your QR pass at the front desk terminal!
          </p>
        ) : (
          <div className="space-y-2">
            {checkIns.map((item) => (
              <div key={item.id} className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="font-medium text-slate-200">{item.notes || 'Front Desk Check-In'}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {new Date(item.checked_in_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}