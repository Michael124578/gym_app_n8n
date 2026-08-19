import React from 'react'
import { Dumbbell, PlusCircle, FileText, Send, User, Target, Layers, CheckCircle2 } from 'lucide-react'

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: DISPATCH PROGRAM FORM */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <div className="inline-flex items-center space-x-2 text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-2">
            <Layers className="h-3 w-3" />
            <span>Prescription Terminal</span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <span>Assign Custom Routine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch personalized sets, reps, and RPE loading directly to athlete portal.
          </p>
        </div>

        <form onSubmit={onAssignWorkoutPlan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Target Athlete</label>
            <select
              required
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">-- Choose Subscribed Client --</option>
              {subscribers.map((sub) => (
                <option key={sub.members?.id} value={sub.members?.id}>
                  {sub.members?.full_name} ({sub.members?.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Program Block Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Hypertrophy Peaking Block - Week 1"
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Split Day</label>
              <select
                value={splitDay}
                onChange={(e) => setSplitDay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
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
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Target RPE (1-10)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                required
                value={targetRpe}
                onChange={(e) => setTargetRpe(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Primary Exercise Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Incline Dumbbell Bench Press"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Working Sets</label>
              <input
                type="number"
                required
                value={targetSets}
                onChange={(e) => setTargetSets(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Target Reps</label>
              <input
                type="number"
                required
                value={targetReps}
                onChange={(e) => setTargetReps(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Biomechanical Cues & Tempo</label>
            <input
              type="text"
              placeholder="e.g. 3-sec eccentric lowering, pause at bottom"
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={savingPlan}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 border border-indigo-400/30 cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{savingPlan ? 'Dispatching Protocol...' : 'Dispatch Routine to Athlete'}</span>
          </button>
        </form>
      </div>

      {/* RIGHT: ASSIGNED PLANS HISTORY */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span>Assigned Routines History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Real-time log of all workouts dispatched to clients.</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {assignedPlans.length} Dispatched
          </span>
        </div>

        <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
          {assignedPlans.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl space-y-2 font-mono">
              <Dumbbell className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-bold">No routines assigned yet.</p>
              <p className="text-[11px] text-slate-500">Configure an athlete workout using the prescription terminal on the left.</p>
            </div>
          ) : (
            assignedPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="p-5 bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition shadow-lg"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="text-sm font-black text-white uppercase">{plan.title}</span>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase">
                      {plan.split_day}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold">
                    {plan.exercise_name} — <span className="font-mono text-indigo-300">{plan.target_sets} Sets</span> × <span className="font-mono text-slate-300">{plan.target_reps} Reps</span> @ <span className="font-mono text-amber-400 font-bold">RPE {plan.target_rpe}</span>
                  </p>
                  {plan.notes && (
                    <p className="text-[11px] text-slate-400 italic">Cue: {plan.notes}</p>
                  )}
                  <p className="text-[10px] font-mono text-slate-500">
                    Athlete: <strong className="text-slate-400">{plan.members?.full_name || 'Client'}</strong>
                  </p>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}