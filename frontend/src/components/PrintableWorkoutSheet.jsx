import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, Download, Printer, Plus, Trash2, 
  QrCode, Dumbbell, CheckSquare, 
  Layers, User, Calendar, Clock, Award
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { QRCodeSVG } from 'qrcode.react'
import PillButton from './PillButton'

const PRESET_ROUTINES = [
  {
    id: 'push_a',
    title: 'Push Day A — Chest, Shoulders & Triceps',
    focus: 'Hypertrophy & Strength (Heavy Compound Emphasis)',
    duration: '60 Mins',
    exercises: [
      { name: 'Barbell Flat Bench Press', target: 'Pectorals', warmup: '2-3 Sets', sets: 4, targetReps: '6-8 Reps', targetRpe: 'RPE 8.5', cue: 'Retract scaps, 3s eccentric, drive feet into floor.' },
      { name: 'Incline Dumbbell Press (30°)', target: 'Upper Chest', warmup: '1 Set', sets: 3, targetReps: '8-10 Reps', targetRpe: 'RPE 8', cue: 'Tuck elbows 45°, deep stretch at bottom.' },
      { name: 'Standing Barbell Overhead Press', target: 'Front Delts', warmup: '1 Set', sets: 3, targetReps: '6-8 Reps', targetRpe: 'RPE 8', cue: 'Lock glutes and core, press head through window at top.' },
      { name: 'Cable Standing Lateral Raises', target: 'Side Delts', warmup: 'None', sets: 4, targetReps: '12-15 Reps', targetRpe: 'RPE 9', cue: 'Lead with elbows, pause 1s at peak contraction.' },
      { name: 'Overhead Cable Tricep Extension', target: 'Triceps Long Head', warmup: 'None', sets: 3, targetReps: '10-12 Reps', targetRpe: 'RPE 9', cue: 'Keep upper arms fixed, full stretch behind neck.' }
    ]
  },
  {
    id: 'pull_a',
    title: 'Pull Day A — Lats, Upper Back & Biceps',
    focus: 'Back Thickness, Width & Bicep Peak',
    duration: '65 Mins',
    exercises: [
      { name: 'Conventional Barbell Deadlift', target: 'Posterior Chain', warmup: '3 Sets', sets: 3, targetReps: '5 Reps', targetRpe: 'RPE 8.5', cue: 'Pull slack out of bar, push floor away through heels.' },
      { name: 'Neutral Grip Chest-Supported Row', target: 'Upper Back / Rhomboids', warmup: '1 Set', sets: 4, targetReps: '8-10 Reps', targetRpe: 'RPE 8', cue: 'Pull elbows back past torso, squeeze scaps for 1s.' },
      { name: 'Wide-Grip Lat Pulldown', target: 'Latissimus Dorsi', warmup: '1 Set', sets: 3, targetReps: '10-12 Reps', targetRpe: 'RPE 8.5', cue: 'Drive elbows down into back pockets, lean back slightly.' },
      { name: 'Incline Dumbbell Bicep Curls', target: 'Biceps Long Head', warmup: 'None', sets: 3, targetReps: '10-12 Reps', targetRpe: 'RPE 9', cue: 'Full elbow extension at bottom, supinate wrists at top.' },
      { name: 'Face Pulls with External Rotation', target: 'Rear Delts & Rotators', warmup: 'None', sets: 4, targetReps: '15 Reps', targetRpe: 'RPE 9', cue: 'Pull rope toward eyes, rotate thumbs backward.' }
    ]
  },
  {
    id: 'legs_a',
    title: 'Leg Day A — Quads, Hamstrings & Calves',
    focus: 'Lower Body Hypertrophy & Knee Stability',
    duration: '70 Mins',
    exercises: [
      { name: 'Barbell Back Squat (High Bar)', target: 'Quads & Glutes', warmup: '3 Sets', sets: 4, targetReps: '6-8 Reps', targetRpe: 'RPE 8.5', cue: 'Chest tall, knees tracking over toes, hit parallel.' },
      { name: 'Romanian Deadlift (RDL)', target: 'Hamstrings & Glutes', warmup: '2 Sets', sets: 3, targetReps: '8-10 Reps', targetRpe: 'RPE 8', cue: 'Push hips back until hamstrings are at maximum stretch.' },
      { name: 'Angled Leg Press (45°)', target: 'Quad Sweep', warmup: '1 Set', sets: 3, targetReps: '10-12 Reps', targetRpe: 'RPE 8.5', cue: 'Feet low on platform for quad bias, controlled descent.' },
      { name: 'Seated Hamstring Leg Curl', target: 'Hamstring Peak', warmup: 'None', sets: 3, targetReps: '12-15 Reps', targetRpe: 'RPE 9', cue: 'Slow 3-second negative, point toes forward.' },
      { name: 'Standing Calf Raise on Step', target: 'Gastrocnemius', warmup: 'None', sets: 4, targetReps: '12-15 Reps', targetRpe: 'RPE 9', cue: 'Pause 2s at bottom stretch, explode up on big toes.' }
    ]
  }
]

