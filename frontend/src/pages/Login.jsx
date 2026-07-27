import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { QrCode, Lock, User, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleMode, setRoleMode] = useState('member') // 'member' or 'admin'
  const [errorMsg, setErrorMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()

    // Strict Single Admin Credentials Check
    if (roleMode === 'admin') {
      if (cleanEmail === 'admin@irongym.com' && password === '123456789') {
        setLoading(false)
        if (onLoginSuccess) onLoginSuccess({ user: { email: cleanEmail, role: 'admin' } }, 'admin')
        return
      } else {
        setErrorMsg('Invalid Admin Email or Security Password.')
        setLoading(false)
        return
      }
    }

    // Member Authentication via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMsg('Invalid credentials. Please verify your email and password.')
    } else {
      if (onLoginSuccess) onLoginSuccess(data.session, 'member')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500 p-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">IRON GYM</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Access Control & Membership Portal</p>
        </div>

        {/* ROLE TOGGLE TABS */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => { setRoleMode('member'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              roleMode === 'member'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Member Pass</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setRoleMode('admin'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              roleMode === 'admin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Staff Terminal</span>
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2 animate-shake">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="member@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {roleMode === 'admin' ? 'Staff Security PIN / Password' : 'Account Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                placeholder={roleMode === 'admin' ? 'Enter PIN (e.g., 1234)' : '••••••••'}
              />
              <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-600" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : roleMode === 'admin' ? 'Access Staff Terminal' : 'Sign In To Member Pass'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}