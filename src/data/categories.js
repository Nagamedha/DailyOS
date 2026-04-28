// ─────────────────────────────────────────────────────────────────────────────
// categories.js — Activity category definitions for the Daily Log
//
// ✏️  TO EDIT: This is the ONLY file you need to change to add, rename,
//    or remove a category. The Daily Log component reads this automatically.
//
// FIELDS:
//   id          — unique key saved in localStorage. DO NOT change this once
//                 you have data, or old entries will not load correctly.
//   label       — displayed name on the card
//   icon        — emoji shown on the left of each row
//   color       — hex colour for the category accent stripe
//   targetHours — suggested daily hours shown as a guide (not enforced)
//   description — small hint text shown below the label
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: 'study',
    label: 'Study & Learning',
    icon: '📚',
    color: '#5a4e88',
    targetHours: 6,
    description: 'Courses, reading, skill-building, project work',
  },
  {
    id: 'jobs',
    label: 'Job Applications',
    icon: '💼',
    color: '#3d6b47',
    targetHours: 1.5,
    description: 'Applying, tailoring resumes, follow-ups, interviews',
  },
  {
    id: 'exercise',
    label: 'Exercise & Walk',
    icon: '🏋️',
    color: '#c05a30',
    targetHours: 1,
    description: 'Gym, home workout, post-meal walks',
  },
  {
    id: 'cook',
    label: 'Cook & Eat',
    icon: '🍳',
    color: '#8a6a30',
    targetHours: 1.5,
    description: 'Cooking, eating, meal prep, washing up',
  },
  {
    id: 'family',
    label: 'Family & Social',
    icon: '📞',
    color: '#e07070',
    targetHours: 1,
    description: 'Calls with parents, time with partner, social',
  },
  {
    id: 'chores',
    label: 'Household Chores',
    icon: '🏠',
    color: '#718096',
    targetHours: 0.5,
    description: 'Cleaning, laundry, errands, admin tasks',
  },
  {
    id: 'relax',
    label: 'Relax & Recharge',
    icon: '😌',
    color: '#4a90c4',
    targetHours: 1,
    description: 'TV, social media, reading for fun, downtime',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    icon: '😴',
    color: '#2d3748',
    targetHours: 7,
    description: 'Actual sleep time including any naps',
  },
  {
    id: 'other',
    label: 'Other',
    icon: '🔧',
    color: '#aaaaaa',
    targetHours: 0,
    description: 'Anything that does not fit the categories above',
  },
]

// Convenience: total of all target hours across categories
// Used to calculate how much of the day is "planned"
export const TOTAL_TARGET_HOURS = CATEGORIES.reduce(
  (sum, cat) => sum + cat.targetHours,
  0
)
