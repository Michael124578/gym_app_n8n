import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, MapPin, Sparkles, Palette, ShieldCheck, 
  Save, CheckCircle2, RotateCcw, Plus, Trash2, Dumbbell, 
  Crown, Zap, Shield, Flame, Globe, Mail, Phone, ExternalLink
} from 'lucide-react'

const PRESET_BRANCHES = [
  { id: 'b1', name: 'Cairo Flagship Arena', address: 'Nasr City, Olympic District, Cairo', phone: '+20 2 2401 8899', isPrimary: true },
  { id: 'b2', name: 'New Cairo VIP Titanium Suite', address: '5th Settlement, South 90th St, New Cairo', phone: '+20 2 2811 4455', isPrimary: false },
  { id: 'b3', name: 'Zamalek Elite Waterfront Studio', address: 'Abou El Feda St, Gezira Island, Zamalek', phone: '+20 2 2736 1200', isPrimary: false },
  { id: 'b4', name: 'Alexandria Coastal High-Performance Dome', address: 'Corniche Rd, Gleem Bay, Alexandria', phone: '+20 3 5844 9900', isPrimary: false }
]

const THEME_ACCENTS = [
  { id: 'indigo', label: 'Carbon Indigo', primary: '#6366f1', gradient: 'from-indigo-600 to-violet-600', ring: 'ring-indigo-500' },
  { id: 'emerald', label: 'Emerald Titan', primary: '#10b981', gradient: 'from-emerald-600 to-teal-600', ring: 'ring-emerald-500' },
  { id: 'cyan', label: 'Cyber Cyan', primary: '#06b6d4', gradient: 'from-cyan-600 to-blue-600', ring: 'ring-cyan-500' },
  { id: 'crimson', label: 'Crimson Apex', primary: '#f43f5e', gradient: 'from-rose-600 to-red-600', ring: 'ring-rose-500' },
  { id: 'amber', label: 'Royal Amber', primary: '#f59e0b', gradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-500' },
]

const LOGO_ICONS = [
  { id: 'dumbbell', label: 'Titan Barbell', icon: Dumbbell },
  { id: 'crown', label: 'Imperial Crown', icon: Crown },
  { id: 'zap', label: 'Kinetic Voltage', icon: Zap },
  { id: 'shield', label: 'Aegis Shield', icon: Shield },
  { id: 'flame', label: 'Apex Blaze', icon: Flame },
]

export default function GymBrandingManager() {
  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem('iron_gym_branding')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      name: 'IRON GYM',
      tagline: 'STRENGTH & CONDITIONING',
      activeBranch: 'Cairo Flagship Arena',
      taxId: 'EG-TAX-2026-9042',
      email: 'hq@irongym.com',
      phone: '+20 122 544 8837',
      website: 'www.irongym.com',
      accent: 'indigo',
      iconId: 'dumbbell',
      branches: PRESET_BRANCHES
    }
  })

  const [toastMessage, setToastMessage] = useState(null)
  const [newBranchName, setNewBranchName] = useState('')
  const [newBranchAddress, setNewBranchAddress] = useState('')
  const [newBranchPhone, setNewBranchPhone] = useState('')
  const [isAddingBranch, setIsAddingBranch] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSaveBranding = (updated) => {
    const next = { ...branding, ...updated }
    setBranding(next)
    localStorage.setItem('iron_gym_branding', JSON.stringify(next))
    
    // Broadcast change to Navbar & other active tabs in realtime
    window.dispatchEvent(new CustomEvent('gym_branding_updated', { detail: next }))
    showToast('Branding & Facility Profile Updated Globally!')
  }

  const handleAddBranch = (e) => {
    e.preventDefault()
    if (!newBranchName.trim() || !newBranchAddress.trim()) return

    const newBranch = {
      id: `branch-${Date.now()}`,
      name: newBranchName.trim(),
      address: newBranchAddress.trim(),
      phone: newBranchPhone.trim() || '+20 2 0000 0000',
      isPrimary: false
    }

    const updatedBranches = [...branding.branches, newBranch]
    handleSaveBranding({ branches: updatedBranches })
    setNewBranchName('')
    setNewBranchAddress('')
    setNewBranchPhone('')
    setIsAddingBranch(false)
  }

  const handleDeleteBranch = (id) => {
    if (branding.branches.length <= 1) {
      showToast('Cannot delete the only remaining facility location.')
      return
    }
    const updatedBranches = branding.branches.filter(b => b.id !== id)
    let nextActive = branding.activeBranch
    if (branding.activeBranch === branding.branches.find(b => b.id === id)?.name) {
      nextActive = updatedBranches[0]?.name || 'Cairo Flagship Arena'
    }
    handleSaveBranding({ branches: updatedBranches, activeBranch: nextActive })
  }

  const activeTheme = THEME_ACCENTS.find(t => t.id === branding.accent) || THEME_ACCENTS[0]
  const ActiveIconComponent = LOGO_ICONS.find(i => i.id === branding.iconId)?.icon || Dumbbell

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Facility Customization & Location Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Facility Branding & Multi-Branch Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize commercial gym branding, multi-location facility hubs, color accents, and official tax invoice credentials.
            </p>
          </div>

          {/* ACTIVE BRAND BADGE */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center space-x-3 shrink-0">
            <div className={`p-3 rounded-2xl bg-gradient-to-tr ${activeTheme.gradient} text-white shadow-lg`}>
              <ActiveIconComponent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase">{branding.name}</p>
              <p className="text-[10px] font-mono text-indigo-400 uppercase font-bold">{branding.activeBranch}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: BRANDING & THEME CONFIG */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* CORE IDENTITY */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Brand Identity & Legal Profile</span>
            </h3>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Gym Facility Commercial Name</label>
              <input
                type="text"
                value={branding.name}
                onChange={(e) => handleSaveBranding({ name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={branding.tagline}
                onChange={(e) => handleSaveBranding({ tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Tax Registration ID</label>
                <input
                  type="text"
                  value={branding.taxId}
                  onChange={(e) => handleSaveBranding({ taxId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono font-bold text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Official Support Phone</label>
                <input
                  type="text"
                  value={branding.phone}
                  onChange={(e) => handleSaveBranding({ phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono font-bold text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Corporate HQ Email</label>
              <input
                type="email"
                value={branding.email}
                onChange={(e) => handleSaveBranding({ email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono font-bold text-slate-300 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* PALETTE ACCENTS & LOGO ICONS */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h3 className="text-sm font-black uppercase text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Palette className="h-4 w-4 text-indigo-400" />
              <span>Theme Palette & Heraldic Crest</span>
            </h3>

            {/* COLOR ACCENTS */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">Accent Color Palette</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {THEME_ACCENTS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSaveBranding({ accent: t.id })}
                    className={`p-3 rounded-2xl border text-left transition flex items-center space-x-2.5 cursor-pointer ${
                      branding.accent === t.id 
                        ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-lg' 
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full bg-gradient-to-tr ${t.gradient} shrink-0`} />
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LOGO ICON BADGES */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">Facility Logo Icon Crest</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {LOGO_ICONS.map((i) => {
                  const Icon = i.icon
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => handleSaveBranding({ iconId: i.id })}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                        branding.iconId === i.id 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' 
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-indigo-400" />
                      <span className="text-[10px] font-bold uppercase">{i.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: MULTI-BRANCH LOCATION MANAGER */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase text-white flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Multi-Location Branch Registry</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingBranch(!isAddingBranch)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isAddingBranch ? 'Cancel' : 'Add Location'}</span>
              </button>
            </div>

            {/* ADD LOCATION FORM */}
            <AnimatePresence>
              {isAddingBranch && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddBranch}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
                >
                  <p className="text-xs font-bold uppercase text-white">Register New Gym Branch</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Branch Title (e.g. Sheikh Zayed Titan Hub)"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Street Address, City"
                      value={newBranchAddress}
                      onChange={(e) => setNewBranchAddress(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Direct Phone Number"
                      value={newBranchPhone}
                      onChange={(e) => setNewBranchPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    Save & Register Location
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* LOCATIONS LIST */}
            <div className="space-y-3">
              {branding.branches.map((branch) => {
                const isActive = branding.activeBranch === branch.name
                return (
                  <div
                    key={branch.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      isActive 
                        ? 'bg-slate-950 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30' 
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-black text-white uppercase">{branch.name}</p>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active Terminal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{branch.address}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{branch.phone}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleSaveBranding({ activeBranch: branch.name })}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                        title="Delete Branch"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
