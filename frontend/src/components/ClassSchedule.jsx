import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Users, Flame, Plus, CheckCircle, XCircle, 
  MapPin, UserCheck, Search, Filter, ChevronRight, X, AlertCircle 
} from 'lucide-react'

// Default classes seed if database table is initially unpopulated
const DEFAULT_CLASSES = [
  {
    id: 'c-1',
    title: 'High-Octane HIIT & Core',
    category: 'HIIT & Conditioning',
    instructor: 'Alex Vance',
    day: 'Monday',
    time: '07:00 AM',
    duration: '45 mins',
    room: 'Studio Alpha',
    capacity: 20,
    bookedCount: 14,
    intensity: 5,
    description: 'High intensity interval training with plyometrics, battle ropes, and abdominal conditioning.',
    attendees: ['Michael Chen', 'Sarah Connor', 'Marcus Brody', 'Elena Rostova']
  },
  {
    id: 'c-2',
    title: 'Iron Powerlifting & Bench Workshop',
    category: 'Strength & Power',
    instructor: 'Dmitri Volkov',
    day: 'Monday',
    time: '05:30 PM',
    duration: '60 mins',
    room: 'Power Pit A',
    capacity: 15,
    bookedCount: 15,
    intensity: 5,
    description: 'Master bar path, leg drive, and arch technique for maximal compound lifting.',
    attendees: ['David Kim', 'Jake Sullivan', 'Maria Garcia']
  },
  {
    id: 'c-3',
    title: 'Cyber Spin & RPM Ride',
    category: 'Cycling / Spin',
    instructor: 'Chloe Bennett',
    day: 'Tuesday',
    time: '08:00 AM',
    duration: '50 mins',
    room: 'Spin Arena',
    capacity: 24,
    bookedCount: 18,
    intensity: 4,
    description: 'Neon rhythm cycling with high cadence sprints and heart-rate zone training.',
    attendees: ['Chloe Price', 'Liam Neeson']
  },
  {
    id: 'c-4',
    title: 'Muay Thai & Heavy Bag Conditioning',
    category: 'Boxing & Combat',
    instructor: 'Marcus Brody',
    day: 'Wednesday',
    time: '06:00 PM',
    duration: '60 mins',
    room: 'Combat Dojo',
    capacity: 16,
    bookedCount: 9,
    intensity: 5,
    description: 'Striking fundamentals, pad work combinations, and explosive rotational conditioning.',
    attendees: ['Sarah Connor', 'Elena Rostova']
  },
  {
    id: 'c-5',
    title: 'Deep Tissue Mobility & Flow Yoga',
    category: 'Yoga & Recovery',
    instructor: 'Elena Rostova',
    day: 'Thursday',
    time: '06:30 PM',
    duration: '50 mins',
    room: 'Zen Studio',
    capacity: 20,
    bookedCount: 11,
    intensity: 2,
    description: 'Decompress tight joints, increase squat hip mobility, and accelerate CNS recovery.',
    attendees: ['David Kim', 'Michael Chen']
  },
  {
    id: 'c-6',
    title: 'Deadlift PR Clinic & Posterior Chain',
    category: 'Strength & Power',
    instructor: 'Dmitri Volkov',
    day: 'Friday',
    time: '05:00 PM',
    duration: '60 mins',
    room: 'Power Pit A',
    capacity: 12,
    bookedCount: 8,
    intensity: 5,
    description: 'Technical breakdown for conventional and sumo deadlifts with velocity feedback.',
    attendees: ['Jake Sullivan']
  },
  {
    id: 'c-7',
    title: 'Weekend Savage Bootcamp',
    category: 'HIIT & Conditioning',
    instructor: 'Alex Vance',
    day: 'Saturday',
    time: '09:00 AM',
    duration: '60 mins',
    room: 'Main Turf Arena',
    capacity: 30,
    bookedCount: 22,
    intensity: 5,
    description: 'Full team-based obstacle workout with sled pushes, tire flips, and kettlebells.',
    attendees: ['Marcus Brody', 'Chloe Price', 'Sarah Connor']
  }
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const CATEGORIES = ['All', 'Strength & Power', 'HIIT & Conditioning', 'Cycling / Spin', 'Boxing & Combat', 'Yoga & Recovery']

export default function ClassSchedule({ session, userRole }) {
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('iron_gym_classes')
    return saved ? JSON.parse(saved) : DEFAULT_CLASSES
  })
  
  const [userBookings, setUserBookings] = useState(() => {
    const saved = localStorage.getItem(`iron_gym_user_bookings_${session?.user?.id || 'guest'}`)
    return saved ? JSON.parse(saved) : ['c-1', 'c-4']
  })

  const [selectedDay, setSelectedDay] = useState('Monday')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMyBookingsOnly, setViewMyBookingsOnly] = useState(false)

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [rosterClass, setRosterClass] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // New Class Form State
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Strength & Power')
  const [newInstructor, setNewInstructor] = useState('Alex Vance')
  const [newDay, setNewDay] = useState('Monday')
  const [newTime, setNewTime] = useState('06:00 PM')
  const [newDuration, setNewDuration] = useState('60 mins')
  const [newRoom, setNewRoom] = useState('Studio Alpha')
  const [newCapacity, setNewCapacity] = useState('20')
  const [newIntensity, setNewIntensity] = useState('4')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    localStorage.setItem('iron_gym_classes', JSON.stringify(classes))
  }, [classes])

  useEffect(() => {
    localStorage.setItem(`iron_gym_user_bookings_${session?.user?.id || 'guest'}`, JSON.stringify(userBookings))
  }, [userBookings, session])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch (e) {}
  }

  const handleToggleBooking = (cls) => {
    const isBooked = userBookings.includes(cls.id)
    const currentMemberName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Member'

    if (isBooked) {
      // Cancel Booking
      setUserBookings(prev => prev.filter(id => id !== cls.id))
      setClasses(prev => prev.map(c => {
        if (c.id === cls.id) {
          return {
            ...c,
            bookedCount: Math.max(0, c.bookedCount - 1),
            attendees: (c.attendees || []).filter(name => name !== currentMemberName)
          }
        }
        return c
      }))
      showToast(`Cancelled reservation for ${cls.title}`)
    } else {
      // Book Spot
      if (cls.bookedCount >= cls.capacity) {
        showToast('Sorry, this class is fully booked!')
        return
      }
      setUserBookings(prev => [...prev, cls.id])
      setClasses(prev => prev.map(c => {
        if (c.id === cls.id) {
          return {
            ...c,
            bookedCount: c.bookedCount + 1,
            attendees: [...(c.attendees || []), currentMemberName]
          }
        }
        return c
      }))
      playChime()
      showToast(`Spot confirmed for ${cls.title}! See you there.`)
    }
  }

  const handleCreateClass = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newCls = {
      id: `c-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      instructor: newInstructor,
      day: newDay,
      time: newTime,
      duration: newDuration,
      room: newRoom,
      capacity: parseInt(newCapacity, 10) || 20,
      bookedCount: 0,
      intensity: parseInt(newIntensity, 10) || 4,
      description: newDesc.trim() || 'High-energy coaching session designed for maximum performance.',
      attendees: []
    }

    setClasses(prev => [newCls, ...prev])
    setIsCreateModalOpen(false)
    playChime()
    showToast(`New class "${newCls.title}" scheduled successfully!`)

    // Reset Form
    setNewTitle('')
    setNewDesc('')
  }

  const handleDeleteClass = (classId) => {
    if (!window.confirm('Are you sure you want to remove this class from the schedule?')) return
    setClasses(prev => prev.filter(c => c.id !== classId))
    setUserBookings(prev => prev.filter(id => id !== classId))
    showToast('Class removed from schedule.')
  }

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesDay = viewMyBookingsOnly || cls.day === selectedDay
      const matchesCategory = selectedCategory === 'All' || cls.category === selectedCategory
      const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cls.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cls.room.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesBookingFilter = !viewMyBookingsOnly || userBookings.includes(cls.id)

      return matchesDay && matchesCategory && matchesSearch && matchesBookingFilter
    })
  }, [classes, selectedDay, selectedCategory, searchQuery, viewMyBookingsOnly, userBookings])

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Calendar className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">GROUP FITNESS & WORKSHOPS</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              LIVE SCHEDULE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reserve your spot in high-intensity classes, strength clinics, and recovery workshops
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMyBookingsOnly(!viewMyBookingsOnly)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 border ${
              viewMyBookingsOnly
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>My Bookings ({userBookings.length})</span>
          </button>

          {(userRole === 'admin' || userRole === 'trainer') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center space-x-2 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Class</span>
            </button>
          )}
        </div>
      </div>

      {/* DAY-OF-WEEK SELECTOR (Hidden when viewing 'My Bookings') */}
      {!viewMyBookingsOnly && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS.map(day => {
            const isSelected = selectedDay === day
            const dayClassCount = classes.filter(c => c.day === day).length
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white border-indigo-500 shadow-lg shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <p className="text-xs font-black uppercase tracking-wider">{day.slice(0, 3)}</p>
                <p className="text-[10px] font-mono mt-0.5 opacity-80">{dayClassCount} Sessions</p>
              </button>
            )
          })}
        </div>
      )}

      {/* SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search class, coach, or room..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* CLASSES GRID */}
      {filteredClasses.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No classes scheduled</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {viewMyBookingsOnly 
              ? "You haven't reserved any upcoming classes yet. Explore the daily schedule above!"
              : "No sessions match your filter criteria for this day."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map(cls => {
            const isBooked = userBookings.includes(cls.id)
            const spotsRemaining = Math.max(0, cls.capacity - cls.bookedCount)
            const isFull = spotsRemaining === 0

            return (
              <motion.div
                key={cls.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-slate-950/80 backdrop-blur-xl border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 relative overflow-hidden ${
                  isBooked ? 'border-indigo-500/50 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950' : 'border-slate-800/80'
                }`}
              >
                {/* TOP BADGES */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl">
                      {cls.category}
                    </span>
                    
                    {/* INTENSITY METER */}
                    <div className="flex items-center space-x-0.5" title={`Intensity: ${cls.intensity}/5`}>
                      {[...Array(5)].map((_, i) => (
                        <Flame 
                          key={i} 
                          className={`h-3.5 w-3.5 ${i < cls.intensity ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white leading-tight mb-2">{cls.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{cls.description}</p>

                  {/* TIME & LOCATION PILLS */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                    <div className="bg-slate-900/80 border border-slate-800/80 p-2 rounded-xl flex items-center space-x-2">
                      <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="text-slate-200 truncate">{cls.time} ({cls.duration})</span>
                    </div>

                    <div className="bg-slate-900/80 border border-slate-800/80 p-2 rounded-xl flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 truncate">{cls.room}</span>
                    </div>
                  </div>

                  {/* INSTRUCTOR INFO */}
                  <div className="flex items-center justify-between text-xs py-2 border-t border-slate-800/60 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-[10px]">
                        {cls.instructor.charAt(0)}
                      </div>
                      <span className="text-slate-300 font-bold">Coach {cls.instructor}</span>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px]">{cls.day}</span>
                  </div>
                </div>

                {/* CAPACITY BAR & ACTION BUTTON */}
                <div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Capacity</span>
                      <span className={isFull ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {cls.bookedCount} / {cls.capacity} Booked {isFull && '(FULL)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull ? 'bg-rose-500' : cls.bookedCount > cls.capacity * 0.75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (cls.bookedCount / cls.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleBooking(cls)}
                      disabled={!isBooked && isFull}
                      className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                        isBooked
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isFull
                          ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25'
                      }`}
                    >
                      {isBooked ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Cancel Spot</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>{isFull ? 'Class Full' : 'Book Spot'}</span>
                        </>
                      )}
                    </button>

                    {(userRole === 'admin' || userRole === 'trainer') && (
                      <button
                        onClick={() => setRosterClass(cls)}
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-2xl transition"
                        title="View Attendee Roster"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* MODAL: CREATE NEW CLASS */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-indigo-400" />
                  <span>SCHEDULE NEW GROUP CLASS</span>
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Class Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spartan Kettlebell Blast"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Coach / Trainer</label>
                    <input
                      type="text"
                      required
                      value={newInstructor}
                      onChange={e => setNewInstructor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Day</label>
                    <select
                      value={newDay}
                      onChange={e => setNewDay(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Start Time</label>
                    <input
                      type="text"
                      placeholder="06:00 PM"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="45 mins"
                      value={newDuration}
                      onChange={e => setNewDuration(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Room / Zone</label>
                    <input
                      type="text"
                      placeholder="Studio Alpha"
                      value={newRoom}
                      onChange={e => setNewRoom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Max Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newCapacity}
                      onChange={e => setNewCapacity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Intensity (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newIntensity}
                      onChange={e => setNewIntensity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Class Description</label>
                  <textarea
                    rows="2"
                    placeholder="Briefly describe the workout focus and equipment used..."
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                  >
                    Publish to Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VIEW ATTENDEE ROSTER */}
      <AnimatePresence>
        {rosterClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white">{rosterClass.title}</h3>
                  <p className="text-xs text-slate-400">{rosterClass.day} • {rosterClass.time} ({rosterClass.room})</p>
                </div>
                <button onClick={() => setRosterClass(null)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>Registered Attendees ({rosterClass.attendees?.length || 0})</span>
                  <span>Max: {rosterClass.capacity}</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(rosterClass.attendees && rosterClass.attendees.length > 0) ? (
                    rosterClass.attendees.map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                            {i + 1}
                          </div>
                          <span className="font-bold text-white">{name}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                          Reserved
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-6 text-slate-500 text-xs font-mono">No members registered yet.</p>
                  )}
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => {
                      handleDeleteClass(rosterClass.id)
                      setRosterClass(null)
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Delete Class
                  </button>
                  <button
                    onClick={() => setRosterClass(null)}
                    className="px-4 py-1.5 bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              )}
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
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
