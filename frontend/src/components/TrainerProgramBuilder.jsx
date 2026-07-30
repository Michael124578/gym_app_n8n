import React from 'react'
import { Dumbbell, PlusCircle, FileText } from 'lucide-react'

export default function TrainerProgramBuilder({
  subscribers,
  selectedClient,
  setSelectedClient,
  programTitle,
  setProgramTitle,
  splitDay,
  setSplitDay,
  targetRpe,
  setTargetRpe,
  exerciseName,
  setExerciseName,
  targetSets,
  setTargetSets,
  targetReps,
  setTargetReps,
  planNotes,
  setPlanNotes,
  onAssignWorkoutPlan,
  savingPlan,
  assignedPlans
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
        <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
          <Dumbbell className="h-5 w-5 text-indigo-400" />
          <span>Assign Custom Routine</span>
        </h3>

        <form onSubmit={onAssignWorkoutPlan} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select Athlete</label>
            <select
              required
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Client --</option>
              {subscribers.map((sub) => (
                <option key={sub.members?.id} value={sub.members?.id}>
                  {sub.members?.full_name} ({sub.members?.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Program Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Hypertrophy Block - Week 1"
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Split Day</label>
              <select
                value={splitDay}
                onChange={(e) => setSplitDay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Push Day">Push Day</option>
                <option value="Pull Day">Pull Day</option>
                <option value="Leg Day">Leg Day</option>
                <option value="Upper Body">Upper Body</option>
                <option value="Lower Body">Lower Body</option>
                <option value="Full Body">Full Body</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target RPE (1-10)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                required
                value={targetRpe}
                onChange={(e) => setTargetRpe(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Exercise Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Incline Dumbbell Bench Press"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Sets</label>
              <input
                type="number"
                required
                value={targetSets}
                onChange={(e) => setTargetSets(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Reps</label>
              <input
                type="number"
                required
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Cues / Tempo Notes</label>
            <input
              type="text"
              placeholder="e.g. 3-sec eccentric lowering, pause at bottom"
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingPlan}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            <span>{savingPlan ? 'Dispatching...' : 'Dispatch Routine'}</span>
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
        <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
          <FileText className="h-5 w-5 text-indigo-400" />
          <span>Assigned Routines History ({assignedPlans.length})</span>
        </h3>

        <div className="space-y-3">
          {assignedPlans.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center border border-dashed border-slate-800 rounded-2xl font-mono">
              No routines assigned yet. Build a workout on the left panel!
            </p>
          ) : (
            assignedPlans.map((plan) => (
              <div key={plan.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white">{plan.title}</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {plan.split_day}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">
                    {plan.exercise_name} — {plan.target_sets} sets × {plan.target_reps} reps @ RPE {plan.target_rpe}
                  </p>
                  {plan.notes && <p className="text-[11px] text-slate-400 mt-0.5">Cue: {plan.notes}</p>}
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Client: {plan.members?.full_name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}