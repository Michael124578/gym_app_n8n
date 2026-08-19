import React, { useState, useEffect, useCallback } from 'react'
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
import ExerciseLibrary from './components/ExerciseLibrary'
import LiveWorkoutTracker from './components/LiveWorkoutTracker'
import BodyProgressVault from './components/BodyProgressVault'
import GymOccupancyHeatmap from './components/GymOccupancyHeatmap'
import WellnessHabitTracker from './components/WellnessHabitTracker'
import WorkoutMusicHub from './components/WorkoutMusicHub'
import AiRoutineGenerator from './components/AiRoutineGenerator'
import MobilityRecoveryGuide from './components/MobilityRecoveryGuide'
import BarbellWarmupCalculator from './components/BarbellWarmupCalculator'
import CoachingChat from './components/CoachingChat'
import POSInvoiceGenerator from './components/POSInvoiceGenerator'
import MuscleRecoveryInsights from './components/MuscleRecoveryInsights'
import PrintableWorkoutSheet from './components/PrintableWorkoutSheet'
import TrainerDashboard from './pages/TrainerDashboard'
import MemberPortal from './pages/MemberPortal'
import Login from './pages/Login'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabaseClient'
import { Dumbbell } from 'lucide-react'

export default function App() {
  // Synchronous restoration from localStorage prevents tab-switch reload flicker
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('iron_gym_cached_session')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  })

  const [role, setRole] = useState(() => {
    return localStorage.getItem('iron_gym_cached_role') || null
  })

  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('iron_gym_active_tab') || null
  })

  const [isAuthLoading, setIsAuthLoading] = useState(() => !session)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedExerciseForWorkout, setSelectedExerciseForWorkout] = useState(null)

  const handleSetActiveTab = useCallback((tab) => {
    if (!tab) return
    setActiveTabState(tab)
    localStorage.setItem('iron_gym_active_tab', tab)
  }, [])

  const detectRole = useCallback(async (userSession, authEvent = 'CHECK') => {
    if (!userSession?.user) return

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
    localStorage.setItem('iron_gym_cached_role', detectedRole)

    // Preserve the active tab if valid, otherwise set default for role
    setActiveTabState((prevTab) => {
      const savedTab = localStorage.getItem('iron_gym_active_tab')
      if (savedTab) return savedTab
      if (prevTab && authEvent !== 'SIGNED_IN') return prevTab
      
      let defaultTab = 'portal'
      if (detectedRole === 'admin') defaultTab = 'members'
      else if (detectedRole === 'trainer') defaultTab = 'trainer_dashboard'

      localStorage.setItem('iron_gym_active_tab', defaultTab)
      return defaultTab
    })
  }, [])

  useEffect(() => {
    let mounted = true

    // 1. Initial Session Check (Runs ONCE on app load)
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return
      if (currentSession) {
        setSession(currentSession)
        localStorage.setItem('iron_gym_cached_session', JSON.stringify(currentSession))
        detectRole(currentSession, 'INITIAL_LOAD')
      } else {
        setSession(null)
        setRole(null)
        localStorage.removeItem('iron_gym_cached_session')
        localStorage.removeItem('iron_gym_cached_role')
        localStorage.removeItem('iron_gym_active_tab')
      }
      setIsAuthLoading(false)
    })

    // 2. Auth Event Listener (Handles explicit login/logout while ignoring tab-switch token refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return

      // IGNORE background focus / token refresh events to prevent tab resets
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession) {
          setSession(currentSession)
          localStorage.setItem('iron_gym_cached_session', JSON.stringify(currentSession))
        }
        return
      }

      if (event === 'SIGNED_OUT' || !currentSession) {
        setSession(null)
        setRole(null)
        setActiveTabState(null)
        localStorage.removeItem('iron_gym_cached_session')
        localStorage.removeItem('iron_gym_cached_role')
        localStorage.removeItem('iron_gym_active_tab')
        setIsAuthLoading(false)
        return
      }

      if (currentSession) {
        setSession(currentSession)
        localStorage.setItem('iron_gym_cached_session', JSON.stringify(currentSession))
        detectRole(currentSession, event)
        setIsAuthLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [detectRole])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setRole(null)
    setActiveTabState(null)
    localStorage.removeItem('iron_gym_cached_session')
    localStorage.removeItem('iron_gym_cached_role')
    localStorage.removeItem('iron_gym_active_tab')
  }

  // Initial Auth Loading Screen (Prevents flickering Login screen on page load or tab return)
  if (isAuthLoading && !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-3xl animate-pulse">
          <Dumbbell className="h-8 w-8 text-indigo-400 animate-spin" />
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
          Syncing Iron Terminal...
        </p>
      </div>
    )
  }

  // Unauthenticated -> Landing / Login Page
  if (!session) {
    return (
      <Login 
        onLoginSuccess={(s, detectedRole) => {
          setSession(s)
          setRole(detectedRole)
          localStorage.setItem('iron_gym_cached_session', JSON.stringify(s))
          localStorage.setItem('iron_gym_cached_role', detectedRole)

          let initialTab = 'portal'
          if (detectedRole === 'admin') initialTab = 'members'
          else if (detectedRole === 'trainer') initialTab = 'trainer_dashboard'

          handleSetActiveTab(initialTab)
        }} 
      />
    )
  }

  const currentActiveTab = activeTab || (role === 'admin' ? 'members' : role === 'trainer' ? 'trainer_dashboard' : 'portal')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={currentActiveTab}
        setActiveTab={handleSetActiveTab}
        role={role}
        onRegisterClick={() => setIsModalOpen(true)}
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
              {(currentActiveTab === 'portal' || !currentActiveTab) && (
                <MemberPortal 
                  session={session} 
                  onNavigateTab={(tab) => handleSetActiveTab(tab)}
                />
              )}
              {currentActiveTab === 'workout_tracker' && (
                <LiveWorkoutTracker 
                  session={session} 
                  initialExercise={selectedExerciseForWorkout} 
                />
              )}
              {currentActiveTab === 'recovery_insights' && (
                <MuscleRecoveryInsights session={session} />
              )}
              {currentActiveTab === 'printable_sheets' && (
                <PrintableWorkoutSheet session={session} />
              )}
              {currentActiveTab === 'warmup_calc' && (
                <BarbellWarmupCalculator 
                  onSendToTracker={() => handleSetActiveTab('workout_tracker')} 
                />
              )}
              {currentActiveTab === 'mobility' && (
                <MobilityRecoveryGuide />
              )}
              {currentActiveTab === 'exercises' && (
                <ExerciseLibrary 
                  onSelectExerciseForWorkout={(ex) => {
                    setSelectedExerciseForWorkout(ex)
                    handleSetActiveTab('workout_tracker')
                  }} 
                />
              )}
              {currentActiveTab === 'ai_generator' && (
                <AiRoutineGenerator 
                  onLaunchRoutineInTracker={() => handleSetActiveTab('workout_tracker')} 
                />
              )}
              {currentActiveTab === 'body_vault' && (
                <BodyProgressVault session={session} />
              )}
              {currentActiveTab === 'wellness' && (
                <WellnessHabitTracker session={session} />
              )}
              {currentActiveTab === 'coaching_chat' && (
                <CoachingChat session={session} userRole={role} />
              )}
              {currentActiveTab === 'invoices' && (
                <POSInvoiceGenerator session={session} />
              )}
              {currentActiveTab === 'occupancy' && (
                <GymOccupancyHeatmap userRole={role} />
              )}
              {currentActiveTab === 'music' && (
                <WorkoutMusicHub />
              )}
              {currentActiveTab === 'nutrition' && (
                <MacroCalculator session={session} />
              )}
              {currentActiveTab === 'classes' && (
                <ClassSchedule session={session} userRole={role} />
              )}
              {currentActiveTab === 'shop' && (
                <GymShop session={session} userRole={role} />
              )}
              {currentActiveTab === 'lockers' && (
                <LockerManagement session={session} userRole={role} />
              )}
              {currentActiveTab === 'community' && (
                <GymCommunityFeed session={session} userRole={role} />
              )}
              {currentActiveTab === 'trainers' && (
                <TrainerManagement session={session} userRole={role} />
              )}
            </div>
          )}

          {/* TRAINER ROLE VIEWS */}
          {role === 'trainer' && (
            <div className="w-full flex-1">
              {(currentActiveTab === 'trainer_dashboard' || !currentActiveTab) && (
                <TrainerDashboard session={session} />
              )}
              {currentActiveTab === 'coaching_chat' && (
                <CoachingChat session={session} userRole={role} />
              )}
              {currentActiveTab === 'printable_sheets' && (
                <PrintableWorkoutSheet session={session} />
              )}
              {currentActiveTab === 'recovery_insights' && (
                <MuscleRecoveryInsights session={session} />
              )}
              {currentActiveTab === 'ai_generator' && (
                <AiRoutineGenerator 
                  onLaunchRoutineInTracker={() => handleSetActiveTab('workout_tracker')} 
                />
              )}
              {currentActiveTab === 'exercises' && (
                <ExerciseLibrary 
                  onSelectExerciseForWorkout={(ex) => {
                    setSelectedExerciseForWorkout(ex)
                    handleSetActiveTab('workout_tracker')
                  }} 
                />
              )}
              {currentActiveTab === 'workout_tracker' && (
                <LiveWorkoutTracker 
                  session={session} 
                  initialExercise={selectedExerciseForWorkout} 
                />
              )}
              {currentActiveTab === 'warmup_calc' && (
                <BarbellWarmupCalculator 
                  onSendToTracker={() => handleSetActiveTab('workout_tracker')} 
                />
              )}
              {currentActiveTab === 'mobility' && (
                <MobilityRecoveryGuide />
              )}
              {currentActiveTab === 'nutrition' && (
                <MacroCalculator session={session} />
              )}
              {currentActiveTab === 'classes' && (
                <ClassSchedule session={session} userRole={role} />
              )}
              {currentActiveTab === 'community' && (
                <GymCommunityFeed session={session} userRole={role} />
              )}
              {currentActiveTab === 'maintenance' && (
                <EquipmentMaintenance userRole={role} />
              )}
            </div>
          )}

          {/* ADMIN ROLE VIEWS */}
          {role === 'admin' && (
            <div className="w-full flex-1">
              {(currentActiveTab === 'members' || !currentActiveTab) && (
                <MemberList 
                  refreshTrigger={refreshTrigger} 
                  onOpenAddMemberModal={() => setIsModalOpen(true)}
                />
              )}
              {currentActiveTab === 'scanner' && (
                <QRScanner onScanComplete={() => setRefreshTrigger((prev) => prev + 1)} />
              )}
              {currentActiveTab === 'analytics' && (
                <AdminAnalytics />
              )}
              {currentActiveTab === 'invoices' && (
                <POSInvoiceGenerator session={session} />
              )}
              {currentActiveTab === 'occupancy' && (
                <GymOccupancyHeatmap userRole={role} />
              )}
              {currentActiveTab === 'classes' && (
                <ClassSchedule session={session} userRole={role} />
              )}
              {currentActiveTab === 'shop' && (
                <GymShop session={session} userRole={role} />
              )}
              {currentActiveTab === 'lockers' && (
                <LockerManagement session={session} userRole={role} />
              )}
              {currentActiveTab === 'maintenance' && (
                <EquipmentMaintenance userRole={role} />
              )}
              {currentActiveTab === 'trainers' && (
                <TrainerManagement session={session} userRole={role} />
              )}
              {currentActiveTab === 'coaching_chat' && (
                <CoachingChat session={session} userRole={role} />
              )}
              {currentActiveTab === 'community' && (
                <GymCommunityFeed session={session} userRole={role} />
              )}
              {currentActiveTab === 'exercises' && (
                <ExerciseLibrary />
              )}
            </div>
          )}

        </main>
      </div>

      {/* REGISTER MEMBER MODAL (FOR ADMINS) */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemberAdded={() => {
          setRefreshTrigger((prev) => prev + 1)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}