import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator, Flame, Droplet, Dumbbell, Sparkles, CheckCircle2, 
  Save, RefreshCw, PieChart as PieIcon, Scale, HeartPulse, Utensils
} from 'lucide-react'
import DailyNutritionDiary from './DailyNutritionDiary'

export default function MacroCalculator({ session }) {
  const [activeView, setActiveView] = useState('diary') // 'diary' | 'calculator'
  const [gender, setGender] = useState('male') // 'male', 'female'
  const [age, setAge] = useState('26')
  const [weightKg, setWeightKg] = useState('78')
  const [heightCm, setHeightCm] = useState('178')
  const [activityLevel, setActivityLevel] = useState('moderate') // 'sedentary', 'light', 'moderate', 'heavy', 'athlete'
  const [fitnessGoal, setFitnessGoal] = useState('lean_bulk') // 'aggressive_cut', 'moderate_cut', 'maintenance', 'lean_bulk', 'mass_bulk'
  const [mealsPerDay, setMealsPerDay] = useState(4)
  const [toastMessage, setToastMessage] = useState(null)

  // Load saved profile if available
  useEffect(() => {
    const saved = localStorage.getItem(`iron_gym_macros_${session?.user?.id || 'guest'}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.gender) setGender(parsed.gender)
        if (parsed.age) setAge(parsed.age)
        if (parsed.weightKg) setWeightKg(parsed.weightKg)
        if (parsed.heightCm) setHeightCm(parsed.heightCm)
        if (parsed.activityLevel) setActivityLevel(parsed.activityLevel)
        if (parsed.fitnessGoal) setFitnessGoal(parsed.fitnessGoal)
      } catch (e) {}
    }
  }, [session])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // BMR & TDEE Calculations using Mifflin-St Jeor Formula
  const calculations = useMemo(() => {
    const w = parseFloat(weightKg) || 75
    const h = parseFloat(heightCm) || 175
    const a = parseInt(age, 10) || 25

    // BMR
    let bmr = (10 * w) + (6.25 * h) - (5 * a)
    if (gender === 'male') bmr += 5
    else bmr -= 161

    // Activity Multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      heavy: 1.725,
      athlete: 1.9
    }
    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55))

    // Goal Multipliers
    const goalDeltas = {
      aggressive_cut: -0.25,
      moderate_cut: -0.15,
      maintenance: 0,
      lean_bulk: 0.10,
      mass_bulk: 0.20
    }
    const targetCalories = Math.round(tdee * (1 + (goalDeltas[fitnessGoal] || 0)))

    // High Protein Athlete Distribution:
    // Protein: 2.2g per kg bodyweight
    const proteinGrams = Math.round(w * 2.2)
    const proteinCalories = proteinGrams * 4

    // Fat: 25% of target calories
    const fatCalories = Math.round(targetCalories * 0.25)
    const fatGrams = Math.round(fatCalories / 9)

    // Carbs: Remaining calories
    const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories)
    const carbGrams = Math.round(remainingCalories / 4)

    // Hydration Target (liters)
    const waterLiters = (w * 0.04).toFixed(1)

    // Percentage splits
    const totalMacroCal = (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9)
    const proteinPct = totalMacroCal > 0 ? Math.round((proteinGrams * 4 / totalMacroCal) * 100) : 30
    const carbPct = totalMacroCal > 0 ? Math.round((carbGrams * 4 / totalMacroCal) * 100) : 45
    const fatPct = totalMacroCal > 0 ? Math.round((fatGrams * 9 / totalMacroCal) * 100) : 25

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      proteinGrams,
      carbGrams,
      fatGrams,
      waterLiters,
      proteinPct,
      carbPct,
      fatPct
    }
  }, [gender, age, weightKg, heightCm, activityLevel, fitnessGoal])

  const handleSaveProfile = () => {
    const dataToSave = {
      gender,
      age,
      weightKg,
      heightCm,
      activityLevel,
      fitnessGoal,
      calculations,
      savedAt: new Date().toLocaleDateString()
    }
    localStorage.setItem(`iron_gym_macros_${session?.user?.id || 'guest'}`, JSON.stringify(dataToSave))
    showToast('Nutritional profile saved to your athlete pass!')
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* NUTRITION NAVIGATION TABS */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit max-w-full">
        <button
          type="button"
          onClick={() => setActiveView('diary')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeView === 'diary'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Daily Food Diary & Meal Logger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('calculator')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeView === 'calculator'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>TDEE & Macro Split Calculator</span>
        </button>
      </div>

      {activeView === 'diary' ? (
        <DailyNutritionDiary session={session} />
      ) : (
        <>
          {/* HEADER HERO */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <Calculator className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">MACRO & NUTRITION ENGINE</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  ATHLETE SCIENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Precision daily caloric & macronutrient targets tailored to your muscle hypertrophy and body composition goals
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center space-x-2 transition"
            >
              <Save className="h-4 w-4" />
              <span>Save to Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INPUT CONFIGURATION PANEL (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-black text-white flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Scale className="h-4 w-4 text-emerald-400" />
            <span>BIOMETRIC PARAMETERS</span>
          </h3>

          {/* GENDER */}
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 rounded-xl font-bold border transition ${
                  gender === 'male' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 rounded-xl font-bold border transition ${
                  gender === 'female' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* AGE / WEIGHT / HEIGHT */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Age</label>
              <input
                type="number"
                min="14"
                max="90"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Weight (kg)</label>
              <input
                type="number"
                min="35"
                max="250"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="230"
                value={heightCm}
                onChange={e => setHeightCm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white p-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ACTIVITY LEVEL */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Training Frequency</label>
            <select
              value={activityLevel}
              onChange={e => setActivityLevel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              <option value="sedentary">Sedentary (Desk job, little workout)</option>
              <option value="light">Light Training (1-3 gym days/week)</option>
              <option value="moderate">Moderate Training (3-5 intense gym days/week)</option>
              <option value="heavy">Heavy Lifting (6-7 days/week)</option>
              <option value="athlete">Elite Athlete / 2x Daily Sessions</option>
            </select>
          </div>

          {/* FITNESS GOAL */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Physique & Performance Goal</label>
            <select
              value={fitnessGoal}
              onChange={e => setFitnessGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              <option value="aggressive_cut">Aggressive Fat Cut (-25% Calorie Deficit)</option>
              <option value="moderate_cut">Lean Shred (-15% Calorie Deficit)</option>
              <option value="maintenance">Body Recomposition / Maintenance (0% Delta)</option>
              <option value="lean_bulk">Clean Hypertrophy Bulk (+10% Surplus)</option>
              <option value="mass_bulk">Mass Monster Power Bulk (+20% Surplus)</option>
            </select>
          </div>

          {/* MEAL FREQUENCY */}
          <div>
            <label className="block text-slate-400 font-bold mb-1">Preferred Meal Frequency</label>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMealsPerDay(num)}
                  className={`py-1.5 rounded-xl font-bold border transition ${
                    mealsPerDay === num ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {num} Meals
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OUTPUT TARGETS & BREAKDOWN (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* TOP BIG NUMBER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
              <p className="text-xs text-slate-400 font-medium">Daily Energy Target</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">{calculations.targetCalories}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">kcal / day (TDEE: {calculations.tdee})</p>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
              <p className="text-xs text-slate-400 font-medium">Protein Target</p>
              <p className="text-3xl font-black text-indigo-400 mt-1 font-mono">{calculations.proteinGrams}g</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">2.2g / kg Bodyweight</p>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-5 rounded-3xl shadow-xl text-center">
              <p className="text-xs text-slate-400 font-medium">Daily Hydration</p>
              <p className="text-3xl font-black text-cyan-400 mt-1 font-mono">{calculations.waterLiters}L</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Pure Water Intake</p>
            </div>
          </div>

          {/* MACRO SPLIT CARDS */}
          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center space-x-2">
              <PieIcon className="h-4 w-4 text-indigo-400" />
              <span>DAILY MACRONUTRIENT DISTRIBUTION</span>
            </h3>

            {/* PROGRESS BARS */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-indigo-400 font-bold">Protein ({calculations.proteinPct}%)</span>
                  <span className="text-white font-bold">{calculations.proteinGrams}g ({calculations.proteinGrams * 4} kcal)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${calculations.proteinPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-amber-400 font-bold">Carbohydrates ({calculations.carbPct}%)</span>
                  <span className="text-white font-bold">{calculations.carbGrams}g ({calculations.carbGrams * 4} kcal)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${calculations.carbPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400 font-bold">Dietary Fats ({calculations.fatPct}%)</span>
                  <span className="text-white font-bold">{calculations.fatGrams}g ({calculations.fatGrams * 9} kcal)</span>
                </div>
                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${calculations.fatPct}%` }} />
                </div>
              </div>
            </div>

            {/* PER-MEAL TARGETS TABLE */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">Target Per Meal ({mealsPerDay} Meals Daily):</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Calories</p>
                  <p className="font-bold text-emerald-400">{Math.round(calculations.targetCalories / mealsPerDay)} kcal</p>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Protein</p>
                  <p className="font-bold text-indigo-400">{Math.round(calculations.proteinGrams / mealsPerDay)}g</p>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Carbs</p>
                  <p className="font-bold text-amber-400">{Math.round(calculations.carbGrams / mealsPerDay)}g</p>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-[10px]">Fats</p>
                  <p className="font-bold text-rose-400">{Math.round(calculations.fatGrams / mealsPerDay)}g</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
