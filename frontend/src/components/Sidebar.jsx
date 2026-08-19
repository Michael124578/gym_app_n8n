import React from 'react'
import { 
  Users, QrCode, BarChart3, PlusCircle, LogOut, Shield, 
  X, User, Wrench, Dumbbell, Award, Calendar, ShoppingBag, 
  Megaphone, KeyRound, Calculator, Sparkles, Target, Activity,
  Scale, Radio, Droplet, Headphones, Flame, Heart, MessageSquare, 
  Receipt, Layers
} from 'lucide-react'

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  role, 
  onRegisterClick, 
  onLogout,
  isOpen,
  setIsOpen 
}) {
  const adminNavItems = [
    { id: 'members', label: 'Member Roster', icon: Users },
    { id: 'scanner', label: 'QR Gate Scanner', icon: QrCode },
    { id: 'analytics', label: 'Analytics & Revenue', icon: BarChart3 },
    { id: 'invoices', label: 'POS & Invoices', icon: Receipt },
    { id: 'occupancy', label: 'Live Gym Traffic', icon: Radio },
    { id: 'classes', label: 'Group Classes', icon: Calendar },
    { id: 'shop', label: 'Fuel Bar & POS', icon: ShoppingBag },
    { id: 'exercises', label: 'Exercise Library', icon: Target },
    { id: 'coaching_chat', label: 'Coaching Messages', icon: MessageSquare },
    { id: 'community', label: 'Community Feed', icon: Megaphone },
    { id: 'lockers', label: 'Digital Lockers', icon: KeyRound },
    { id: 'maintenance', label: 'Equipment & Repairs', icon: Wrench },
    { id: 'trainers', label: 'PT & Coaching', icon: Dumbbell },
  ]

  const trainerNavItems = [
    { id: 'trainer_dashboard', label: 'Coach Dashboard', icon: Award },
    { id: 'coaching_chat', label: 'Client Messages', icon: MessageSquare },
    { id: 'exercises', label: 'Exercise Library', icon: Target },
    { id: 'ai_generator', label: 'AI Routine Builder', icon: Sparkles },
    { id: 'workout_tracker', label: 'Live Workout Logger', icon: Flame },
    { id: 'warmup_calc', label: 'Warmup Calculator', icon: Layers },
    { id: 'mobility', label: 'Mobility & Warmup', icon: Heart },
    { id: 'classes', label: 'Group Classes', icon: Calendar },
    { id: 'community', label: 'Community Feed', icon: Megaphone },
    { id: 'nutrition', label: 'Food Diary & Macros', icon: Calculator },
    { id: 'maintenance', label: 'Report Machine Issue', icon: Wrench },
  ]

  const memberNavItems = [
    { id: 'portal', label: 'Pass & Workouts', icon: User },
    { id: 'workout_tracker', label: 'Live Workout Tracker', icon: Flame },
    { id: 'warmup_calc', label: 'Warmup Calculator', icon: Layers },
    { id: 'exercises', label: 'Exercise Library', icon: Target },
    { id: 'mobility', label: 'Mobility & Warmup', icon: Heart },
    { id: 'ai_generator', label: 'AI Routine Builder', icon: Sparkles },
    { id: 'body_vault', label: 'Body Progress Vault', icon: Scale },
    { id: 'wellness', label: 'Hydration & Habits', icon: Droplet },
    { id: 'nutrition', label: 'Food Diary & Macros', icon: Calculator },
    { id: 'coaching_chat', label: 'Coach Direct Chat', icon: MessageSquare },
    { id: 'occupancy', label: 'Live Gym Heatmap', icon: Radio },
    { id: 'music', label: 'Workout Beats Hub', icon: Headphones },
    { id: 'invoices', label: 'Receipts & Invoices', icon: Receipt },
    { id: 'classes', label: 'Book Classes', icon: Calendar },
    { id: 'shop', label: 'Fuel Bar & Shop', icon: ShoppingBag },
    { id: 'community', label: 'Community Feed', icon: Megaphone },
    { id: 'lockers', label: 'Digital Lockers', icon: KeyRound },
    { id: 'trainers', label: 'Hire a Trainer', icon: Dumbbell },
    { id: 'maintenance', label: 'Report Machine Issue', icon: Wrench },
  ]

  let navItems = memberNavItems
  if (role === 'admin') navItems = adminNavItems
  if (role === 'trainer') navItems = trainerNavItems

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 
        flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-2 py-3 mb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/25">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">IRON GYM</h1>
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  <span className="capitalize">{role || 'Member'}</span>
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {role === 'admin' && onRegisterClick && (
            <button
              onClick={() => {
                onRegisterClick()
                setIsOpen(false)
              }}
              className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 shrink-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register Member</span>
            </button>
          )}

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Navigation Hub
            </p>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
          >
            <div className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] font-mono opacity-60">v3.0 Pro</span>
          </button>
        </div>
      </aside>
    </>
  )
}