import React, { useState } from 'react'
import Header    from './components/Header'
import TabNav    from './components/TabNav'
import DailyLog  from './components/DailyLog/DailyLog'
import Exercise  from './components/Exercise/Exercise'
import Meals     from './components/Meals/Meals'
import Finance   from './components/Finance/Finance'
import Journal   from './components/Journal/Journal'
import Analytics from './components/Analytics/Analytics'
import Chat      from './components/Chat/Chat'

const TABS = {
  DAILY:     'daily',
  EXERCISE:  'exercise',
  MEALS:     'meals',
  FINANCE:   'finance',
  JOURNAL:   'journal',
  ANALYTICS: 'analytics',
  CHAT:      'chat',
}

export default function App() {
  const [activeTab, setActiveTab]   = useState(TABS.DAILY)
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div className="app">
      <Header currentDate={currentDate} onDateChange={setCurrentDate} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        {activeTab === TABS.DAILY     && <DailyLog  currentDate={currentDate} />}
        {activeTab === TABS.EXERCISE  && <Exercise  currentDate={currentDate} />}
        {activeTab === TABS.MEALS     && <Meals     currentDate={currentDate} />}
        {activeTab === TABS.FINANCE   && <Finance   currentDate={currentDate} />}
        {activeTab === TABS.JOURNAL   && <Journal   currentDate={currentDate} />}
        {activeTab === TABS.ANALYTICS && <Analytics />}
        {activeTab === TABS.CHAT      && <Chat />}
      </main>
    </div>
  )
}
