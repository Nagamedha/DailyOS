import React, { useState, useCallback } from 'react'
import DaySummary from './DaySummary'
import ActivityRow from './ActivityRow'
import { useDailyLog } from '../../hooks/useDailyLog'
import { CATEGORIES } from '../../data/categories'
import { exportForClaude } from '../../utils/storage'
import { toLongDate, isFuture, toDateStr } from '../../utils/dateUtils'
import './DailyLog.css'

const ROUTINE_KEY = 'daily_routines'
const ROUTINE_CHECKS_PREFIX = 'routine_checks_'

function loadRoutineChecks(dateStr) {
  try { const r = localStorage.getItem(ROUTINE_CHECKS_PREFIX + dateStr); return r ? JSON.parse(r) : {} }
  catch { return {} }
}
function saveRoutineChecks(dateStr, checks) { localStorage.setItem(ROUTINE_CHECKS_PREFIX + dateStr, JSON.stringify(checks)) }
const DEFAULT_ROUTINES = [
  {
    id: 'r1', name: 'Evening Gym Day',
    steps: ['7:00 Wake up + supplements', '8:00 Study block 1 (2 hrs)', '10:00 Walk after breakfast', '12:00 Lunch + rest', '14:00 Study block 2 (2 hrs)', '17:00 Job applications (1 hr)', '18:30 Gym session', '20:00 Dinner + walk', '21:30 Journal + wind down', '22:30 Sleep'],
  },
  {
    id: 'r2', name: 'Morning Gym Day',
    steps: ['6:30 Wake up + supplements', '7:00 Gym session', '9:00 Breakfast + walk', '10:00 Study block 1 (3 hrs)', '13:00 Lunch + walk', '14:30 Study block 2 (2 hrs)', '17:00 Job applications (1 hr)', '19:00 Dinner', '20:00 Study block 3 (1 hr)', '21:30 Journal + sleep'],
  },
  {
    id: 'r3', name: 'Rest Day',
    steps: ['8:00 Wake up slow', '9:00 Breakfast + morning walk', '10:00 Light study / reading (2 hrs)', '12:30 Lunch', '14:00 Nap or relax', '16:00 Job applications (1 hr)', '17:00 Walk + fresh air', '19:00 Dinner + family time', '21:00 Journal', '22:00 Early sleep'],
  },
]

function loadRoutines() {
  try { const r = localStorage.getItem(ROUTINE_KEY); return r ? JSON.parse(r) : DEFAULT_ROUTINES }
  catch { return DEFAULT_ROUTINES }
}
function saveRoutines(routines) { localStorage.setItem(ROUTINE_KEY, JSON.stringify(routines)) }

const ICON_OPTIONS = ['📚', '💼', '🏋️', '🍳', '👨‍👩‍👧', '🏠', '😴', '🧘', '💊', '🎨', '🎵', '💻', '✍️', '🌿', '🚴']
const COLOR_OPTIONS = ['#5a4e88', '#3d6b47', '#c05a30', '#8a6a30', '#2d6a8a', '#8a2d6a', '#6a8a2d', '#2d8a6a']

