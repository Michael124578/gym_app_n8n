import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, XCircle, QrCode, Search, KeyRound, 
  LogOut as ExitIcon, LogIn as EntryIcon, ShieldCheck, 
  Radio, Clock, AlertTriangle, ArrowRight, UserCheck,
  Volume2, VolumeX, Send, Wifi, Settings, Sliders
} from 'lucide-react'
import PillButton from './PillButton'
import PillFilter from './PillFilter'
import { playSuccessChime, playErrorBuzz, triggerHaptic } from '../utils/audioUtils'

export default function QRScanner({ onScanComplete }) {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [flashEffect, setFlashEffect] = useState(null)
  const [gateMode, setGateMode] = useState('entry') // 'entry' | 'exit'
  
  // SOUND PROFILES CONFIG
  const [soundProfile, setSoundProfile] = useState(() => {
    return localStorage.getItem('iron_gym_sound_profile') || 'titanium_chime'
  })

  // HARDWARE / N8N WEBHOOK CONFIG
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('iron_gym_gate_webhook_url') || ''
  })
  const [webhookSecret, setWebhookSecret] = useState(() => {
    return localStorage.getItem('iron_gym_gate_webhook_secret') || ''
  })
  const [isWebhookEnabled, setIsWebhookEnabled] = useState(() => {
    return localStorage.getItem('iron_gym_gate_webhook_enabled') === 'true'
  })
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [webhookTestStatus, setWebhookTestStatus] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const scannerRef = useRef(null)

  // Unique element ID per instance to avoid DOM collisions
  const scannerElementId = useRef(`reader-${Math.random().toString(36).substring(2, 9)}`).current

  const handleSoundProfileChange = (profile) => {
    setSoundProfile(profile)
    localStorage.setItem('iron_gym_sound_profile', profile)
  }

  const handleSaveWebhookConfig = (url, secret, enabled) => {
    setWebhookUrl(url)
    setWebhookSecret(secret)
    setIsWebhookEnabled(enabled)
    localStorage.setItem('iron_gym_gate_webhook_url', url)
    localStorage.setItem('iron_gym_gate_webhook_secret', secret)
    localStorage.setItem('iron_gym_gate_webhook_enabled', enabled ? 'true' : 'false')
  }

  const triggerTerminalFlash = (type) => {
    setFlashEffect(type)
    setTimeout(() => setFlashEffect(null), 1200)
  }

  // Web Audio Synthesizer Profiles & Haptic Feedback
  const playAudioFeedback = (isSuccess, forcedProfile = null) => {
    triggerHaptic(isSuccess ? [100, 50, 100] : [200, 100, 200])

    const profile = forcedProfile || soundProfile
    if (profile === 'silent') return

    if (isSuccess) {
      playSuccessChime()
    } else {
      playErrorBuzz()
    }
  }

  // Dispatch Turnstile Relay Webhook
  const dispatchTurnstileWebhook = async (payload) => {
    if (!isWebhookEnabled || !webhookUrl.trim()) return

    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookSecret ? { 'X-Gate-Secret': webhookSecret.trim() } : {})
        },
        body: JSON.stringify({
          source: 'IRON_GYM_TURNSTILE_TERMINAL',
          timestamp: new Date().toISOString(),
          ...payload
        })
      })
    } catch (err) {
      console.warn('Webhook dispatch failed (silently caught):', err)
    }
  }

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      setWebhookTestStatus({ success: false, message: 'Please enter a webhook URL first.' })
      return
    }

    setIsTestingWebhook(true)
    setWebhookTestStatus(null)

    try {
      const res = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookSecret ? { 'X-Gate-Secret': webhookSecret.trim() } : {})
        },
        body: JSON.stringify({
          source: 'IRON_GYM_TEST_PING',
          event: 'GATE_PING_TEST',
          terminal_id: 'TERM-01',
          timestamp: new Date().toISOString()
        })
      })

      if (res.ok) {
        setWebhookTestStatus({ success: true, message: `Connected! HTTP ${res.status} OK` })
      } else {
        setWebhookTestStatus({ success: false, message: `HTTP Error: ${res.status} ${res.statusText}` })
      }
    } catch (err) {
      setWebhookTestStatus({ success: false, message: `Connection Failed: ${err.message}` })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  const processCheckIn = async (scannedValue, isManual = false) => {
    setLoading(true)
    let memberQueryId = scannedValue

    // Handle Demo Simulator Triggers
    if (scannedValue === 'demo_vip_pass') {
      playAudioFeedback(true)
      triggerTerminalFlash('success')
      dispatchTurnstileWebhook({
        event: 'GATE_ENTRY_GRANTED',
        member_name: 'Captain Alex Vance',
        plan_name: 'VIP Titanium Annual Pass'
      })
      setScanResult({
        success: true,
        member: { full_name: 'Captain Alex Vance', plan_name: 'VIP Titanium Annual Pass', email: 'alex.vance@irongym.com' },
        message: 'Turnstile Unlocked! Welcome, Captain Alex Vance.'
      })
      if (onScanComplete) onScanComplete()
      setLoading(false)
      return
    }

    if (scannedValue === 'demo_expired_pass') {
      playAudioFeedback(false)
      triggerTerminalFlash('error')
      dispatchTurnstileWebhook({
        event: 'ACCESS_DENIED',
        reason: 'MEMBERSHIP_EXPIRED'
      })
      setScanResult({
        success: false,
        member: { full_name: 'Jordan Miller', plan_name: 'Monthly Pass (Expired)', email: 'jordan@example.com' },
        message: 'Membership Pass Expired. Please renew at front desk or mobile app.'
      })
      setLoading(false)
      return
    }

    // Parse dynamic TOTP pass format: PASS-{idPrefix}-{timeStep}-{tokenPart}
    if (scannedValue.startsWith('PASS-')) {
      const parts = scannedValue.split('-')
      if (parts.length >= 4) {
        const scannedTimeStep = parseInt(parts[2], 10)
        const currentEpoch = Math.floor(Date.now() / 1000)
        const currentTimeStep = Math.floor(currentEpoch / 30)

        // Tolerance window (+/- 1 time step / 60s)
        if (Math.abs(currentTimeStep - scannedTimeStep) > 1) {
          playAudioFeedback(false)
          triggerTerminalFlash('error')
          dispatchTurnstileWebhook({
            event: 'ACCESS_DENIED',
            reason: 'EXPIRED_TOTP_CODE',
            raw_token: scannedValue
          })
          setScanResult({ success: false, message: 'Expired dynamic QR pass code. Please scan active screen.' })
          setLoading(false)
          return
        }
        memberQueryId = parts[1]
      }
    }

    // 1. Check Guest Pass
    const { data: guestPass } = await supabase
      .from('guest_passes')
      .select('*, members(full_name)')
      .eq('pass_token', scannedValue)
      .maybeSingle()

    if (guestPass) {
      const isValid = !guestPass.is_used && new Date() < new Date(guestPass.valid_until)

      if (isValid) {
        await supabase.from('guest_passes').update({ is_used: true }).eq('id', guestPass.id)
        await supabase.from('check_ins').insert([{
          member_id: guestPass.host_member_id,
          access_granted: true,
          notes: `Guest Pass Used: ${guestPass.guest_name}`
        }])

        playAudioFeedback(true)
        triggerTerminalFlash('success')
        dispatchTurnstileWebhook({
          event: 'GATE_ENTRY_GRANTED',
          type: 'GUEST_PASS',
          guest_name: guestPass.guest_name,
          host_member_id: guestPass.host_member_id
        })
        setScanResult({
          success: true,
          message: `Guest Access Granted! Welcome ${guestPass.guest_name} (Host: ${guestPass.members?.full_name || 'Member'})`
        })
        if (onScanComplete) onScanComplete()
      } else {
        playAudioFeedback(false)
        triggerTerminalFlash('error')
        dispatchTurnstileWebhook({
          event: 'ACCESS_DENIED',
          type: 'GUEST_PASS',
          reason: guestPass.is_used ? 'ALREADY_USED' : 'EXPIRED'
        })
        setScanResult({
          success: false,
          message: guestPass.is_used ? 'This guest pass has already been redeemed.' : 'Guest pass expired.'
        })
      }
      setLoading(false)
      return
    }

    // 2. Check Standard Member with Offline Fallback
    let member = null
    let error = null

    try {
      let query = supabase.from('members').select('*')
      if (scannedValue.startsWith('PASS-')) {
        query = query.ilike('id', `${memberQueryId}%`)
      } else {
        query = query.or(`id.eq.${scannedValue},qr_code_token.eq.${scannedValue}`)
      }

      const res = await query.maybeSingle()
      member = res.data
      error = res.error

      // Cache verified active member pass for offline resilience
      if (member && member.status === 'active') {
        try {
          const cachedMap = JSON.parse(localStorage.getItem('iron_gym_cached_member_passes') || '{}')
          cachedMap[member.id] = member
          if (member.qr_code_token) cachedMap[member.qr_code_token] = member
          localStorage.setItem('iron_gym_cached_member_passes', JSON.stringify(cachedMap))
        } catch (e) {}
      }
    } catch (e) {
      error = e
    }

    // Offline Fallback Lookup if network is unavailable or request fails
    if ((error || !member) && typeof window !== 'undefined') {
      try {
        const cachedMap = JSON.parse(localStorage.getItem('iron_gym_cached_member_passes') || '{}')
        const lookupId = scannedValue.startsWith('PASS-') ? memberQueryId : scannedValue
        const offlineMatch = Object.values(cachedMap).find((m) => 
          m.id?.toLowerCase().includes(lookupId.toLowerCase()) || 
          m.qr_code_token === scannedValue
        )
        if (offlineMatch) {
          member = offlineMatch
          error = null
        }
      } catch (e) {}
    }

    if (error || !member) {
      playAudioFeedback(false)
      triggerTerminalFlash('error')
      dispatchTurnstileWebhook({
        event: 'ACCESS_DENIED',
        reason: 'MEMBER_NOT_FOUND',
        raw_token: scannedValue
      })
      setScanResult({
        success: false,
        message: 'Pass not recognized in Iron Gym registry.'
      })
      setLoading(false)
      return
    }

    const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
    const isStatusActive = member.status === 'active'

    if (!isStatusActive || isExpired) {
      playAudioFeedback(false)
      triggerTerminalFlash('error')
      await supabase.from('check_ins').insert([{
        member_id: member.id,
        access_granted: false,
        notes: isExpired ? 'Expired Membership' : `Status: ${member.status}`
      }])
      dispatchTurnstileWebhook({
        event: 'ACCESS_DENIED',
        member_id: member.id,
        member_name: member.full_name,
        plan_name: member.plan_name,
        reason: isExpired ? 'MEMBERSHIP_EXPIRED' : 'INACTIVE_STATUS'
      })
      setScanResult({
        success: false,
        member,
        message: isExpired ? `Membership Expired on ${new Date(member.membership_end_date).toLocaleDateString()}` : `Status: ${member.status}`
      })
      setLoading(false)
      return
    }

    // Handle Gate Exit Mode
    if (gateMode === 'exit') {
      const { data: activeCheckIn } = await supabase
        .from('check_ins')
        .select('id')
        .eq('member_id', member.id)
        .is('checked_out_at', null)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activeCheckIn) {
        await supabase
          .from('check_ins')
          .update({ checked_out_at: new Date().toISOString() })
          .eq('id', activeCheckIn.id)
      }

      playAudioFeedback(true)
      triggerTerminalFlash('success')
      dispatchTurnstileWebhook({
        event: 'GATE_EXIT_GRANTED',
        member_id: member.id,
        member_name: member.full_name,
        plan_name: member.plan_name
      })
      setScanResult({
        success: true,
        member,
        message: `Goodbye, ${member.full_name}! Check-out verified.`
      })
      if (onScanComplete) onScanComplete()
      setLoading(false)
      return
    }

    // Gate Entry Mode
    await supabase.from('check_ins').insert([{
      member_id: member.id,
      access_granted: true,
      notes: isManual ? 'Manual Staff Override' : 'Optical Turnstile Scan'
    }])

    playAudioFeedback(true)
    triggerTerminalFlash('success')
    dispatchTurnstileWebhook({
      event: 'GATE_ENTRY_GRANTED',
      member_id: member.id,
      member_name: member.full_name,
      plan_name: member.plan_name
    })
    setScanResult({
      success: true,
      member,
      message: isManual ? `Manual Override Granted for ${member.full_name}` : `Turnstile Unlocked! Welcome, ${member.full_name}.`
    })
    if (onScanComplete) onScanComplete()
    setLoading(false)
  }

  const startScanner = useCallback(() => {
    if (scannerRef.current) return

    try {
      const scanner = new Html5QrcodeScanner(
        scannerElementId,
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true
        },
        false
      )

      scanner.render(
        (decodedText) => {
          scanner.pause(true)
          processCheckIn(decodedText)
        },
        () => {}
      )

      scannerRef.current = scanner
    } catch (e) {
      console.warn('Scanner init failed', e)
    }
  }, [scannerElementId])

  useEffect(() => {
    startScanner()

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (e) {}
        scannerRef.current = null
      }
    }
  }, [startScanner])

  const handleScanNext = () => {
    setScanResult(null)
    setSearchQuery('')
    setSearchResults([])
    if (scannerRef.current) {
      try {
        scannerRef.current.resume()
      } catch (e) {}
    }
  }

  const handleManualSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const { data } = await supabase
      .from('members')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5)

    if (data) setSearchResults(data)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-6">
      
      {flashEffect === 'success' && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-emerald-500/20 border-[12px] border-emerald-500 animate-pulse transition duration-300" />
      )}
      {flashEffect === 'error' && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-rose-500/20 border-[12px] border-rose-500 animate-pulse transition duration-300" />
      )}

      {/* SCANNER CONTAINER */}
      <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 w-full ${
        flashEffect === 'success' ? 'ring-4 ring-emerald-500/50' : flashEffect === 'error' ? 'ring-4 ring-rose-500/50' : ''
      }`}>
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
                <span>Turnstile Gate Terminal</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Optical scanner for dynamic athlete passes & guest QR tokens.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <PillButton
              onClick={() => setShowSettings(!showSettings)}
              theme="purple"
              icon={Sliders}
              size="sm"
            >
              Gate Config
            </PillButton>

            <div className="flex items-center gap-1.5">
              <PillFilter
                active={gateMode === 'entry'}
                onClick={() => setGateMode('entry')}
                theme="indigo"
                icon={EntryIcon}
                size="sm"
              >
                Entry
              </PillFilter>

              <PillFilter
                active={gateMode === 'exit'}
                onClick={() => setGateMode('exit')}
                theme="amber"
                icon={ExitIcon}
                size="sm"
              >
                Exit
              </PillFilter>
            </div>
          </div>
        </div>

        {/* EXPANDABLE GATE HARDWARE & SOUND SETTINGS */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-5">
                
                {/* SOUND PROFILE ROW */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Audio Feedback Profile</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => playAudioFeedback(true)}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      ▶ Test Current Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'titanium_chime', label: 'Titanium Chime', desc: 'Tri-Tone Chord' },
                      { id: 'cyber_pulse', label: 'Cyber Pulse', desc: 'Futuristic Blip' },
                      { id: 'sub_bass', label: 'Sub-Bass Thud', desc: 'Acoustic Kick' },
                      { id: 'laser_ping', label: 'Laser Ping', desc: 'Fast Chirp' },
                      { id: 'silent', label: 'Silent Mode', desc: 'Visual Only' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          handleSoundProfileChange(p.id)
                          playAudioFeedback(true, p.id)
                        }}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          soundProfile === p.id 
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md' 
                            : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <p className="text-xs font-bold uppercase">{p.label}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HARDWARE / N8N WEBHOOK ROW */}
                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
                        <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Turnstile Relay Webhook (n8n / IoT Controller)</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Trigger physical gate relays and WhatsApp notifications upon check-in.</p>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWebhookEnabled}
                        onChange={(e) => handleSaveWebhookConfig(webhookUrl, webhookSecret, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8">
                      <input
                        type="url"
                        placeholder="https://n8n.yourdomain.com/webhook/gate-turnstile"
                        value={webhookUrl}
                        onChange={(e) => handleSaveWebhookConfig(e.target.value, webhookSecret, isWebhookEnabled)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-4 flex space-x-2">
                      <input
                        type="text"
                        placeholder="X-Gate-Secret"
                        value={webhookSecret}
                        onChange={(e) => handleSaveWebhookConfig(webhookUrl, e.target.value, isWebhookEnabled)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={isTestingWebhook}
                        className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isTestingWebhook ? 'Pinging...' : 'Test Ping'}
                      </button>
                    </div>
                  </div>

                  {webhookTestStatus && (
                    <p className={`text-[10px] font-mono font-bold ${webhookTestStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {webhookTestStatus.message}
                    </p>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE CAMERA / SCAN RESULT WITH CYBER LASER RETICLE OVERLAY */}
        {!scanResult && (
          <div className="space-y-3">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/90 bg-slate-950 shadow-2xl group">
              {/* LASER HUD CORNER BRACKETS */}
              <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-indigo-400 z-20 pointer-events-none rounded-tl-lg" />
              <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-indigo-400 z-20 pointer-events-none rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-indigo-400 z-20 pointer-events-none rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-indigo-400 z-20 pointer-events-none rounded-br-lg" />

              {/* LASER SCANNING BEAM */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20 pointer-events-none shadow-[0_0_15px_#22d3ee] animate-bounce opacity-75" />

              <div id={scannerElementId} className="w-full"></div>
            </div>

            {/* LIVE SIMULATOR DEMO PASS SHORTCUTS */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Radio className="h-3 w-3 text-indigo-400 animate-pulse" />
                <span>Instant Terminal Test Simulator</span>
              </span>

              <div className="flex items-center gap-2">
                <PillButton
                  onClick={() => processCheckIn('demo_vip_pass')}
                  theme="emerald"
                  icon={ShieldCheck}
                  size="sm"
                >
                  Simulate VIP Entry
                </PillButton>

                <PillButton
                  onClick={() => processCheckIn('demo_expired_pass')}
                  theme="crimson"
                  icon={AlertTriangle}
                  size="sm"
                >
                  Simulate Expired Pass
                </PillButton>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-4 text-center">
            <p className="text-indigo-400 font-bold text-xs animate-pulse font-mono tracking-wider">
              VERIFYING PASS CREDENTIALS & SECURITY CLEARANCE...
            </p>
          </div>
        )}

        {scanResult && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className={`p-6 sm:p-8 rounded-3xl border text-left flex flex-col sm:flex-row items-start gap-5 shadow-2xl ${
              scanResult.success 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            {scanResult.success ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl shrink-0">
                <CheckCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-2xl shrink-0">
                <XCircle className="h-8 w-8" />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  scanResult.success ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {scanResult.success ? 'Authorization Verified' : 'Access Prohibited'}
                </span>
              </div>
              <h3 className="font-black text-xl text-white uppercase tracking-tight">
                {scanResult.success ? (gateMode === 'exit' ? 'CHECK-OUT CONFIRMED' : 'TURNSTILE ACCESS GRANTED') : 'ACCESS DENIED'}
              </h3>
              <p className="text-xs text-slate-300">{scanResult.message}</p>

              {scanResult.member && (
                <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1 font-mono">
                  <p className="text-slate-400">ATHLETE: <strong className="text-white uppercase">{scanResult.member.full_name}</strong></p>
                  <p className="text-slate-400">PLAN: <strong className="text-indigo-300 uppercase">{scanResult.member.plan_name || 'Active Pass'}</strong></p>
                </div>
              )}

              <div className="pt-2">
                <PillButton
                  onClick={handleScanNext}
                  theme="lime"
                  icon={ArrowRight}
                  size="md"
                >
                  Scan Next Athlete
                </PillButton>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* MANUAL STAFF OVERRIDE ACCORDION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 w-full">
        <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
          <KeyRound className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-black text-white uppercase tracking-tight">Manual Staff Gate Override</h3>
        </div>
        <p className="text-xs text-slate-400">If athlete phone battery died, search by name or email to admit manually.</p>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Type athlete name, email, or ID..."
            value={searchQuery}
            onChange={(e) => handleManualSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2">
            {searchResults.map((m) => (
              <div key={m.id} className="p-4 bg-slate-950 rounded-2xl flex items-center justify-between border border-slate-800/80 hover:border-indigo-500/40 transition">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-white uppercase">{m.full_name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{m.email} • {m.plan_name || 'Pass'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => processCheckIn(m.id, true)}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Admit Manually →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  )
}