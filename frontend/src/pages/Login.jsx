import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  QrCode, ShieldCheck, ArrowRight, Lock, Mail, 
  Dumbbell, Sparkles, ChevronRight, Flame, Zap, 
  CheckCircle2, Users, Trophy, QrCode as QrIcon, KeyRound 
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

  // 1. Keyboard ESC Listener to Close Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setIsAuthModalOpen(false)
      }
    }

    if (isAuthModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAuthModalOpen])

  // 2. Simulated Intro Loading Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 300)
          return 100
        }
        return prev + 5
      })
    }, 25)

    return () => clearInterval(interval)
  }, [])

  // Auto-fill Test Admin Credentials
  const handleAutoFillAdmin = () => {
    setEmail('michael.nagui.kiriakos@gmail.com')
    setPassword('123456') // Replace with your test admin password if different
  }

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
      let role = 'member'
      if (user.email === 'michael.nagui.kiriakos@gmail.com' || user.email.includes('admin')) {
        role = 'admin'
      }

      onLoginSuccess(data.session, role)
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // PRELOADER
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 mb-6 animate-bounce">
            <QrCode className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-1">
            IRON <span className="text-indigo-500">GYM</span>
          </h1>
          <p className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-8">
            Loading System Modules...
          </p>

          <div className="w-full bg-slate-900 border border-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 h-full transition-all duration-75 ease-out rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <div className="flex justify-between w-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>Gate Engine</span>
            <span>{loadingProgress}%</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white uppercase">
              IRON <span className="text-indigo-500">GYM</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#programs" className="hover:text-indigo-400 transition">Programs</a>
            <a href="#facilities" className="hover:text-indigo-400 transition">Facilities</a>
            <a href="#plans" className="hover:text-indigo-400 transition">Plans</a>
            <a href="#passes" className="hover:text-indigo-400 transition">Passes</a>
          </nav>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            Portal Sign In
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Flame className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>Next-Gen Fitness Ecosystem</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-[0.95] text-white mb-6">
            DOMINATE YOUR <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-white">
              POTENTIAL.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed mb-8">
            Automated contactless gate access, high-intensity training programs, world-class equipment, and instant QR pass credentials.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2 group"
            >
              <span>Access Member Portal</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>
            <a
              href="#plans"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl transition flex items-center justify-center"
            >
              View Memberships
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 1: PROGRAMS */}
      <section id="programs" className="py-20 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">01 // Training Protocols</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mt-1">PROGRAMS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Hypertrophy & Strength', desc: 'Progressive overload training tailored for max power output and muscle adaptation.', tag: 'Elite Lifting', icon: Dumbbell },
              { title: 'High-Intensity Conditioning', desc: 'Caloric torching circuit protocols designed for cardiovascular endurance.', tag: 'Endurance', icon: Zap },
              { title: 'Athletic Performance', desc: 'Explosive plyometrics and mobility routines engineered for competitive athletes.', tag: 'Agility & Speed', icon: Trophy }
            ].map((prog, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition duration-300 group relative overflow-hidden">
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
      <section id="facilities" className="py-20 px-6 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">02 // Club Infrastructure</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mt-1">FACILITIES</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Hammer Strength Zone', detail: 'Plate-loaded custom machinery', img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600' },
              { name: 'Olympic Lifting Platforms', detail: 'Calibrated bumper plates & barbells', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600' },
              { name: 'Recovery & Cryo Lounge', detail: 'Infrared saunas & cold plunges', img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600' },
              { name: '24/7 Smart Gate Access', detail: 'Instant QR turnstile authorization', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' }
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
      <section id="plans" className="py-20 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">03 // Membership Tiers</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white mt-1">MEMBERSHIP PLANS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Day Pass', price: '$10', period: '/ single day', features: ['Full facility access for 24h', 'Instant QR code generated', 'Locker & shower access'] },
              { name: 'Monthly Pass', price: '$50', period: '/ month', featured: true, features: ['Unlimited 24/7 club access', 'Member app & QR access', 'Guest pass eligibility', 'Free initial fitness assessment'] },
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
                  onClick={() => setIsAuthModalOpen(true)}
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

      {/* SECTION 4: PASSES */}
      <section id="passes" className="py-20 px-6 border-t border-slate-900 bg-slate-900/20">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-md">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">04 // Digital Access System</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white mt-1 mb-3">INSTANT DIGITAL PASSES</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                No keycards, no hassle. Every registered member receives an encrypted, real-time QR token synced directly to their mobile portal for seamless front desk entry.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center max-w-xs w-full shadow-2xl">
              <div className="bg-white p-3 rounded-xl mb-3 shadow-lg">
                <QrIcon className="h-24 w-24 text-slate-950" />
              </div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Active Member Pass</span>
              <span className="text-xs font-bold text-white uppercase mt-0.5">Scan At Front Desk</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 font-mono">
        © {new Date().getFullYear()} IRON GYM. Built for peak physical performance.
      </footer>

      {/* AUTH MODAL OVERLAY */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 relative">
            
            {/* ESC Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
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

            {/* Quick Auto-Fill Admin Test Account Button */}
            <button
              type="button"
              onClick={handleAutoFillAdmin}
              className="w-full mb-4 py-2 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-[11px] font-semibold text-indigo-300 flex items-center justify-center space-x-2 transition"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              <span>Auto-Fill Admin Credentials</span>
            </button>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {/* Form */}
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