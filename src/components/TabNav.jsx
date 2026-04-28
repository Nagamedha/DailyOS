import React from 'react'
import './TabNav.css'

const TABS = [
  { id: 'daily',     label: 'Daily',     icon: '📅' },
  { id: 'exercise',  label: 'Exercise',  icon: '🏋️' },
  { id: 'meals',     label: 'Meals',     icon: '🍽️' },
  { id: 'finance',   label: 'Finance',   icon: '💰' },
  { id: 'journal',   label: 'Journal',   icon: '📓' },
  { id: 'analytics', label: 'Stats',     icon: '📊' },
  { id: 'chat',      label: 'Coach',     icon: '🤖' },
]

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav" aria-label="Main navigation">
      <div className="tab-nav-inner">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
