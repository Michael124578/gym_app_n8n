import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  QrCode, ArrowRight, Lock, Mail,
  Dumbbell, ChevronRight, Flame, Zap,
  CheckCircle2, Trophy, KeyRound, Activity,
  Eye, EyeOff, Radio, Shield, Users, Clock,
  MapPin, Award, Check, ChevronDown,
  Layers, Play, Phone, HelpCircle
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

  // Interactive Landing Page States
  const [billingCycle, setBillingCycle] = useState('annual') // 'monthly' | 'annual'
  const [activeFacilityCategory, setActiveFacilityCategory] = useState('all')
  const [activeTabFaq, setActiveTabFaq] = useState(null)

  // Interactive Live Scanner Demo Widget State
  const [demoPassScanned, setDemoPassScanned] = useState(false)
  const [simulatedTurnstileTime, setSimulatedTurnstileTime] = useState(new Date().toLocaleTimeString())

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
          setTimeout(() => setIsLoading(false), 200)
          return 100
        }
        return prev + 8
      })
    }, 18)

    return () => clearInterval(interval)
  }, [])

  // Update clock for hero live widget
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setSimulatedTurnstileTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(clockInterval)
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

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-3xl blur opacity-75 animate-pulse" />
            <div className="relative bg-slate-900 border border-slate-700/80 p-5 rounded-3xl shadow-2xl">
              <Dumbbell className="h-12 w-12 text-indigo-400 animate-bounce" />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-widest text-white uppercase mb-1">
            IRON <span className="text-indigo-400">GYM</span>
          </h1>
          <p className="text-[11px] font-mono tracking-widest uppercase text-slate-400 mb-6">
            AUTHENTICATING ACCESS TERMINALS...
          </p>

          <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 mb-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 h-full transition-all duration-75 ease-out rounded-full shadow-lg shadow-indigo-500/50"
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

  const facilitiesList = [
    {
      category: 'weights',
      name: 'Olympic Free Weight Arena',
      tag: 'Heavy Iron & Calibrated Plates',
      desc: 'Competition bench presses, deadlift dead-drop platforms, Eleiko calibrated steel discs, and dumbbells ranging from 2.5 kg up to 75 kg.',
      img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800'
    },
    {
      category: 'machines',
      name: 'Hammer Strength & Custom Biomechanics',
      tag: 'Pin & Plate-Loaded Stacks',
      desc: 'Precision iso-lateral chest presses, dual-axis leg presses, converging lat pulldowns, and custom multi-pulley cable towers.',
      img: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800'
    },
    {
      category: 'recovery',
      name: 'Hydro-Recovery & Contrast Lounge',
      tag: 'Therapy & Cold Immersion',
      desc: 'State-of-the-art Finnish cedar saunas, 4°C cold plunge tanks, infrared light therapy suites, and pneumatic compression boots.',
      img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800'
    },
    {
      category: 'turf',
      name: 'Athletic Conditioning & Sprint Track',
      tag: 'Functional Agility Turf',
      desc: '50-meter indoor sprint turf, weighted push sleds, Concept2 rowers, SkiErgs, assault bikes, and plyometric jump towers.',
      img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800'
    }
  ]

  const filteredFacilities = activeFacilityCategory === 'all'
    ? facilitiesList
    : facilitiesList.filter(f => f.category === activeFacilityCategory)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden pt-20 scroll-smooth selection:bg-indigo-500 selection:text-white">

      {/* AMBIENT TITANIUM & CYBER ACCENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[15%] w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[500px] bg-amber-500/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[800px] h-[600px] bg-violet-600/10 rounded-full blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* FIXED TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white uppercase block leading-none">
                IRON <span className="text-indigo-400">GYM</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase block mt-0.5">Strength Club & Gate Engine</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('ecosystem')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Ecosystem
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('facilities')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Facilities
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('plans')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Membership
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('coaches')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              Coaching
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-indigo-400 transition cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAuth}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2 border border-indigo-400/30"
            >
              <span>Member Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT HERO COPY */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2.5 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-full text-slate-300 text-xs font-mono font-bold uppercase tracking-widest shadow-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>24/7 High-Capacity Performance Hub</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.92] text-white">
                WHERE TITANS <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-amber-300 to-white">
                  ARE FORGED
                </span>
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Elite strength facilities meets automated access technology. Anti-screenshot dynamic QR gates, live hypertrophy telemetry, certified coach periodization, and recovery contrast lounges.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleOpenAuth}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition flex items-center justify-center space-x-2 group border border-indigo-400/30"
              >
                <span>Access Member Terminal</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => scrollToSection('plans')}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider px-7 py-4 rounded-2xl border border-slate-800 transition flex items-center justify-center space-x-2"
              >
                <span>Explore Memberships</span>
              </button>
            </div>

            {/* LIVE TELEMETRY STATS */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-white font-mono">0.2s</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Turnstile Gate Scan</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-amber-400 font-mono">24/7</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Keyless Club Access</span>
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-emerald-400 font-mono">50+</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Custom Machines</span>
              </div>
            </div>
          </div>

          {/* RIGHT HERO INTERACTIVE WIDGET CARD */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

              {/* TERMINAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-emerald-400">
                    <Radio className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase block">Main Gate Terminal #01</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">Live Optical Engine Online</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {simulatedTurnstileTime}
                </span>
              </div>

              {/* DYNAMIC PASS DEMO */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                <div className="bg-white p-3 rounded-2xl shadow-2xl relative group cursor-pointer" onClick={() => setDemoPassScanned(prev => !prev)}>
                  <QrCode className="h-32 w-32 text-slate-950 transition-transform group-hover:scale-105" />
                  {demoPassScanned && (
                    <div className="absolute inset-0 bg-emerald-600/90 rounded-2xl flex flex-col items-center justify-center text-white p-2">
                      <Check className="h-10 w-10 animate-bounce" />
                      <span className="text-[10px] font-mono uppercase font-black tracking-widest mt-1">TURNSTILE UNLOCKED</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-widest block">
                    {demoPassScanned ? 'STATUS: ACCESS AUTHORIZED (24h)' : 'TAP QR CODE TO SIMULATE ENTRY'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {demoPassScanned ? 'Turnstile gate opened • Welcome back, Athlete' : 'Encrypted with auto-cycling dynamic timestamp'}
                  </span>
                </div>
              </div>

              {/* LIVE CAPACITY TELEMETRY */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] uppercase">Current Floor Occupancy</span>
                  <span className="font-mono text-emerald-400 font-bold">42% (Optimal)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[42%] rounded-full shadow-lg shadow-emerald-500/50" />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>38 Athletes Active</span>
                  <span>Max Capacity: 90</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 1: THE IRON ECOSYSTEM */}
      <section id="ecosystem" className="py-24 px-6 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-2">
              01 // Digital & Physical Integration
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              The Complete Iron Ecosystem
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              We seamlessly combine heavy industrial hardware with intuitive, athlete-centered digital tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Layers,
                title: 'Program Architect',
                badge: 'Periodization',
                color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                desc: 'Generate custom periodized routines tailored to hypertrophy, strength, or conditioning with exact sets, reps, and RPE loading.'
              },
              {
                icon: Activity,
                title: 'Recovery Heatmap',
                badge: 'Muscle Readiness',
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                desc: 'Visual anatomical map showing real-time recovery countdowns and weekly volume load tonnage per muscle group.'
              },
              {
                icon: QrCode,
                title: 'Instant Gate Pass',
                badge: 'Anti-Screenshot QR',
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                desc: 'High-speed optical turnstile authorization with auto-refreshing security tokens for seamless 24/7 entry.'
              },
              {
                icon: Users,
                title: '1-on-1 Coaching',
                badge: 'Direct Directives',
                color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                desc: 'Direct messaging communication with your certified personal trainer for form checks, weekly check-ins, and diet adjustments.'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition duration-300 flex flex-col justify-between space-y-4 group shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${feature.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-white">{feature.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: CLUB FACILITIES */}
      <section id="facilities" className="py-24 px-6 border-t border-slate-900 bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-2">
                02 // World-Class Training Infrastructure
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                Built For Serious Lifters
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Every square meter is calibrated for optimal biomechanical loading and recovery.
              </p>
            </div>

            {/* CATEGORY CHIP FILTER */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Zones' },
                { id: 'weights', label: 'Free Weights' },
                { id: 'machines', label: 'Machinery' },
                { id: 'recovery', label: 'Recovery' },
                { id: 'turf', label: 'Sprint Turf' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFacilityCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${activeFacilityCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* FACILITY CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredFacilities.map((fac, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group shadow-2xl flex flex-col justify-between"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={fac.img}
                    alt={fac.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-white font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full">
                    {fac.tag}
                  </span>
                </div>
                <div className="p-6 sm:p-8 space-y-2">
                  <h3 className="text-xl font-black uppercase text-white">{fac.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: MEMBERSHIP PLANS */}
      <section id="plans" className="py-24 px-6 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              03 // Straightforward Membership
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              Invest In Your Physical Peak
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              No hidden signup fees. No cancellation penalties. 100% transparent pricing.
            </p>

            {/* BILLING TOGGLE */}
            <div className="inline-flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition ${billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition flex items-center space-x-1.5 ${billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>Annual VIP Pass</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* DAY PASS */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-xl">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Single Session</span>
                  <h3 className="text-xl font-black uppercase text-white mt-1">24-Hour Day Pass</h3>
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-4xl font-black text-white font-mono">250 EGP</span>
                  <span className="text-xs text-slate-400 font-mono">/ single day</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Instant dynamic QR turnstile pass</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Full access to free weights & machines</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Locker and shower facility access</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleOpenAuth}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition cursor-pointer"
              >
                Get Day Pass
              </button>
            </div>

            {/* MONTHLY / ANNUAL VIP PASS (FEATURED) */}
            <div className="bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500 rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-2xl relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-mono text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full shadow-lg border border-indigo-400/40">
                Most Popular Athlete Tier
              </span>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
                    {billingCycle === 'annual' ? '12 Months Full Access' : 'Monthly Recurring'}
                  </span>
                  <h3 className="text-2xl font-black uppercase text-white mt-1">
                    {billingCycle === 'annual' ? 'Annual Titan Pass' : 'Monthly Unlimited'}
                  </h3>
                </div>

                <div className="flex items-baseline space-x-1.5">
                  <span className="text-5xl font-black text-white font-mono">
                    {billingCycle === 'annual' ? '9,600 EGP' : '1,200 EGP'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {billingCycle === 'annual' ? '/ year' : '/ month'}
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-200">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span><strong>24/7 Keyless QR Turnstile Access</strong></span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span><strong>Full Program Architect & Live Logger</strong></span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Recovery Heatmap & Volume Telemetry</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Free Guest Passes for friends</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Finnish Cedar Sauna & Contrast Lounge</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleOpenAuth}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Join Iron Gym Today
              </button>
            </div>

            {/* VIP COACHING BUNDLE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-xl">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">1-on-1 Dedicated Coaching</span>
                  <h3 className="text-xl font-black uppercase text-white mt-1">Coaching Elite Pass</h3>
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-4xl font-black text-white font-mono">3,500 EGP</span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>All Titan Annual benefits included</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Dedicated Certified Strength Coach</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Weekly 1-on-1 In-App video & messaging checks</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Personalized nutrition & macronutrient targets</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleOpenAuth}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition"
              >
                Apply for Coaching
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 4: COACHING ROSTER PREVIEW */}
      <section id="coaches" className="py-24 px-6 border-t border-slate-900 bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">

          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block mb-2">
              04 // Professional Coaching Staff
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              Master Level Instructors
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Certified CSCS, USA Weightlifting, and IFBB Pro coaches dedicated to helping you shatter personal records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Marcus "Vanguard" Vance',
                role: 'Head Powerlifting & CNS Strength Coach',
                exp: '11 Years Experience • CSCS Certified',
                desc: 'Specializes in barbell mechanics, lockout strength, and periodized peaking cycles for competitive powerlifters.',
                img: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=600'
              },
              {
                name: 'Elena Rostova',
                role: 'Hypertrophy & Biomechanics Specialist',
                exp: '8 Years Experience • Exercise Physiologist',
                desc: 'Pioneers high-tension training techniques, angle variations, and sarcomerogenesis protocols for physique athletes.',
                img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600'
              },
              {
                name: 'Darius Thorne',
                role: 'Athletic Conditioning & Sprint Director',
                exp: '9 Years Experience • EXOS Performance',
                desc: 'Focuses on power development, VO2 max conditioning, and rotational core stability for elite athletic performance.',
                img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600'
              }
            ].map((coach, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group shadow-xl"
              >
                <div className="h-64 overflow-hidden relative">
                  <img src={coach.img} alt={coach.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">{coach.exp}</span>
                    <h3 className="text-lg font-black uppercase text-white mt-0.5">{coach.name}</h3>
                    <p className="text-xs text-amber-400 font-medium">{coach.role}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{coach.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-24 px-6 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">

          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              05 // Common Questions
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the digital QR gate pass work?',
                a: 'Upon purchasing a pass or logging in, your personalized dynamic QR code generates instantly in the Member Portal. It cycles cryptographic security tokens and can be held up to any turnstile scanner for immediate 0.2-second access.'
              },
              {
                q: 'Can I bring a guest with my membership?',
                a: 'Yes! Monthly and Annual Titan members receive complimentary guest passes each month that can be issued directly to friends via SMS or digital pass in the Member Portal.'
              },
              {
                q: 'What hours is Iron Gym open?',
                a: 'Iron Gym operates 24 hours a day, 7 days a week, 365 days a year. Our turnstiles and security cameras are fully automated for uninterrupted training.'
              },
              {
                q: 'Are locker rooms, showers, and saunas included?',
                a: 'Yes. All active passes include full access to digital pin-code lockers, luxury rainfall showers, Finnish cedar saunas, and hydration stations.'
              }
            ].map((faq, idx) => {
              const isOpen = activeTabFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveTabFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between space-x-4 cursor-pointer"
                  >
                    <span className="text-sm font-black uppercase text-white">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-indigo-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-12 px-6 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-black text-white uppercase block leading-none">IRON GYM</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Strength Club & Gate Engine</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            © {new Date().getFullYear()} IRON GYM CLUB. All rights reserved. Built for champions.
          </p>

          <button
            onClick={handleOpenAuth}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider"
          >
            Terminal Portal Sign In →
          </button>
        </div>
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
              <div className="inline-flex bg-gradient-to-tr from-indigo-600 to-amber-500 p-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 mb-3">
                <Dumbbell className="h-7 w-7 text-white" />
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
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center space-x-2"
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