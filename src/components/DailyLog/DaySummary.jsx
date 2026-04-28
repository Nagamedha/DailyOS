// ─────────────────────────────────────────────────────────────────────────────
// DaySummary.jsx — Summary card shown at the top of the Daily Log tab
//
// Displays:
//   • Total hours logged out of 24
//   • A coloured bar showing the breakdown by category
//   • Count of targets hit
//   • Mood selector
//
// Props:
//   totalHours      {number}            — total logged hours for the day
//   targetsHit      {number}            — how many categories met their target
//   totalTargets    {number}            — how many categories have a target
//   mood            {string}            — current mood value
//   onMoodChange    {(string) => void}  — called when user picks a mood
//   activities      {object}            — activities map from dayData
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react'
import { CATEGORIES } from '../../data/categories'
import './DailyLog.css'

const MOODS = [
  { id: 'great', label: '🌟', title: 'Great day!',   desc: 'Productive & energised — everything clicked' },
  { id: 'good',  label: '😊', title: 'Good day',     desc: 'Solid progress, felt balanced and capable' },
  { id: 'okay',  label: '😐', title: 'Just okay',    desc: 'Got through it, nothing remarkable either way' },
  { id: 'tough', label: '😓', title: 'Tough day',    desc: 'Low energy or stress made things harder today' },
]

export default function DaySummary({
  totalHours,
  targetsHit,
  totalTargets,
  mood,
  onMoodChange,
  activities,
}) {
  // Percentage of the day logged (capped at 100%)
  const loggedPct = Math.min(100, (totalHours / 24) * 100)

  // Build colour segments for the breakdown bar
  // Each category gets a slice proportional to its logged hours
  const segments = CATEGORIES
    .filter(cat => (activities[cat.id]?.hours || 0) > 0)
    .map(cat => ({
      color: cat.color,
      pct: ((activities[cat.id]?.hours || 0) / 24) * 100,
      label: cat.label,
    }))

  return (
    <div className="day-summary-card">
      {/* ── Row 1: hours + mood ── */}
      <div className="ds-row">
        <div className="ds-hours-block">
          <span className="ds-hours-value">{totalHours.toFixed(1)}</span>
          <span className="ds-hours-label">/ 24 hrs logged</span>
        </div>

        {/* Mood selector */}
        <div className="ds-mood">
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`mood-btn ${mood === m.id ? 'active' : ''}`}
              onClick={() => onMoodChange(mood === m.id ? '' : m.id)}
              title={`${m.title} — ${m.desc}`}
              aria-label={m.title}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mood && (
          <div className="ds-mood-desc">{MOODS.find(m => m.id === mood)?.desc}</div>
        )}
      </div>

      {/* ── Hour breakdown bar ── */}
      <div className="ds-bar-wrap" title={`${totalHours.toFixed(1)} of 24 hrs`}>
        {/* Background track (remaining unlogged time) */}
        <div className="ds-bar-bg">
          {/* Colour segments for each logged category */}
          {segments.map((seg, i) => (
            <div
              key={i}
              className="ds-bar-seg"
              style={{ width: `${seg.pct}%`, background: seg.color }}
              title={`${seg.label}: ${((seg.pct / 100) * 24).toFixed(1)} hrs`}
            />
          ))}
        </div>
      </div>

      {/* ── Targets hit ── */}
      <div className="ds-targets">
        <span className="ds-targets-text">
          {targetsHit === 0
            ? 'No targets hit yet — start logging!'
            : targetsHit === totalTargets
            ? `🎯 All ${totalTargets} targets hit! Amazing day.`
            : `🎯 ${targetsHit} of ${totalTargets} targets hit`}
        </span>
      </div>
    </div>
  )
}
