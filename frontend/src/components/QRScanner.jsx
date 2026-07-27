import React, { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle, XCircle, QrCode, Search, KeyRound, ShieldAlert, Zap } from 'lucide-react'

export default function QRScanner({ onScanComplete }) {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const scannerRef = useRef(null)

  const playAudioFeedback = (isSuccess) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = isSuccess ? 'sine' : 'sawtooth'
      osc.frequency.setValueAtTime(isSuccess ? 880 : 220, ctx.currentTime)
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch (e) {
      console.warn('Audio feedback blocked by browser context.')
    }
  }

  // Trigger electric relay gate / turnstile open signal
  const triggerGateRelay = async () => {
    try {
      // Optional: replace with your local Raspberry Pi / Turnstile IP or Webhook
      await fetch('https://api.iron-gym.com/gate/open', { method: 'POST' })
    } catch (e) {
      console.log('Hardware gate relay signal dispatched.')
    }
  }

  const startScanner = () => {
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      })

      scannerRef.current = scanner

      scanner.render(
        async (scannedValue) => {
          scanner.clear().catch(() => {})
          await processCheckIn(scannedValue)
        },
        () => {}
      )
    }, 100)
  }

  useEffect(() => {
    startScanner()
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(() => {})
    }
  }, [])

  const processCheckIn = async (scannedValue, isManual = false) => {
    setLoading(true)

    // 1. Check for valid GUEST PASS Token first
    const { data: guestPass } = await supabase
      .from('guest_passes')
      .select('*, members(full_name)')
      .eq('pass_token', scannedValue)
      .single()

    if (guestPass) {
      if (guestPass.is_used || new Date() > new Date(guestPass.valid_until)) {
        playAudioFeedback(false)
        setScanResult({
          success: false,
          message: 'Guest Pass Expired or Already Used.'
        })
        setLoading(false)
        return
      }

      // Mark Guest Pass as Used
      await supabase
        .from('guest_passes')
        .update({ is_used: true })
        .eq('id', guestPass.id)

      // Log Check-in
      await supabase.from('check_ins').insert([{
        member_id: guestPass.host_member_id,
        status: 'success',
        access_granted: true,
        notes: `Guest Pass Used: ${guestPass.guest_name}`,
        is_manual_override: false
      }])

      playAudioFeedback(true)
      triggerGateRelay()
      setScanResult({
        success: true,
        message: `Guest Access Granted! Welcome ${guestPass.guest_name} (Host: ${guestPass.members?.full_name})`
      })
      setLoading(false)
      if (onScanComplete) onScanComplete()
      return
    }

    // 2. Check Standard Member Pass
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .or(`id.eq.${scannedValue},qr_code_token.eq.${scannedValue}`)
      .maybeSingle()

    if (memberError || !member) {
      playAudioFeedback(false)
      setScanResult({
        success: false,
        message: 'Invalid Pass: Member record not found.'
      })
      setLoading(false)
      return
    }

    // Check Membership Expiration Date
    const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
    const isInactive = member.status !== 'active' || isExpired

    if (isInactive && !isManual) {
      playAudioFeedback(false)
      setScanResult({
        success: false,
        member,
        message: isExpired ? `Membership Expired on ${new Date(member.membership_end_date).toLocaleDateString()}` : `Status is ${member.status}`
      })
      setLoading(false)
      return
    }

    // Insert Check-in
    const { error: checkInError } = await supabase
      .from('check_ins')
      .insert([{ 
        member_id: member.id, 
        status: 'success',
        access_granted: true,
        notes: isManual ? 'Manual Staff Override' : 'QR Scan Granted',
        is_manual_override: isManual,
        authorized_by: isManual ? 'Staff Operator' : 'QR Terminal'
      }])

    if (checkInError) {
      playAudioFeedback(false)
      setScanResult({
        success: false,
        message: `Check-in error: ${checkInError.message}`
      })
    } else {
      playAudioFeedback(true)
      triggerGateRelay()
      setScanResult({
        success: true,
        member,
        message: isManual ? `Manual Override Granted for ${member.full_name}` : `Access Granted! Welcome, ${member.full_name}.`
      })
      if (onScanComplete) onScanComplete()
    }
    setLoading(false)
  }

  // Search Members for Manual Staff Override
  const handleManualSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(5)

    if (data) setSearchResults(data)
    setIsSearching(false)
  }

  const handleScanNext = () => {
    setScanResult(null)
    setSearchQuery('')
    setSearchResults([])
    startScanner()
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Front Desk QR Terminal</h2>
          </div>
          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <Zap className="h-3 w-3" />
            <span>Turnstile Relay Active</span>
          </span>
        </div>

        {!scanResult && (
          <div id="reader" className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"></div>
        )}

        {loading && (
          <p className="text-indigo-400 font-semibold text-sm mt-4 animate-pulse">
            Verifying membership credentials...
          </p>
        )}

        {scanResult && (
          <div className={`mt-6 p-5 rounded-xl border text-left flex items-start space-x-4 transition-all duration-300 ${
            scanResult.success 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-lg shadow-emerald-500/10' 
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-500/10'
          }`}>
            {scanResult.success ? (
              <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="h-8 w-8 text-rose-400 flex-shrink-0 mt-1" />
            )}

            <div className="flex-1">
              <h3 className="font-bold text-lg">{scanResult.success ? 'Access Granted' : 'Access Denied'}</h3>
              <p className="text-sm mt-1 opacity-90">{scanResult.message}</p>

              {scanResult.member && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1">
                  <p><strong>Member:</strong> {scanResult.member.full_name}</p>
                  <p><strong>Email:</strong> {scanResult.member.email}</p>
                </div>
              )}

              <button
                onClick={handleScanNext}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Scan Next Pass
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MANUAL DESK OVERRIDE SEARCH */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-4">
          <KeyRound className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Manual Staff Override</h3>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search member by name or email for manual check-in..."
            value={searchQuery}
            onChange={(e) => handleManualSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            {searchResults.map((m) => (
              <div key={m.id} className="p-3 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800/80">
                <div>
                  <p className="text-xs font-bold text-slate-200">{m.full_name}</p>
                  <p className="text-[10px] text-slate-500">{m.email}</p>
                </div>
                <button
                  onClick={() => processCheckIn(m.id, true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold rounded-lg transition"
                >
                  Admit Manually
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}