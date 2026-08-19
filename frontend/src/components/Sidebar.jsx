import React from 'react'
import { 
  Users, QrCode, BarChart3, PlusCircle, LogOut, Shield, 
  X, User, Wrench, Dumbbell, Award, Calendar, ShoppingBag, 
  Megaphone, KeyRound, Calculator, Target, Activity,
  Scale, Radio, Droplet, Headphones, Flame, Heart, MessageSquare, 
  Receipt, Layers, FileText, ChevronRight
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
  const adminNavSections = [
    {
      title: 'Command & Gate',
      items: [
        { id: 'members', label: 'Athlete Directory', icon: Users },
        { id: 'scanner', label: 'Turnstile Scanner', icon: QrCode },
        { id: 'analytics', label: 'Revenue & Metrics', icon: BarChart3 },
        { id: 'invoices', label: 'POS & Tax Invoices', icon: Receipt },
      ]
    },
    {
      title: 'Club Operations',
      items: [
        { id: 'occupancy', label: 'Live Floor Traffic', icon: Radio },
        { id: 'classes', label: 'Class Schedules', icon: Calendar },
        { id: 'shop', label: 'Pro Shop & Cafe', icon: ShoppingBag },
        { id: 'lockers', label: 'Locker Allocations', icon: KeyRound },
        { id: 'maintenance', label: 'Equipment Health', icon: Wrench },
        { id: 'trainers', label: 'Coaching Roster', icon: Dumbbell },
      ]
    },
    {
      title: 'Communications',
      items: [
        { id: 'coaching_chat', label: 'Coach Messages', icon: MessageSquare },
        { id: 'community', label: 'Community Feed', icon: Megaphone },
        { id: 'exercises', label: 'Exercise Atlas', icon: Target },
      ]
    }
  ]

  const trainerNavSections = [
    {
      title: 'Coach Center',
      items: [
        { id: 'trainer_dashboard', label: 'Athlete Roster & MRR', icon: Award },
        { id: 'coaching_chat', label: 'Client Direct Chat', icon: MessageSquare },
        { id: 'printable_sheets', label: 'Printable Gym Sheets', icon: FileText },
        { id: 'recovery_insights', label: 'Recovery & Volume Map', icon: Activity },
      ]
    },
    {
      title: 'Strength & Periodization',
      items: [
        { id: 'ai_generator', label: 'Program Architect', icon: Layers },
        { id: 'exercises', label: 'Exercise Atlas', icon: Target },
        { id: 'workout_tracker', label: 'Live Workout Logger', icon: Flame },
        { id: 'warmup_calc', label: 'Warmup Calculator', icon: Layers },
        { id: 'mobility', label: 'Mobility & Prep', icon: Heart },
        { id: 'nutrition', label: 'Food Diary & Macros', icon: Calculator },
      ]
    },
    {
      title: 'Club Schedule',
      items: [
        { id: 'classes', label: 'Group Classes', icon: Calendar },
        { id: 'community', label: 'Community Feed', icon: Megaphone },
        { id: 'maintenance', label: 'Report Machine Issue', icon: Wrench },
      ]
    }
  ]

  const memberNavSections = [
    {
      title: 'Athlete Hub',
      items: [
        { id: 'portal', label: 'Digital Gate Pass', icon: User },
        { id: 'workout_tracker', label: 'Live Workout Logger', icon: Flame },
        { id: 'recovery_insights', label: 'Recovery & Volume Map', icon: Activity },
        { id: 'body_vault', label: 'Body Progress Vault', icon: Scale },
      ]
    },
    {
      title: 'Training Tools',
      items: [
        { id: 'warmup_calc', label: 'Barbell Warmup Ramp', icon: Layers },
        { id: 'mobility', label: 'Mobility Protocols', icon: Heart },
        { id: 'ai_generator', label: 'Program Architect', icon: Layers },
        { id: 'exercises', label: 'Exercise Atlas', icon: Target },
        { id: 'printable_sheets', label: 'Printable Gym Logs', icon: FileText },
        { id: 'nutrition', label: 'Food Diary & Macros', icon: Calculator },
        { id: 'wellness', label: 'Hydration & Habits', icon: Droplet },
      ]
    },
    {
      title: 'Club & Community',
      items: [
        { id: 'coaching_chat', label: 'Coach 1-on-1 Chat', icon: MessageSquare },
        { id: 'occupancy', label: 'Live Floor Traffic', icon: Radio },
        { id: 'music', label: 'Workout Beats Hub', icon: Headphones },
        { id: 'classes', label: 'Book Class Sessions', icon: Calendar },
        { id: 'shop', label: 'Pro Shop & Fuel Bar', icon: ShoppingBag },
        { id: 'invoices', label: 'Receipts & Invoices', icon: Receipt },
        { id: 'community', label: 'Community Feed', icon: Megaphone },
        { id: 'lockers', label: 'Digital Lockers', icon: KeyRound },
        { id: 'trainers', label: 'Hire Personal Trainer', icon: Dumbbell },
      ]
    }
  ]

  let navSections = memberNavSections
  if (role === 'admin') navSections = adminNavSections
  if (role === 'trainer') navSections = trainerNavSections

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-slate-800/90 
        flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out backdrop-blur-xl shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* LOGO & BRAND */}
          <div className="flex items-center justify-between px-2 py-3 mb-3 shrink-0 border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 border border-indigo-400/20">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white uppercase">IRON GYM</h1>
                <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase">
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  <span>{role || 'Athlete'} Suite</span>
                </span>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ADMIN REGISTER SHORTCUT */}
          {role === 'admin' && onRegisterClick && (
            <button
              onClick={() => {
                onRegisterClick()
                setIsOpen(false)
              }}
              className="w-full mb-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 shrink-0 border border-indigo-400/30 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register Athlete</span>
            </button>
          )}

          {/* SCROLLABLE NAV SECTIONS */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER SIGN OUT */}
        {onLogout && (
          <div className="pt-3 mt-2 border-t border-slate-800/80 shrink-0">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit System</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}