import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  KeyRound, Lock, Unlock, ShieldCheck, UserCheck, 
  AlertCircle, RefreshCw, X, CheckCircle2, Shield, Info 
} from 'lucide-react'

const INITIAL_LOCKERS = Array.from({ length: 36 }, (_, i) => {
  const num = i + 1
  let status = 'available'
  let occupant = null
  let pin = null

  if ([3, 7, 12, 18, 22, 29, 34].includes(num)) {
    status = 'occupied'
    occupant = `Member #${100 + num}`
  } else if (num === 15) {
    status = 'maintenance'
  }

  return {
    id: `locker-${num}`,
    number: num,
    status,
    occupant,
    pin,
    room: num <= 18 ? 'Mens Main Room' : 'Womens / VIP Suite'
  }
})

export default function LockerManagement({ session, userRole }) {
  const [lockers, setLockers] = useState(() => {
    const saved = localStorage.getItem('iron_gym_lockers')
    return saved ? JSON.parse(saved) : INITIAL_LOCKERS
  })

  const [selectedRoom, setSelectedRoom] = useState('All')
  const [activeUserLocker, setActiveUserLocker] = useState(() => {
    const saved = localStorage.getItem(`iron_gym_active_locker_${session?.user?.id || 'guest'}`)
    return saved ? JSON.parse(saved) : null
  })

  const [selectedLockerToClaim, setSelectedLockerToClaim] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const currentUserName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Valued Member'

  useEffect(() => {
    localStorage.setItem('iron_gym_lockers', JSON.stringify(lockers))
  }, [lockers])

  useEffect(() => {
    if (activeUserLocker) {
      localStorage.setItem(`iron_gym_active_locker_${session?.user?.id || 'guest'}`, JSON.stringify(activeUserLocker))
    } else {
      localStorage.removeItem(`iron_gym_active_locker_${session?.user?.id || 'guest'}`)
    }
  }, [activeUserLocker, session])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleClaimLocker = (locker) => {
    if (activeUserLocker) {
      showToast('You already have an active locker assigned!')
      return
    }

    if (locker.status !== 'available') {
      showToast('This locker is currently unavailable.')
      return
    }

    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString()
    const userLockerData = {
      lockerId: locker.id,
      number: locker.number,
      pin: generatedPin,
      claimedAt: new Date().toLocaleTimeString(),
      room: locker.room
    }

    setLockers(prev => prev.map(l => {
      if (l.id === locker.id) {
        return {
          ...l,
          status: 'occupied',
          occupant: currentUserName,
          pin: generatedPin
        }
      }
      return l
    }))

    setActiveUserLocker(userLockerData)
    setSelectedLockerToClaim(null)
    showToast(`Locker #${locker.number} claimed! Your digital PIN is ${generatedPin}`)
  }

  const [confirmModalConfig, setConfirmModalConfig] = useState(null)

  const handleReleaseLocker = () => {
    if (!activeUserLocker) return
    setConfirmModalConfig({
      title: 'Confirm Locker Release',
      message: 'Are you sure you want to release your locker? Please ensure your belongings have been retrieved.',
      onConfirm: () => {
        setLockers(prev => prev.map(l => {
          if (l.id === activeUserLocker.lockerId) {
            return { ...l, status: 'available', occupant: null, pin: null }
          }
          return l
        }))
        setActiveUserLocker(null)
        showToast('Locker released and reset to available.')
        setConfirmModalConfig(null)
      }
    })
  }

  const handleAdminResetLocker = (lockerId, occupantName, lockerNumber) => {
    setConfirmModalConfig({
      title: `Force Clear Locker #${lockerNumber}`,
      message: `Are you sure you want to force clear Locker #${lockerNumber} (Occupant: ${occupantName || 'Unknown'})?`,
      onConfirm: () => {
        setLockers(prev => prev.map(l => {
          if (l.id === lockerId) {
            return { ...l, status: 'available', occupant: null, pin: null }
          }
          return l
        }))
        showToast(`Locker #${lockerNumber} force-reset to available.`)
        setConfirmModalConfig(null)
      }
    })
  }

  const filteredLockers = useMemo(() => {
    return lockers.filter(l => {
      if (selectedRoom === 'All') return true
      return l.room.toLowerCase().includes(selectedRoom.toLowerCase())
    })
  }, [lockers, selectedRoom])

  const stats = useMemo(() => {
    const available = lockers.filter(l => l.status === 'available').length
    const occupied = lockers.filter(l => l.status === 'occupied').length
    const maintenance = lockers.filter(l => l.status === 'maintenance').length
    return { available, occupied, maintenance, total: lockers.length }
  }, [lockers])

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <KeyRound className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">DIGITAL LOCKERS & AMENITIES</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              SMART ACCESS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Claim an active day locker, generate temporary digital PIN codes, and manage facility amenities
          </p>
        </div>

        {/* STATUS COUNTER */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold">
            {stats.available} Available
          </span>
          <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold">
            {stats.occupied} In Use
          </span>
        </div>
      </div>

      {/* ACTIVE USER LOCKER CARD (IF ASSIGNED) */}
      {activeUserLocker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-950/40 via-slate-950 to-indigo-950/40 border border-indigo-500/50 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30">
              <Unlock className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">YOUR ACTIVE LOCKER: #{activeUserLocker.number}</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-full font-bold">
                  ACTIVE TODAY
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Location: {activeUserLocker.room} • Claimed at {activeUserLocker.claimedAt}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-slate-400 font-bold">Digital Keypad PIN:</span>
                <span className="px-3 py-1 bg-slate-900 border border-indigo-500/40 text-indigo-300 font-mono font-black text-sm rounded-xl tracking-widest">
                  {activeUserLocker.pin}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleReleaseLocker}
            className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-2xl transition flex items-center space-x-2"
          >
            <Lock className="h-4 w-4" />
            <span>Release Locker</span>
          </button>
        </motion.div>
      )}

      {/* ROOM FILTER PILLS */}
      <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800/80 p-2 rounded-2xl">
        {['All', 'Mens', 'Womens'].map(room => (
          <button
            key={room}
            onClick={() => setSelectedRoom(room)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedRoom === room
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {room === 'All' ? 'All Lockers' : `${room}'s Locker Room`}
          </button>
        ))}
      </div>

      {/* LOCKERS GRID MATRIX */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {filteredLockers.map(l => {
            const isUserLocker = activeUserLocker?.lockerId === l.id
            const isAvailable = l.status === 'available'
            const isOccupied = l.status === 'occupied'
            const isMaint = l.status === 'maintenance'

            return (
              <motion.div
                key={l.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isAvailable && !activeUserLocker) setSelectedLockerToClaim(l)
                  else if (userRole === 'admin' && isOccupied) {
                    handleAdminResetLocker(l.id, l.occupant, l.number)
                  }
                }}
                className={`p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none min-h-[95px] ${
                  isUserLocker
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    : isAvailable
                    ? 'bg-slate-900/60 hover:bg-emerald-500/10 border-slate-800 hover:border-emerald-500/40 text-slate-300'
                    : isOccupied
                    ? 'bg-slate-950/90 border-slate-800/60 text-slate-600 cursor-default'
                    : 'bg-rose-950/20 border-rose-900/30 text-rose-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-black text-sm">{l.number}</span>
                  {isUserLocker ? (
                    <Unlock className="h-3.5 w-3.5 text-indigo-400" />
                  ) : isAvailable ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </div>

                <div className="text-[10px] font-mono mt-2">
                  {isUserLocker ? (
                    <span className="text-indigo-300 font-bold">MINE</span>
                  ) : isAvailable ? (
                    <span className="text-emerald-400 font-bold">OPEN</span>
                  ) : isOccupied ? (
                    <span className="text-slate-500">IN USE</span>
                  ) : (
                    <span className="text-rose-400">OUT</span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CLAIM CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedLockerToClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-center"
            >
              <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <KeyRound className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">RESERVE LOCKER #{selectedLockerToClaim.number}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Location: {selectedLockerToClaim.room}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  A secure 4-digit digital PIN will be generated and saved to your member profile for today's workout.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setSelectedLockerToClaim(null)}
                  className="py-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClaimLocker(selectedLockerToClaim)}
                  className="py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Confirm & Lock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* CONFIRMATION DIALOG MODAL */}
      {confirmModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <h3 className="text-lg font-black text-white uppercase">{confirmModalConfig.title}</h3>
            <p className="text-xs text-slate-400">{confirmModalConfig.message}</p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalConfig(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModalConfig.onConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
