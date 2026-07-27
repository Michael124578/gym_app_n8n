import React, { useState } from 'react'
import AddMemberModal from './components/AddMemberModal'
import MemberList from './components/MemberList'
import QRScanner from './components/QRScanner'
import MemberPortal from './pages/MemberPortal'
import { ShieldCheck, Lock, QrCode, Users, PlusCircle } from 'lucide-react'

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [viewMode, setViewMode] = useState('member')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [activeAdminTab, setActiveAdminTab] = useState('members')

  const ADMIN_PIN = '1234'

  const handleAdminAuth = (e) => {
    e.preventDefault()
    if (pinInput === ADMIN_PIN) {
      setIsAdminAuthenticated(true)
      setViewMode('admin')
      setPinError('')
      setPinInput('')
    } else {
      setPinError('Invalid Admin PIN')
    }
  }

  const handleSwitchMode = (mode) => {
    if (mode === 'admin' && !isAdminAuthenticated) {
      setViewMode('admin-lock')
    } else {
      setViewMode(mode)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">IRON GYM</h1>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('member')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === 'member' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Member App
            </button>
            <button
              onClick={() => handleSwitchMode('admin')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode.startsWith('admin') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              Admin Portal
            </button>
          </div>
        </div>

        {viewMode === 'admin-lock' && (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-full max-w-sm bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-xl text-center">
              <ShieldCheck className="h-10 w-10 text-indigo-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white">Staff Authentication</h2>
              <p className="text-xs text-slate-400 mt-1 mb-4">Enter PIN code to access Admin Portal</p>

              {pinError && (
                <div className="mb-4 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                  {pinError}
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-4">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="PIN (1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-center text-xl tracking-widest rounded-lg py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg transition"
                >
                  Authenticate
                </button>
              </form>
            </div>
          </div>
        )}

        {viewMode === 'admin' && isAdminAuthenticated && (
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

        {viewMode === 'member' && <MemberPortal />}
      </div>
    </div>
  )
}