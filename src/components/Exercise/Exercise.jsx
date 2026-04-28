import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useExercise } from '../../hooks/useExercise'
import { DAYS, WALK_INFO, WALK_GOAL_SECS, EXERCISE_LIBRARY, LIBRARY_CATEGORIES } from '../../data/exercises'
import { toDateStr } from '../../utils/dateUtils'
import './Exercise.css'

// ── Formatters ────────────────────────────────────────────────────────────────

function fmtSecs(s) {
  s = Math.max(0, Math.floor(s))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function fmtMin(sec) {
  const m = Math.round(sec / 60)
  return m < 1 && sec > 0 ? '<1 min' : m + ' min'
}

// ── Week Strip ────────────────────────────────────────────────────────────────

function WeekStrip({ currentDate }) {
  const days = useMemo(() => {
    const d = new Date(currentDate)
    const dow = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
    const todayStr = toDateStr(currentDate)
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const ds = toDateStr(date)
      let dot = ''
      try {
        const raw = localStorage.getItem('exercise_' + ds)
        if (raw) {
          const saved = JSON.parse(raw)
          const allEx = (DAYS[saved.dayType]?.phases || []).flatMap(p => p.exercises)
          const done = allEx.filter(ex => saved.exercises?.[ex.id]?.done).length
          dot = done === allEx.length && allEx.length > 0 ? 'done' : done > 0 ? 'partial' : ''
        }
      } catch { /* ignore */ }
      return { label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], ds, date: date.getDate(), dot, isToday: ds === todayStr }
    })
  }, [currentDate])

  return (
    <div className="ec-week-strip">
      <div className="ec-week-inner">
        {days.map((day, i) => (
          <div key={i} className={`ec-week-day${day.isToday ? ' today' : ''}`}>
            <div className="ec-wd-label">{day.label}</div>
            <div className={`ec-wd-num${day.isToday ? ' today' : ''}`}>{day.date}</div>
            <div className={`ec-wd-dot${day.dot ? ' ' + day.dot : ''}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Phase title pill ──────────────────────────────────────────────────────────

function PhasePill({ type, title }) {
  return <div className={`ec-phase-pill ec-phase-pill--${type}`}>{title}</div>
}

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExCard({
  ex, state, exSecs, exRunning, demoUrl, override, dayType,
  expandedId, setExpandedId,
  onToggle, onNoteChange, onDemoChange, onOverride,
  onExTimerToggle, onExTimerReset, onRest,
  custom, onCustomFieldChange, onDelete, onRemove,
  onMoveUp, onMoveDown, isFirst, isLast,
  onPhaseChange, availablePhases,
}) {
  const isExpanded = expandedId === ex.id
  const isDone     = state?.done
  // Apply overrides for standard exercises, or use custom fields directly
  const name   = override?.name   ?? ex.name
  const tag    = override?.tag    ?? ex.tag
  const weight = override?.weight ?? ex.weight
  const rest   = override?.rest   ?? ex.rest
  const posture = ex.posture
  const notes   = ex.notes

  const [editMode, setEditMode] = useState(false)

  return (
    <div className={`ec-card${isDone ? ' done' : ''}${isExpanded ? ' expanded' : ''}`}>
      {/* ── Main row ── */}
      <div className="ec-main">
        {/* Reorder arrows */}
        <div className="ec-move-btns">
          <button className="ec-move-btn" onClick={onMoveUp} disabled={isFirst} title="Move up">▲</button>
          <button className="ec-move-btn" onClick={onMoveDown} disabled={isLast} title="Move down">▼</button>
        </div>

        {/* Check */}
        <button
          className={`ec-check${isDone ? ' done' : ''}`}
          onClick={() => onToggle(ex)}
          aria-label={isDone ? 'Mark undone' : 'Mark done'}
        >
          {isDone && (
            <svg viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Name + tags */}
        <div className="ec-body" onClick={() => setExpandedId(isExpanded ? null : ex.id)} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setExpandedId(isExpanded ? null : ex.id)}>
          <div className={`ec-name${isDone ? ' done' : ''}`}>{name}</div>
          <div className="ec-tags">
            {tag && <span className={`ec-tag ec-tag--${dayType}`}>{tag}</span>}
            {weight && <span className="ec-tag ec-tag--weight">{weight}</span>}
            {rest > 0 && <span className="ec-tag ec-tag--rest">⏸ {rest}s rest</span>}
          </div>
        </div>

        {/* Per-exercise timer */}
        <div className="ec-timer-cell">
          <span className={`ec-timer-time${exSecs > 0 ? ' has-time' : ''}`}>{fmtSecs(exSecs)}</span>
          <button
            className={`ec-timer-btn${exRunning ? ' pause' : ' play'}`}
            onClick={onExTimerToggle}
            aria-label={exRunning ? 'Pause exercise timer' : 'Start exercise timer'}
          >
            {exRunning ? '⏸' : '▶'}
          </button>
        </div>

        {/* Expand */}
        <button
          className="ec-expand-btn"
          onClick={() => setExpandedId(isExpanded ? null : ex.id)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <span className={`ec-chevron${isExpanded ? ' open' : ''}`}>▾</span>
        </button>
      </div>

      {/* ── Expanded detail ── */}
      {isExpanded && (
        <div className="ec-detail">
          {/* Posture */}
          {posture && (
            <div className="ec-detail-section">
              <div className="ec-detail-label">Posture &amp; Form</div>
              <div className="ec-posture-box">{posture}</div>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="ec-detail-section">
              <div className="ec-detail-label">Why + Tips</div>
              <div className="ec-notes-text">{notes}</div>
            </div>
          )}

          {/* Demo area */}
          <div className="ec-detail-section">
            <div className="ec-detail-label">Demo Video / Image</div>
            <div className="ec-demo-area">
              <div className="ec-demo-url-row">
                <input
                  className="ec-demo-url-input"
                  type="url"
                  value={demoUrl || ''}
                  placeholder="Paste YouTube or image URL…"
                  onChange={e => onDemoChange(ex.id, e.target.value)}
                />
                <button
                  className="ec-demo-open-btn"
                  disabled={!demoUrl}
                  onClick={() => demoUrl && window.open(demoUrl, '_blank', 'noopener')}
                >
                  ▶ Open
                </button>
              </div>
            </div>
          </div>

          {/* Edit mode toggle (for standard exercises — override name/sets/weight) */}
          {!custom && (
            <div className="ec-edit-toggle-row">
              <button className="ec-edit-toggle" onClick={() => setEditMode(m => !m)}>
                {editMode ? '✓ Done editing' : '✏ Edit this exercise'}
              </button>
            </div>
          )}

          {/* Edit fields */}
          {(custom || editMode) && (
            <div className="ec-edit-fields">
              <input
                className="ec-edit-input"
                placeholder="Exercise name"
                value={name}
                onChange={e => custom ? onCustomFieldChange(ex.id, 'name', e.target.value) : onOverride(ex.id, 'name', e.target.value)}
              />
              <div className="ec-edit-row">
                <input
                  className="ec-edit-input"
                  placeholder="Sets × reps"
                  value={tag || ''}
                  onChange={e => custom ? onCustomFieldChange(ex.id, 'tag', e.target.value) : onOverride(ex.id, 'tag', e.target.value)}
                />
                <input
                  className="ec-edit-input"
                  placeholder="Weight"
                  value={weight || ''}
                  onChange={e => custom ? onCustomFieldChange(ex.id, 'weight', e.target.value) : onOverride(ex.id, 'weight', e.target.value)}
                />
                <input
                  className="ec-edit-input ec-edit-input--small"
                  placeholder="Rest (s)"
                  type="number"
                  value={rest || ''}
                  onChange={e => {
                    const v = parseInt(e.target.value) || 0
                    custom ? onCustomFieldChange(ex.id, 'rest', v) : onOverride(ex.id, 'rest', v)
                  }}
                />
              </div>
            </div>
          )}

          {/* Rest timer + timer reset row */}
          <div className="ec-rest-trigger-row">
            {rest > 0 && (
              <button className="ec-rest-trigger" onClick={() => onRest(rest)}>
                ⏱ Start {rest}s rest
              </button>
            )}
            {exSecs > 0 && (
              <button className="ec-timer-reset" onClick={() => onExTimerReset(ex.id)}>
                ↺ Reset timer
              </button>
            )}
          </div>

          {/* Personal note */}
          <textarea
            className="ec-personal-note"
            placeholder={`Your note for ${name}…`}
            value={state?.note || ''}
            onChange={e => onNoteChange(ex.id, e.target.value)}
            rows={2}
          />

          {/* Move to phase (custom exercises only) */}
          {custom && availablePhases && (
            <div className="ec-phase-move-row">
              <span className="ec-phase-move-label">Move to section:</span>
              {availablePhases.map(p => (
                <button
                  key={p.type}
                  className={`ec-phase-move-btn${ex.phase === p.type ? ' active' : ''}`}
                  onClick={() => onPhaseChange(ex.id, p.type)}
                >{p.title.split(' ·')[0]}</button>
              ))}
            </div>
          )}

          {/* Delete custom / Remove standard */}
          {custom
            ? <button className="ec-delete-btn" onClick={() => onDelete(ex.id)}>✕ Remove exercise</button>
            : onRemove && <button className="ec-remove-btn" onClick={() => onRemove(ex.id)}>− Hide from today</button>
          }
        </div>
      )}
    </div>
  )
}

// ── Walk card (3-column grid) ──────────────────────────────────────────────────

function WalkCard({ info, secs, running, done, onStart, onStop, onToggle, onReset }) {
  const pct     = Math.min(100, Math.round((secs / WALK_GOAL_SECS) * 100))
  const complete = secs >= WALK_GOAL_SECS

  return (
    <div className={`ec-walk-card${done ? ' done' : ''}${running ? ' running' : ''}`}>
      <div className="ec-wi-top">
        <span className="ec-wi-icon">{info.icon}</span>
        <button
          className={`ec-wi-check${done ? ' done' : ''}`}
          onClick={onToggle}
          aria-label={done ? 'Mark undone' : 'Mark done'}
        >
          {done && <svg viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
      </div>
      <div className="ec-wi-time">{fmtSecs(secs)}</div>
      <div className={`ec-wi-sub${complete ? ' complete' : ''}`}>
        {complete ? '✓ 10 min done!' : pct + '% of 10 min'}
      </div>
      <div className="ec-wi-btn-row">
        <button
          className={`ec-wi-btn${running ? ' stop' : ' start'}`}
          onClick={running ? onStop : onStart}
        >
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        {secs > 0 && !running && (
          <button className="ec-wi-reset" onClick={onReset} title="Reset walk timer">↺</button>
        )}
      </div>
      <div className="ec-wi-label">{info.label}</div>
      <div className="ec-wi-sublabel">{info.sub}</div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Exercise({ currentDate }) {
  const {
    data, sessionRunning, walkRunning, exTimers, demos, overrides,
    progress, doneExercises, totalExercises,
    setDayType, toggleExercise, updateExerciseNote,
    startExTimer, stopExTimer, resetExTimer,
    updateDemoUrl, saveOverride,
    toggleWalk, startWalkTimer, stopWalkTimer, resetWalkTimer,
    startSession, stopSession, resumeSession, resetSession,
    removeExercise, restoreExercise,
    getSortedPhaseExercises, moveExerciseInPhase,
    moveCustomExerciseUp, moveCustomExerciseDown, setCustomExercisePhase,
    addLibraryExercise, addCustomExercise, updateCustomExercise, deleteCustomExercise,
    updateOverallNote,
  } = useExercise(currentDate)

  // Live tick — drives all timer displays
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Rest timer
  const [restTimer, setRestTimer] = useState({ active: false, total: 90, elapsed: 0 })
  const restRef = useRef(null)
  useEffect(() => {
    if (restTimer.active) {
      restRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev.elapsed >= prev.total - 1) { clearInterval(restRef.current); return { ...prev, active: false } }
          return { ...prev, elapsed: prev.elapsed + 1 }
        })
      }, 1000)
    }
    return () => clearInterval(restRef.current)
  }, [restTimer.active, restTimer.total])

  const startRest = useCallback((secs) => {
    clearInterval(restRef.current)
    setRestTimer({ active: true, total: secs, elapsed: 0 })
  }, [])
  const skipRest = useCallback(() => {
    clearInterval(restRef.current)
    setRestTimer(prev => ({ ...prev, active: false }))
  }, [])

  const handleToggle = useCallback((ex) => {
    const wasDone = data.exercises[ex.id]?.done
    toggleExercise(ex.id)
    const rest = overrides[ex.id]?.rest ?? ex.rest
    if (!wasDone && rest > 0) startRest(rest)
  }, [data.exercises, toggleExercise, overrides, startRest])

  // Expand
  const [expandedId, setExpandedId] = useState(null)

  // Add exercise modal
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('library')
  const [libCat, setLibCat] = useState('all')
  const [form, setForm] = useState({ name: '', tag: '', weight: '', rest: '', notes: '' })

  // Live session elapsed
  const sessionElapsed = sessionRunning
    ? (data.sessionSecs || 0) + Math.floor((Date.now() - sessionRunning.startTs) / 1000)
    : (data.sessionSecs || 0)

  // Live walk secs
  const getWalkSecs = (idx) => {
    const startTs = walkRunning[idx]
    return startTs
      ? (data.walks[idx]?.secs || 0) + Math.floor((Date.now() - startTs) / 1000)
      : (data.walks[idx]?.secs || 0)
  }

  // Live exercise secs
  const getExSecs = (id) => {
    const t = exTimers[id]
    return t?.startTs
      ? (t.accumulated || 0) + Math.floor((Date.now() - t.startTs) / 1000)
      : (t?.accumulated || 0)
  }

  const day = DAYS[data.dayType]
  const totalWalkSecs = [0, 1, 2].reduce((sum, i) => sum + getWalkSecs(i), 0)

  return (
    <div className="exercise">

      {/* ── Day type selector ── */}
      <div className="ec-day-grid">
        {Object.entries(DAYS).map(([key, d]) => (
          <div
            key={key}
            className={`ec-day-tab${data.dayType === key ? ' active' : ''}`}
            data-day={key}
            onClick={() => setDayType(key)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setDayType(key)}
          >
            <div className="ec-dt-letter">Day {key}</div>
            <div className="ec-dt-name">{d.label}</div>
            <div className="ec-dt-dur">{d.duration}</div>
          </div>
        ))}
      </div>

      {/* ── Week strip ── */}
      <WeekStrip currentDate={currentDate} />

      {/* ── Progress in header-like bar ── */}
      <div className="ec-progress-bar-wrap">
        <div className="ec-progress-bar-bg">
          <div className="ec-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="ec-progress-meta">
          <span>{progress === 0 ? 'Tap an exercise to begin' : `${doneExercises}/${totalExercises} exercises done`}</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* ── Session timer pill ── */}
      <div className="ec-session-pill-wrap">
        <div
          className={`ec-session-pill${sessionRunning ? ' running' : ''}`}
          onClick={sessionElapsed === 0 ? startSession : sessionRunning ? stopSession : resumeSession}
          title={sessionRunning ? 'Tap to pause' : sessionElapsed > 0 ? 'Tap to resume' : 'Tap to start session'}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && (sessionElapsed === 0 ? startSession() : sessionRunning ? stopSession() : resumeSession())}
        >
          <div className={`ec-sp-dot${sessionRunning ? ' running' : ''}`} />
          <div>
            <div className="ec-sp-label">Session</div>
            <div className="ec-sp-time">{fmtSecs(sessionElapsed)}</div>
          </div>
        </div>
        {sessionElapsed > 0 && (
          <button className="ec-session-reset" onClick={resetSession} title="Reset session timer">↺</button>
        )}
      </div>

      {/* ── Exercises ── */}
      <div className="ec-main-content">
        {day.phases.map((phase, pi) => {
          const removed = data.removedExercises || []
          const sorted   = getSortedPhaseExercises(data.dayType, phase.type, phase.exercises)
          const visibleExs = sorted.filter(ex => !removed.includes(ex.id))
          const hiddenExs  = sorted.filter(ex => removed.includes(ex.id))
          return (
            <div key={pi} className="ec-phase-group">
              <PhasePill type={phase.type} title={phase.title} />
              {visibleExs.map((ex, idx) => (
                <ExCard
                  key={ex.id}
                  ex={ex}
                  state={data.exercises[ex.id]}
                  exSecs={getExSecs(ex.id)}
                  exRunning={!!exTimers[ex.id]?.startTs}
                  demoUrl={demos[ex.id] ?? ex.demo}
                  override={overrides[ex.id]}
                  dayType={data.dayType}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onToggle={handleToggle}
                  onNoteChange={updateExerciseNote}
                  onDemoChange={updateDemoUrl}
                  onOverride={saveOverride}
                  onExTimerToggle={() => exTimers[ex.id]?.startTs ? stopExTimer(ex.id) : startExTimer(ex.id)}
                  onExTimerReset={resetExTimer}
                  onRest={startRest}
                  custom={false}
                  onRemove={removeExercise}
                  isFirst={idx === 0}
                  isLast={idx === visibleExs.length - 1}
                  onMoveUp={() => moveExerciseInPhase(data.dayType, phase.type, ex.id, 'up')}
                  onMoveDown={() => moveExerciseInPhase(data.dayType, phase.type, ex.id, 'down')}
                />
              ))}
              {hiddenExs.length > 0 && (
                <div className="ec-hidden-exs">
                  {hiddenExs.map(ex => (
                    <button key={ex.id} className="ec-restore-btn" onClick={() => restoreExercise(ex.id)}>
                      + Restore: {overrides[ex.id]?.name ?? ex.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Custom exercises — grouped by phase */}
        {(data.customExercises?.length || 0) > 0 && (() => {
          const availablePhases = day.phases.map(p => ({ type: p.type, title: p.title }))
          // Group custom exercises by their assigned phase (default to 'main')
          const byPhase = {}
          day.phases.forEach(p => { byPhase[p.type] = [] })
          byPhase['_ungrouped'] = []
          ;(data.customExercises || []).forEach(ex => {
            const ph = ex.phase && byPhase[ex.phase] !== undefined ? ex.phase : '_ungrouped'
            byPhase[ph].push(ex)
          })
          const allCustom = day.phases.flatMap(p => byPhase[p.type]).concat(byPhase['_ungrouped'])
          return (
            <div className="ec-phase-group">
              <PhasePill type="home" title="Added by Me" />
              {allCustom.map((ex, idx) => (
                <ExCard
                  key={ex.id}
                  ex={ex}
                  state={data.exercises[ex.id]}
                  exSecs={getExSecs(ex.id)}
                  exRunning={!!exTimers[ex.id]?.startTs}
                  demoUrl={demos[ex.id] || ''}
                  override={{}}
                  dayType={data.dayType}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  onToggle={ex2 => toggleExercise(ex2.id)}
                  onNoteChange={updateExerciseNote}
                  onDemoChange={updateDemoUrl}
                  onOverride={() => {}}
                  onExTimerToggle={() => exTimers[ex.id]?.startTs ? stopExTimer(ex.id) : startExTimer(ex.id)}
                  onExTimerReset={resetExTimer}
                  onRest={startRest}
                  custom
                  onCustomFieldChange={updateCustomExercise}
                  onDelete={deleteCustomExercise}
                  isFirst={idx === 0}
                  isLast={idx === allCustom.length - 1}
                  onMoveUp={() => moveCustomExerciseUp(ex.id)}
                  onMoveDown={() => moveCustomExerciseDown(ex.id)}
                  onPhaseChange={setCustomExercisePhase}
                  availablePhases={availablePhases}
                />
              ))}
            </div>
          )
        })()}

        {/* Add exercise button */}
        <button className="ec-add-btn" onClick={() => setShowModal(true)}>
          <span>＋</span> Add Exercise
        </button>

        {/* ── Walks ── */}
        <div className="ec-section-card">
          <div className="ec-sec-label">Daily Walks · 10 min each</div>
          <div className="ec-walks-grid">
            {WALK_INFO.map((info, idx) => (
              <WalkCard
                key={idx}
                info={info}
                secs={getWalkSecs(idx)}
                running={!!walkRunning[idx]}
                done={data.walks[idx]?.done}
                onStart={() => startWalkTimer(idx)}
                onStop={() => stopWalkTimer(idx)}
                onToggle={() => toggleWalk(idx)}
                onReset={() => resetWalkTimer(idx)}
              />
            ))}
          </div>
          <div className="ec-walk-summary">
            <span>🚶 Total walked: <strong>{fmtMin(totalWalkSecs)}</strong> ({fmtSecs(totalWalkSecs)})</span>
          </div>
        </div>

        {/* ── Overall note ── */}
        <div className="ec-section-card">
          <div className="ec-sec-label">Day Notes</div>
          <textarea
            className="ec-overall-note"
            placeholder="How did today's workout go? Adjustments for next time?"
            value={data.overallNote}
            onChange={e => updateOverallNote(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* ── Fixed bottom panel: rest timer ── */}
      {restTimer.active && (
        <div className="ec-timer-panel">
          <div className="ec-timer-panel-inner">
            {/* Session quick controls */}
            <div className="ec-sw-block">
              <div className="ec-sw-top">
                <span className="ec-sw-lbl">Session</span>
                <span className="ec-sw-time">{fmtSecs(sessionElapsed)}</span>
              </div>
              <div className="ec-sw-controls">
                {sessionElapsed === 0
                  ? <button className="ec-sw-btn start" onClick={startSession}>Start</button>
                  : sessionRunning
                    ? <button className="ec-sw-btn pause" onClick={stopSession}>Pause</button>
                    : <button className="ec-sw-btn start" onClick={resumeSession}>Resume</button>
                }
              </div>
            </div>

            {/* Rest timer */}
            <div className="ec-rest-block">
              <div className="ec-rest-lbl">Rest</div>
              <div className="ec-rest-circle-wrap" onClick={skipRest} title="Tap to skip">
                <svg className="ec-rest-svg" viewBox="0 0 58 58">
                  <circle className="ec-rest-bg" cx="29" cy="29" r="25" />
                  <circle
                    className="ec-rest-fg"
                    cx="29" cy="29" r="25"
                    strokeDasharray={2 * Math.PI * 25}
                    strokeDashoffset={2 * Math.PI * 25 * (restTimer.elapsed / restTimer.total)}
                    transform="rotate(-90 29 29)"
                  />
                </svg>
                <div className="ec-rest-inner">
                  <div className="ec-rest-time">{Math.max(0, restTimer.total - restTimer.elapsed)}</div>
                  <div className="ec-rest-action">tap skip</div>
                </div>
              </div>
              <div className="ec-rest-presets">
                {[60, 90, 120].map(s => (
                  <button
                    key={s}
                    className={`ec-rest-preset${restTimer.total === s ? ' active' : ''}`}
                    onClick={() => startRest(s)}
                  >
                    {s === 60 ? '1m' : s === 90 ? '90s' : '2m'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add exercise modal ── */}
      {showModal && (
        <div className="ec-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ec-modal" onClick={e => e.stopPropagation()}>
            <div className="ec-modal-handle" />
            <div className="ec-modal-title">Add Exercise</div>

            {/* Tabs */}
            <div className="ec-modal-tabs">
              <button className={`ec-modal-tab${modalTab === 'library' ? ' active' : ''}`} onClick={() => setModalTab('library')}>From Library</button>
              <button className={`ec-modal-tab${modalTab === 'custom' ? ' active' : ''}`} onClick={() => setModalTab('custom')}>Custom</button>
            </div>

            {modalTab === 'library' ? (
              <>
                {/* Category filter */}
                <div className="ec-lib-cats">
                  <button className={`ec-lib-cat${libCat === 'all' ? ' active' : ''}`} onClick={() => setLibCat('all')}>All</button>
                  {LIBRARY_CATEGORIES.map(cat => (
                    <button key={cat.key} className={`ec-lib-cat${libCat === cat.key ? ' active' : ''}`} onClick={() => setLibCat(cat.key)}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
                {/* Exercise list */}
                <div className="ec-lib-list">
                  {EXERCISE_LIBRARY.filter(ex => libCat === 'all' || ex.category === libCat).map(ex => {
                    const catLabel = LIBRARY_CATEGORIES.find(c => c.key === ex.category)
                    return (
                      <div key={ex.id} className="ec-lib-item">
                        <div className="ec-lib-item-info">
                          <div className="ec-lib-item-name">{ex.name}</div>
                          <div className="ec-lib-item-tag">
                            {catLabel && <span className="ec-lib-item-cat">{catLabel.icon} {catLabel.label}</span>}
                            {ex.tag && <span>{ex.tag}</span>}
                            {ex.weight && <span>· {ex.weight}</span>}
                          </div>
                        </div>
                        <button className="ec-lib-add-btn" onClick={() => { addLibraryExercise(ex); setShowModal(false) }}>
                          + Add
                        </button>
                      </div>
                    )
                  })}
                </div>
                <button className="ec-btn-secondary" style={{ marginTop: 12 }} onClick={() => setShowModal(false)}>Close</button>
              </>
            ) : (
              <>
                {['name', 'tag', 'weight', 'notes'].map(field => (
                  <div key={field} className="ec-form-group">
                    <label className="ec-form-label">{
                      field === 'name' ? 'Exercise name *' :
                      field === 'tag' ? 'Sets × reps (e.g. 3 × 12)' :
                      field === 'weight' ? 'Weight (e.g. 10 kg)' : 'Notes'
                    }</label>
                    {field === 'notes' ? (
                      <textarea className="ec-form-input" rows={2} value={form[field]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                    ) : (
                      <input className="ec-form-input" value={form[field]} autoFocus={field === 'name'}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                    )}
                  </div>
                ))}
                <div className="ec-form-group">
                  <label className="ec-form-label">Rest (seconds)</label>
                  <input className="ec-form-input" type="number" placeholder="e.g. 90" value={form.rest}
                    onChange={e => setForm(f => ({ ...f, rest: e.target.value }))} />
                </div>
                <div className="ec-modal-actions">
                  <button className="ec-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="ec-btn-primary" disabled={!form.name.trim()} onClick={() => {
                    addCustomExercise({ ...form, rest: parseInt(form.rest) || 0 })
                    setForm({ name: '', tag: '', weight: '', rest: '', notes: '' })
                    setShowModal(false)
                  }}>Add</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
