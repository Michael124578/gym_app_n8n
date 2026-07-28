import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  QrCode, ShieldCheck, ArrowRight, Lock, Mail, 
  Dumbbell, Sparkles, ChevronRight, UserCheck, Flame 
} from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  // Preloader State
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Simulated Intro Loading Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 400) // Brief delay at 100%
          return 100
        }
        return prev + 4
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      if (error) throw error

      const user = data.user

      // 2. Determine Role (Admin vs Member)
      let role = 'member'
      if (user.email === 'michael.nagui.kiriakos@gmail.com' || user.email.includes('admin')) {
        role = 'admin'
      }

      // 3. Trigger parent state callback
      onLoginSuccess(data.session, role)
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==========================================
  // 1. CINEMATIC PRELOADER SCREEN
  // ==========================================
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        {/* Glow ambient background rings */}
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-2xl animate-ping opacity-25" />

        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
          {/* Logo Icon */}
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 mb-6 animate-bounce">
            <QrCode className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-1">
            IRON <span className="text-indigo-500">GYM</span>
          </h1>
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-8">
            Initializing Gate Engine...
          </p>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 h-full transition-all duration-75 ease-out rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="flex justify-between w-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>System Check</span>
            <span>{loadingProgress}%</span>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // 2. HERO LANDING PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden flex flex-col justify-between">
      {/* Background Image with Dark Vignette Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')`
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      <div className="absolute inset-0 z-0 bg-radial-vignette opacity-70" />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase">
            IRON <span className="text-indigo-500">GYM</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-300">
          <a href="#about" className="hover:text-indigo-400 transition">Programs</a>
          <a href="#coaches" className="hover:text-indigo-400 transition">Facilities</a>
          <a href="#pricing" className="hover:text-indigo-400 transition">Plans</a>
          <a href="#contact" className="hover:text-indigo-400 transition">Passes</a>
        </nav>

        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition shadow-lg"
        >
          Sign In
        </button>
      </header>

      {/* HERO MAIN BODY */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-6 py-12 md:py-24 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Flame className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>Digital Pass & Member Portal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-[0.95] text-white mb-6">
            BUILD YOUR <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-white">
              LEGACY TODAY.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl font-normal leading-relaxed mb-8">
            Experience next-generation fitness access with automated contactless QR scan gates, real-time membership management, and seamless digital access.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2 group"
            >
              <span>Access Member Terminal</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-2xl transition flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </main>

      {/* BOTTOM TICKER / FOOTER BAR */}
      <footer className="relative z-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-2 md:space-y-0">
          <div className="flex items-center space-x-6 font-mono text-[11px]">
            <span>● 24/7 Gate Access</span>
            <span>● Real-time QR Sync</span>
            <span>● Automated Billing</span>
          </div>
          <p>© {new Date().getFullYear()} IRON GYM Systems. All rights reserved.</p>
        </div>
      </footer>

      {/* ==========================================
          3. LOGIN AUTH MODAL OVERLAY
         ========================================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Modal Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg"
            >
              ESC
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex bg-gradient-to-tr from-indigo-600 to-violet-500 p-3 rounded-2xl shadow-lg shadow-indigo-600/30 mb-3">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-black uppercase text-white tracking-tight">Sign In To Terminal</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your portal</p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Enter Portal'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}