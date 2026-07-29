import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Award, Lock, Mail, DollarSign, User, AlertCircle, Sparkles } from 'lucide-react'

export default function AddTrainerModal({ isOpen, onClose, onTrainerAdded }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialty, setSpecialty] = useState('Strength & Conditioning')
  const [hourlyRate, setHourlyRate] = useState('40')
  const [monthlyPrice, setMonthlyPrice] = useState('120')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Create Auth user via admin function or direct signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: { data: { full_name: fullName.trim(), user_role: 'trainer' } }
      })

      if (authError) throw new Error(`Trainer Auth Error: ${authError.message}`)

      // 2. Insert into 'trainers' table
      const { data: trainer, error: trainerError } = await supabase
        .from('trainers')
        .insert([{
          auth_id: authData.user?.id,
          email: cleanEmail,
          full_name: fullName.trim(),
          specialty: specialty.trim(),
          hourly_rate: parseFloat(hourlyRate),
          monthly_plan_price: parseFloat(monthlyPrice),
          bio: bio.trim() || 'Professional certified fitness coach.'
        }])
        .select()
        .maybeSingle()

      if (trainerError) throw new Error(`Trainer Record Insertion: ${trainerError.message}`)

      setFullName('')
      setEmail('')
      setPassword('')
      setBio('')
      if (onTrainerAdded) onTrainerAdded(trainer)
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
          <div className="bg-amber-500/20 border border-amber-500/30 p-2.5 rounded-2xl text-amber-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Register New Personal Trainer</h2>
            <p className="text-xs text-slate-400">Create coach portal access & pricing parameters</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Coach Marcus Vance"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="coach@irongym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Specialty</label>
            <input
              type="text"
              required
              placeholder="e.g. Powerlifting & Hypertrophy"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Hourly Session ($)</label>
              <input
                type="number"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Plan ($)</label>
              <input
                type="number"
                required
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Bio / Qualifications</label>
            <input
              type="text"
              placeholder="e.g. CSCS certified strength coach with 10+ years experience."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
            />
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center space-x-1"
            >
              <Award className="h-4 w-4 mr-1" />
              <span>{loading ? 'Creating Account...' : 'Add Trainer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}