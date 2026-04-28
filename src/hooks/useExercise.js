import { useState, useEffect, useCallback } from 'react'
import { toDateStr } from '../utils/dateUtils'
import { DAYS, WALK_INFO } from '../data/exercises'

const PREFIX      = 'exercise_'
const SESS_PREFIX = 'ex_sess_'
const WALK_PREFIX = 'ex_walk_'
const EXTM_PREFIX = 'ex_etmr_'   // per-exercise timers, keyed by date
const DEMOS_KEY   = 'exercise_demos'      // global demo URL overrides
const OVRD_KEY    = 'exercise_overrides'  // global exercise property overrides
const ORDER_KEY   = 'exercise_order'      // global phase ordering: { dayType: { phaseType: [id,...] } }

const AUTO_DAY = { 0: 'D', 1: 'A', 2: 'B', 3: 'D', 4: 'C', 5: 'A', 6: 'B' }

function getAutoDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return AUTO_DAY[d.getDay()] || 'A'
}

function buildEmptyDay(dateStr) {
  const dayType = getAutoDay(dateStr)
  const exercises = {}
  DAYS[dayType].phases.flatMap(p => p.exercises).forEach(ex => {
    exercises[ex.id] = { done: false, note: '' }
  })
  return {
    dayType,
    exercises,
    walks: WALK_INFO.map(() => ({ done: false, secs: 0 })),
    sessionSecs: 0,
    customExercises: [],
    removedExercises: [],
    overallNote: '',
  }
}

