import React from 'react'
import { 
  Users, QrCode, Calendar, ShoppingBag, Menu, 
  User, Award, Flame, Activity, MessageSquare 
} from 'lucide-react'

export default function MobileBottomDock({ 
  activeTab, 
  setActiveTab, 
  role, 
  onToggleSidebar 
}) {
  const getDockItems = () => {
    if (role === 'admin') {
      return [
        { id: 'members', label: 'Roster', icon: Users },
        { id: 'scanner', label: 'Scanner', icon: QrCode, isPrimary: true },
        { id: 'classes', label: 'Classes', icon: Calendar },
        { id: 'shop', label: 'Pro Shop', icon: ShoppingBag },
      ]
    }
    if (role === 'trainer') {
      return [
        { id: 'trainer_dashboard', label: 'Dashboard', icon: Award },
        { id: 'coaching_chat', label: 'Chat', icon: MessageSquare },
        { id: 'workout_tracker', label: 'Logger', icon: Flame, isPrimary: true },
        { id: 'classes', label: 'Classes', icon: Calendar },
      ]
    }
    // Default Member Role
    return [
      { id: 'portal', label: 'Gate Pass', icon: User },
      { id: 'workout_tracker', label: 'Logger', icon: Flame, isPrimary: true },
      { id: 'recovery_insights', label: 'Recovery', icon: Activity },
      { id: 'classes', label: 'Classes', icon: Calendar },
    ]
  }

  const items = getDockItems()

  return (
    <nav 
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-950/90 backdrop-blur-2xl border border-slate-800/90 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around select-none"
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id || (!activeTab && (item.id === 'members' || item.id === 'portal' || item.id === 'trainer_dashboard'))

        if (item.isPrimary) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                relative -top-4 p-3.5 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 
                text-white shadow-xl shadow-indigo-600/40 border-2 border-slate-950 transition-transform active:scale-95 cursor-pointer
              `}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5 drop-shadow" />
            </button>
          )
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex flex-col items-center justify-center space-y-0.5 px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-2xl transition cursor-pointer
              ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400 scale-110' : ''} transition-transform`} />
            <span className="text-[9px] font-mono uppercase tracking-wider">{item.label}</span>
          </button>
        )
      })}

      {/* FULL NAV SIDEBAR DRAWER TOGGLE */}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col items-center justify-center space-y-0.5 px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-2xl text-slate-400 hover:text-white transition cursor-pointer"
        title="Open Full Navigation Menu"
        aria-label="Open Full Navigation Menu"
      >
        <Menu className="h-4 w-4" />
        <span className="text-[9px] font-mono uppercase tracking-wider">Menu</span>
      </button>
    </nav>
  )
}
