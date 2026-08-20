import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { UserPlus, CreditCard, AlertCircle, Eye, EyeOff, Phone, Mail, User, Lock, ShieldCheck, Check, Lock as LockIcon } from 'lucide-react'

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [planName, setPlanName] = useState('Monthly Pass')
  const [amount, setAmount] = useState('1200')
  const [durationDays, setDurationDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // AUTO-RESET FORM STATE ON MODAL CLOSE
  useEffect(() => {
    if (!isOpen) {
      setFullName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setShowPassword(false)
      setPlanName('Monthly Pass')
      setAmount('1200')
      setDurationDays(30)
      setErrorMsg('')
      setLoading(false)
    }
  }, [isOpen])

  // ESC Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handlePlanChange = (plan) => {
    setPlanName(plan)
    const presets = {
      'Day Pass': { amount: '250', days: 1 },
      'Monthly Pass': { amount: '1200', days: 30 },
      '3-Month VIP': { amount: '3200', days: 90 },
      'Annual Pass': { amount: '9600', days: 365 }
    }
    if (presets[plan]) {
      setAmount(presets[plan].amount)
      setDurationDays(presets[plan].days)
    }
  }

  const isCustomPass = planName === 'Custom Pass'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    try {
      // 1. Create Isolated Non-Persisted Supabase Auth Client to PREVENT ADMIN LOGOUT
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yprqvpkkatdgvfldxlni.supabase.co'
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcnF2cGtrYXRkZ3ZmbGR4bG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5ODAsImV4cCI6MjA1NTkzMDk4MH0.g7wM7W1_92yE02yN2Q573Xg7X87Xg7X87Xg7X8'
      
      const isolatedAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      })

      const { data: authData, error: authError } = await isolatedAuthClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: { data: { full_name: fullName.trim(), phone: cleanPhone } }
      })

      if (authError) throw new Error(`Auth Creation: ${authError.message}`)

      const userId = authData.user?.id
      if (!userId) throw new Error('Failed to resolve valid Auth User ID.')

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays, 10))

      // 2. Insert into public.members using active Admin client session
      const { data: member, error: memberError } = await supabase
        .from('members')
        .insert([{
          auth_id: userId,
          full_name: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          status: 'active',
          plan_name: planName,
          last_payment_amount: parseFloat(amount),
          membership_end_date: expiryDate.toISOString()
        }])
        .select()
        .maybeSingle()

      if (memberError) throw new Error(`Profile Insertion: ${memberError.message}`)

      // 3. Record Payment
      await supabase.from('payments').insert([{
        member_id: member.id,
        amount: parseFloat(amount),
        plan_name: planName
      }])

      // 4. Safe Non-blocking Welcome Email API Dispatch
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, full_name: fullName.trim(), plan_name: planName })
        })
      } catch (err) {
        console.warn('Welcome email dispatch warning:', err)
      }

      // 5. Safe Non-blocking Automated WhatsApp Direct Message Dispatch
      try {
        const rawUrl = import.meta.env.VITE_WHATSAPP_BOT_URL || 'http://localhost:3001'
        const botUrl = rawUrl.replace(/\/+$/, '')
        const botSecret = import.meta.env.VITE_WHATSAPP_BOT_SECRET || 'my_super_secret_gym_key_124578@'

        await fetch(`${botUrl}/send-pass`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${botSecret}`,
            'Bypass-Tunnel-Reminder': 'true'
          },
          body: JSON.stringify({
            phone: cleanPhone,
            fullName: fullName.trim(),
            planName: planName,
            qrToken: member.qr_code_token
          })
        })
      } catch (err) {
        console.warn('WhatsApp dispatch warning:', err)
      }

      if (onMemberAdded) onMemberAdded(member)
      onClose()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const calculatedExpiry = new Date()
  calculatedExpiry.setDate(calculatedExpiry.getDate() + parseInt(durationDays || 30, 10))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-mono border border-slate-700 cursor-pointer"
        >
          ESC
        </button>

        <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl text-indigo-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Register Athlete Pass</h2>
            <p className="text-xs text-slate-400 mt-0.5">Generate digital turnstile credentials & log initial payment.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl flex items-center space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Athlete Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Marcus Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="marcus@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Phone (WhatsApp Pass)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Account Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* PLAN SELECTOR PILLS WITH CUSTOM PASS OPTION */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Membership Tier</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { name: 'Day Pass', desc: '1 Day' },
                { name: 'Monthly Pass', desc: '30 Days' },
                { name: '3-Month VIP', desc: '90 Days' },
                { name: 'Annual Pass', desc: '365 Days' },
                { name: 'Custom Pass', desc: 'Custom' }
              ].map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePlanChange(p.name)}
                  className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                    planName === p.name 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-[10px] uppercase truncate">{p.name}</p>
                  <p className="text-[9px] font-mono text-slate-500">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* PAYMENT & DURATION FIELDS (LOCKED FOR PRESETS, EDITABLE ONLY FOR CUSTOM PASS) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Amount (EGP)</label>
                {!isCustomPass && <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><LockIcon className="h-2.5 w-2.5" /> Preset Locked</span>}
              </div>
              <input
                type="number"
                required
                readOnly={!isCustomPass}
                value={amount}
                onChange={(e) => isCustomPass && setAmount(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-xs font-mono font-bold transition ${
                  isCustomPass 
                    ? 'bg-slate-950 border-indigo-500 text-emerald-400 focus:outline-none' 
                    : 'bg-slate-950/50 border-slate-800/80 text-emerald-400/80 cursor-not-allowed select-none'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Duration (Days)</label>
                {!isCustomPass && <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1"><LockIcon className="h-2.5 w-2.5" /> Preset Locked</span>}
              </div>
              <input
                type="number"
                required
                readOnly={!isCustomPass}
                value={durationDays}
                onChange={(e) => isCustomPass && setDurationDays(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-xs font-mono font-bold transition ${
                  isCustomPass 
                    ? 'bg-slate-950 border-indigo-500 text-slate-200 focus:outline-none' 
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-400/80 cursor-not-allowed select-none'
                }`}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Pass Expiration:</span>
            <span className="text-amber-400 font-bold">{calculatedExpiry.toLocaleDateString()}</span>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition disabled:opacity-50 flex items-center space-x-2 shadow-xl shadow-indigo-600/30 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>{loading ? 'Creating Pass & Credentials...' : 'Register & Authorize Pass'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}