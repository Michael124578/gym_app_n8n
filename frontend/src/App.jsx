import React, { useState, useEffect } from 'react'
import AddMemberModal from './components/AddMemberModal'
import MemberList from './components/MemberList'
import QRScanner from './components/QRScanner'
import AdminAnalytics from './components/AdminAnalytics'
import MemberPortal from './pages/MemberPortal'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null) // 'member' or 'admin'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeAdminTab, setActiveAdminTab] = useState('members')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        const isStaff = session.user?.email === 'admin@irongym.com' || session.user?.email?.includes('admin')
        setRole(isStaff ? 'admin' : 'member')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session)
        const isStaff = session.user?.email === 'admin@irongym.com' || session.user?.email?.includes('admin')
        setRole(isStaff ? 'admin' : 'member')
      } else {
        setSession(null)
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLoginSuccess = (userSession, userRole) => {
    setSession(userSession)
    setRole(userRole)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole(null)
  }

  if (!session && !role) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-violet-600/10 rounded-full blur-[140px]" />
      </div>

      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={role === 'admin' ? activeAdminTab : 'portal'}
        setActiveTab={role === 'admin' ? setActiveAdminTab : () => {}}
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
          subtitle={role === 'admin' ? 'SYSTEM TERMINAL' : 'MEMBER ACCESS'}
          role={role}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {/* ADMIN CONTENT SWITCHER */}
          {role === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {activeAdminTab === 'members' && (
                <MemberList refreshTrigger={refreshTrigger} />
              )}

              {activeAdminTab === 'scanner' && (
                <QRScanner onScanComplete={() => setRefreshTrigger((prev) => prev + 1)} />
              )}

              {activeAdminTab === 'analytics' && (
                <AdminAnalytics />
              )}

              <AddMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMemberAdded={() => setRefreshTrigger((prev) => prev + 1)}
              />
            </div>
          )}

          {/* MEMBER PORTAL VIEW */}
          {role === 'member' && (
            <div className="animate-in fade-in duration-300">
              <MemberPortal session={session} onLogout={handleLogout} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}