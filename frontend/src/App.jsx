import React, { useState, useEffect } from 'react'
import AddMemberModal from './components/AddMemberModal'
import MemberList from './components/MemberList'
import QRScanner from './components/QRScanner'
import MemberPortal from './pages/MemberPortal'
import Login from './pages/Login'
import { supabase } from './lib/supabaseClient'
import { ShieldCheck, Lock, QrCode, PlusCircle, LogOut } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null) // 'member' or 'admin'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeAdminTab, setActiveAdminTab] = useState('members')

  useEffect(() => {
    // Listen for Supabase auth state changes
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

  // If not logged in, show the sleek Login page
  if (!session && !role) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">IRON GYM</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ADMIN VIEW */}
        {role === 'admin' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveAdminTab('members')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeAdminTab === 'members' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Roster
                </button>
                <button
                  onClick={() => setActiveAdminTab('scanner')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeAdminTab === 'scanner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  QR Terminal
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Register Member</span>
              </button>
            </div>

            <main>
              {activeAdminTab === 'members' && (
                <MemberList refreshTrigger={refreshTrigger} />
              )}
              {activeAdminTab === 'scanner' && (
                <QRScanner onScanComplete={() => setRefreshTrigger((prev) => prev + 1)} />
              )}
            </main>

            <AddMemberModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onMemberAdded={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </div>
        )}

        {/* MEMBER VIEW */}
        {role === 'member' && (
          <MemberPortal session={session} onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}