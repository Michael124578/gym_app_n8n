import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabaseClient'
import { 
  User, CheckCircle, Calendar, LogOut, ShieldCheck, UserPlus, Send, 
  Activity, X, KeyRound, Edit3, Save, Lock, AlertCircle 
} from 'lucide-react'

export default function MemberPortal({ session, onLogout }) {
  const [member, setMember] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [guestName, setGuestName] = useState('')
  const [generatedGuestPass, setGeneratedGuestPass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // Profile Edit State
  const [editName, setEditName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  
  // Feedback Toast
  const [toastMessage, setToastMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const showError = (msg) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(null), 4000)
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchMemberData(session.user.email)
    }
  }, [session])

  const fetchMemberData = async (userEmail) => {
    setLoading(true)
    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .eq('email', userEmail.toLowerCase())
      .single()

    if (memberData) {
      setMember(memberData)
      setEditName(memberData.full_name)

      const { data: checkInData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('member_id', memberData.id)
        .order('checked_in_at', { ascending: false })

      if (checkInData) setCheckIns(checkInData)
    }
    setLoading(false)
  }

  // Update Full Name in public.members
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!editName.trim() || editName === member.full_name) {
      setIsEditingName(false)
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from('members')
      .update({ full_name: editName.trim() })
      .eq('id', member.id)

    setLoading(false)

    if (error) {
      showError(`Profile Update Failed: ${error.message}`)
    } else {
      setMember({ ...member, full_name: editName.trim() })
      setIsEditingName(false)
      showToast('Profile updated successfully!')
    }
  }

  // Update Password in Supabase Auth
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      showError('Password must be at least 6 characters long.')
      return
    }

    setIsUpdatingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    setIsUpdatingPassword(false)

    if (error) {
      showError(`Password Update Failed: ${error.message}`)
    } else {
      setNewPassword('')
      showToast('Account password updated successfully!')
    }
  }

  const handleGenerateGuestPass = async (e) => {
    e.preventDefault()
    if (!guestName.trim() || !member) return

    setLoading(true)
    const { data } = await supabase
      .from('guest_passes')
      .insert([{ host_member_id: member.id, guest_name: guestName.trim() }])
      .select()
      .single()

    if (data) {
      setGeneratedGuestPass(data)
      setGuestName('')
      showToast(`Guest pass issued for ${data.guest_name}`)
    }
    setLoading(false)
  }

  if (loading && !member) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-sm font-medium animate-pulse">
        Loading member pass credentials...
      </div>
    )
  }

  if (!member) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* FLOATING TOAST NOTIFICATIONS */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 text-xs font-bold animate-bounce flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-rose-400/30 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-200" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Welcome, {member.full_name}!</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Member ID: {member.id.substring(0, 8)}...</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DIGITAL PASS CARD */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/90 border border-slate-800/80 p-6 rounded-3xl shadow-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3 mb-4">
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

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{member.full_name}</p>
              <p className="text-xs text-indigo-300 font-semibold mt-1">{member.plan_name || 'Monthly Pass'}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>
              <p className="text-[10px] text-slate-500 mt-4 font-mono">
                Expires: {member.membership_end_date ? new Date(member.membership_end_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="bg-white p-2.5 rounded-2xl shadow-xl text-center cursor-pointer hover:scale-105 transition" onClick={() => setIsZoomed(true)}>
              <QRCodeSVG value={member.qr_code_token || member.id} size={100} bgColor="#ffffff" fgColor="#0f172a" level="H" />
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

      {/* MEMBER EDITABLE PROFILE & SECURITY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EDIT PROFILE DETAILS */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Personal Information</h3>
            </div>
            {!isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditingName ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div className="flex space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setEditName(member.full_name); setIsEditingName(false); }}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Full Name</p>
                <p className="text-slate-200 font-bold">{member.full_name}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Email Address (Read-Only)</p>
                <p className="text-slate-400 font-mono">{member.email}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Active Membership Plan</p>
                <p className="text-indigo-400 font-semibold">{member.plan_name || 'Monthly Pass'}</p>
              </div>
            </div>
          )}
        </div>

        {/* SECURITY & PASSWORD UPDATE */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Security & Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
                <KeyRound className="absolute right-3 top-2.5 h-4 w-4 text-slate-600" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Lock className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>{isUpdatingPassword ? 'Updating...' : 'Update Account Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* FULLSCREEN QR ZOOM MODAL */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6" onClick={() => setIsZoomed(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-sm w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsZoomed(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-slate-900 font-bold text-lg">{member.full_name}</h3>
            <div className="flex justify-center p-2">
              <QRCodeSVG value={member.qr_code_token || member.id} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
            </div>
            <p className="text-xs text-slate-500 font-semibold">Max Brightness • Hold directly to scanner laser</p>
          </div>
        </div>
      )}
    </div>
  )
}