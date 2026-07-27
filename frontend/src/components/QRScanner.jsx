import React, { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle, XCircle, QrCode } from 'lucide-react'

export default function QRScanner({ onScanComplete }) {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef(null)

  // Web Audio API feedback generator
  const playAudioFeedback = (isSuccess) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = isSuccess ? 'sine' : 'sawtooth'
      osc.frequency.setValueAtTime(isSuccess ? 880 : 220, ctx.currentTime) // High pitch success, low pitch failure
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch (e) {
      console.warn('Audio feedback not supported or blocked by browser policies.')
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
        () => {} // Silently ignore frame search errors
      )
    }, 100)
  }

  useEffect(() => {
    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  const processCheckIn = async (scannedValue) => {
    setLoading(true)

    // Lookup member by ID or QR Token
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

    if (member.status !== 'active') {
      playAudioFeedback(false)
      setScanResult({
        success: false,
        member,
        message: `Entry Denied: Member status is "${member.status}".`
      })
      setLoading(false)
      return
    }

    // Insert attendance log
    const { error: checkInError } = await supabase
      .from('check_ins')
      .insert([{ 
        member_id: member.id, 
        status: 'success',
        access_granted: true,
        notes: 'Access Granted'
      }])

    if (checkInError) {
      playAudioFeedback(false)
      setScanResult({
        success: false,
        message: `Check-in error: ${checkInError.message}`
      })
    } else {
      playAudioFeedback(true)
      setScanResult({
        success: true,
        member,
        message: `Access Granted! Welcome, ${member.full_name}.`
      })
      if (onScanComplete) onScanComplete()
    }
    setLoading(false)
  }

  const handleScanNext = () => {
    setScanResult(null)
    startScanner()
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <QrCode className="h-6 w-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Front Desk QR Terminal</h2>
      </div>

      {!scanResult && (
        <div id="reader" className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900"></div>
      )}

      {loading && (
        <p className="text-indigo-400 font-semibold text-sm mt-4 animate-pulse">
          Verifying membership pass...
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
  )
}