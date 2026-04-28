import { useState, useEffect, useCallback } from 'react'
import { toDateStr } from '../utils/dateUtils'
import { SUPPLEMENTS, BREAKFASTS, LUNCHES, DINNERS } from '../data/meals'

const PREFIX           = 'meals_'
const CUSTOM_MEALS_KEY = 'custom_meal_options'
const CUSTOM_SUPPS_KEY = 'custom_supplements'   // [{id,name,icon,frequency,timing,withFood,avoid,rules,color}]
const HIDDEN_SUPPS_KEY = 'hidden_default_supps'  // ['vitD','iron',...] — default supps user hid

// ── Generic localStorage helpers ─────────────────────────────────────────────
function ls(k)    { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null } catch { return null } }
function ss(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

// ── Supplement helpers ────────────────────────────────────────────────────────
function loadCustomSupps()  { return ls(CUSTOM_SUPPS_KEY)  || [] }
function loadHiddenSupps()  { return ls(HIDDEN_SUPPS_KEY)  || [] }

/** Returns the full list of visible supplements: default (minus hidden) + custom */
function getAllVisibleSupps(customSupps = [], hiddenIds = []) {
  return [
    ...SUPPLEMENTS.filter(s => !hiddenIds.includes(s.id)),
    ...customSupps,
  ]
}

// ── Meal option helpers ───────────────────────────────────────────────────────
function loadCustomMealOptions() {
  return ls(CUSTOM_MEALS_KEY) || { breakfasts: [], lunches: [], dinners: [] }
}
function saveCustomMealOptions(opts) { ss(CUSTOM_MEALS_KEY, opts) }

// ── Build empty day ───────────────────────────────────────────────────────────
function buildEmpty(allSupps) {
  const supps = {}
  allSupps.forEach(s => { supps[s.id] = { taken: false, time: '' } })
  return {
    breakfast:   { code: '', time: '', note: '', photoId: null, custom: '' },
    lunch:       { code: '', time: '', note: '', photoId: null, custom: '' },
    snack:       { text: '', time: '', note: '', photoId: null },
    dinner:      { code: '', time: '', note: '', photoId: null, custom: '' },
    supplements: supps,
    extraMeals:  [],
  }
}

// ── Merge saved day data with current visible supps ───────────────────────────
// Ensures newly added supplements get initialized even on old dates
function mergeSuppState(saved, allSupps) {
  const supps = { ...(saved.supplements || {}) }
  allSupps.forEach(s => {
    if (!supps[s.id]) supps[s.id] = { taken: false, time: '' }
  })
  return { ...saved, supplements: supps }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMeals(currentDate) {
  const dateStr = toDateStr(currentDate)

  // Global supplement lists (not date-specific)
  const [customSupps, setCustomSupps] = useState(() => loadCustomSupps())
  const [hiddenSupps, setHiddenSupps] = useState(() => loadHiddenSupps())

  // Custom meal options
  const [customMealOpts, setCustomMealOpts] = useState(() => loadCustomMealOptions())

  // All visible supps is a pure derivation — no extra state needed
  const allVisibleSupps = getAllVisibleSupps(customSupps, hiddenSupps)

  // Per-date data — initialise with ALL current visible supps
  const [data, setData] = useState(() => {
    const saved = ls(PREFIX + dateStr)
    return saved ? mergeSuppState(saved, getAllVisibleSupps(loadCustomSupps(), loadHiddenSupps())) : buildEmpty(getAllVisibleSupps(loadCustomSupps(), loadHiddenSupps()))
  })

  // ── Reload on date change ─────────────────────────────────────────────────
  useEffect(() => {
    const saved = ls(PREFIX + dateStr)
    setData(saved ? mergeSuppState(saved, allVisibleSupps) : buildEmpty(allVisibleSupps))
  // allVisibleSupps intentionally excluded — we only reload on date change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr])

  // ── Persist per-date data ─────────────────────────────────────────────────
  useEffect(() => { ss(PREFIX + dateStr, data) }, [dateStr, data])

  // ── Persist global supplement lists ──────────────────────────────────────
  useEffect(() => { ss(CUSTOM_SUPPS_KEY, customSupps) }, [customSupps])
  useEffect(() => { ss(HIDDEN_SUPPS_KEY, hiddenSupps) }, [hiddenSupps])

  // ── Meals ─────────────────────────────────────────────────────────────────
  const setMeal = useCallback((meal, field, value) => {
    setData(prev => ({ ...prev, [meal]: { ...prev[meal], [field]: value } }))
  }, [])

  // ── Supplement actions ────────────────────────────────────────────────────
  const toggleSupp = useCallback((id) => {
    setData(prev => ({
      ...prev,
      supplements: { ...prev.supplements, [id]: { ...prev.supplements[id], taken: !prev.supplements[id]?.taken } }
    }))
  }, [])

  const setSuppTime = useCallback((id, time) => {
    setData(prev => ({
      ...prev,
      supplements: { ...prev.supplements, [id]: { ...prev.supplements[id], time } }
    }))
  }, [])

  /** Add a brand new custom supplement (permanent, global) */
  const addCustomSupplement = useCallback((supp) => {
    const id = 'csupp_' + Date.now()
    const newSupp = { ...supp, id }
    setCustomSupps(prev => [...prev, newSupp])
    // Also initialise its state on the current date immediately
    setData(prev => ({
      ...prev,
      supplements: { ...prev.supplements, [id]: { taken: false, time: '' } }
    }))
  }, [])

  /** Permanently delete a custom supplement */
  const deleteCustomSupplement = useCallback((id) => {
    setCustomSupps(prev => prev.filter(s => s.id !== id))
    // Remove from today's state too (orphans in past dates are harmless)
    setData(prev => {
      const supps = { ...prev.supplements }
      delete supps[id]
      return { ...prev, supplements: supps }
    })
  }, [])

  /** Hide a default supplement (e.g. doctor stopped Iron) — restoreable */
  const hideDefaultSupplement = useCallback((id) => {
    setHiddenSupps(prev => prev.includes(id) ? prev : [...prev, id])
  }, [])

  /** Restore a previously hidden default supplement */
  const restoreDefaultSupplement = useCallback((id) => {
    setHiddenSupps(prev => prev.filter(hid => hid !== id))
    // Ensure it has state on current date
    setData(prev => ({
      ...prev,
      supplements: {
        ...prev.supplements,
        [id]: prev.supplements[id] || { taken: false, time: '' }
      }
    }))
  }, [])

  // ── Extra meals ───────────────────────────────────────────────────────────
  const addExtraMeal = useCallback((entry) => {
    const id = 'extra_' + Date.now()
    setData(prev => ({ ...prev, extraMeals: [...(prev.extraMeals || []), { ...entry, id }] }))
  }, [])

  const deleteExtraMeal = useCallback((id) => {
    setData(prev => ({ ...prev, extraMeals: (prev.extraMeals || []).filter(e => e.id !== id) }))
  }, [])

  // ── Custom meal options ───────────────────────────────────────────────────
  const addCustomMealOption = useCallback((type, option) => {
    const allOpts = [...BREAKFASTS, ...LUNCHES, ...DINNERS]
    const current = loadCustomMealOptions()
    const existingCodes = [...allOpts, ...(current.breakfasts||[]), ...(current.lunches||[]), ...(current.dinners||[])].map(o => o.code)
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

  // ── Derived stats ─────────────────────────────────────────────────────────
  const suppsTaken = allVisibleSupps.filter(s => data.supplements[s.id]?.taken).length
  const suppTotal  = allVisibleSupps.length
  const mealsLogged = ['breakfast', 'lunch', 'dinner'].filter(m => data[m]?.code || data[m]?.custom).length

  return {
    data, dateStr,
    customMealOpts, customSupps, hiddenSupps, allVisibleSupps,
    setMeal, toggleSupp, setSuppTime,
    addCustomSupplement, deleteCustomSupplement,
    hideDefaultSupplement, restoreDefaultSupplement,
    addExtraMeal, deleteExtraMeal,
    addCustomMealOption, deleteCustomMealOption,
    suppsTaken, suppTotal, mealsLogged,
  }
}
