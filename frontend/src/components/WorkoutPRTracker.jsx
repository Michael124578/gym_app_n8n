import React from 'react'
import { Dumbbell, Plus, Trash2, Trophy, Flame } from 'lucide-react'
import { formatReadableDate } from '../utils/dateUtils'

export default function WorkoutPRTracker({
  splitType,
  setSplitType,
  exerciseName,
  setExerciseName,
  weightKg,
  setWeightKg,
  onLogWorkout,
  onDeleteWorkout,
  workouts
}) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Personal Record (PR) Vault</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track your all-time heaviest sets and barbell milestones.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          {workouts.length} Lifts Logged
        </span>
      </div>

      <form onSubmit={onLogWorkout} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <select
          value={splitType}
          onChange={(e) => setSplitType(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="Push">Push Split</option>
          <option value="Pull">Pull Split</option>
          <option value="Legs">Legs Split</option>
          <option value="Cardio">Cardio & Conditioning</option>
          <option value="Full Body">Full Body</option>
        </select>

        <input
          type="text"
          required
          placeholder="Exercise (e.g. Barbell Deadlift)"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
        />

        <input
          type="number"
          required
          step="0.5"
          placeholder="Top Weight (kg)"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Log Record</span>
        </button>
      </form>

      {workouts.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl font-mono text-slate-500 text-xs space-y-1">
          <Dumbbell className="h-6 w-6 text-slate-600 mx-auto" />
          <p className="font-bold text-slate-400">No personal best sets logged yet.</p>
          <p>Record your peak lifts above to start building your strength history.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-3.5">Training Split</th>
                <th className="p-3.5">Exercise Movement</th>
                <th className="p-3.5">Top Lift Weight</th>
                <th className="p-3.5">Date Logged</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {workouts.map((w) => (
                <tr key={w.id} className="hover:bg-slate-950/60 transition group">
                  <td className="p-3.5">
                    <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase font-mono">
                      {w.split_type}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white uppercase">{w.exercise_name}</td>
                  <td className="p-3.5 font-mono text-amber-400 font-bold text-sm">{w.weight_kg} kg</td>
                  <td className="p-3.5 font-mono text-slate-500 text-xs">{formatReadableDate(w.logged_at)}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Delete PR Record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}