export default function PrintableWorkoutSheet({ session }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_ROUTINES[0])
  const [athleteName, setAthleteName] = useState(session?.user?.email ? 'Michael Kiriakos' : 'Athlete Name')
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [customExercises, setCustomExercises] = useState(PRESET_ROUTINES[0].exercises)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState(null)

  // Retrieve custom gym branding if configured
  const savedBranding = (() => {
    try {
      const b = localStorage.getItem('iron_gym_branding')
      return b ? JSON.parse(b) : null
    } catch (e) {
      return null
    }
  })()

  const gymName = savedBranding?.name || 'IRON GYM'
  const gymBranch = savedBranding?.branch || 'Olympic Training Center'

  const printRef = useRef(null)

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset)
    setCustomExercises(preset.exercises)
  }

  const handleAddExerciseRow = () => {
    setCustomExercises(prev => [
      ...prev,
      { name: 'New Custom Exercise', target: 'Muscle Target', warmup: '1 Set', sets: 3, targetReps: '10-12 Reps', targetRpe: 'RPE 8', cue: 'Focus on full range of motion & mind-muscle connection.' }
    ])
  }

  const handleDeleteExerciseRow = (idx) => {
    setCustomExercises(prev => prev.filter((_, i) => i !== idx))
  }

  const handleDownloadSheet = async () => {
    if (!printRef.current) return
    setIsExporting(true)
    setExportFormat('png')
    try {
      const dataUrl = await toPng(printRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `${selectedPreset.title.split('—')[0].trim().replace(/\s+/g, '_')}_WorkoutCard.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export error', err)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const handleDownloadPDF = async () => {
    if (!printRef.current) return
    setIsExporting(true)
    setExportFormat('pdf')
    try {
      const dataUrl = await toPng(printRef.current, { cacheBust: true, pixelRatio: 2 })
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${selectedPreset.title.split('—')[0].trim().replace(/\s+/g, '_')}_A4_Sheet.pdf`)
    } catch (err) {
      console.error('PDF export error', err)
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FileText className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Physical Training Log Sheets & PDF Routine Cards</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Printable Gym Workout Sheet Exporter
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Export high-contrast, printable physical gym log sheets formatted for clipboards with set checkboxes, target weights, and coaching cues.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <PillButton
              onClick={() => window.print()}
              theme="amber"
              icon={Printer}
              size="sm"
            >
              Print
            </PillButton>

            <PillButton
              onClick={handleDownloadPDF}
              disabled={isExporting}
              theme="teal"
              icon={FileText}
              size="sm"
            >
              {isExporting && exportFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF'}
            </PillButton>

            <PillButton
              onClick={handleDownloadSheet}
              disabled={isExporting}
              theme="purple"
              icon={Download}
              size="sm"
            >
              {isExporting && exportFormat === 'png' ? 'Exporting...' : 'PNG Image'}
            </PillButton>
          </div>
        </div>
      </div>

      {/* PRESETS BAR */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl">
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold px-2">
          Select Routine Preset:
        </span>
        {PRESET_ROUTINES.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedPreset.id === preset.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {preset.title.split('—')[0]}
          </button>
        ))}
      </div>

      {/* CONFIGURATION & ATHLETE DETAILS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800 text-xs">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Athlete / Lifter Name</label>
          <input
            type="text"
            value={athleteName}
            onChange={(e) => setAthleteName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Workout Date</label>
          <input
            type="date"
            value={workoutDate}
            onChange={(e) => setWorkoutDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* PRINTABLE HIGH-CONTRAST LOG SHEET PREVIEW */}
      <div className="flex justify-center">
        <div
          ref={printRef}
          className="w-full max-w-4xl bg-slate-950 border-2 border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-slate-100"
        >
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-6 gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase text-white tracking-tight leading-none">
                    {gymName}
                  </h2>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                    {gymBranch} • Athlete Workout Prescription
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <p><strong className="text-slate-400">Athlete:</strong> <span className="text-white font-bold uppercase">{athleteName}</span></p>
              <p><strong className="text-slate-400">Date:</strong> <span className="text-indigo-400">{workoutDate}</span></p>
              <p><strong className="text-slate-400">Target Time:</strong> <span className="text-slate-300">{selectedPreset.duration}</span></p>
            </div>
          </div>

          {/* ROUTINE TITLE BANNER */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-base font-black uppercase text-white">{selectedPreset.title}</h3>
              <p className="text-xs text-indigo-300 font-mono mt-0.5">{selectedPreset.focus}</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
              {customExercises.length} Total Movements
            </span>
          </div>

          {/* EXERCISE LOG TABLE */}
          <div className="space-y-4">
            {customExercises.map((ex, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center border border-indigo-500/20">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-black uppercase text-white">{ex.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      {ex.target}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-mono">
                    <span className="text-slate-400">Target: <strong className="text-white">{ex.sets} Sets × {ex.targetReps}</strong></span>
                    <span className="text-indigo-400 font-bold">{ex.targetRpe}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteExerciseRow(idx)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition"
                      title="Remove Row"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* SET LOGGING BOXES (GRID OF 4 WORKING SETS) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {Array.from({ length: ex.sets }).map((_, sIdx) => (
                    <div key={sIdx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-bold uppercase text-indigo-300">Set {sIdx + 1}</span>
                        <div className="w-3 h-3 rounded-sm border border-slate-700" />
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px]">
                        <span className="text-slate-500">___ kg</span>
                        <span className="text-slate-500">× ___ reps</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* BIOMECHANICAL CUE */}
                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/40">
                  💡 <strong className="text-indigo-400">Form Cue:</strong> {ex.cue}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddExerciseRow}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-indigo-400 text-xs font-bold uppercase rounded-2xl border border-dashed border-slate-800 transition flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Movement Row</span>
          </button>

          {/* POST-WORKOUT SUMMARY SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t-2 border-slate-800 pt-6 text-xs font-mono">
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Total Session Volume</span>
              <p className="text-sm font-bold text-white">_________ kg / lbs</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Session RPE (1-10)</span>
              <p className="text-sm font-bold text-white">RPE: ____ / 10</p>
            </div>
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase block">Coach / Athlete Signature</span>
              <p className="text-sm font-bold text-slate-500 italic">Signed: ________________</p>
            </div>
          </div>

          {/* QR CODE TOKEN VERIFICATION */}
          <div className="flex items-center justify-between border-t border-slate-900 pt-4 text-[10px] font-mono text-slate-500">
            <div className="flex items-center space-x-2">
              <QRCodeSVG value="https://irongym.com/log" size={30} />
              <span>Iron Gym Physical Training Systems • Session ID: #LOG-{Date.now().toString().slice(-6)}</span>
            </div>
            <span>Keep pushing progressive overload ⚡</span>
          </div>

        </div>
      </div>

    </div>
  )
}
