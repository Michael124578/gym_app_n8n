import React, { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle, XCircle, QrCode } from 'lucide-react'

export default function QRScanner({ onScanComplete }) {
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 10,
    })

    scanner.render(
      async (scannedMemberId) => {
        scanner.clear()
        await processCheckIn(scannedMemberId)
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  const processCheckIn = async (memberId) => {
    setLoading(true)

    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (memberError || !member) {
      setScanResult({
        success: false,
        message: 'Invalid Pass: Member record not found.'
      })
      setLoading(false)
      return
    }

    if (member.status !== 'active') {
      setScanResult({
        success: false,
        member,
        message: `Entry Denied: Member status is "${member.status}".`
      })
      setLoading(false)
      return
    }

    const { error: checkInError } = await supabase
      .from('check_ins')
      .insert([{ member_id: member.id, status: 'success' }])

    if (checkInError) {
      setScanResult({
        success: false,
        message: `Check-in error: ${checkInError.message}`
      })
    } else {
      setScanResult({
        success: true,
        member,
        message: `Access Granted! Welcome, ${member.full_name}.`
      })
      if (onScanComplete) onScanComplete()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl text-center">
      <div className="flex items-center justify-center space-x-2 mb-6">
        <QrCode className="h-6 w-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Front Desk QR Scanner</h2>
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
        <div className={`mt-6 p-5 rounded-xl border text-left flex items-start space-x-4 ${
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
            <h3 className="font-bold text-lg">{scanResult.success ? 'Access Granted' : 'Access Denied'}</h3>
            <p className="text-sm mt-1 opacity-90">{scanResult.message}</p>

            {scanResult.member && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1">
                <p><strong>Member:</strong> {scanResult.member.full_name}</p>
                <p><strong>Email:</strong> {scanResult.member.email}</p>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
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