import React, { useState, useEffect } from 'react'
import AddMemberModal from './components/AddMemberModal'
import MemberList from './components/MemberList'
import QRScanner from './components/QRScanner'
import AdminAnalytics from './components/AdminAnalytics'
import EquipmentMaintenance from './components/EquipmentMaintenance'
import TrainerManagement from './components/TrainerManagement'
import TrainerDashboard from './pages/TrainerDashboard' // Corrected path to pages/
import MemberPortal from './pages/MemberPortal'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabaseClient'

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
    
    // 1. Admin Email Check
    if (email === 'admin@irongym.com' || email.includes('admin')) {
      setRole('admin')
      setActiveTab('members')
      return
    }

    // 2. Trainer Database Check
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

    // 3. Fallback Member
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* SIDEBAR NAVIGATION */}
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
    </div>
  )
}