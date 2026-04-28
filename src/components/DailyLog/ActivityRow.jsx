import React, { useState, useEffect, useRef } from 'react'
import './DailyLog.css'

// ── Formatters ──────────────────────────────────────────────────────────────

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ActivityRow({
  category,
  hours,
  notes,
  sessions = [],
  timerRunning = false,
  timerStart = null,
  onHoursChange,
  onNotesChange,
  onStartTimer,
  onStopTimer,
  onDeleteSession,
  onEditSession,
  onReset,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const intervalRef = useRef(null)

  // Live elapsed counter
  useEffect(() => {
    if (timerRunning && timerStart) {
      const tick = () => setElapsed(Date.now() - timerStart)
      tick()
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
      setElapsed(0)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning, timerStart])

  const hasHours   = hours > 0
  const targetMet  = category.targetHours > 0 && hours >= category.targetHours
  const overTarget = hours > category.targetHours && category.targetHours > 0

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleHoursInput(e) {
    const raw = e.target.value
    if (raw === '') { onHoursChange(category.id, 0); return }
    const val = parseFloat(raw)
    if (!isNaN(val) && val >= 0 && val <= 24) onHoursChange(category.id, val)
  }

  function handleTimerClick(e) {
    e.stopPropagation()
    if (timerRunning) onStopTimer(category.id)
    else onStartTimer(category.id)
  }

  function handleReset(e) {
    e.stopPropagation()
    if (window.confirm(`Reset all sessions and hours for "${category.label}"?`)) {
      onReset(category.id)
    }
  }

  function startEdit(session) {
    setEditingId(session.id)
    setEditStart(session.startTime)
    setEditEnd(session.endTime)
  }

  function saveEdit(sessionId) {
    if (!editStart || !editEnd) { setEditingId(null); return }
    const [sh, sm] = editStart.split(':').map(Number)
    const [eh, em] = editEnd.split(':').map(Number)
    let mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins <= 0) mins += 24 * 60
    onEditSession(category.id, sessionId, editStart, editEnd, mins)
    setEditingId(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className={[
        'activity-row',
        hasHours   ? 'has-hours'     : '',
        targetMet  ? 'target-met'   : '',
        timerRunning ? 'timer-active' : '',
      ].join(' ')}
      style={{ '--cat-color': category.color }}
    >
      {/* ── Main row ── */}
      <div
        className="ar-main"
        onClick={() => setExpanded(p => !p)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(p => !p)}
      >
        {/* Left: icon + label + target */}
        <div className="ar-left">
          <span className="ar-icon" aria-hidden="true">{category.icon}</span>
          <div className="ar-text">
            <span className="ar-label">{category.label}</span>
            {category.targetHours > 0 && (
              <span className="ar-target">
                target {category.targetHours} hr{category.targetHours !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right: timer btn + hours input + expand */}
        <div className="ar-right" onClick={e => e.stopPropagation()}>
          {targetMet && (
            <span className="ar-badge" title={overTarget ? 'Over target!' : 'Target met!'}>
              {overTarget ? '⭐' : '✓'}
            </span>
          )}

          {/* Timer button */}
          <button
            className={`ar-timer-btn${timerRunning ? ' running' : ''}`}
            onClick={handleTimerClick}
            title={timerRunning ? 'Stop timer' : 'Start timer'}
            aria-label={timerRunning ? `Stop timer — ${formatElapsed(elapsed)}` : 'Start timer'}
          >
            {timerRunning
              ? <span className="ar-elapsed">{formatElapsed(elapsed)}</span>
              : <span className="ar-timer-icon">▶</span>
            }
          </button>

          {/* Direct number input */}
          <div className="ar-input-wrap">
            <input
              className="ar-hours-input"
              type="number"
              min="0"
              max="24"
              step="0.25"
              value={hours === 0 ? '' : hours}
              placeholder="0"
              onChange={handleHoursInput}
              aria-label={`Hours for ${category.label}`}
            />
            <span className="ar-hours-unit">h</span>
          </div>

          <button
            className={`ar-expand-btn${expanded ? ' open' : ''}`}
            onClick={e => { e.stopPropagation(); setExpanded(p => !p) }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* ── Expanded: sessions + notes ── */}
      {expanded && (
        <div className="ar-expanded">
          {sessions.length > 0 && (
            <div className="ar-sessions">
              <div className="ar-sessions-hdr">
                <span className="ar-sessions-title">Timed sessions</span>
                <button className="ar-reset-btn" onClick={handleReset}>Reset all</button>
              </div>

              {sessions.map(session => (
                <div key={session.id} className="ar-session-row">
                  {editingId === session.id ? (
                    <div className="ar-session-edit">
                      <input
                        type="time"
                        value={editStart}
                        onChange={e => setEditStart(e.target.value)}
                        className="ar-time-input"
                      />
                      <span className="ar-session-arrow">→</span>
                      <input
                        type="time"
                        value={editEnd}
                        onChange={e => setEditEnd(e.target.value)}
                        className="ar-time-input"
                      />
                      <button className="ar-session-save" onClick={() => saveEdit(session.id)}>✓</button>
                      <button className="ar-session-cancel" onClick={() => setEditingId(null)}>✕</button>
                    </div>
                  ) : (
                    <>
                      <span className="ar-session-times">
                        {session.startTime} → {session.endTime}
                      </span>
                      <span className="ar-session-dur">{minutesToLabel(session.minutes)}</span>
                      <button
                        className="ar-session-edit-btn"
                        onClick={() => startEdit(session)}
                        title="Edit session"
                      >✎</button>
                      <button
                        className="ar-session-del-btn"
                        onClick={() => onDeleteSession(category.id, session.id)}
                        title="Delete session"
                      >×</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="ar-notes-wrap">
            <textarea
              className="ar-notes-input"
              placeholder={`Notes for ${category.label}…`}
              value={notes}
              onChange={e => onNotesChange(category.id, e.target.value)}
              rows={3}
              autoFocus={sessions.length === 0}
            />
          </div>

          {onDelete && (
            <button className="ar-delete-cat-btn" onClick={() => {
              if (window.confirm(`Remove "${category.label}" activity?`)) onDelete()
            }}>
              ✕ Remove this activity
            </button>
          )}
        </div>
      )}
    </div>
  )
}
