import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dumbbell, Search, Filter, Play, CheckCircle2, AlertTriangle, 
  Flame, Eye, Layers, ChevronRight, X, Plus, Info, 
  RotateCcw, Target, ShieldCheck, Zap
} from 'lucide-react'
import PillFilter from './PillFilter'
import MuscleHeatmap from './MuscleHeatmap'

export const EXERCISE_DATABASE = [
  // CHEST
  {
    id: 'barbell_bench_press',
    name: 'Barbell Flat Bench Press',
    muscle: 'chest',
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    category: 'Compound',
    tempo: '3-0-1-0 (3s lower, 1s push)',
    videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600',
    description: 'The foundational upper-body compound movement for maximal pectoral hypertrophy and horizontal pressing power.',
    steps: [
      'Lie flat on the bench with eyes directly under the racked barbell. Plant feet firmly into the floor.',
      'Grip the bar slightly wider than shoulder-width with wrists stacked straight over elbows.',
      'Retract scapulae (pinch shoulder blades together) and unrack the bar with locked arms.',
      'Inhale and lower the barbell with control to the mid-chest/sternum level, keeping elbows at a ~45° angle.',
      'Drive the barbell explosively upward through the palms while exhaling, locking out over mid-chest.'
    ],
    dos: [
      'Keep shoulder blades tightly retracted and depressed throughout the entire lift.',
      'Maintain 5 points of contact: head, upper back, glutes, and both feet on the floor.',
      'Tuck elbows at ~45-75 degrees rather than flaring them 90 degrees wide.'
    ],
    donts: [
      'Do not bounce the bar aggressively off your ribcage.',
      'Do not let wrists bend backwards under heavy load.',
      'Avoid lifting hips off the bench during the push phase.'
    ]
  },
  {
    id: 'incline_dumbbell_press',
    name: 'Incline Dumbbell Press',
    muscle: 'chest',
    secondaryMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Intermediate',
    category: 'Hypertrophy',
    tempo: '3-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600',
    description: 'Emphasizes the clavicular head (upper chest) and allows a deeper range of motion than barbell presses.',
    steps: [
      'Set bench to a 30° to 45° incline. Sit with dumbbells resting on your knees.',
      'Kick dumbbells up one by one as you lie back. Plant feet firmly.',
      'Lower weights smoothly until dumbbells reach chest level, feeling a deep stretch in the upper pectorals.',
      'Press dumbbells upward along a slight inward arc without letting weights clack together at the top.'
    ],
    dos: [
      'Keep the bench at 30° for optimal upper chest activation without overloading shoulders.',
      'Rotate palms slightly inward (semi-pronated) for healthier shoulder mechanics.'
    ],
    donts: [
      'Do not set bench too steep (>45° shifts load directly to front deltoids).',
      'Do not drop weights suddenly at bottom of rep.'
    ]
  },
  {
    id: 'cable_chest_flyes',
    name: 'High-to-Low Cable Flyes',
    muscle: 'chest',
    secondaryMuscles: ['Lower Chest', 'Serratus Anterior'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    category: 'Isolation',
    tempo: '2-1-1-1',
    videoUrl: 'https://www.youtube.com/embed/taI4XduLpBe?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    description: 'Constant tension cable movement designed to isolate the lower & sternal chest fibers with maximal peak contraction.',
    steps: [
      'Set cable pulleys at head height. Step forward in a staggered stance with handles in hand.',
      'Maintain a slight bend in elbows throughout the entire movement.',
      'Bring hands downward and together in an arc motion until knuckles almost touch in front of hips.',
      'Squeeze pectorals intensely for 1 second at full peak contraction before slowly controlling the return.'
    ],
    dos: [
      'Lead with elbows and maintain a proud, elevated chest posture.',
      'Focus on mind-muscle connection and sustained peak squeeze.'
    ],
    donts: [
      'Do not turn the fly into a press by excessively bending and extending elbows.',
      'Avoid swinging the torso for momentum.'
    ]
  },

  // BACK
  {
    id: 'conventional_deadlift',
    name: 'Barbell Deadlift',
    muscle: 'back',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Lats', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    category: 'Compound Power',
    tempo: '2-0-1-0',
    videoUrl: 'https://www.youtube.com/embed/op9kVnSso6Q?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'The king of posterior chain exercises. Builds total spinal erector density, grip strength, and explosive hip hinge power.',
    steps: [
      'Stand with feet hip-width apart, barbell cutting across the middle of your shoelaces.',
      'Hinge at hips and grip the bar just outside your shins with double overhand or mixed grip.',
      'Pull slack out of the bar, brace abdominal wall 360°, depress lats into back pockets, and flatten spine.',
      'Drive the floor away with your legs until the bar crosses knees, then thrust hips forward to full lockout.'
    ],
    dos: [
      'Maintain a neutral cervical and lumbar spine from start to finish.',
      'Keep the bar in contact with your shins and thighs throughout the ascent.'
    ],
    donts: [
      'Never round your lower lumbar spine under heavy loads.',
      'Do not hyperextend your back backwards at the top of the lift.'
    ]
  },
  {
    id: 'lat_pulldown',
    name: 'Wide-Grip Lat Pulldown',
    muscle: 'back',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Rhomboids'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    category: 'Hypertrophy',
    tempo: '3-1-1-1',
    videoUrl: 'https://www.youtube.com/embed/CAwf7n6Luuc?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600',
    description: 'Premier vertical pulling movement to sculpt the coveted V-taper aesthetic by targeting the latissimus dorsi.',
    steps: [
      'Adjust thigh pad snug against knees. Grip the wide bar with an overhand grip wider than shoulders.',
      'Sit tall with chest lifted and lean back slightly (10-15°).',
      'Pull the bar down toward upper chest by driving elbows straight down and back.',
      'Squeeze lats hard at bottom, then slowly extend arms back to full stretch overhead.'
    ],
    dos: [
      'Think of pulling through your elbows rather than pulling with your hands.',
      'Allow full shoulder elevation at the top for maximum lat stretch.'
    ],
    donts: [
      'Do not pull the bar behind your neck.',
      'Do not use excessive momentum to swing backward.'
    ]
  },
  {
    id: 'bent_over_barbell_row',
    name: 'Bent-Over Barbell Row (Pendlay Style)',
    muscle: 'back',
    secondaryMuscles: ['Rhomboids', 'Rear Delts', 'Biceps', 'Erectors'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    category: 'Compound',
    tempo: '2-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/FWJR5Ve8gkQ?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    description: 'Heavy horizontal pulling movement to build deep mid-back thickness and postural endurance.',
    steps: [
      'Hinge at hips until torso is roughly parallel to floor with knees softly unlocked.',
      'Grip the bar overhand just outside shoulder width.',
      'Pull the barbell forcefully toward your lower ribs/belly button, driving elbows high.',
      'Hold the peak contraction for 1 second, then lower under control to full arm hang.'
    ],
    dos: [
      'Keep core braced tight to protect the lumbar spine in the hinged position.',
      'Pull elbows toward hips to maximize lat engagement.'
    ],
    donts: [
      'Do not jerk torso upward on each rep to hoist the weight.',
      'Do not let shoulders round forward at bottom.'
    ]
  },

  // SHOULDERS / DELTOIDS
  {
    id: 'overhead_barbell_press',
    name: 'Overhead Barbell Press (OHP)',
    muscle: 'shoulders',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    category: 'Compound Strength',
    tempo: '2-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600',
    description: 'Standing vertical press to build boulder shoulders, scapular stability, and total-body core stiffness.',
    steps: [
      'Rest barbell across front deltoids with hands just outside shoulders, elbows slightly in front of bar.',
      'Squeeze glutes, quads, and abs tight to form an immovable foundation.',
      'Pull head back slightly to clear the bar path and press bar vertically straight overhead.',
      'Once bar clears forehead, bring head forward to lock out bar directly over mid-foot and spine.'
    ],
    dos: [
      'Keep glutes clenched throughout the movement to prevent lower back arching.',
      'Lock out elbows fully at the top with active traps.'
    ],
    donts: [
      'Do not bend knees to turn it into a push press.',
      'Do not flare elbows excessively outward on the descent.'
    ]
  },
  {
    id: 'cable_lateral_raise',
    name: 'Cable Lateral Raise',
    muscle: 'shoulders',
    secondaryMuscles: ['Traps'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    category: 'Isolation',
    tempo: '2-1-1-1',
    videoUrl: 'https://www.youtube.com/embed/PPrzBWZDOhA?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600',
    description: 'Provides constant resistance throughout the arc to maximize side deltoid capped roundness.',
    steps: [
      'Set cable pulley at wrist/hip height. Stand side-on and grab the handle across your body.',
      'Raise arm out to the side in the scapular plane (30° forward) until arm is parallel to floor.',
      'Pause for a beat at peak height, then lower smoothly through the eccentric phase.'
    ],
    dos: [
      'Lead with the elbow, keeping pinky finger slightly higher than thumb.',
      'Keep torso upright without swinging or leaning.'
    ],
    donts: [
      'Do not shrug traps upward to lift the weight.',
      'Avoid swinging weight with hip momentum.'
    ]
  },

  // LEGS - QUADS
  {
    id: 'barbell_back_squat',
    name: 'Barbell Back Squat',
    muscle: 'quads',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Adductors', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    category: 'Compound Foundation',
    tempo: '3-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/ultWZbUMPL8?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600',
    description: 'The supreme lower-body movement for mass, quad development, and functional athleticism.',
    steps: [
      'Set bar on upper traps (high bar) or across rear delts (low bar). Grip bar tight.',
      'Step back, feet shoulder-width apart with toes pointed slightly outward (15-30°).',
      'Take a deep belly breath, brace core, and break at hips and knees simultaneously.',
      'Descend until hip crease is below top of knees (parallel or deeper).',
      'Drive through mid-foot and heels to power back to the standing position.'
    ],
    dos: [
      'Track knees in the same direction as your toes.',
      'Keep chest up and maintain an braced neutral spine.'
    ],
    donts: [
      'Do not allow knees to cave inward (valgus collapse).',
      'Do not shift weight entirely onto toes or lift heels.'
    ]
  },
  {
    id: 'leg_press_45',
    name: '45-Degree Leg Press',
    muscle: 'quads',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: 'Machines',
    difficulty: 'Beginner',
    category: 'Hypertrophy',
    tempo: '3-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/IZxyjW7MPJQ?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600',
    description: 'High-load machine exercise that allows brutal quad isolation without spinal compression.',
    steps: [
      'Sit snug into seat with lower back and hips firmly pressed against the pad.',
      'Place feet shoulder-width apart on platform center.',
      'Release safety pins and lower the sled smoothly until knees form a 90-degree angle.',
      'Press sled upward through full foot, stopping just short of hyperextending knees.'
    ],
    dos: [
      'Keep lower back glued to backrest to protect lumbar spine.',
      'Control the negative tempo to maximize quad recruitment.'
    ],
    donts: [
      'NEVER lock out knees forcefully at top (risk of joint hyperextension).',
      'Do not let hips lift off the bottom seat pad.'
    ]
  },

  // LEGS - HAMSTRINGS & GLUTES
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscle: 'hamstrings',
    secondaryMuscles: ['Glutes', 'Lower Back', 'Forearms'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    category: 'Hypertrophy Hinge',
    tempo: '3-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/JCXUYuzwNrM?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    description: 'The definitive hamstring stretch movement that builds deep hamstring muscle bellies and glute thickness.',
    steps: [
      'Stand holding barbell with overhand grip at hip level, feet hip-width apart.',
      'Keep knees soft (15° bend) and push hips backward as if touching a wall behind you.',
      'Slide barbell down close along thighs and shins until you feel a deep stretch in hamstrings.',
      'Drive hips forward forcefully and squeeze glutes to return to standing.'
    ],
    dos: [
      'Keep the bar skimming your legs the entire rep.',
      'Think of moving hips back and forward rather than bending down and up.'
    ],
    donts: [
      'Do not squat the weight down by excessively bending knees.',
      'Do not allow the spine to round at the bottom of the stretch.'
    ]
  },
  {
    id: 'barbell_hip_thrust',
    name: 'Barbell Hip Thrust',
    muscle: 'glutes',
    secondaryMuscles: ['Hamstrings', 'Adductors', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    category: 'Hypertrophy Isolation',
    tempo: '2-2-1-0',
    videoUrl: 'https://www.youtube.com/embed/SEdqd1n0cvg?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600',
    description: 'The highest EMG glute activation exercise in existence for hypertrophy and hip extension power.',
    steps: [
      'Sit on floor with upper back against a bench and padded barbell placed over hips.',
      'Plant feet flat on floor shoulder-width apart, shins vertical at top of movement.',
      'Drive through heels and extend hips upward until thighs and torso are in a straight line.',
      'Squeeze glutes hard at the top for 2 seconds while tucking chin slightly, then lower under control.'
    ],
    dos: [
      'Keep ribs down and chin tucked to maintain pelvic tilt and prevent lower back strain.',
      'Push strictly through heels.'
    ],
    donts: [
      'Do not hyperextend lower back at the top.',
      'Do not place feet too far forward (shifts focus to hamstrings) or too close (shifts to quads).'
    ]
  },

  // ARMS - BICEPS & TRICEPS
  {
    id: 'incline_dumbbell_bicep_curl',
    name: 'Incline Dumbbell Bicep Curl',
    muscle: 'biceps',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    category: 'Isolation Stretch',
    tempo: '3-0-1-1',
    videoUrl: 'https://www.youtube.com/embed/soxrZlIl35U?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600',
    description: 'Places the long head of the biceps on an extreme stretch for superior bicep peak development.',
    steps: [
      'Set bench to a 45-60° incline. Sit back holding dumbbells with arms hanging straight down.',
      'Keep upper arms pinned perpendicular to floor.',
      'Curl dumbbells upward while supinating wrists (palms facing ceiling).',
      'Squeeze biceps at the top, then lower smoothly to full extension.'
    ],
    dos: [
      'Keep elbows behind your torso to maximize long-head stretch.',
      'Supinate wrists fully at peak contraction.'
    ],
    donts: [
      'Do not swing elbows forward during the curl.',
      'Avoid lifting head and shoulders off the back pad.'
    ]
  },
  {
    id: 'cable_tricep_pushdown',
    name: 'Cable Tricep Rope Pushdown',
    muscle: 'triceps',
    secondaryMuscles: ['Forearms'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    category: 'Isolation',
    tempo: '2-1-1-1',
    videoUrl: 'https://www.youtube.com/embed/vB5OHsJ3EME?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    description: 'Isolates the lateral and medial heads of the triceps with continuous cable resistance.',
    steps: [
      'Attach rope to high cable pulley. Grip rope ends and tuck elbows tightly against ribs.',
      'Lean forward slightly at hips.',
      'Extend arms downward by contracting triceps, flaring rope handles apart at bottom.',
      'Lock out elbows and squeeze for 1 second, then control back to 90 degrees.'
    ],
    dos: [
      'Keep upper arms completely stationary beside ribs.',
      'Spread the rope ends apart at the bottom for maximum contraction.'
    ],
    donts: [
      'Do not let elbows drift forward and back like a row.',
      'Do not use bodyweight momentum to press the cable down.'
    ]
  },

  // CORE / ABS
  {
    id: 'hanging_leg_raise',
    name: 'Hanging Leg / Knee Raise',
    muscle: 'core',
    secondaryMuscles: ['Hip Flexors', 'Forearms', 'Lats'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    category: 'Core Stability',
    tempo: '2-1-1-0',
    videoUrl: 'https://www.youtube.com/embed/Pr1ieGZ5atk?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600',
    description: 'Gold-standard hanging core movement targeting the lower rectus abdominis and deep abdominal wall.',
    steps: [
      'Hang from a pull-up bar with an overhand grip, shoulders engaged.',
      'Without swinging, curl pelvis upward and raise straight legs (or knees) toward chest.',
      'Pause for a split-second when thighs reach parallel or above.',
      'Slowly lower legs back down while maintaining posterior pelvic tilt.'
    ],
    dos: [
      'Focus on tilting pelvis upward toward ribs rather than just lifting legs with hip flexors.',
      'Control the descent to eliminate swing.'
    ],
    donts: [
      'Do not swing or kick legs with momentum.',
      'Avoid arching lower back at the bottom of the hang.'
    ]
  },
  {
    id: 'cable_woodchopper',
    name: 'High-to-Low Cable Woodchopper',
    muscle: 'core',
    secondaryMuscles: ['Obliques', 'Shoulders'],
    equipment: 'Cables',
    difficulty: 'Beginner',
    category: 'Rotational Core',
    tempo: '2-1-1-1',
    videoUrl: 'https://www.youtube.com/embed/pAplQXk3dkU?autoplay=1&mute=1&loop=1',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600',
    description: 'Rotational kinetic movement targeting internal and external obliques for core power and torso definition.',
    steps: [
      'Set pulley to highest position. Stand sideways to machine with feet wider than shoulders.',
      'Grab handle with both hands, arms extended.',
      'Rotate torso diagonally across body down toward opposite knee in a chopping motion.',
      'Pivot back foot and engage obliques throughout the rotation before returning with control.'
    ],
    dos: [
      'Initiate rotation from core and hips, not just arms.',
      'Keep arms long with slight elbow bend.'
    ],
    donts: [
      'Do not round spine aggressively during chop.',
      'Avoid bending arms too much.'
    ]
  }
]

const MUSCLE_GROUPS = [
  { id: 'all', name: 'All Muscles' },
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back & Lats' },
  { id: 'shoulders', name: 'Shoulders / Delts' },
  { id: 'quads', name: 'Quads' },
  { id: 'hamstrings', name: 'Hamstrings' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'core', name: 'Abs & Core' }
]

const EQUIPMENT_LIST = ['All', 'Barbell', 'Dumbbell', 'Cables', 'Machines', 'Bodyweight']
const DIFFICULTY_LIST = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function ExerciseLibrary({ onSelectExerciseForWorkout }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState('all')
  const [selectedEquipment, setSelectedEquipment] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [activeModalExercise, setActiveModalExercise] = useState(null)
  const [bodyView, setBodyView] = useState('front') // 'front' | 'back'
  const [hoveredMuscle, setHoveredMuscle] = useState(null)

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.secondaryMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesMuscle = selectedMuscle === 'all' || ex.muscle === selectedMuscle
      const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment
      const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty

      return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty
    })
  }, [searchQuery, selectedMuscle, selectedEquipment, selectedDifficulty])

  const handleMuscleClick = (muscleId) => {
    setSelectedMuscle(prev => prev === muscleId ? 'all' : muscleId)
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Target className="h-4 w-4" />
            <span>Interactive Muscle Atlas & Movement Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Exercise Library & Form Guide
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Click on any muscle zone on the interactive 3D anatomy diagram or search our verified movement database for step-by-step biomechanical execution cues, tempo guidelines, and injury-prevention protocols.
          </p>
        </div>
      </div>

      {/* TOP SECTION: INTERACTIVE ANATOMY BODY MAP & QUICK FILTERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INTERACTIVE BODY MAP CARD */}
        <div className="lg:col-span-5">
          <MuscleHeatmap
            selectedMuscle={selectedMuscle}
            onSelectMuscle={(m) => setSelectedMuscle(m)}
            title="Biomechanical Target Map"
          />
        </div>

        {/* RIGHT COLUMN: SEARCH, PILL SELECTORS & QUICK STATS */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise name, primary muscle, cues, or mechanics..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* MUSCLE BUTTON PILLS */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-bold">
              Target Muscle Group
            </span>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((m) => (
                <PillFilter
                  key={m.id}
                  active={selectedMuscle === m.id}
                  onClick={() => setSelectedMuscle(m.id)}
                  theme="indigo"
                  size="sm"
                >
                  {m.name}
                </PillFilter>
              ))}
            </div>
          </div>

          {/* SECONDARY FILTER ROWS: EQUIPMENT & DIFFICULTY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-bold flex items-center space-x-1">
                <Dumbbell className="h-3 w-3 text-indigo-400" />
                <span>Equipment Type</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_LIST.map((eq) => (
                  <PillFilter
                    key={eq}
                    active={selectedEquipment === eq}
                    onClick={() => setSelectedEquipment(eq)}
                    theme="cyan"
                    size="sm"
                  >
                    {eq}
                  </PillFilter>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2 font-bold flex items-center space-x-1">
                <Zap className="h-3 w-3 text-indigo-400" />
                <span>Difficulty Tier</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DIFFICULTY_LIST.map((diff) => (
                  <PillFilter
                    key={diff}
                    active={selectedDifficulty === diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    theme="amber"
                    size="sm"
                  >
                    {diff}
                  </PillFilter>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE SEARCH METRICS */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 px-4 py-2.5 rounded-2xl border border-slate-800/60">
            <span>Showing <strong className="text-white">{filteredExercises.length}</strong> matching exercises</span>
            <span className="font-mono text-indigo-400 font-bold">Verified Biomechanics</span>
          </div>

        </div>

      </div>

      {/* EXERCISES GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-xl"
          >
            {/* THUMBNAIL & VIDEO PREVIEW OVERLAY */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-950">
              <img
                src={exercise.thumbnail}
                alt={exercise.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              {/* BADGES */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="bg-indigo-600/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md">
                  {exercise.muscle}
                </span>
                <span className="bg-slate-950/80 text-slate-300 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-slate-800">
                  {exercise.equipment}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  exercise.difficulty === 'Beginner' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : exercise.difficulty === 'Intermediate'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {exercise.difficulty}
                </span>
              </div>

              {/* QUICK PLAY BUTTON */}
              <button
                type="button"
                onClick={() => setActiveModalExercise(exercise)}
                className="absolute bottom-3 right-3 bg-indigo-600/90 hover:bg-indigo-500 text-white p-2.5 rounded-2xl shadow-xl transition backdrop-blur-md group-hover:scale-110 flex items-center space-x-1.5 text-xs font-bold"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Form Demo</span>
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-black uppercase text-white tracking-tight group-hover:text-indigo-400 transition">
                  {exercise.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {exercise.description}
                </p>
              </div>

              {/* SECONDARY MUSCLES & TEMPO */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Secondary Muscles:</span>
                  <span className="text-indigo-300 font-medium truncate max-w-[160px]">
                    {exercise.secondaryMuscles.join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cadence / Tempo:</span>
                  <span className="font-mono text-slate-200 font-semibold">{exercise.tempo}</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalExercise(exercise)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>Form Cues</span>
                </button>
                
                {onSelectExerciseForWorkout && (
                  <button
                    type="button"
                    onClick={() => onSelectExerciseForWorkout(exercise)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center justify-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Set</span>
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Dumbbell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white uppercase">No Exercises Match Criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting your search query or muscle filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedMuscle('all')
              setSelectedEquipment('All')
              setSelectedDifficulty('All')
            }}
            className="mt-4 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* DETAILED FORM & VIDEO MODAL */}
      <AnimatePresence>
        {activeModalExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              {/* MODAL HEADER */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-2xl text-indigo-400">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                      {activeModalExercise.category} // {activeModalExercise.equipment}
                    </span>
                    <h2 className="text-xl font-black uppercase text-white">
                      {activeModalExercise.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalExercise(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
                
                {/* VIDEO EMBED DEMONSTRATION */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video shadow-2xl relative">
                  <iframe
                    src={activeModalExercise.videoUrl}
                    title={activeModalExercise.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* OVERVIEW & METRICS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Primary Target</span>
                    <span className="text-xs font-bold text-white uppercase">{activeModalExercise.muscle}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Equipment</span>
                    <span className="text-xs font-bold text-white uppercase">{activeModalExercise.equipment}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Difficulty</span>
                    <span className="text-xs font-bold text-indigo-400 uppercase">{activeModalExercise.difficulty}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Optimal Tempo</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{activeModalExercise.tempo}</span>
                  </div>
                </div>

                {/* STEP-BY-STEP EXECUTION */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold mb-3 flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Step-by-Step Biomechanical Execution</span>
                  </h3>
                  <ol className="space-y-2.5">
                    {activeModalExercise.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300 leading-relaxed">
                        <span className="bg-indigo-600/20 text-indigo-400 font-mono text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* DO'S & DON'TS CALLOUT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DO'S */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase text-emerald-400 flex items-center space-x-2 mb-3">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Form Technique Master Cues</span>
                    </h4>
                    <ul className="space-y-2">
                      {activeModalExercise.dos.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-emerald-200 flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DON'TS */}
                  <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase text-rose-400 flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Critical Mistakes & Injury Risks</span>
                    </h4>
                    <ul className="space-y-2">
                      {activeModalExercise.donts.map((item, idx) => (
                        <li key={idx} className="text-[11px] text-rose-200 flex items-start space-x-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalExercise(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close Guide
                </button>
                {onSelectExerciseForWorkout && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectExerciseForWorkout(activeModalExercise)
                      setActiveModalExercise(null)
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Live Workout Tracker</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
