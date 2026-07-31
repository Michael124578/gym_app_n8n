import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { supabaseAdminAuth } from '../utils/supabaseAdmin'
import { UserPlus, CreditCard, AlertCircle, Eye, EyeOff, Phone } from 'lucide-react'

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [planName, setPlanName] = useState('Monthly Pass')
  const [amount, setAmount] = useState('50')
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
      setAmount('50')
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
      'Day Pass': { amount: '10', days: 1 },
      'Monthly Pass': { amount: '50', days: 30 },
      '3-Month VIP': { amount: '130', days: 90 },
      'Annual Pass': { amount: '450', days: 365 }
    }
    if (presets[plan]) {
      setAmount(presets[plan].amount)
      setDurationDays(presets[plan].days)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()

    try {
      // 1. Create Auth User directly via non-persisted Admin Auth client
      const { data: authData, error: authError } = await supabaseAdminAuth.auth.signUp({
        email: cleanEmail,
        password: password,
        options: { data: { full_name: fullName.trim(), phone: cleanPhone } }
      })

      if (authError) throw new Error(`Auth Creation: ${authError.message}`)

      const userId = authData.user?.id
      if (!userId) throw new Error('Failed to resolve valid Auth User ID.')

      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays, 10))

      // 2. Insert into public.members
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
        const botUrl = rawUrl.replace(/\/+$/, '') // Prevents double slashes like //send-pass
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition bg-slate-800 px-2 py-1 rounded-lg text-xs font-mono"
        >
          ESC
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-2.5 rounded-2xl text-indigo-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Register Member</h2>
            <p className="text-xs text-slate-400">Create access credentials & initial payment</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Michael Nagi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. michael@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number (WhatsApp)</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="e.g. +201234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <Phone className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Account Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Membership Plan</label>
            <select
              value={planName}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="Day Pass">Day Pass ($10 / 1 Day)</option>
              <option value="Monthly Pass">Monthly Pass ($50 / 30 Days)</option>
              <option value="3-Month VIP">3-Month VIP ($130 / 90 Days)</option>
              <option value="Annual Pass">Annual Pass ($450 / 365 Days)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Amount ($)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center space-x-1 shadow-lg shadow-indigo-600/30"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              <span>{loading ? 'Creating Pass...' : 'Register & Log Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}