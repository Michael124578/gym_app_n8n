import React, { useState, useEffect } from 'react'
import AddMemberModal from './components/AddMemberModal'
import MemberList from './components/MemberList'
import QRScanner from './components/QRScanner'
import AdminAnalytics from './components/AdminAnalytics'
import EquipmentMaintenance from './components/EquipmentMaintenance'
import TrainerManagement from './components/TrainerManagement'
import TrainerDashboard from './pages/TrainerDashboard'
import MemberPortal from './pages/MemberPortal'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabaseClient'
import { QrCode, Dumbbell, Wrench, Users, Award, Shield } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null) // 'member', 'admin', or 'trainer'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState('members')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        detectRole(session)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session)
        detectRole(session)
      } else {
        setSession(null)
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const detectRole = async (userSession) => {
    const email = userSession.user?.email || ''
    
    if (email === 'admin@irongym.com' || email.includes('admin')) {
      setRole('admin')
      setActiveTab('members')
      return
    }

    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .or(`auth_id.eq.${userSession.user.id},email.eq.${email}`)
      .maybeSingle()

    if (trainer) {
      setRole('trainer')
      setActiveTab('trainer_dashboard')
      return
    }

    setRole('member')
    setActiveTab('portal')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole(null)
  }

  if (!session && !role) {
    return <Login onLoginSuccess={(s) => setSession(s)} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex relative overflow-x-hidden pb-16 lg:pb-0 selection:bg-indigo-500 selection:text-white">
      {/* SIDEBAR NAVIGATION (DESKTOP / DRAWER) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        onRegisterClick={() => setIsModalOpen(true)}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* MAIN VIEW AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 z-10">
        <Navbar
          title="IRON GYM"
          subtitle={role?.toUpperCase() || 'ACCESS'}
          role={role}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {/* TRAINER VIEW */}
          {role === 'trainer' && (
            <div className="space-y-6">
              {activeTab === 'trainer_dashboard' && <TrainerDashboard session={session} />}
              {activeTab === 'maintenance' && <EquipmentMaintenance userRole={role} />}
            </div>
          )}

          {/* ADMIN VIEW */}
          {role === 'admin' && (
            <div className="space-y-6">
              {activeTab === 'members' && <MemberList refreshTrigger={refreshTrigger} />}
              {activeTab === 'scanner' && <QRScanner onScanComplete={() => setRefreshTrigger((prev) => prev + 1)} />}
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'maintenance' && <EquipmentMaintenance userRole={role} />}
              {activeTab === 'trainers' && <TrainerManagement session={session} />}

              <AddMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMemberAdded={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          )}

          {/* MEMBER PORTAL VIEW */}
          {role === 'member' && (
            <div className="space-y-6">
              {activeTab === 'portal' && <MemberPortal session={session} onLogout={handleLogout} />}
              {activeTab === 'trainers' && <TrainerManagement session={session} />}
              {activeTab === 'maintenance' && <EquipmentMaintenance userRole={role} />}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (PWA STYLE) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center py-2 px-1 shadow-2xl">
        {role === 'member' && (
          <>
            <button
              onClick={() => setActiveTab('portal')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'portal' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <QrCode className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('trainers')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'trainers' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Dumbbell className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Coaches</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'maintenance' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Wrench className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Repairs</span>
            </button>
          </>
        )}

        {role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'scanner' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <QrCode className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Gate</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'members' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Users className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Roster</span>
            </button>

            <button
              onClick={() => setActiveTab('trainers')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'trainers' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Award className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Coaches</span>
            </button>
          </>
        )}

        {role === 'trainer' && (
          <>
            <button
              onClick={() => setActiveTab('trainer_dashboard')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'trainer_dashboard' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Award className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Coach</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                activeTab === 'maintenance' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
              }`}
            >
              <Wrench className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] uppercase font-mono">Repairs</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}