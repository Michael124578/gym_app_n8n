import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  QrCode, ArrowRight, Lock, Mail, 
  Dumbbell, ChevronRight, Flame, Zap, 
  CheckCircle2, Trophy, KeyRound, Activity, 
  Eye, EyeOff, Radio
} from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  // Preloader State
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showDemoLogins, setShowDemoLogins] = useState(false)

  // ESC Listener to close Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeAuthModal()
      }
    }

    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAuthModalOpen])

  // Preloader Progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 250)
          return 100
        }
        return prev + 6
      })
    }, 20)

    return () => clearInterval(interval)
  }, [])

  const handleOpenAuth = () => {
    setErrorMsg('')
    setIsAuthModalOpen(true)
    if (window.location.hash) {
      window.history.pushState('', document.title, window.location.pathname + window.location.search)
    }
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setErrorMsg('')
  }

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  // Unified Login Process with Multi-tier Role Detection
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      if (error) throw error

      const user = data.user
      let detectedRole = 'member'

      const userRoleMeta = user?.user_metadata?.user_role

      // Role Priority Check
      if (userRoleMeta === 'admin' || cleanEmail === 'admin@irongym.com' || cleanEmail.includes('admin')) {
        detectedRole = 'admin'
      } else {
        const { data: trainer } = await supabase
          .from('trainers')
          .select('id')
          .or(`auth_id.eq.${user.id},email.eq.${cleanEmail}`)
          .maybeSingle()

        if (trainer || userRoleMeta === 'trainer') {
          detectedRole = 'trainer'
        }
      }

      closeAuthModal()
      onLoginSuccess(data.session, detectedRole)
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur opacity-75 animate-pulse" />
            <div className="relative bg-slate-900 border border-slate-700/80 p-5 rounded-2xl shadow-2xl">
              <QrCode className="h-12 w-12 text-indigo-400 animate-bounce" />
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-widest text-white uppercase mb-1">
            IRON <span className="text-indigo-500">GYM</span>
          </h1>
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-8">
            Initializing Gate Engine & Authentication...
          </p>

          <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 mb-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 h-full transition-all duration-75 ease-out rounded-full shadow-lg shadow-indigo-500/50"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="flex justify-between w-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Terminal Core</span>
            <span className="text-indigo-400 font-bold">{loadingProgress}%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden pt-20 scroll-smooth">
      
      {/* GLOWING AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
      </div>

      {/* FIXED TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white uppercase block leading-none">
                IRON <span className="text-indigo-500">GYM</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">System v2.4</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#programs" className="hover:text-indigo-400 transition">Programs</a>
            <a href="#facilities" className="hover:text-indigo-400 transition">Facilities</a>
            <a href="#plans" className="hover:text-indigo-400 transition">Plans</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAuth}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
            >
              <span>Sign In to Terminal</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Flame className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Automated Gate Access & Analytics</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-[0.92] text-white mb-6">
              FORGE YOUR <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-white">
                ULTIMATE FORM
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl font-normal leading-relaxed mb-8">
              Instant turnstile authorization via anti-screenshot dynamic QR passes, equipment maintenance dispatch queues, and dedicated 1-on-1 personal trainer coaching terminals.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-10">
              <button
                onClick={handleOpenAuth}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2 group"
              >
                <span>Access Terminal Portal</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </button>
            </div>

            {/* LIVE METRICS STATS BAR */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900">
              <div>
                <span className="block text-2xl font-black text-white">24/7</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Gate Access</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-indigo-400">0.2s</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">QR Scan Speed</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white">100%</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Automated</span>
              </div>
            </div>
          </div>

          {/* HERO PREVIEW CARD */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-400">
                    <Radio className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase block">Gate Terminal #01</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">System Online</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">MAIN BRANCH</span>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center mb-6">
                <div className="bg-white p-3 rounded-2xl shadow-xl mb-4">
                  <QrCode className="h-28 w-28 text-slate-950" />
                </div>
                <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-wider">SCAN TO AUTHORIZE</span>
                <span className="text-[11px] text-slate-400 mt-1">Place pass code near turnstile camera</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                <span className="flex items-center"><Activity className="h-3.5 w-3.5 text-indigo-400 mr-2" /> Live Realtime Sync</span>
                <span className="font-mono text-indigo-400 font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 1: PROGRAMS */}
      <section id="programs" className="py-20 px-6 border-t border-slate-900 bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">01 // Training Protocols</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mt-1">PROGRAMS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Hypertrophy & Power', desc: 'Heavy resistance protocols built for maximal strength and muscle adaptation.', tag: 'Resistance', icon: Dumbbell },
              { title: 'High-Intensity Conditioning', desc: 'Caloric torching circuit protocols designed for peak stamina.', tag: 'Endurance', icon: Zap },
              { title: 'Athletic Agility', desc: 'Explosive plyometrics and mobility routines engineered for performance.', tag: 'Performance', icon: Trophy }
            ].map((prog, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition duration-300 group">
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-2xl text-indigo-400 w-fit mb-5 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                  <prog.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">{prog.tag}</span>
                <h3 className="text-lg font-black text-white uppercase mt-1 mb-2">{prog.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{prog.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: FACILITIES */}
      <section id="facilities" className="py-20 px-6 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">02 // Club Infrastructure</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mt-1">FACILITIES</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Hammer Strength Zone', detail: 'Plate-loaded custom machinery', img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600' },
              { name: 'Olympic Platforms', detail: 'Calibrated bumper plates & barbells', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600' },
              { name: 'Recovery Lounge', detail: 'Infrared saunas & cold plunges', img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600' },
              { name: '24/7 Smart Access', detail: 'Instant turnstile authorization', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' }
            ].map((fac, idx) => (
              <div key={idx} className="relative rounded-3xl overflow-hidden group h-64 border border-slate-800">
                <img src={fac.img} alt={fac.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
                  <h4 className="text-sm font-black uppercase text-white">{fac.name}</h4>
                  <p className="text-[11px] text-slate-300 font-mono">{fac.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: PLANS */}
      <section id="plans" className="py-20 px-6 border-t border-slate-900 bg-slate-950/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">03 // Membership Tiers</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white mt-1">MEMBERSHIP PLANS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Day Pass', price: '$10', period: '/ single day', features: ['Full facility access for 24h', 'Instant QR code generated', 'Locker & shower access'] },
              { name: 'Monthly Pass', price: '$50', period: '/ month', featured: true, features: ['Unlimited 24/7 club access', 'Member portal & QR pass', 'Guest pass eligibility', 'Free initial fitness assessment'] },
              { name: 'Annual VIP Pass', price: '$450', period: '/ year', features: ['All Monthly benefits included', '2 Months FREE savings', 'Complimentary guest passes', 'Recovery lounge access'] }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`rounded-3xl p-8 relative flex flex-col justify-between border ${
                  plan.featured 
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-2xl shadow-indigo-600/20' 
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-mono text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black uppercase text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline space-x-1 mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs font-mono text-slate-400">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center space-x-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleOpenAuth}
                  className={`w-full font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition ${
                    plan.featured
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        © {new Date().getFullYear()} IRON GYM. Automated Gate Engine & Portal Systems.
      </footer>

      {/* UNIFIED AUTH MODAL OVERLAY */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 relative">
            
            {/* ESC Key Badge & Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-[11px] font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <span>ESC</span>
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="inline-flex bg-gradient-to-tr from-indigo-600 to-violet-500 p-3 rounded-2xl shadow-lg shadow-indigo-600/30 mb-3">
                <QrCode className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-black uppercase text-white tracking-tight">
                Terminal Access Sign In
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials. The engine automatically routes Members, Coaches, and Staff to their dashboards.
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {/* Unified Form */}
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            {/* Collapsible Demo Fill Bar for Testing */}
            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="w-full text-center text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center justify-center space-x-1"
              >
                <KeyRound className="h-3 w-3" />
                <span>{showDemoLogins ? 'Hide Demo Logins' : 'Show Demo Testing Credentials'}</span>
              </button>

              {showDemoLogins && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin@irongym.com', '123456789')}
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-slate-300 text-center font-mono"
                  >
                    Staff Admin
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('coach1@irongym.com', '123456789')}
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-lg text-slate-300 text-center font-mono"
                  >
                    Coach Account
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}