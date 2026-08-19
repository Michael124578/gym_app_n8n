import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Utensils, Plus, Trash2, Search, Flame, 
  CheckCircle2, PieChart, ChevronRight, X, RotateCcw, 
  Apple, Dumbbell, Coffee, Sun, Moon, Zap, Scale
} from 'lucide-react'

export const FOOD_DATABASE = [
  // PROTEINS
  { id: 'f1', name: 'Boneless Skinless Chicken Breast', category: 'Protein', servingUnit: '100g', defaultQty: 150, calPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6 },
  { id: 'f2', name: 'Atlantic Salmon Fillet', category: 'Protein', servingUnit: '100g', defaultQty: 150, calPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatsPer100g: 13 },
  { id: 'f3', name: 'Extra Lean Ground Beef (93/7)', category: 'Protein', servingUnit: '100g', defaultQty: 150, calPer100g: 172, proteinPer100g: 24, carbsPer100g: 0, fatsPer100g: 8 },
  { id: 'f4', name: 'Whey Protein Isolate (1 Scoop)', category: 'Supplements', servingUnit: '30g scoop', defaultQty: 30, calPer100g: 380, proteinPer100g: 85, carbsPer100g: 3, fatsPer100g: 1.5 },
  { id: 'f5', name: 'Whole Large Egg', category: 'Protein', servingUnit: '1 egg (50g)', defaultQty: 100, calPer100g: 143, proteinPer100g: 13, carbsPer100g: 0.7, fatsPer100g: 9.5 },
  { id: 'f6', name: 'Liquid Egg Whites', category: 'Protein', servingUnit: '100g', defaultQty: 150, calPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatsPer100g: 0.2 },
  { id: 'f7', name: 'Non-Fat Greek Yogurt (0%)', category: 'Dairy', servingUnit: '100g', defaultQty: 200, calPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatsPer100g: 0.4 },
  { id: 'f8', name: 'Low-Fat Cottage Cheese (2%)', category: 'Dairy', servingUnit: '100g', defaultQty: 150, calPer100g: 86, proteinPer100g: 12, carbsPer100g: 3.4, fatsPer100g: 2.5 },
  { id: 'f9', name: 'Canned Chunk Light Tuna in Water', category: 'Protein', servingUnit: '100g', defaultQty: 120, calPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatsPer100g: 1 },
  { id: 'f10', name: 'Oven Roasted Turkey Breast', category: 'Protein', servingUnit: '100g', defaultQty: 150, calPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatsPer100g: 1.5 },
  
  // CARBS & GRAINS
  { id: 'f11', name: 'Rolled Old-Fashioned Oats', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 80, calPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatsPer100g: 6.9 },
  { id: 'f12', name: 'Jasmine White Rice (Cooked)', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 200, calPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatsPer100g: 0.3 },
  { id: 'f13', name: 'Baked Sweet Potato', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 200, calPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatsPer100g: 0.1 },
  { id: 'f14', name: 'Cream of Rice Cereal', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 50, calPer100g: 370, proteinPer100g: 7, carbsPer100g: 82, fatsPer100g: 0.5 },
  { id: 'f15', name: 'Whole Wheat Pasta (Cooked)', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 150, calPer100g: 124, proteinPer100g: 5.3, carbsPer100g: 26, fatsPer100g: 0.5 },
  { id: 'f16', name: 'White Russet Potato (Boiled/Baked)', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 200, calPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatsPer100g: 0.1 },
  { id: 'f17', name: 'Whole Grain Ezekiel Bread (1 Slice)', category: 'Carbohydrates', servingUnit: '1 slice (34g)', defaultQty: 68, calPer100g: 235, proteinPer100g: 14.7, carbsPer100g: 44, fatsPer100g: 1.5 },
  { id: 'f18', name: 'Quinoa (Cooked)', category: 'Carbohydrates', servingUnit: '100g', defaultQty: 150, calPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatsPer100g: 1.9 },

  // HEALTHY FATS
  { id: 'f19', name: 'Natural Peanut Butter (100% Peanuts)', category: 'Fats', servingUnit: '100g', defaultQty: 32, calPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatsPer100g: 50 },
  { id: 'f20', name: 'Fresh Hass Avocado', category: 'Fats', servingUnit: '100g', defaultQty: 75, calPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatsPer100g: 14.7 },
  { id: 'f21', name: 'Raw Whole Almonds', category: 'Fats', servingUnit: '100g', defaultQty: 30, calPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatsPer100g: 49.9 },
  { id: 'f22', name: 'Extra Virgin Olive Oil', category: 'Fats', servingUnit: '1 tbsp (14g)', defaultQty: 14, calPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatsPer100g: 100 },
  { id: 'f23', name: 'Chia Seeds', category: 'Fats', servingUnit: '100g', defaultQty: 15, calPer100g: 486, proteinPer100g: 16.5, carbsPer100g: 42, fatsPer100g: 30.7 },

  // FRUITS & VEGGIES
  { id: 'f24', name: 'Medium Banana', category: 'Fruits', servingUnit: '1 medium (118g)', defaultQty: 118, calPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatsPer100g: 0.3 },
  { id: 'f25', name: 'Fresh Blueberries', category: 'Fruits', servingUnit: '100g', defaultQty: 100, calPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatsPer100g: 0.3 },
  { id: 'f26', name: 'Fresh Strawberries', category: 'Fruits', servingUnit: '100g', defaultQty: 150, calPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatsPer100g: 0.3 },
  { id: 'f27', name: 'Steamed Fresh Broccoli', category: 'Vegetables', servingUnit: '100g', defaultQty: 150, calPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatsPer100g: 0.4 },
  { id: 'f28', name: 'Baby Spinach Leaves', category: 'Vegetables', servingUnit: '100g', defaultQty: 80, calPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatsPer100g: 0.4 }
]

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast', icon: Sun, subtitle: 'Morning Metabolism & Fuel' },
  { id: 'lunch', label: 'Lunch', icon: Coffee, subtitle: 'Mid-day Sustained Energy' },
  { id: 'dinner', label: 'Dinner', icon: Moon, subtitle: 'Evening Recovery & Protein' },
  { id: 'snacks', label: 'Pre/Post-Workout & Snacks', icon: Zap, subtitle: 'Performance & Nutrient Timing' },
]

