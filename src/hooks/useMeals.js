import { useState, useEffect, useCallback } from 'react'
import { toDateStr } from '../utils/dateUtils'
import { SUPPLEMENTS, BREAKFASTS, LUNCHES, DINNERS } from '../data/meals'

const PREFIX = 'meals_'
const CUSTOM_MEALS_KEY = 'custom_meal_options'

function loadCustomMealOptions() {
  try { const r = localStorage.getItem(CUSTOM_MEALS_KEY); return r ? JSON.parse(r) : { breakfasts: [], lunches: [], dinners: [] } }
  catch { return { breakfasts: [], lunches: [], dinners: [] } }
}
function saveCustomMealOptions(opts) { localStorage.setItem(CUSTOM_MEALS_KEY, JSON.stringify(opts)) }

function buildEmpty() {
  const supps = {}
  SUPPLEMENTS.forEach(s => { supps[s.id] = { taken: false, time: '' } })
  return {
    breakfast: { code: '', time: '', note: '', photoId: null, custom: '' },
    lunch:     { code: '', time: '', note: '', photoId: null, custom: '' },
    snack:     { text: '', time: '', note: '', photoId: null },
    dinner:    { code: '', time: '', note: '', photoId: null, custom: '' },
    supplements: supps,
    extraMeals: [],
  }
}

function ls(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

export function useMeals(currentDate) {
  const dateStr = toDateStr(currentDate)
  const [data, setData] = useState(() => ls(PREFIX + dateStr) || buildEmpty())
  const [customMealOpts, setCustomMealOpts] = useState(() => loadCustomMealOptions())

  useEffect(() => {
    setData(ls(PREFIX + dateStr) || buildEmpty())
  }, [dateStr])

  useEffect(() => { ss(PREFIX + dateStr, data) }, [dateStr, data])

  const setMeal = useCallback((meal, field, value) => {
    setData(prev => ({ ...prev, [meal]: { ...prev[meal], [field]: value } }))
  }, [])

  const toggleSupp = useCallback((id) => {
    setData(prev => ({
      ...prev,
      supplements: {
        ...prev.supplements,
        [id]: { ...prev.supplements[id], taken: !prev.supplements[id]?.taken }
      }
    }))
  }, [])

  const setSuppTime = useCallback((id, time) => {
    setData(prev => ({
      ...prev,
      supplements: { ...prev.supplements, [id]: { ...prev.supplements[id], time } }
    }))
  }, [])

  const addExtraMeal = useCallback((entry) => {
    const id = 'extra_' + Date.now()
    setData(prev => ({ ...prev, extraMeals: [...(prev.extraMeals || []), { ...entry, id }] }))
  }, [])

  const deleteExtraMeal = useCallback((id) => {
    setData(prev => ({ ...prev, extraMeals: (prev.extraMeals || []).filter(e => e.id !== id) }))
  }, [])

  const addCustomMealOption = useCallback((type, option) => {
    // type: 'breakfasts' | 'lunches' | 'dinners'
    const allOpts = [...BREAKFASTS, ...LUNCHES, ...DINNERS]
    const current = loadCustomMealOptions()
    const existingCodes = [...allOpts, ...(current.breakfasts||[]), ...(current.lunches||[]), ...(current.dinners||[])].map(o => o.code)
    // Auto-generate code: BF5, BF6... / L11, L12... / D9, D10...
    const prefix = type === 'breakfasts' ? 'BF' : type === 'lunches' ? 'L' : 'D'
    const baseList = type === 'breakfasts' ? BREAKFASTS : type === 'lunches' ? LUNCHES : DINNERS
    let num = baseList.length + 1 + (current[type]?.length || 0)
    let code = prefix + num
    while (existingCodes.includes(code)) { num++; code = prefix + num }
    const newOpt = { ...option, code }
    setCustomMealOpts(prev => {
      const next = { ...prev, [type]: [...(prev[type] || []), newOpt] }
      saveCustomMealOptions(next)
      return next
    })
  }, [])

  const deleteCustomMealOption = useCallback((type, code) => {
    setCustomMealOpts(prev => {
      const next = { ...prev, [type]: prev[type].filter(o => o.code !== code) }
      saveCustomMealOptions(next)
      return next
    })
  }, [])

  const suppsTaken = Object.values(data.supplements).filter(s => s.taken).length
  const suppTotal = SUPPLEMENTS.length
  const mealsLogged = ['breakfast', 'lunch', 'dinner'].filter(m => data[m]?.code || data[m]?.custom).length

  return {
    data, dateStr,
    customMealOpts,
    setMeal, toggleSupp, setSuppTime,
    addExtraMeal, deleteExtraMeal,
    addCustomMealOption, deleteCustomMealOption,
    suppsTaken, suppTotal, mealsLogged,
  }
}
