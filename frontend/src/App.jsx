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
  const [activeAdminTab, setActiveAdminTab] = useState('members') // 'members' | 'scanner' | 'analytics'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setRole('member')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session)
        setRole('member')
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
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

      {/* MAIN VIEW AREA OFFSET FOR SIDEBAR */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
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
            <div className="space-y-6">
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
            <MemberPortal session={session} onLogout={handleLogout} />
          )}
        </main>
      </div>
    </div>
  )
}