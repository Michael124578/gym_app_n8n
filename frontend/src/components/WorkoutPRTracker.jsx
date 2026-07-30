import React from 'react'
import { Dumbbell, Plus, Trash2 } from 'lucide-react'
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
    <div className="glass-panel p-6 rounded-3xl space-y-6 w-full">
      <div className="flex items-center space-x-2">
        <Dumbbell className="h-5 w-5 text-indigo-400" />
        <h3 className="text-base font-black text-white uppercase">Personal Record (PR) Tracker</h3>
      </div>

      <form onSubmit={onLogWorkout} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <select
          value={splitType}
          onChange={(e) => setSplitType(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="Push">Push</option>
          <option value="Pull">Pull</option>
          <option value="Legs">Legs</option>
          <option value="Cardio">Cardio</option>
          <option value="Full Body">Full Body</option>
        </select>

        <input
          type="text"
          required
          placeholder="Exercise (e.g. Bench Press)"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />

        <input
          type="number"
          required
          placeholder="Weight (kg)"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-1 shadow-lg shadow-indigo-600/30"
        >
          <Plus className="h-4 w-4" />
          <span>Log PR</span>
        </button>
      </form>

      {workouts.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-2xl font-mono">
          No personal best sets logged yet. Log your top lift above!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-950 text-slate-300 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Split</th>
                <th className="p-3">Exercise</th>
                <th className="p-3">Top Weight</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {workouts.map((w) => (
                <tr key={w.id} className="hover:bg-slate-900/40 transition">
                  <td className="p-3">
                    <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                      {w.split_type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{w.exercise_name}</td>
                  <td className="p-3 font-mono text-emerald-400 font-bold">{w.weight_kg} kg</td>
                  <td className="p-3 font-mono text-slate-500">{formatReadableDate(w.logged_at)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDeleteWorkout(w.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
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