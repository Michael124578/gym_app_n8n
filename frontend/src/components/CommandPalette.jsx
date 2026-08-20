import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Users, QrCode, Activity, Flame, Dumbbell, 
  Calendar, ShoppingBag, KeyRound, Calculator, Sparkles, 
  Bot, ShieldAlert, Award, MessageSquare, Heart, CreditCard, 
  Sliders, UserCheck, X, ArrowRight, CornerDownLeft
} from 'lucide-react'

export default function CommandPalette({ isOpen, onClose, activeTab, setActiveTab, role }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // ALL AVAILABLE COMMAND PALETTE DESTINATIONS & ACTIONS
  const allCommands = [
    // TRAINING & WORKOUTS
    { id: 'workout_tracker', title: 'Live Workout Logger', desc: 'Track active sets, reps, weight & rest timer', category: 'Training', icon: Flame, badge: 'Member' },
    { id: 'exercise_library', title: 'Exercise Library & 3D Demos', desc: 'Browse muscle groups & exercise execution', category: 'Training', icon: Dumbbell, badge: 'All Roles' },
    { id: 'ai_routines', title: 'AI Routine Generator', desc: 'Generate customized workout programs', category: 'Training', icon: Bot, badge: 'AI Powered' },
    { id: 'recovery_insights', title: 'Recovery Hub & HRV', desc: 'Monitor central nervous system & fatigue', category: 'Training', icon: Heart, badge: 'Member' },
    { id: 'habit_tracker', title: 'Wellness & Daily Habits', desc: 'Log water intake, sleep & daily steps', category: 'Training', icon: Activity, badge: 'Member' },

    // ACCESS & MANAGEMENT
    { id: 'scanner', title: 'Turnstile & Gate Scanner', desc: 'Scan member QR passes for access control', category: 'Access & Admin', icon: QrCode, badge: 'Staff / Admin' },
    { id: 'members', title: 'Member Directory & Roster', desc: 'Manage memberships, check-ins & status', category: 'Access & Admin', icon: Users, badge: 'Admin' },
    { id: 'admin_analytics', title: 'Revenue & Gym Analytics', desc: 'View MRR, active check-ins & occupancy', category: 'Access & Admin', icon: Activity, badge: 'Admin' },
    { id: 'pos_invoice', title: 'POS & Invoice Generator', desc: 'Create billing receipts & sell passes', category: 'Access & Admin', icon: CreditCard, badge: 'Admin' },
    { id: 'lockers', title: 'Locker Allocation Vault', desc: 'Assign & monitor digital lockers', category: 'Access & Admin', icon: ShieldAlert, badge: 'Admin' },

    // TOOLS & COMMUNITY
    { id: 'classes', title: 'Class Schedule & Booking', desc: 'Book HIIT, Yoga & Strength group sessions', category: 'Tools & Schedule', icon: Calendar, badge: 'All Roles' },
    { id: 'shop', title: 'Iron Pro Shop', desc: 'Supplements, gear & gym merch', category: 'Tools & Schedule', icon: ShoppingBag, badge: 'All Roles' },
    { id: 'community', title: 'Gym Community Feed', desc: 'Share PRs, posts & gym announcements', category: 'Tools & Schedule', icon: MessageSquare, badge: 'Social' },
    { id: 'macro_calc', title: 'Macro & TDEE Calculator', desc: 'Calculate daily calories, protein & carbs', category: 'Tools & Schedule', icon: Calculator, badge: 'Tools' },
    { id: 'barbell_calc', title: 'Barbell Warmup Calculator', desc: 'Calculate plate loading configurations', category: 'Tools & Schedule', icon: Dumbbell, badge: 'Tools' },
    { id: 'body_vault', title: 'Body Progress Vault', desc: 'Track bodyweight & progress photos', category: 'Tools & Schedule', icon: Award, badge: 'Member' },
  ]

  // Filter commands based on user role and query string
  const filteredCommands = allCommands.filter((cmd) => {
    const matchesQuery = cmd.title.toLowerCase().includes(query.toLowerCase()) || 
                         cmd.desc.toLowerCase().includes(query.toLowerCase()) ||
                         cmd.category.toLowerCase().includes(query.toLowerCase())
    
    // Admin sees everything; trainer & member see relevant commands
    if (role === 'trainer' && cmd.id === 'pos_invoice') return false
    return matchesQuery
  })

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex].id)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  const handleSelect = (tabId) => {
    setActiveTab(tabId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md">
        {/* Backdrop overlay click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800/90 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* SEARCH INPUT BAR */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/60">
            <Search className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, modules, or tools... (e.g. Scanner, Workouts, POS)"
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-500 hover:text-slate-300 rounded-lg mr-2"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/80 rounded-md">
              ESC
            </kbd>
          </div>

          {/* COMMANDS LIST */}
          <div className="overflow-y-auto p-2 space-y-1 max-h-[60vh] scrollable-list">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-40 text-indigo-400" />
                No matching commands found for "{query}"
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon
                const isSelected = idx === selectedIndex
                const isActiveCurrent = activeTab === cmd.id

                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`
                      w-full text-left flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group
                      ${isSelected 
                        ? 'bg-gradient-to-r from-indigo-900/50 via-slate-800/80 to-slate-800/40 border border-indigo-500/30 text-white shadow-lg' 
                        : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'}
                    `}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`
                        p-2.5 rounded-xl transition-colors
                        ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800/80 text-indigo-400'}
                      `}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold truncate">{cmd.title}</span>
                          {isActiveCurrent && (
                            <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{cmd.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                      <span className="hidden sm:inline-block text-[9px] font-mono uppercase text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {cmd.category}
                      </span>
                      <CornerDownLeft className={`h-4 w-4 text-indigo-400 opacity-0 ${isSelected ? 'opacity-100' : ''} transition-opacity`} />
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* PALETTE FOOTER HINTS */}
          <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 mr-1 text-[9px]">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 mr-1 text-[9px]">↵</kbd> Select
              </span>
            </div>
            <span>IRON GYM OS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
