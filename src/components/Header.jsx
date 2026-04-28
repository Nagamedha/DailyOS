// ─────────────────────────────────────────────────────────────────────────────
// Header.jsx — Sticky top bar
//
// Displays:
//   • App title "DailyOS"
//   • Date navigation (previous day ‹, date display, next day ›)
//   • "Today" button (appears when viewing a past date)
//
// Props:
//   currentDate  {Date}            — the date currently being viewed
//   onDateChange {(Date) => void}  — called when user navigates to a new date
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef } from 'react'
import { toDisplayDate, prevDay, nextDay, isToday, toDateStr } from '../utils/dateUtils'
import './Header.css'

export default function Header({ currentDate, onDateChange }) {
  const dateInputRef = useRef(null)
  const displayDate  = toDisplayDate(currentDate)

  function openPicker() {
    const el = dateInputRef.current
    if (!el) return
    if (el.showPicker) el.showPicker()
    else el.click()
  }

  function handlePickerChange(e) {
    if (!e.target.value) return
    const [y, m, d] = e.target.value.split('-').map(Number)
    onDateChange(new Date(y, m - 1, d))
  }

  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="app-title">Daily<em>OS</em></h1>

        <div className="date-nav">
          <button
            className="date-nav-btn"
            onClick={() => onDateChange(prevDay(currentDate))}
            aria-label="Go to previous day"
          >
            ‹
          </button>

          <div className="date-center">
            {/* Tap to open native date picker */}
            <div className="d-date d-date--picker" onClick={openPicker} title="Tap to pick any date">
              {displayDate} <span className="d-cal-icon">📅</span>
            </div>
            {!isToday(currentDate) && (
              <button className="today-btn" onClick={() => onDateChange(new Date())}>Today</button>
            )}
            <input
              ref={dateInputRef}
              type="date"
              value={toDateStr(currentDate)}
              onChange={handlePickerChange}
              className="date-input-hidden"
              aria-label="Pick a date"
            />
          </div>

          {/* Forward arrow — no restriction, can navigate to future */}
          <button
            className="date-nav-btn"
            onClick={() => onDateChange(nextDay(currentDate))}
            aria-label="Go to next day"
          >
            ›
          </button>
        </div>
      </div>
    </header>
  )
}
