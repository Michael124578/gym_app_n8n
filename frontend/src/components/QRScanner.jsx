import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, XCircle, QrCode, Search, KeyRound, 
  LogOut as ExitIcon, LogIn as EntryIcon, ShieldCheck, 
  Radio, Clock, AlertTriangle, ArrowRight, UserCheck
} from 'lucide-react'

export default function QRScanner({ onScanComplete }) {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [flashEffect, setFlashEffect] = useState(null)
  const [gateMode, setGateMode] = useState('entry') // 'entry' | 'exit'
  const scannerRef = useRef(null)

  // Unique element ID per instance to avoid DOM collisions
  const scannerElementId = useRef(`reader-${Math.random().toString(36).substring(2, 9)}`).current

  const triggerTerminalFlash = (type) => {
    setFlashEffect(type)
    setTimeout(() => setFlashEffect(null), 1200)
  }

  const playAudioFeedback = (isSuccess) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = isSuccess ? 'sine' : 'sawtooth'
      osc.frequency.setValueAtTime(isSuccess ? 880 : 220, ctx.currentTime)
      if (isSuccess) {
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1) // High chime
      }
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) {
      console.warn('Audio feedback blocked')
    }
  }

  const processCheckIn = async (scannedValue, isManual = false) => {
    setLoading(true)
    let memberQueryId = scannedValue

    // Parse dynamic TOTP pass format: PASS-{idPrefix}-{timeStep}-{tokenPart}
    if (scannedValue.startsWith('PASS-')) {
      const parts = scannedValue.split('-')
      if (parts.length >= 4) {
        const scannedTimeStep = parseInt(parts[2], 10)
        const currentEpoch = Math.floor(Date.now() / 1000)
        const currentTimeStep = Math.floor(currentEpoch / 30)

        // Expand tolerance to +/- 1 time step (60s window) to handle client device clock drift
        if (Math.abs(currentTimeStep - scannedTimeStep) > 1) {
          playAudioFeedback(false)
          triggerTerminalFlash('error')
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
        setScanResult({
          success: true,
          message: `Guest Access Granted! Welcome ${guestPass.guest_name} (Host: ${guestPass.members?.full_name || 'Member'})`
        })
      } else {
        playAudioFeedback(false)
        triggerTerminalFlash('error')
        setScanResult({
          success: false,
          message: 'Guest Pass Expired or Already Used.'
        })
      }
      setLoading(false)
      if (onScanComplete) onScanComplete()
      return
    }

    // 2. Member Pass Resolution
    let { data: member } = await supabase
      .from('members')
      .select('*')
      .or(`id.eq.${scannedValue},qr_code_token.eq.${scannedValue}`)
      .maybeSingle()

    if (!member && scannedValue.startsWith('PASS-')) {
      const { data: prefixMatches } = await supabase.from('members').select('*')
      member = prefixMatches?.find(m => m.id.startsWith(memberQueryId)) || null
    }

    if (!member) {
      playAudioFeedback(false)
      triggerTerminalFlash('error')
      setScanResult({ success: false, message: 'Invalid Pass: Member record not found in database.' })
      setLoading(false)
      return
    }

    const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
    const isInactive = member.status !== 'active' || isExpired

    if (isInactive && !isManual) {
      playAudioFeedback(false)
      triggerTerminalFlash('error')
      setScanResult({
        success: false,
        member,
        message: isExpired ? `Membership Expired on ${new Date(member.membership_end_date).toLocaleDateString()}` : `Status: ${member.status}`
      })
      setLoading(false)
      return
    }

    if (gateMode === 'exit') {
      const { data: lastVisit } = await supabase
        .from('check_ins')
        .select('id')
        .eq('member_id', member.id)
        .is('checked_out_at', null)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastVisit) {
        await supabase
          .from('check_ins')
          .update({ checked_out_at: new Date().toISOString() })
          .eq('id', lastVisit.id)
      }

      playAudioFeedback(true)
      triggerTerminalFlash('success')
      setScanResult({
        success: true,
        member,
        message: `Goodbye, ${member.full_name}! Check-out verified.`
      })
    } else {
      await supabase.from('check_ins').insert([{ 
        member_id: member.id, 
        status: 'success',
        access_granted: true,
        notes: isManual ? 'Manual Staff Override' : 'Dynamic QR Scan Granted',
        is_manual_override: isManual,
        authorized_by: isManual ? 'Staff Operator' : 'QR Terminal'
      }])

      playAudioFeedback(true)
      triggerTerminalFlash('success')
      setScanResult({
        success: true,
        member,
        message: isManual ? `Manual Override Granted for ${member.full_name}` : `Turnstile Unlocked! Welcome, ${member.full_name}.`
      })
    }

    if (onScanComplete) onScanComplete()
    setLoading(false)
  }

  const startScanner = useCallback(() => {
    if (scannerRef.current) return

    const scanner = new Html5QrcodeScanner(scannerElementId, {
      qrbox: { width: 260, height: 260 },
      fps: 15,
    })

    scannerRef.current = scanner

    scanner.render(
      async (scannedValue) => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {})
          scannerRef.current = null
        }
        await processCheckIn(scannedValue)
      },
      () => {}
    )
  }, [gateMode, scannerElementId])

  useEffect(() => {
    startScanner()
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [startScanner])

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

  const handleScanNext = () => {
    setScanResult(null)
    setSearchQuery('')
    setSearchResults([])
    startScanner()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto space-y-6 animate-fadeIn">
      
      {flashEffect === 'success' && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-emerald-500/20 border-[12px] border-emerald-500 animate-pulse transition duration-300" />
      )}
      {flashEffect === 'error' && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-rose-500/20 border-[12px] border-rose-500 animate-pulse transition duration-300" />
      )}

      {/* SCANNER CONTAINER */}
      <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 w-full ${
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

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setGateMode('entry')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                gateMode === 'entry' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <EntryIcon className="h-3.5 w-3.5" />
              <span>Gate Entry</span>
            </button>
            <button
              onClick={() => setGateMode('exit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                gateMode === 'exit' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ExitIcon className="h-3.5 w-3.5" />
              <span>Gate Exit</span>
            </button>
          </div>
        </div>

        {/* ACTIVE CAMERA / SCAN RESULT */}
        {!scanResult && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <div id={scannerElementId} className="w-full"></div>
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
                <button
                  onClick={handleScanNext}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xl shadow-indigo-600/30 cursor-pointer"
                >
                  Scan Next Athlete →
                </button>
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