import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, QrCode, Search, KeyRound, Zap } from 'lucide-react'

export default function QRScanner({ onScanComplete }) {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const scannerRef = useRef(null)

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

    // 1. Guest Pass Verification
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
        setScanResult({
          success: true,
          message: `Guest Access Granted! Welcome ${guestPass.guest_name} (Host: ${guestPass.members?.full_name || 'Member'})`
        })
      } else {
        playAudioFeedback(false)
        setScanResult({
          success: false,
          message: 'Guest Pass Expired or Already Used.'
        })
      }
      setLoading(false)
      if (onScanComplete) onScanComplete()
      return
    }

    // 2. Member Pass Verification
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .or(`id.eq.${scannedValue},qr_code_token.eq.${scannedValue}`)
      .maybeSingle()

    if (!member) {
      playAudioFeedback(false)
      setScanResult({ success: false, message: 'Invalid Pass: Member record not found.' })
      setLoading(false)
      return
    }

    const isExpired = member.membership_end_date && new Date() > new Date(member.membership_end_date)
    const isInactive = member.status !== 'active' || isExpired

    if (isInactive && !isManual) {
      playAudioFeedback(false)
      setScanResult({
        success: false,
        member,
        message: isExpired ? `Membership Expired on ${new Date(member.membership_end_date).toLocaleDateString()}` : `Status: ${member.status}`
      })
      setLoading(false)
      return
    }

    await supabase.from('check_ins').insert([{ 
      member_id: member.id, 
      status: 'success',
      access_granted: true,
      notes: isManual ? 'Manual Staff Override' : 'QR Scan Granted',
      is_manual_override: isManual,
      authorized_by: isManual ? 'Staff Operator' : 'QR Terminal'
    }])

    playAudioFeedback(true)
    setScanResult({
      success: true,
      member,
      message: isManual ? `Manual Override Granted for ${member.full_name}` : `Access Granted! Welcome, ${member.full_name}.`
    })

    if (onScanComplete) onScanComplete()
    setLoading(false)
  }

  const startScanner = useCallback(() => {
    if (scannerRef.current) return

    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
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
  }, [])

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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto space-y-6">
      <div className="glass-panel rounded-3xl p-6 shadow-2xl text-center">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <QrCode className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Front Desk QR Scanner</h2>
          </div>
          <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Zap className="h-3 w-3" />
            <span>RELAY ONLINE</span>
          </span>
        </div>

        {!scanResult && (
          <div id="reader" className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"></div>
        )}

        {loading && (
          <p className="text-indigo-400 font-semibold text-xs mt-4 animate-pulse font-mono">
            VERIFYING PASS CREDENTIALS...
          </p>
        )}

        {scanResult && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`mt-6 p-6 rounded-2xl border text-left flex items-start space-x-4 ${
            scanResult.success 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}>
            {scanResult.success ? (
              <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="h-8 w-8 text-rose-400 flex-shrink-0 mt-1" />
            )}

            <div className="flex-1">
              <h3 className="font-black text-lg uppercase">{scanResult.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h3>
              <p className="text-xs mt-1 opacity-90">{scanResult.message}</p>

              {scanResult.member && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1 font-mono">
                  <p><strong>MEMBER:</strong> {scanResult.member.full_name}</p>
                  <p><strong>EMAIL:</strong> {scanResult.member.email}</p>
                </div>
              )}

              <button
                onClick={handleScanNext}
                className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 uppercase"
              >
                Scan Next Member
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-4">
          <KeyRound className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-black text-white uppercase">Manual Staff Override</h3>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search member by name or email..."
            value={searchQuery}
            onChange={(e) => handleManualSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-3">
            {searchResults.map((m) => (
              <div key={m.id} className="p-3 bg-slate-900 rounded-xl flex items-center justify-between border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-200">{m.full_name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{m.email}</p>
                </div>
                <button
                  onClick={() => processCheckIn(m.id, true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-lg transition"
                >
                  Admit Manually
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}