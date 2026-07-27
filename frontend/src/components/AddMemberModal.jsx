import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { UserPlus, X, CreditCard } from 'lucide-react'

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [planName, setPlanName] = useState('Monthly Pass')
  const [amount, setAmount] = useState('50')
  const [durationDays, setDurationDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handlePlanChange = (plan) => {
    setPlanName(plan)
    if (plan === 'Day Pass') {
      setAmount('10')
      setDurationDays(1)
    } else if (plan === 'Monthly Pass') {
      setAmount('50')
      setDurationDays(30)
    } else if (plan === '3-Month VIP') {
      setAmount('130')
      setDurationDays(90)
    } else if (plan === 'Annual Pass') {
      setAmount('450')
      setDurationDays(365)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays))

    // Insert new member
    const { data: member, error } = await supabase
      .from('members')
      .insert([
        {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          status: 'active',
          plan_name: planName,
          last_payment_amount: parseFloat(amount),
          membership_end_date: expiryDate.toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    // Insert payment record
    await supabase.from('payments').insert([
      {
        member_id: member.id,
        amount: parseFloat(amount),
        plan_name: planName
      }
    ])

    setLoading(false)
    setFullName('')
    setEmail('')
    if (onMemberAdded) onMemberAdded(member)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-2.5 rounded-xl text-indigo-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Register New Member</h2>
            <p className="text-xs text-slate-400">Add member profile & record subscription payment</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Michael Nagi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. michael@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Membership Plan</label>
            <select
              value={planName}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="Day Pass">Day Pass ($10)</option>
              <option value="Monthly Pass">Monthly Pass ($50)</option>
              <option value="3-Month VIP">3-Month VIP ($130)</option>
              <option value="Annual Pass">Annual Pass ($450)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount Collected ($)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Days)</label>
              <input
                type="number"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center space-x-1"
            >
              <CreditCard className="h-3.5 w-3.5 mr-1" />
              <span>{loading ? 'Processing...' : 'Register & Log Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}