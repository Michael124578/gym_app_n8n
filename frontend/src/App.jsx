import React, { useState, useEffect } from 'react'
import AddMemberModal from './components/AddMemberModal'
import MemberList from './components/MemberList'
import QRScanner from './components/QRScanner'
import AdminAnalytics from './components/AdminAnalytics'
import EquipmentMaintenance from './components/EquipmentMaintenance'
import TrainerManagement from './components/TrainerManagement'
import ClassSchedule from './components/ClassSchedule'
import GymShop from './components/GymShop'
import GymCommunityFeed from './components/GymCommunityFeed'
import LockerManagement from './components/LockerManagement'
import MacroCalculator from './components/MacroCalculator'
import TrainerDashboard from './pages/TrainerDashboard'
import MemberPortal from './pages/MemberPortal'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabaseClient'
import { 
  QrCode, Dumbbell, Wrench, Users, Award, BarChart3, 
  Calendar, ShoppingBag, Megaphone, User, KeyRound, Calculator 
} from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // 1. Initial Session Check (Runs ONCE on app load)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession)
        detectRole(currentSession, 'INITIAL_LOAD')
      }
    })

    // 2. Auth Event Listener (Handles explicit login/logout while ignoring tab-switch token refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // IGNORE background focus / token refresh events to prevent tab resets
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession) setSession(currentSession)
        return
      }

      if (currentSession) {
        setSession(currentSession)
        detectRole(currentSession, event)
      } else {
        setSession(null)
        setRole(null)
        setActiveTab(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const detectRole = async (userSession, authEvent) => {
    const email = userSession.user?.email || ''
    let detectedRole = 'member'

    if (email === 'admin@irongym.com' || email.includes('admin')) {
      detectedRole = 'admin'
    } else {
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .or(`auth_id.eq.${userSession.user.id},email.eq.${email}`)
        .maybeSingle()

      if (trainer) detectedRole = 'trainer'
    }

    setRole(detectedRole)

    // ONLY set the default tab on initial load or explicit SIGNED_IN event.
    // Never reset activeTab if the user is already on a tab.
    setActiveTab((prevTab) => {
      if (prevTab && authEvent !== 'SIGNED_IN') return prevTab
      if (detectedRole === 'admin') return 'members'
      if (detectedRole === 'trainer') return 'trainer_dashboard'
      return 'portal'
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole(null)
    setActiveTab(null)
  }

  if (!session && !role) {
    return <Login onLoginSuccess={(s, detectedRole) => {
      setSession(s)
      setRole(detectedRole)
      if (detectedRole === 'admin') setActiveTab('members')
      else if (detectedRole === 'trainer') setActiveTab('trainer_dashboard')
      else setActiveTab('portal')
    }} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab || (role === 'admin' ? 'members' : role === 'trainer' ? 'trainer_dashboard' : 'portal')}
        setActiveTab={setActiveTab}
        role={role}
        onRegisterClick={() => setIsModalOpen(true)}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full relative z-10">
        <Navbar
          title="IRON GYM"
          subtitle={role?.toUpperCase() || 'ACCESS'}
          role={role}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col mb-16 lg:mb-0">
          
          {/* MEMBER ROLE VIEWS */}
          {role === 'member' && (
            <div className="w-full flex-1">
              {(activeTab === 'portal' || !activeTab) && (
                <MemberPortal session={session} onLogout={handleLogout} />
              )}
              {activeTab === 'classes' && (
                <ClassSchedule session={session} userRole={role} />
              )}
              {activeTab === 'shop' && (
                <GymShop session={session} userRole={role} />
              )}
              {activeTab === 'community' && (
                <GymCommunityFeed session={session} userRole={role} />
              )}
              {activeTab === 'nutrition' && (
                <MacroCalculator session={session} />
              )}
              {activeTab === 'lockers' && (
                <LockerManagement session={session} userRole={role} />
              )}
              {activeTab === 'trainers' && (
                <TrainerManagement session={session} userRole={role} />
              )}
              {activeTab === 'maintenance' && (
                <EquipmentMaintenance userRole={role} />
              )}
            </div>
          )}

          {/* ADMIN ROLE VIEWS */}
          {role === 'admin' && (
            <div className="w-full flex-1">
              {(activeTab === 'members' || !activeTab) && (
                <MemberList refreshTrigger={refreshTrigger} />
              )}
              {activeTab === 'scanner' && (
                <QRScanner onScanComplete={() => setRefreshTrigger((prev) => prev + 1)} />
              )}
              {activeTab === 'analytics' && (
                <AdminAnalytics />
              )}
              {activeTab === 'classes' && (
                <ClassSchedule session={session} userRole={role} />
              )}
              {activeTab === 'shop' && (
                <GymShop session={session} userRole={role} />
              )}
              {activeTab === 'community' && (
                <GymCommunityFeed session={session} userRole={role} />
              )}
              {activeTab === 'lockers' && (
                <LockerManagement session={session} userRole={role} />
              )}
              {activeTab === 'maintenance' && (
                <EquipmentMaintenance userRole={role} />
              )}
              {activeTab === 'trainers' && (
                <TrainerManagement session={session} userRole={role} />
              )}

              <AddMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMemberAdded={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          )}

          {/* TRAINER ROLE VIEWS */}
          {role === 'trainer' && (
            <div className="w-full flex-1">
              {(activeTab === 'trainer_dashboard' || !activeTab) && (
                <TrainerDashboard session={session} />
              )}
              {activeTab === 'classes' && (
                <ClassSchedule session={session} userRole={role} />
              )}
              {activeTab === 'community' && (
                <GymCommunityFeed session={session} userRole={role} />
              )}
              {activeTab === 'nutrition' && (
                <MacroCalculator session={session} />
              )}
              {activeTab === 'maintenance' && (
                <EquipmentMaintenance userRole={role} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 flex justify-around items-center py-2 px-1 shadow-2xl">
        {role === 'member' && (
          <>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'portal' || !activeTab ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <User className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'classes' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Calendar className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Classes</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'shop' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Shop</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'community' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Megaphone className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'nutrition' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Calculator className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Macros</span>
            </button>
          </>
        )}

        {role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'members' || !activeTab ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Users className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'scanner' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <QrCode className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Gate</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'analytics' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <BarChart3 className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'classes' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Calendar className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Classes</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition ${
                activeTab === 'shop' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">POS</span>
            </button>
          </>
        )}

        {role === 'trainer' && (
          <>
            <button
              onClick={() => setActiveTab('trainer_dashboard')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'trainer_dashboard' || !activeTab ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Award className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Clients</span>
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'classes' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Calendar className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Schedule</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'community' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Megaphone className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'nutrition' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Calculator className="h-5 w-5 mb-0.5" />
              <span className="text-[9px] uppercase font-mono">Macros</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}