export default function DailyLog({ currentDate }) {
  const {
    dayData,
    saveStatus,
    totalHours,
    targetsHit,
    totalTargets,
    timerStates,
    orphanedTimers,
    customCats,
    updateHours,
    updateNotes,
    updateDeviationNote,
    updateMood,
    startTimer,
    stopTimer,
    discardTimer,
    stopOrphanedTimer,
    deleteSession,
    editSession,
    resetActivity,
    addCustomCategory,
    deleteCustomCategory,
  } = useDailyLog(currentDate)

  const [copied, setCopied] = useState(false)

  // Routine checks — per date
  const dateStr = toDateStr(currentDate)
  const [routineChecks, setRoutineChecks] = useState(() => loadRoutineChecks(toDateStr(currentDate)))

  // Reload checks when date changes
  React.useEffect(() => {
    setRoutineChecks(loadRoutineChecks(toDateStr(currentDate)))
  }, [currentDate])

  function toggleRoutineCheck(routineId, stepIdx) {
    setRoutineChecks(prev => {
      const key = `${routineId}_${stepIdx}`
      const next = { ...prev, [key]: !prev[key] }
      saveRoutineChecks(toDateStr(currentDate), next)
      return next
    })
  }

  // Custom category modal
  const [showCatModal, setShowCatModal] = useState(false)
  const [catForm, setCatForm] = useState({ label: '', icon: '📚', color: COLOR_OPTIONS[0], targetHours: '' })

  // Routines
  const [routines, setRoutines] = useState(() => loadRoutines())
  const [expandedRoutine, setExpandedRoutine] = useState(null)
  const [editingRoutine, setEditingRoutine] = useState(null) // id of routine being edited

  function updateRoutine(id, field, value) {
    setRoutines(prev => {
      const next = prev.map(r => r.id === id ? { ...r, [field]: value } : r)
      saveRoutines(next)
      return next
    })
  }

  function updateRoutineStep(id, idx, value) {
    setRoutines(prev => {
      const next = prev.map(r => {
        if (r.id !== id) return r
        const steps = [...r.steps]
        steps[idx] = value
        return { ...r, steps }
      })
      saveRoutines(next)
      return next
    })
  }

  function addRoutineStep(id) {
    setRoutines(prev => {
      const next = prev.map(r => r.id === id ? { ...r, steps: [...r.steps, ''] } : r)
      saveRoutines(next)
      return next
    })
  }

  function removeRoutineStep(id, idx) {
    setRoutines(prev => {
      const next = prev.map(r => {
        if (r.id !== id) return r
        const steps = r.steps.filter((_, i) => i !== idx)
        return { ...r, steps }
      })
      saveRoutines(next)
      return next
    })
  }

  const handleExport = useCallback(async () => {
    const text = exportForClaude(30)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      const win = window.open('', '_blank')
      win.document.write('<pre>' + text + '</pre>')
    }
  }, [])

  if (isFuture(currentDate)) {
    return (
      <div className="future-day-card">
        <div className="future-icon">📅</div>
        <p>You can only log today or past days.</p>
      </div>
    )
  }

  return (
    <div className="daily-log">
      <div className="dl-date-heading">
        {toLongDate(currentDate)}
        <span className={`save-status save-status--${saveStatus}`}>
          {saveStatus === 'saved' ? '✓ Saved' : 'Saving…'}
        </span>
      </div>

      {/* ── Orphaned timer recovery banners ── */}
      {orphanedTimers.map(({ categoryId, startTimestamp, dateStr: timerDate }) => {
        const cat = CATEGORIES.find(c => c.id === categoryId)
        const startStr = new Date(startTimestamp).toLocaleString([], {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        return (
          <div key={categoryId} className="timer-recovery-banner">
            <strong>⏱ Timer still running — {cat?.label || categoryId}</strong>
            Started {startStr} on {timerDate} — it's still counting.
            <div className="timer-recovery-actions">
              <button
                className="timer-recovery-stop"
                onClick={() => stopOrphanedTimer(categoryId)}
              >
                Stop &amp; log time
              </button>
              <button
                className="timer-recovery-discard"
                onClick={() => discardTimer(categoryId)}
              >
                Discard
              </button>
            </div>
          </div>
        )
      })}

      <DaySummary
        totalHours={totalHours}
        targetsHit={targetsHit}
        totalTargets={totalTargets}
        mood={dayData.mood}
        onMoodChange={updateMood}
        activities={dayData.activities}
      />

      <div className="section-label">Log your hours</div>

      <div className="activity-list">
        {[...CATEGORIES, ...customCats].map(cat => {
          const timer = timerStates[cat.id]
          const isCustom = customCats.some(c => c.id === cat.id)
          return (
            <ActivityRow
              key={cat.id}
              category={cat}
              hours={dayData.activities[cat.id]?.hours || 0}
              notes={dayData.activities[cat.id]?.notes || ''}
              sessions={dayData.activities[cat.id]?.sessions || []}
              timerRunning={!!(timer && timer.dateStr === toDateStr(currentDate))}
              timerStart={timer?.startTimestamp ?? null}
              onHoursChange={updateHours}
              onNotesChange={updateNotes}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              onDeleteSession={deleteSession}
              onEditSession={editSession}
              onReset={resetActivity}
              onDelete={isCustom ? () => deleteCustomCategory(cat.id) : undefined}
            />
          )
        })}
      </div>

      {/* Add custom activity button */}
      <button className="dl-add-cat-btn" onClick={() => setShowCatModal(true)}>
        ＋ Add custom activity
      </button>

      <div className="section-label" style={{ marginTop: '20px' }}>Today's note</div>

      <div className="card deviation-note-wrap">
        <label className="deviation-label" htmlFor="deviation-note">
          📝 How did today go? Any deviations from your plan?
        </label>
        <textarea
          id="deviation-note"
          className="deviation-textarea"
          placeholder="e.g. Skipped gym because tired, did home workout instead. Studied 6 hrs but mostly surface-level — need deeper focus tomorrow."
          value={dayData.deviationNote}
          onChange={e => updateDeviationNote(e.target.value)}
          rows={4}
        />
      </div>

      <button className="export-btn" onClick={handleExport}>
        {copied ? '✓ Copied! Paste in Cowork to ask Claude' : '📋 Export for Claude Analysis'}
      </button>

      <p className="export-hint">
        Copies your last 30 days of data. Paste it in the Cowork chat and ask:
        "How am I doing? What should I improve?"
      </p>

      {/* ── Daily Routine Templates ── */}
      <div className="section-label" style={{ marginTop: 20 }}>Daily Routines</div>
      <div className="dl-routines">
        {routines.map(routine => (
          <div key={routine.id} className="dl-routine-card">
            <div className="dl-routine-header" onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}>
              {editingRoutine === routine.id
                ? <input
                    className="dl-routine-name-input"
                    value={routine.name}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateRoutine(routine.id, 'name', e.target.value)}
                  />
                : <span className="dl-routine-name">{routine.name}</span>
              }
              <div className="dl-routine-header-actions">
                <button className="dl-routine-edit-btn" onClick={e => { e.stopPropagation(); setEditingRoutine(editingRoutine === routine.id ? null : routine.id) }}>
                  {editingRoutine === routine.id ? '✓' : '✏'}
                </button>
                <span className={`dl-routine-chevron${expandedRoutine === routine.id ? ' open' : ''}`}>▾</span>
              </div>
            </div>
            {expandedRoutine === routine.id && (
              <div className="dl-routine-steps">
                {routine.steps.map((step, idx) => {
                  const checked = !!routineChecks[`${routine.id}_${idx}`]
                  return (
                    <div key={idx} className={`dl-routine-step${checked ? ' checked' : ''}`}>
                      {editingRoutine === routine.id ? (
                        <>
                          <input
                            className="dl-routine-step-input"
                            value={step}
                            onChange={e => updateRoutineStep(routine.id, idx, e.target.value)}
                          />
                          <button className="dl-routine-step-del" onClick={() => removeRoutineStep(routine.id, idx)}>✕</button>
                        </>
                      ) : (
                        <>
                          <button
                            className={`dl-step-check${checked ? ' done' : ''}`}
                            onClick={() => toggleRoutineCheck(routine.id, idx)}
                          >
                            {checked && <svg viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                          <span className={`dl-routine-step-text${checked ? ' done' : ''}`}>{step}</span>
                        </>
                      )}
                    </div>
                  )
                })}
                {editingRoutine === routine.id && (
                  <button className="dl-routine-add-step" onClick={() => addRoutineStep(routine.id)}>＋ Add step</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Custom category modal ── */}
      {showCatModal && (
        <div className="dl-modal-overlay" onClick={() => setShowCatModal(false)}>
          <div className="dl-modal" onClick={e => e.stopPropagation()}>
            <div className="dl-modal-handle" />
            <div className="dl-modal-title">New Activity</div>

            <div className="dl-form-group">
              <label className="dl-form-label">Name *</label>
              <input className="dl-form-input" placeholder="e.g. Language learning"
                value={catForm.label} autoFocus
                onChange={e => setCatForm(f => ({ ...f, label: e.target.value }))} />
            </div>

            <div className="dl-form-group">
              <label className="dl-form-label">Icon</label>
              <div className="dl-icon-grid">
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} className={`dl-icon-btn${catForm.icon === icon ? ' active' : ''}`}
                    onClick={() => setCatForm(f => ({ ...f, icon }))}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="dl-form-group">
              <label className="dl-form-label">Colour</label>
              <div className="dl-color-row">
                {COLOR_OPTIONS.map(color => (
                  <button key={color} className={`dl-color-btn${catForm.color === color ? ' active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setCatForm(f => ({ ...f, color }))} />
                ))}
              </div>
            </div>

            <div className="dl-form-group">
              <label className="dl-form-label">Daily target (hours, optional)</label>
              <input className="dl-form-input" type="number" step="0.5" min="0" max="24"
                placeholder="e.g. 1" value={catForm.targetHours}
                onChange={e => setCatForm(f => ({ ...f, targetHours: e.target.value }))} />
            </div>

            <div className="dl-modal-actions">
              <button className="dl-btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
              <button className="dl-btn-primary" disabled={!catForm.label.trim()} onClick={() => {
                addCustomCategory({
                  label: catForm.label.trim(),
                  icon: catForm.icon,
                  color: catForm.color,
                  targetHours: parseFloat(catForm.targetHours) || 0,
                  description: '',
                })
                setCatForm({ label: '', icon: '📚', color: COLOR_OPTIONS[0], targetHours: '' })
                setShowCatModal(false)
              }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