function ls(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null }
  catch { return null }
}
function ss(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
function rm(key) { localStorage.removeItem(key) }

export function useExercise(currentDate) {
  const dateStr = toDateStr(currentDate)

  const [data, setData]               = useState(() => ls(PREFIX + dateStr) || buildEmptyDay(dateStr))
  const [sessionRunning, setSessionR] = useState(() => ls(SESS_PREFIX + dateStr))   // { startTs } | null
  const [walkRunning, setWalkRunning] = useState(() => ls(WALK_PREFIX + dateStr) || {}) // { idx: startTs }
  const [exTimers, setExTimers]       = useState(() => ls(EXTM_PREFIX + dateStr) || {}) // { id: { startTs|null, accumulated } }
  const [demos, setDemos]             = useState(() => ls(DEMOS_KEY) || {})
  const [overrides, setOverrides]     = useState(() => ls(OVRD_KEY) || {})
  const [exOrder, setExOrder]         = useState(() => ls(ORDER_KEY) || {}) // global

  // ── Reload on date change ────────────────────────────────────────────────
  useEffect(() => {
    setData(ls(PREFIX + dateStr) || buildEmptyDay(dateStr))
    setSessionR(ls(SESS_PREFIX + dateStr))
    setWalkRunning(ls(WALK_PREFIX + dateStr) || {})
    setExTimers(ls(EXTM_PREFIX + dateStr) || {})
  }, [dateStr])

  // ── Persist ──────────────────────────────────────────────────────────────
  useEffect(() => { ss(PREFIX + dateStr, data) },               [dateStr, data])
  useEffect(() => { sessionRunning ? ss(SESS_PREFIX + dateStr, sessionRunning) : rm(SESS_PREFIX + dateStr) }, [sessionRunning, dateStr])
  useEffect(() => { ss(WALK_PREFIX + dateStr, walkRunning) },   [walkRunning, dateStr])
  useEffect(() => { ss(EXTM_PREFIX + dateStr, exTimers) },      [exTimers, dateStr])
  useEffect(() => { ss(DEMOS_KEY, demos) },                     [demos])
  useEffect(() => { ss(OVRD_KEY, overrides) },                  [overrides])
  useEffect(() => { ss(ORDER_KEY, exOrder) },                   [exOrder])

  // ── Day type ─────────────────────────────────────────────────────────────
  const setDayType = useCallback((type) => {
    setData(prev => {
      const exercises = { ...prev.exercises }
      DAYS[type].phases.flatMap(p => p.exercises).forEach(ex => {
        if (!exercises[ex.id]) exercises[ex.id] = { done: false, note: '' }
      })
      ;(prev.customExercises || []).forEach(ex => {
        if (!exercises[ex.id]) exercises[ex.id] = { done: false, note: '' }
      })
      return { ...prev, dayType: type, exercises }
    })
  }, [])

  // ── Exercises ────────────────────────────────────────────────────────────
  const toggleExercise = useCallback((id) => {
    setData(prev => ({
      ...prev,
      exercises: { ...prev.exercises, [id]: { ...prev.exercises[id], done: !(prev.exercises[id]?.done) } },
    }))
  }, [])

  const updateExerciseNote = useCallback((id, note) => {
    setData(prev => ({
      ...prev,
      exercises: { ...prev.exercises, [id]: { ...prev.exercises[id], note } },
    }))
  }, [])

  // ── Per-exercise timers ──────────────────────────────────────────────────
  const startExTimer = useCallback((id) => {
    setExTimers(prev => ({
      ...prev, [id]: { startTs: Date.now(), accumulated: prev[id]?.accumulated || 0 }
    }))
  }, [])

  const stopExTimer = useCallback((id) => {
    setExTimers(prev => {
      const t = prev[id]
      if (!t?.startTs) return prev
      const added = Math.floor((Date.now() - t.startTs) / 1000)
      return { ...prev, [id]: { startTs: null, accumulated: (t.accumulated || 0) + added } }
    })
  }, [])

  const resetExTimer = useCallback((id) => {
    setExTimers(prev => ({ ...prev, [id]: { startTs: null, accumulated: 0 } }))
  }, [])

  // ── Demo URLs (global) ───────────────────────────────────────────────────
  const updateDemoUrl = useCallback((id, url) => {
    setDemos(prev => ({ ...prev, [id]: url }))
  }, [])

  // ── Property overrides (global) ──────────────────────────────────────────
  const saveOverride = useCallback((id, field, value) => {
    setOverrides(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }, [])

  // ── Session timer ────────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    setData(prev => ({ ...prev, sessionSecs: 0 }))
    setSessionR({ startTs: Date.now() })
  }, [])

  const stopSession = useCallback(() => {
    setSessionR(prev => {
      if (!prev) return null
      const added = Math.floor((Date.now() - prev.startTs) / 1000)
      setData(d => ({ ...d, sessionSecs: (d.sessionSecs || 0) + added }))
      return null
    })
  }, [])

  const resumeSession = useCallback(() => {
    setSessionR({ startTs: Date.now() })
  }, [])

  const resetSession = useCallback(() => {
    setSessionR(null)
    setData(prev => ({ ...prev, sessionSecs: 0 }))
  }, [])

  // ── Walk timers ──────────────────────────────────────────────────────────
  const startWalkTimer = useCallback((idx) => {
    setWalkRunning(prev => ({ ...prev, [idx]: Date.now() }))
  }, [])

  const stopWalkTimer = useCallback((idx) => {
    setWalkRunning(prev => {
      const startTs = prev[idx]
      if (!startTs) return prev
      const added = Math.floor((Date.now() - startTs) / 1000)
      setData(d => {
        const walks = [...d.walks]
        walks[idx] = { ...walks[idx], secs: (walks[idx]?.secs || 0) + added }
        return { ...d, walks }
      })
      const next = { ...prev }; delete next[idx]; return next
    })
  }, [])

  const resetWalkTimer = useCallback((idx) => {
    setWalkRunning(prev => { const next = { ...prev }; delete next[idx]; return next })
    setData(prev => {
      const walks = [...prev.walks]
      walks[idx] = { ...walks[idx], secs: 0 }
      return { ...prev, walks }
    })
  }, [])

  const toggleWalk = useCallback((idx) => {
    setData(prev => {
      const walks = [...prev.walks]
      walks[idx] = { ...walks[idx], done: !walks[idx].done }
      return { ...prev, walks }
    })
  }, [])

  // ── Custom exercises ─────────────────────────────────────────────────────
  // ── Exercise ordering (global/permanent) ─────────────────────────────────

  // Returns exercises for a phase sorted by stored order
  const getSortedPhaseExercises = useCallback((dayType, phaseType, exercises) => {
    const storedOrder = exOrder?.[dayType]?.[phaseType]
    if (!storedOrder || storedOrder.length === 0) return exercises
    const byId = Object.fromEntries(exercises.map(ex => [ex.id, ex]))
    const sorted = storedOrder.filter(id => byId[id]).map(id => byId[id])
    const unsorted = exercises.filter(ex => !storedOrder.includes(ex.id))
    return [...sorted, ...unsorted]
  }, [exOrder])

  const moveExerciseInPhase = useCallback((dayType, phaseType, exId, direction) => {
    setExOrder(prev => {
      const phase = DAYS[dayType]?.phases.find(p => p.type === phaseType)
      const defaultOrder = phase?.exercises.map(e => e.id) || []
      const current = prev?.[dayType]?.[phaseType]
        ? [...prev[dayType][phaseType]]
        : [...defaultOrder]
      const idx = current.indexOf(exId)
      if (idx === -1) return prev
      if (direction === 'up' && idx > 0) {
        [current[idx - 1], current[idx]] = [current[idx], current[idx - 1]]
      } else if (direction === 'down' && idx < current.length - 1) {
        [current[idx], current[idx + 1]] = [current[idx + 1], current[idx]]
      } else return prev
      return { ...prev, [dayType]: { ...(prev[dayType] || {}), [phaseType]: current } }
    })
  }, [])

  const moveCustomExerciseUp = useCallback((id) => {
    setData(prev => {
      const arr = [...(prev.customExercises || [])]
      const idx = arr.findIndex(e => e.id === id)
      if (idx <= 0) return prev
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      return { ...prev, customExercises: arr }
    })
  }, [])

  const moveCustomExerciseDown = useCallback((id) => {
    setData(prev => {
      const arr = [...(prev.customExercises || [])]
      const idx = arr.findIndex(e => e.id === id)
      if (idx === -1 || idx >= arr.length - 1) return prev
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      return { ...prev, customExercises: arr }
    })
  }, [])

  const setCustomExercisePhase = useCallback((id, phase) => {
    setData(prev => ({
      ...prev,
      customExercises: (prev.customExercises || []).map(ex =>
        ex.id === id ? { ...ex, phase } : ex
      ),
    }))
  }, [])

  const removeExercise = useCallback((id) => {
    setData(prev => ({
      ...prev,
      removedExercises: [...(prev.removedExercises || []), id],
    }))
  }, [])

  const restoreExercise = useCallback((id) => {
    setData(prev => ({
      ...prev,
      removedExercises: (prev.removedExercises || []).filter(eid => eid !== id),
    }))
  }, [])

  const addLibraryExercise = useCallback((ex) => {
    const id = 'libadded_' + Date.now()
    setData(prev => ({
      ...prev,
      customExercises: [...(prev.customExercises || []), { ...ex, id }],
      exercises: { ...prev.exercises, [id]: { done: false, note: '' } },
    }))
  }, [])

  const addCustomExercise = useCallback((form) => {
    const id = 'custom_' + Date.now()
    setData(prev => ({
      ...prev,
      customExercises: [...(prev.customExercises || []), { ...form, id }],
      exercises: { ...prev.exercises, [id]: { done: false, note: '' } },
    }))
  }, [])

  const updateCustomExercise = useCallback((id, field, value) => {
    setData(prev => ({
      ...prev,
      customExercises: (prev.customExercises || []).map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    }))
  }, [])

  const deleteCustomExercise = useCallback((id) => {
    setData(prev => {
      const exercises = { ...prev.exercises }; delete exercises[id]
      return { ...prev, customExercises: (prev.customExercises || []).filter(e => e.id !== id), exercises }
    })
  }, [])

  // ── Notes ─────────────────────────────────────────────────────────────────
  const updateOverallNote = useCallback((note) => {
    setData(prev => ({ ...prev, overallNote: note }))
  }, [])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const allExercises    = DAYS[data.dayType].phases.flatMap(p => p.exercises)
  const customExercises = data.customExercises || []
  const totalExercises  = allExercises.length + customExercises.length
  const doneExercises   = allExercises.filter(ex => data.exercises[ex.id]?.done).length
    + customExercises.filter(ex => data.exercises[ex.id]?.done).length
  const doneWalks = data.walks.filter(w => w.done).length
  const progress  = (totalExercises + WALK_INFO.length) > 0
    ? Math.round(((doneExercises + doneWalks) / (totalExercises + WALK_INFO.length)) * 100)
    : 0

  return {
    data, dateStr,
    sessionRunning, walkRunning, exTimers, demos, overrides, exOrder,
    progress, doneExercises, totalExercises, doneWalks,
    setDayType,
    toggleExercise, updateExerciseNote,
    startExTimer, stopExTimer, resetExTimer,
    updateDemoUrl, saveOverride,
    toggleWalk, startWalkTimer, stopWalkTimer, resetWalkTimer,
    startSession, stopSession, resumeSession, resetSession,
    removeExercise, restoreExercise,
    getSortedPhaseExercises, moveExerciseInPhase,
    moveCustomExerciseUp, moveCustomExerciseDown, setCustomExercisePhase,
    addLibraryExercise, addCustomExercise, updateCustomExercise, deleteCustomExercise,
    updateOverallNote,
  }
}