export default function DailyNutritionDiary({ session }) {
  // DAILY TARGETS (Can be synced with MacroCalculator)
  const [dailyTargets, setDailyTargets] = useState({
    calories: 2500,
    protein: 180,
    carbs: 275,
    fats: 70
  })

  // LOGGED MEALS STATE
  const [loggedMeals, setLoggedMeals] = useState(() => {
    const saved = localStorage.getItem('iron_gym_logged_meals')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) {}
    }
    return {
      breakfast: [
        { id: 'log-1', name: 'Rolled Old-Fashioned Oats', grams: 80, calories: 311, protein: 13.5, carbs: 52.8, fats: 5.5 },
        { id: 'log-2', name: 'Whey Protein Isolate (1 Scoop)', grams: 30, calories: 114, protein: 25.5, carbs: 0.9, fats: 0.5 },
        { id: 'log-3', name: 'Fresh Blueberries', grams: 100, calories: 57, protein: 0.7, carbs: 14.0, fats: 0.3 },
      ],
      lunch: [
        { id: 'log-4', name: 'Boneless Skinless Chicken Breast', grams: 180, calories: 297, protein: 55.8, carbs: 0, fats: 6.5 },
        { id: 'log-5', name: 'Jasmine White Rice (Cooked)', grams: 200, calories: 260, protein: 5.4, carbs: 56.0, fats: 0.6 },
        { id: 'log-6', name: 'Steamed Fresh Broccoli', grams: 150, calories: 51, protein: 4.2, carbs: 10.5, fats: 0.6 },
      ],
      dinner: [
        { id: 'log-7', name: 'Atlantic Salmon Fillet', grams: 160, calories: 333, protein: 32.0, carbs: 0, fats: 20.8 },
        { id: 'log-8', name: 'Baked Sweet Potato', grams: 200, calories: 172, protein: 3.2, carbs: 40.0, fats: 0.2 },
      ],
      snacks: [
        { id: 'log-9', name: 'Non-Fat Greek Yogurt (0%)', grams: 200, calories: 118, protein: 20.0, carbs: 7.2, fats: 0.8 },
        { id: 'log-10', name: 'Medium Banana', grams: 118, calories: 105, protein: 1.3, carbs: 27.1, fats: 0.4 },
        { id: 'log-11', name: 'Natural Peanut Butter (100% Peanuts)', grams: 20, calories: 118, protein: 5.0, carbs: 4.0, fats: 10.0 },
      ]
    }
  })

  // ADD FOOD MODAL STATE
  const [activeSlotModal, setActiveSlotModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [customGrams, setCustomGrams] = useState(100)

  // CUSTOM FOOD CREATOR MODAL
  const [isCreatingCustom, setIsCreatingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCal, setCustomCal] = useState('')
  const [customPro, setCustomPro] = useState('')
  const [customCarb, setCustomCarb] = useState('')
  const [customFat, setCustomFat] = useState('')

  useEffect(() => {
    localStorage.setItem('iron_gym_logged_meals', JSON.stringify(loggedMeals))
  }, [loggedMeals])

  // Calculate totals
  const allLogs = Object.values(loggedMeals).flat()
  const totalConsumedCalories = Math.round(allLogs.reduce((acc, f) => acc + f.calories, 0))
  const totalConsumedProtein = Math.round(allLogs.reduce((acc, f) => acc + f.protein, 0))
  const totalConsumedCarbs = Math.round(allLogs.reduce((acc, f) => acc + f.carbs, 0))
  const totalConsumedFats = Math.round(allLogs.reduce((acc, f) => acc + f.fats, 0))

  const caloriesRemaining = dailyTargets.calories - totalConsumedCalories
  const proteinRemaining = dailyTargets.protein - totalConsumedProtein
  const carbsRemaining = dailyTargets.carbs - totalConsumedCarbs
  const fatsRemaining = dailyTargets.fats - totalConsumedFats

  const caloriePct = Math.min(100, Math.round((totalConsumedCalories / dailyTargets.calories) * 100))

  const handleAddFoodToSlot = () => {
    if (!selectedFood || !activeSlotModal) return
    const ratio = customGrams / 100
    const newEntry = {
      id: `log-${Date.now()}`,
      name: selectedFood.name,
      grams: customGrams,
      calories: Math.round(selectedFood.calPer100g * ratio),
      protein: Math.round(selectedFood.proteinPer100g * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbsPer100g * ratio * 10) / 10,
      fats: Math.round(selectedFood.fatsPer100g * ratio * 10) / 10,
    }

    setLoggedMeals(prev => ({
      ...prev,
      [activeSlotModal]: [...(prev[activeSlotModal] || []), newEntry]
    }))

    setSelectedFood(null)
    setActiveSlotModal(null)
  }

  const handleAddCustomFood = (e) => {
    e.preventDefault()
    if (!customName.trim() || !activeSlotModal) return
    const newEntry = {
      id: `log-${Date.now()}`,
      name: customName.trim(),
      grams: 100,
      calories: parseFloat(customCal) || 0,
      protein: parseFloat(customPro) || 0,
      carbs: parseFloat(customCarb) || 0,
      fats: parseFloat(customFat) || 0,
    }

    setLoggedMeals(prev => ({
      ...prev,
      [activeSlotModal]: [...(prev[activeSlotModal] || []), newEntry]
    }))

    setIsCreatingCustom(false)
    setCustomName('')
    setCustomCal('')
    setCustomPro('')
    setCustomCarb('')
    setCustomFat('')
    setActiveSlotModal(null)
  }

  const handleDeleteLogItem = (slotId, itemId) => {
    setLoggedMeals(prev => ({
      ...prev,
      [slotId]: prev[slotId].filter(i => i.id !== itemId)
    }))
  }

  const filteredFoodList = FOOD_DATABASE.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Utensils className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Nutrition Tracker 2.0 & Daily Food Diary</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Daily Meal & Macro Diary
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Log your meals across Breakfast, Lunch, Dinner & Snacks with verified nutritional macronutrient breakdowns.
            </p>
          </div>

          {/* QUICK TARGET ADJUST BUTTON */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 self-start md:self-auto shadow-xl">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block font-bold">Daily Goal</span>
              <span className="text-lg font-black text-white">{dailyTargets.calories} kcal</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block font-bold">Protein Target</span>
              <span className="text-lg font-black text-indigo-400">{dailyTargets.protein}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP SECTION: CIRCULAR CALORIE BUDGET RING & MACRO BARS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CALORIE BUDGET RADIAL CARD */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
              Energy Balance Gauge
            </span>
            <span className="text-[10px] font-mono text-slate-400">Target: {dailyTargets.calories} kcal</span>
          </div>

          {/* CIRCULAR GAUGE */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="#1e293b"
                strokeWidth="16"
                fill="transparent"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={caloriePct > 100 ? '#f43f5e' : '#6366f1'}
                strokeWidth="16"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - Math.min(1, caloriePct / 100))}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white">{totalConsumedCalories}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">kcal Consumed</span>
              <span className={`text-xs font-mono font-bold mt-1 ${
                caloriesRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {caloriesRemaining >= 0 ? `${caloriesRemaining} kcal Left` : `${Math.abs(caloriesRemaining)} kcal Over`}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Items</span>
              <span className="text-sm font-black text-white">{allLogs.length} Logged</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Daily Progress</span>
              <span className="text-sm font-black text-indigo-400">{caloriePct}%</span>
            </div>
          </div>
        </div>

        {/* MACRONUTRIENTS PROGRESS BARS */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-4 shadow-2xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold block">
              Macronutrient Targets
            </span>
            <h2 className="text-xl font-black uppercase text-white">Protein, Carbs & Fats Breakdown</h2>
          </div>

          {/* PROTEIN BAR */}
          <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="font-bold uppercase text-white">Protein (Muscle Hypertrophy)</span>
              </div>
              <span className="font-mono text-indigo-400 font-bold">
                {totalConsumedProtein}g / {dailyTargets.protein}g ({proteinRemaining >= 0 ? `${proteinRemaining}g left` : 'Target Hit! 🎉'})
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.round((totalConsumedProtein / dailyTargets.protein) * 100))}%` }}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* CARBS BAR */}
          <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-cyan-500" />
                <span className="font-bold uppercase text-white">Carbohydrates (Glycogen & Energy)</span>
              </div>
              <span className="font-mono text-cyan-400 font-bold">
                {totalConsumedCarbs}g / {dailyTargets.carbs}g ({carbsRemaining >= 0 ? `${carbsRemaining}g left` : 'Target Exceeded'})
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.round((totalConsumedCarbs / dailyTargets.carbs) * 100))}%` }}
                className="bg-gradient-to-r from-cyan-500 to-sky-500 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* FATS BAR */}
          <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="font-bold uppercase text-white">Healthy Fats (Hormone Health)</span>
              </div>
              <span className="font-mono text-amber-400 font-bold">
                {totalConsumedFats}g / {dailyTargets.fats}g ({fatsRemaining >= 0 ? `${fatsRemaining}g left` : 'Target Exceeded'})
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.round((totalConsumedFats / dailyTargets.fats) * 100))}%` }}
                className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

        </div>

      </div>

      {/* 4 MEAL LOGGING SLOTS (BREAKFAST, LUNCH, DINNER, SNACKS) */}
      <div className="space-y-6">
        {MEAL_SLOTS.map((slot) => {
          const Icon = slot.icon
          const items = loggedMeals[slot.id] || []
          const slotCalories = Math.round(items.reduce((acc, i) => acc + i.calories, 0))
          const slotProtein = Math.round(items.reduce((acc, i) => acc + i.protein, 0))
          const slotCarbs = Math.round(items.reduce((acc, i) => acc + i.carbs, 0))
          const slotFats = Math.round(items.reduce((acc, i) => acc + i.fats, 0))

          return (
            <div
              key={slot.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              {/* SLOT HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white">{slot.label}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{slot.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-sm font-black text-white">{slotCalories} kcal</span>
                    <span className="text-[10px] font-mono text-indigo-300 block">
                      {slotProtein}P • {slotCarbs}C • {slotFats}F
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setActiveSlotModal(slot.id); setSearchQuery('') }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Food</span>
                  </button>
                </div>
              </div>

              {/* SLOT FOOD ITEMS LIST */}
              {items.length > 0 ? (
                <div className="divide-y divide-slate-800/50">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-950/40 px-2 rounded-xl transition">
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.grams}g portion • <strong className="text-indigo-400">{item.calories} kcal</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-[11px] font-mono">
                          <span className="text-indigo-400 font-bold">{item.protein}g P</span>
                          <span className="text-slate-500 mx-1.5">|</span>
                          <span className="text-cyan-400">{item.carbs}g C</span>
                          <span className="text-slate-500 mx-1.5">|</span>
                          <span className="text-amber-400">{item.fats}g F</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteLogItem(slot.id, item.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-500 italic">No food logged for this meal slot yet.</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* FOOD SEARCH & ADD MODAL */}
      <AnimatePresence>
        {activeSlotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              {/* MODAL HEADER */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                    Log Meal Entry // {activeSlotModal.toUpperCase()}
                  </span>
                  <h2 className="text-xl font-black uppercase text-white">Search Nutritional Database</h2>
                </div>

                <button
                  type="button"
                  onClick={() => { setActiveSlotModal(null); setSelectedFood(null) }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                
                {/* SEARCH INPUT */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chicken breast, salmon, oats, whey, avocado, rice..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* FOOD ITEMS SELECTION LIST */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredFoodList.map((food) => {
                    const isSelected = selectedFood?.id === food.id
                    return (
                      <div
                        key={food.id}
                        onClick={() => {
                          setSelectedFood(food)
                          setCustomGrams(food.defaultQty)
                        }}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{food.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {food.calPer100g} kcal / 100g • {food.proteinPer100g}P • {food.carbsPer100g}C • {food.fatsPer100g}F
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
                          {food.category}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* SELECTED FOOD GRAMS / PORTION ADJUSTER */}
                {selectedFood && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase">{selectedFood.name}</span>
                      <div className="flex items-center space-x-2">
                        <label className="text-[10px] font-mono text-slate-400">Portion (grams):</label>
                        <input
                          type="number"
                          value={customGrams}
                          onChange={(e) => setCustomGrams(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-20 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-white text-center focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <span className="text-[10px] font-mono text-slate-400 block">Calories</span>
                        <span className="font-black text-white">{Math.round(selectedFood.calPer100g * (customGrams / 100))} kcal</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <span className="text-[10px] font-mono text-indigo-400 block">Protein</span>
                        <span className="font-black text-indigo-400">{Math.round(selectedFood.proteinPer100g * (customGrams / 100) * 10) / 10}g</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <span className="text-[10px] font-mono text-cyan-400 block">Carbs</span>
                        <span className="font-black text-cyan-400">{Math.round(selectedFood.carbsPer100g * (customGrams / 100) * 10) / 10}g</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <span className="text-[10px] font-mono text-amber-400 block">Fats</span>
                        <span className="font-black text-amber-400">{Math.round(selectedFood.fatsPer100g * (customGrams / 100) * 10) / 10}g</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddFoodToSlot}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-xl shadow-lg transition"
                    >
                      Confirm & Add to {activeSlotModal}
                    </button>
                  </motion.div>
                )}

              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Can't find an item?</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Custom Food</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CUSTOM FOOD POPUP */}
      <AnimatePresence>
        {isCreatingCustom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddCustomFood}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black uppercase text-white">Create Custom Food</h3>
                <button type="button" onClick={() => setIsCreatingCustom(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">Food / Dish Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Homemade Protein Pancake"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Total Calories</label>
                  <input
                    type="number"
                    required
                    value={customCal}
                    onChange={(e) => setCustomCal(e.target.value)}
                    placeholder="kcal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={customPro}
                    onChange={(e) => setCustomPro(e.target.value)}
                    placeholder="grams"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Carbohydrates (g)</label>
                  <input
                    type="number"
                    value={customCarb}
                    onChange={(e) => setCustomCarb(e.target.value)}
                    placeholder="grams"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    placeholder="grams"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase py-3 rounded-xl transition mt-4"
              >
                Save & Log Item
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
