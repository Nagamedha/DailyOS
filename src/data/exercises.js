// Exercise database — personalised for Medha (58 kg / 5'6")
// Ported from exercise_tracker.html

export const DAYS = {
  A: {
    label: 'Legs & Glutes',
    duration: '40 min',
    color: '#3d6b47',
    bg: '#e8f0e9',
    phases: [
      {
        type: 'warmup',
        title: 'Warm-up · 5 min',
        exercises: [
          { id: 'a-w1', name: 'Treadmill Walk (Warm-up)', tag: '3 min', weight: null, rest: 0, notes: 'Incline 1 · speed 3.5 · never start cold with low iron', posture: 'Walk upright, shoulders back. Heel-to-toe stride. Arms swing naturally. Breathe through your nose.', demo: 'https://www.youtube.com/results?search_query=treadmill+walking+proper+form+beginner' },
          { id: 'a-w2', name: 'Hip Circles + Leg Swings', tag: '2 min', weight: null, rest: 0, notes: '10 circles each direction · 10 leg swings each leg', posture: 'Hip circles: hands on hips, draw big slow circles. Leg swings: hold wall for balance, swing leg forward-back like a pendulum.', demo: 'https://www.youtube.com/results?search_query=hip+circles+leg+swings+warm+up+mobility' },
        ],
      },
      {
        type: 'main',
        title: 'Main — Legs, Glutes & Pelvic · 28 min',
        exercises: [
          { id: 'a-m1', name: 'Leg Press Machine', tag: '3 × 15', weight: '30–35 kg', rest: 90, notes: '#1 glute & delivery strength move. Start 30 kg, increase to 35 kg when easy.', posture: 'Sit back FULLY against pad. Feet hip-width on platform. Lower until knees ~90°. PUSH THROUGH HEELS. 2 sec push, 3 sec lower. Do NOT lock knees at top.', demo: 'https://www.youtube.com/results?search_query=leg+press+machine+proper+form+women+gym' },
          { id: 'a-m2', name: 'Adductor Machine (Push Together)', tag: '3 × 20', weight: '23 kg', rest: 90, notes: 'Inner thigh + pelvic floor. Slow and controlled beats heavy.', posture: 'Sit tall, back against pad. SLOWLY bring knees together (2 sec) squeeze at end. Slowly open (3 sec). Don\'t let weight crash. Exhale as you close.', demo: 'https://www.youtube.com/results?search_query=adductor+machine+inner+thigh+proper+form+women' },
          { id: 'a-m3', name: 'Abductor Machine (Push Apart)', tag: '3 × 20', weight: '9 kg', rest: 90, notes: 'Outer glutes + hip stability. Light weight — this muscle is smaller.', posture: 'Sit tall, back against pad. SLOWLY push knees apart (2 sec) squeeze outer glutes. Slowly return (3 sec). Spine straight throughout.', demo: 'https://www.youtube.com/results?search_query=abductor+machine+outer+glute+form+women' },
          { id: 'a-m4', name: 'Dumbbell Sumo Squat', tag: '2 × 15', weight: '6–8 kg', rest: 90, notes: 'Wide stance, toes out 45°. Hold one dumbbell at chest or two at sides. Sit DEEP.', posture: 'Feet wider than shoulders, toes out 45°. Hold dumbbell goblet-style at chest. SIT DOWN between heels. Knees track over toes. Chest proud. Push through heels.', demo: 'https://www.youtube.com/results?search_query=dumbbell+sumo+squat+goblet+form+women+gym' },
          { id: 'a-m5', name: 'Glute Bridge', tag: '3 × 20', weight: 'Bodyweight', rest: 60, notes: 'Most important pelvic floor + glute exercise. 2 sec hold at top.', posture: 'Lie on back. Feet hip-width, knees bent 90°. Drive hips UP through heels. SQUEEZE glutes — hold 2 sec at top. Lower slowly (3 sec). Back flat, no arching.', demo: 'https://www.youtube.com/results?search_query=glute+bridge+proper+form+pelvic+floor+women' },
        ],
      },
      {
        type: 'cooldown',
        title: 'Cooldown + Kegels · 7 min',
        exercises: [
          { id: 'a-c1', name: 'Treadmill Slow Walk (Cooldown)', tag: '4 min', weight: null, rest: 0, notes: 'Speed 3, flat. Safely lowers heart rate.', posture: 'Easy, relaxed pace. Breathe slowly and deeply. Never stop abruptly with low iron.', demo: 'https://www.youtube.com/results?search_query=cool+down+walk+after+workout+treadmill' },
          { id: 'a-c2', name: 'Butterfly Stretch', tag: '45 sec hold', weight: null, rest: 0, notes: 'Seated, soles together. Pelvic floor release.', posture: 'Sit on floor, soles of feet together, knees fall open. Sit tall. Gentle forward fold. Hold 45 sec. Don\'t bounce or force knees.', demo: 'https://www.youtube.com/results?search_query=butterfly+stretch+baddha+konasana+seated+yoga' },
          { id: 'a-c3', name: 'Kegel Holds', tag: '10 × 5 sec', weight: null, rest: 0, notes: '#1 delivery prep exercise. Invisible — do anywhere.', posture: 'Squeeze the muscles you use to stop urination. Hold 5 sec. FULLY release 5 sec. Repeat 10 times. Don\'t hold breath or clench glutes.', demo: 'https://www.youtube.com/results?search_query=kegel+exercises+how+to+correctly+women+tutorial' },
        ],
      },
    ],
  },

  B: {
    label: 'Upper Body & Core',
    duration: '40 min',
    color: '#5a4e88',
    bg: '#f0edf8',
    phases: [
      {
        type: 'warmup',
        title: 'Warm-up · 5 min',
        exercises: [
          { id: 'b-w1', name: 'Treadmill Walk (Warm-up)', tag: '3 min', weight: null, rest: 0, notes: 'Speed 3.5 — warms shoulders + spine', posture: 'Upright, easy walking. Shoulders rolled back and down. Arms swing freely.', demo: 'https://www.youtube.com/results?search_query=treadmill+warm+up+walking+upper+body+workout' },
          { id: 'b-w2', name: 'Arm Circles + Head Turns + Cat-Cow', tag: '2 min', weight: null, rest: 0, notes: '10 each. Warms shoulder joint + spine.', posture: 'Arm circles: small to large, both directions. Head turns: slow side-to-side. Cat-cow: on all fours, inhale arch (cow), exhale round (cat).', demo: 'https://www.youtube.com/results?search_query=arm+circles+shoulder+warm+up+cat+cow+yoga' },
        ],
      },
      {
        type: 'main',
        title: 'Main — Upper Body + Core · 28 min',
        exercises: [
          { id: 'b-m1', name: 'Lat Pulldown Machine', tag: '3 × 15', weight: '15–20 kg', rest: 90, notes: 'Fights pregnancy back pain. Wide overhand grip. Pull to upper chest.', posture: 'Grip wider than shoulders (overhand). Thighs under pads. Lean back ~15°. Lead with ELBOWS — pull down toward hips. Squeeze shoulder blades at bottom. 2 sec pull, 3 sec return. Don\'t swing.', demo: 'https://www.youtube.com/results?search_query=lat+pulldown+machine+proper+form+women+beginners' },
          { id: 'b-m2', name: 'Chest Press Machine', tag: '3 × 15', weight: '15 kg', rest: 90, notes: '2 sec press, 3 sec slow return. Shoulders stay DOWN.', posture: 'Back flat against pad. Handles at chest height. Press forward — don\'t lock elbows fully. Exhale as you press. Core gently tight.', demo: 'https://www.youtube.com/results?search_query=chest+press+machine+form+women+gym+beginners' },
          { id: 'b-m3', name: 'Seated Dumbbell Shoulder Press', tag: '3 × 15', weight: '4 kg each', rest: 90, notes: 'Light but controlled — shoulder is a small joint.', posture: 'Sit with back straight. Dumbbells at ear height, elbows at 90°. Press straight up — stop before full lock. 2 sec press, 3 sec lower. Don\'t arch lower back.', demo: 'https://www.youtube.com/results?search_query=seated+dumbbell+shoulder+press+proper+form+women' },
          { id: 'b-m4', name: 'Dead Bug', tag: '3 × 10 each', weight: 'Bodyweight', rest: 90, notes: 'BEST pregnancy-safe core exercise. Back NEVER leaves floor.', posture: 'Lie on back. Arms up, knees at 90°. EXHALE slowly lower opposite arm overhead + opposite leg (hover 3cm). Back must stay FLAT. If it arches, don\'t go as far. Alternate. Go very slow.', demo: 'https://www.youtube.com/results?search_query=dead+bug+exercise+core+proper+form+beginners' },
          { id: 'b-m5', name: 'Knee Push-Ups', tag: '3 × 12', weight: 'Bodyweight', rest: 90, notes: 'Head-hip-knee must be ONE straight diagonal line.', posture: 'Knees on mat. Hands slightly wider than shoulders. Lower chest over 2 sec. Push up in 1 sec. Elbows at 45° from body. Core tight. Don\'t let hips sag or stick up.', demo: 'https://www.youtube.com/results?search_query=knee+push+ups+proper+form+beginners+women' },
          { id: 'b-m6', name: 'Plank on Elbows', tag: '2 × 25 sec', weight: 'Bodyweight', rest: 90, notes: 'Breathe normally. Stop if belly domes. Add 5 sec each week.', posture: 'Forearms on floor, elbows under shoulders. Body straight line head to heels. BREATHE normally. If belly domes (coning) — stop immediately.', demo: 'https://www.youtube.com/results?search_query=elbow+plank+proper+form+beginner+women+core' },
        ],
      },
      {
        type: 'cooldown',
        title: 'Cooldown + Kegels · 7 min',
        exercises: [
          { id: 'b-c1', name: 'Treadmill Slow Walk (Cooldown)', tag: '4 min', weight: null, rest: 0, notes: 'Speed 3. Easy walking.', posture: 'Relaxed walking. Deep breaths. Shoulders drop and relax.', demo: 'https://www.youtube.com/results?search_query=cool+down+treadmill+walk+after+workout' },
          { id: 'b-c2', name: 'Chest Doorframe Stretch', tag: '30 sec × 2', weight: null, rest: 0, notes: 'Counters rounded shoulders.', posture: 'Stand in doorframe. Place forearms at 90°. Step through and gently lean. Feel stretch across chest. Hold 30 sec. Gentle only.', demo: 'https://www.youtube.com/results?search_query=chest+doorframe+stretch+pec+stretch+proper+form' },
          { id: 'b-c3', name: 'Kegel Holds', tag: '10 × 5 sec', weight: null, rest: 0, notes: 'End EVERY session with these.', posture: 'Squeeze pelvic floor 5 sec. FULLY release 5 sec. Repeat 10 times. Don\'t hold breath.', demo: 'https://www.youtube.com/results?search_query=kegel+exercises+pelvic+floor+how+to+correctly' },
        ],
      },
    ],
  },

  C: {
    label: 'Full Body Circuit',
    duration: '40 min',
    color: '#8a6a30',
    bg: '#fdf6ec',
    phases: [
      {
        type: 'warmup',
        title: 'Warm-up · 5 min',
        exercises: [
          { id: 'c-w1', name: 'Elliptical (Low Resistance)', tag: '3 min', weight: null, rest: 0, notes: 'Resistance 1–2. Full body warm-up, easier on joints.', posture: 'Use handles. Smooth stride. Slight forward lean. Easy resistance.', demo: 'https://www.youtube.com/results?search_query=elliptical+machine+proper+form+beginner+workout' },
          { id: 'c-w2', name: 'Inchworm Walks + Belly Circles', tag: '2 min', weight: null, rest: 0, notes: '6 inchworms + 10 belly circles each way.', posture: 'Inchworm: stand, bend, walk hands to plank, walk feet to hands, stand. Belly circles: hands on hips, big slow torso circles.', demo: 'https://www.youtube.com/results?search_query=inchworm+exercise+full+body+warm+up+form' },
        ],
      },
      {
        type: 'main',
        title: 'Main — Full Body Circuit · 25 min',
        exercises: [
          { id: 'c-m1', name: 'Dumbbell Squats', tag: '3 × 15', weight: '6 kg each', rest: 90, notes: 'Best blood sugar exercise. Sit deep.', posture: 'Feet shoulder-width, toes slightly out. Dumbbells at sides or shoulders. Sit DOWN — hips below knees. CHEST PROUD. Weight on heels. Push through heels. Squeeze glutes at top.', demo: 'https://www.youtube.com/results?search_query=dumbbell+squat+proper+form+women+beginners+gym' },
          { id: 'c-m2', name: 'Kettlebell Swing', tag: '3 × 15', weight: '4 kg', rest: 90, notes: 'Power from GLUTES not arms. Glutes + cardio + blood sugar in one.', posture: 'Feet slightly wider than hips. HINGE at hips (push hips back — not a squat). Swing KB between legs. Drive hips FORWARD explosively. Arms just guide the KB. Never round lower back.', demo: 'https://www.youtube.com/results?search_query=kettlebell+swing+proper+form+beginner+women' },
          { id: 'c-m3', name: 'Reverse Lunges', tag: '2 × 10 each', weight: 'Bodyweight', rest: 90, notes: 'Step BACK, not forward. Front heel drives you up.', posture: 'Stand tall. Step one foot BACK. Lower back knee toward floor (hover). Front knee over ankle. Torso upright. Push through FRONT HEEL to return. Alternate legs.', demo: 'https://www.youtube.com/results?search_query=reverse+lunge+proper+form+beginner+women+gym' },
          { id: 'c-m4', name: 'Dumbbell Bent-Over Row', tag: '3 × 12 each', weight: '6 kg', rest: 90, notes: 'FLAT back. Pull to hip. Works back + biceps.', posture: 'Hold dumbbell in one hand. Other hand on bench. Hinge forward — FLAT BACK. Pull dumbbell toward HIP. Elbow close to body. Squeeze shoulder blade at top. 2 sec pull, 3 sec lower.', demo: 'https://www.youtube.com/results?search_query=dumbbell+bent+over+row+proper+form+women+beginners' },
          { id: 'c-m5', name: 'Mountain Climbers', tag: '2 × 20', weight: 'Bodyweight', rest: 60, notes: 'Steady pace. Core + cardio. Great for blood sugar.', posture: 'High plank. Drive one knee to chest, switch. Steady rhythm, not racing. Hips LEVEL. Breathe steadily. Core tight.', demo: 'https://www.youtube.com/results?search_query=mountain+climbers+proper+form+beginner+core' },
          { id: 'c-m6', name: 'Glute Bridge', tag: '2 × 20', weight: 'Bodyweight', rest: 60, notes: '2 sec squeeze at top. Every session should have one.', posture: 'Lie on back. Feet flat, knees bent. Push through heels — hips rise. Squeeze glutes HARD 2 sec at top. Lower slowly.', demo: 'https://www.youtube.com/results?search_query=glute+bridge+exercise+proper+form+women+gym' },
        ],
      },
      {
        type: 'cooldown',
        title: 'Cardio Cooldown + Kegels · 10 min',
        exercises: [
          { id: 'c-c1', name: 'Treadmill Walk (Gradual Cooldown)', tag: '8 min', weight: null, rest: 0, notes: 'Speed 4 → 3 over 8 min. Wind down gradually.', posture: 'Start speed 4, reduce to 3 halfway. Deep breathing to recover.', demo: 'https://www.youtube.com/results?search_query=cool+down+walk+treadmill+gradual+after+workout' },
          { id: 'c-c2', name: 'Hip Flexor Stretch + Kegels', tag: '2 min', weight: null, rest: 0, notes: 'Lunge stretch 30 sec each side, then 10 × 5 sec Kegels.', posture: 'Low lunge: one knee on floor, other forward. Sink hips. Hold 30 sec each side. Then Kegels: squeeze 5 sec, release 5 sec × 10.', demo: 'https://www.youtube.com/results?search_query=hip+flexor+lunge+stretch+yoga+beginner' },
        ],
      },
    ],
  },

  D: {
    label: 'Home Yoga + Floor',
    duration: '35 min',
    color: '#c05a30',
    bg: '#fef3ef',
    phases: [
      {
        type: 'home',
        title: 'Fertility Yoga Flow · 15 min',
        exercises: [
          { id: 'd-y1', name: 'Butterfly Pose (Baddha Konasana)', tag: '3 × 90 sec', weight: null, rest: 30, notes: 'Opens inner groin + pelvic floor. Near a window for Vitamin D.', posture: 'Sit on floor, soles of feet together, knees open. Sit TALL. Optional gentle forward lean. Breathe slowly into lower belly. Never force knees down.', demo: 'https://www.youtube.com/results?search_query=butterfly+pose+baddha+konasana+yoga+tutorial+beginner' },
          { id: 'd-y2', name: 'Deep Squat Hold (Malasana)', tag: '3 × 45 sec', weight: null, rest: 30, notes: '#1 delivery position. Opens pelvis completely.', posture: 'Feet wider than hips, toes out 45°. Deep squat. Hands prayer at chest, elbows press knees open. Heels on floor (towel under heels if needed). Breathe into belly.', demo: 'https://www.youtube.com/results?search_query=malasana+deep+squat+yoga+tutorial+beginners' },
          { id: 'd-y3', name: 'Low Lunge (Anjaneyasana)', tag: '45 sec each', weight: null, rest: 0, notes: 'Opens hip flexors tight from sitting.', posture: 'Step one foot forward. Back knee on floor. Sink hips forward and DOWN. Arms reach overhead. Feel hip flexor opening. Hold 45 sec. Switch sides.', demo: 'https://www.youtube.com/results?search_query=anjaneyasana+low+lunge+yoga+pose+tutorial' },
          { id: 'd-y4', name: 'Cat-Cow', tag: '10 rounds', weight: null, rest: 0, notes: 'Spine mobility + breath connection. Very slowly.', posture: 'All fours. COW (inhale): belly drops, chest lifts. CAT (exhale): round spine up, tuck chin. 4–5 sec per position. Feel each vertebra.', demo: 'https://www.youtube.com/results?search_query=cat+cow+yoga+pose+tutorial+spine+mobility' },
          { id: 'd-y5', name: 'Legs Up the Wall', tag: '5 min', weight: null, rest: 0, notes: 'Improves pelvic blood flow. Ayurvedic fertility support. Let sunlight reach legs.', posture: 'Sit sideways near wall, swing legs up as you lower back to floor. Legs straight on wall. Arms relaxed, palms up. Close eyes. Stay 5 full minutes. Exit: bend knees, roll to side.', demo: 'https://www.youtube.com/results?search_query=legs+up+the+wall+viparita+karani+yoga+tutorial' },
        ],
      },
      {
        type: 'main',
        title: 'Floor Strength (No Equipment) · 18 min',
        exercises: [
          { id: 'd-f1', name: 'Glute Bridge Holds', tag: '3 × 20', weight: 'Bodyweight', rest: 60, notes: 'Progress to single-leg when 3×20 feels easy.', posture: 'Lie on back. Feet hip-width. Drive hips up, squeeze glutes 2 sec. Lower slowly 3 sec. Keep back flat.', demo: 'https://www.youtube.com/results?search_query=glute+bridge+hold+exercise+floor+proper+form+women' },
          { id: 'd-f2', name: 'Dead Bug', tag: '3 × 10 each', weight: 'Bodyweight', rest: 60, notes: 'Best pregnancy-safe core. Back NEVER leaves floor.', posture: 'Lie on back. Arms up, knees 90°. EXHALE — extend opposite arm + leg (hover). Back must press into floor. Alternate slowly.', demo: 'https://www.youtube.com/results?search_query=dead+bug+exercise+core+form+beginners' },
          { id: 'd-f3', name: 'Side-Lying Clamshell', tag: '3 × 20 each', weight: 'Bodyweight', rest: 60, notes: 'Outer glute + hip stability. Feet stay together.', posture: 'Lie on side. Hips stacked. Knees bent 45°. Feet together. Lift top knee like a clamshell. Hold 1 sec at top. Lower slowly. Don\'t roll hip back. Switch sides.', demo: 'https://www.youtube.com/results?search_query=side+lying+clamshell+exercise+outer+glute+form' },
          { id: 'd-f4', name: 'Bird-Dog', tag: '3 × 10 each', weight: 'Bodyweight', rest: 60, notes: 'Hips LEVEL. Safe all trimesters.', posture: 'All fours. Extend opposite arm forward + leg back. Hold 3 sec. HIPS LEVEL — no rotating. Core tight but breathe. Alternate.', demo: 'https://www.youtube.com/results?search_query=bird+dog+exercise+core+stability+proper+form' },
          { id: 'd-f5', name: 'Wall Sit', tag: '3 × 30 sec', weight: 'Bodyweight', rest: 60, notes: 'Add 5 sec each week.', posture: 'Back against wall. Slide down until thighs parallel (90° knee). Back FLAT on wall. Weight on heels. Breathe normally.', demo: 'https://www.youtube.com/results?search_query=wall+sit+exercise+proper+form+how+to' },
          { id: 'd-f6', name: 'Kegel Holds + Rapid Pulses', tag: '30 total', weight: null, rest: 0, notes: '10 × slow holds (5 sec) then 20 rapid pulses.', posture: '10 slow holds: squeeze 5 sec, release 5 sec. Then 20 rapid pulses: quick squeeze-release 1/sec. Don\'t hold breath.', demo: 'https://www.youtube.com/results?search_query=kegel+exercises+slow+holds+fast+pulses+women' },
        ],
      },
    ],
  },
}

export const WALK_INFO = [
  { icon: '🌅', label: 'After Breakfast', sub: 'Best for blood sugar' },
  { icon: '☀️', label: 'After Lunch', sub: 'Best for Vitamin D' },
  { icon: '🌙', label: 'After Dinner', sub: 'Lowers cortisol' },
]

export const WALK_GOAL_SECS = 600 // 10 minutes

// ── Exercise Library — for adding exercises to any phase ──────────────────────

export const EXERCISE_LIBRARY = [
  // Warmup
  { id: 'lib-wu1', name: 'Jumping Jacks', category: 'warmup', tag: '2 min', weight: null, rest: 0, notes: 'Full body warm-up. Land softly.', posture: 'Keep core tight. Land with soft knees. Arms fully extend overhead.', demo: 'https://www.youtube.com/results?search_query=jumping+jacks+proper+form' },
  { id: 'lib-wu2', name: 'Arm Circles', category: 'warmup', tag: '30 sec each direction', weight: null, rest: 0, notes: 'Forward then backward. Shoulder mobility.', posture: 'Stand tall, arms extended. Slow controlled circles.', demo: 'https://www.youtube.com/results?search_query=arm+circles+warm+up' },
  { id: 'lib-wu3', name: 'High Knees', category: 'warmup', tag: '1 min', weight: null, rest: 0, notes: 'Drives heart rate up quickly. Good pre-cardio.', posture: 'Drive knees up to hip height. Pump arms. Land on balls of feet.', demo: 'https://www.youtube.com/results?search_query=high+knees+exercise+form' },
  { id: 'lib-wu4', name: 'Dynamic Lunges', category: 'warmup', tag: '10 each leg', weight: null, rest: 0, notes: 'Opens hip flexors. Activates glutes.', posture: 'Step forward, knee over ankle. Back knee hovers. Return to standing.', demo: 'https://www.youtube.com/results?search_query=dynamic+lunge+warm+up+form' },
  { id: 'lib-wu5', name: 'Cat-Cow Stretch', category: 'warmup', tag: '10 reps', weight: null, rest: 0, notes: 'Spinal mobility. Breath-linked movement.', posture: 'On hands and knees. Exhale: arch back (cat). Inhale: drop belly (cow).', demo: 'https://www.youtube.com/results?search_query=cat+cow+stretch+yoga+spine' },
  { id: 'lib-wu6', name: 'Inchworm', category: 'warmup', tag: '8 reps', weight: null, rest: 0, notes: 'Full body wake-up. Hamstring + shoulder activation.', posture: 'Hinge at hips, walk hands to plank. Do a push-up optional. Walk feet to hands. Stand.', demo: 'https://www.youtube.com/results?search_query=inchworm+exercise+warm+up' },
  // Legs & Glutes
  { id: 'lib-lg1', name: 'Barbell Squat', category: 'legs', tag: '3 × 10', weight: '20–40 kg', rest: 90, notes: 'Compound leg builder. Most important leg exercise.', posture: 'Bar on traps. Feet shoulder-width. Sit BACK and DOWN. Knees track toes. Drive through heels.', demo: 'https://www.youtube.com/results?search_query=barbell+squat+proper+form+women' },
  { id: 'lib-lg2', name: 'Romanian Deadlift', category: 'legs', tag: '3 × 12', weight: '15–20 kg', rest: 90, notes: 'Hamstring + glute lengthening. Feel the stretch.', posture: 'Hip-width stance. Soft knees. Hinge at hips, bar close to body. Feel hamstring stretch. Drive hips forward.', demo: 'https://www.youtube.com/results?search_query=romanian+deadlift+dumbbell+women+form' },
  { id: 'lib-lg3', name: 'Walking Lunges', category: 'legs', tag: '3 × 12 each', weight: '5–8 kg', rest: 90, notes: 'Balance + glute activation. Control the descent.', posture: 'Step forward, lower back knee towards floor. Push off front heel to step forward.', demo: 'https://www.youtube.com/results?search_query=walking+lunges+dumbbell+proper+form' },
  { id: 'lib-lg4', name: 'Leg Curl Machine', category: 'legs', tag: '3 × 15', weight: '20 kg', rest: 90, notes: 'Isolated hamstring work.', posture: 'Lie face down. Pad just above heels. Curl fully. Lower slowly.', demo: 'https://www.youtube.com/results?search_query=lying+leg+curl+machine+proper+form' },
  { id: 'lib-lg5', name: 'Hip Thrust (Barbell)', category: 'legs', tag: '3 × 15', weight: '20 kg', rest: 90, notes: 'Best glute builder. Feel the squeeze at top.', posture: 'Shoulders on bench. Bar at hips. Drive UP through heels. Squeeze 2 sec at top.', demo: 'https://www.youtube.com/results?search_query=barbell+hip+thrust+proper+form+women' },
  { id: 'lib-lg6', name: 'Calf Raises', category: 'legs', tag: '3 × 20', weight: 'Bodyweight', rest: 60, notes: 'Full range — all the way up, all the way down.', posture: 'Stand on edge of step. Rise onto toes. Lower heel below step level.', demo: 'https://www.youtube.com/results?search_query=calf+raises+proper+form+gym' },
  { id: 'lib-lg7', name: 'Donkey Kicks', category: 'legs', tag: '3 × 15 each', weight: 'Bodyweight', rest: 60, notes: 'Glute activation. Keep hips square.', posture: 'On all fours. Kick one leg back and up, sole to ceiling. Squeeze glute at top. Hips square throughout.', demo: 'https://www.youtube.com/results?search_query=donkey+kicks+glute+exercise+form' },
  // Upper Body
  { id: 'lib-ub1', name: 'Lat Pulldown', category: 'upper', tag: '3 × 12', weight: '20–25 kg', rest: 90, notes: 'Back width. Pull elbows DOWN.', posture: 'Grip wide overhand. Lean back slightly. Pull bar to upper chest. Squeeze shoulder blades together at bottom.', demo: 'https://www.youtube.com/results?search_query=lat+pulldown+proper+form+beginner' },
  { id: 'lib-ub2', name: 'Dumbbell Chest Press', category: 'upper', tag: '3 × 12', weight: '8–10 kg', rest: 90, notes: 'Chest + shoulder + tricep compound.', posture: 'Feet flat on floor. Press up and slightly in. Lower slowly, elbows 45° from body.', demo: 'https://www.youtube.com/results?search_query=dumbbell+chest+press+proper+form+women' },
  { id: 'lib-ub3', name: 'Seated Cable Row', category: 'upper', tag: '3 × 12', weight: '15 kg', rest: 90, notes: 'Back thickness. Pull with elbows, not hands.', posture: 'Sit tall. Pull handle to lower chest. Squeeze shoulder blades. Return slowly.', demo: 'https://www.youtube.com/results?search_query=seated+cable+row+proper+form' },
  { id: 'lib-ub4', name: 'Dumbbell Shoulder Press', category: 'upper', tag: '3 × 12', weight: '6–8 kg', rest: 90, notes: 'Overhead pressing strength.', posture: 'Dumbbells at ear level, palms forward. Press up, do not lock elbows. Lower to 90°.', demo: 'https://www.youtube.com/results?search_query=dumbbell+shoulder+press+seated+form' },
  { id: 'lib-ub5', name: 'Tricep Pushdown', category: 'upper', tag: '3 × 15', weight: '12–15 kg', rest: 60, notes: 'Arm definition. Keep upper arms still.', posture: 'Elbows at sides, fixed. Push down fully. Squeeze at bottom. Return slowly to 90°.', demo: 'https://www.youtube.com/results?search_query=tricep+pushdown+cable+proper+form' },
  { id: 'lib-ub6', name: 'Bicep Curl', category: 'upper', tag: '3 × 12', weight: '5–8 kg', rest: 60, notes: 'Don\'t swing. Slow controlled movement.', posture: 'Stand tall. Elbows at sides. Curl to shoulder. Squeeze. Lower 3 seconds.', demo: 'https://www.youtube.com/results?search_query=dumbbell+bicep+curl+proper+form' },
  { id: 'lib-ub7', name: 'Push-ups', category: 'upper', tag: '3 × 10', weight: 'Bodyweight', rest: 60, notes: 'Modify on knees if needed. Chest to floor.', posture: 'Hands shoulder-width. Body straight like a plank. Lower chest, then push. Elbows 45° not flared.', demo: 'https://www.youtube.com/results?search_query=push+up+proper+form+beginner+women' },
  { id: 'lib-ub8', name: 'Lateral Raise', category: 'upper', tag: '3 × 15', weight: '4–5 kg', rest: 60, notes: 'Shoulder width. Slight forward lean.', posture: 'Slight bend in elbows. Raise arms to shoulder height. Lead with elbows. Lower slowly.', demo: 'https://www.youtube.com/results?search_query=lateral+raise+proper+form+shoulder' },
  // Core
  { id: 'lib-co1', name: 'Plank', category: 'core', tag: '3 × 30 sec', weight: 'Bodyweight', rest: 60, notes: 'Quality over time. Squeeze everything.', posture: 'Forearms on floor, elbows under shoulders. Body straight. Squeeze core, glutes, quads. Do not let hips sag.', demo: 'https://www.youtube.com/results?search_query=plank+proper+form+core+exercise' },
  { id: 'lib-co2', name: 'Russian Twists', category: 'core', tag: '3 × 20', weight: '3–4 kg', rest: 60, notes: 'Obliques. Keep feet off floor for harder version.', posture: 'Sit at 45°. Lean back slightly. Rotate torso side to side. Touch weight to floor each side.', demo: 'https://www.youtube.com/results?search_query=russian+twist+exercise+proper+form' },
  { id: 'lib-co3', name: 'Bicycle Crunches', category: 'core', tag: '3 × 20', weight: 'Bodyweight', rest: 60, notes: 'Best crunch variation. Slow and controlled.', posture: 'Hands behind head lightly. Alternate: elbow to opposite knee. Twist from core, not neck.', demo: 'https://www.youtube.com/results?search_query=bicycle+crunches+proper+form+core' },
  { id: 'lib-co4', name: 'Leg Raises', category: 'core', tag: '3 × 15', weight: 'Bodyweight', rest: 60, notes: 'Lower abs. Lower legs slowly for max effect.', posture: 'Lie flat, hands under lower back. Raise legs to 90°. Lower SLOWLY without touching floor.', demo: 'https://www.youtube.com/results?search_query=lying+leg+raise+proper+form+abs' },
  { id: 'lib-co5', name: 'Dead Bug', category: 'core', tag: '3 × 10 each', weight: 'Bodyweight', rest: 60, notes: 'Core stability. Back stays flat on floor always.', posture: 'Lie on back, arms up, knees 90°. Lower opposite arm and leg simultaneously. Back FLAT. Breathe out on the way down.', demo: 'https://www.youtube.com/results?search_query=dead+bug+exercise+core+stability' },
  { id: 'lib-co6', name: 'Mountain Climbers', category: 'core', tag: '3 × 20', weight: 'Bodyweight', rest: 60, notes: 'Core + cardio. Keep hips down.', posture: 'Start in high plank. Drive one knee towards chest, then switch. Hips stay low and level.', demo: 'https://www.youtube.com/results?search_query=mountain+climbers+proper+form' },
  // Yoga & Stretch
  { id: 'lib-ys1', name: "Child's Pose", category: 'yoga', tag: '60 sec hold', weight: null, rest: 0, notes: 'Rest and release. Back and hip opener.', posture: 'Kneel, sit back on heels. Extend arms forward. Forehead on mat. Breathe deeply into back.', demo: 'https://www.youtube.com/results?search_query=childs+pose+yoga+tutorial' },
  { id: 'lib-ys2', name: 'Downward Dog', category: 'yoga', tag: '30 sec hold', weight: null, rest: 0, notes: 'Full body stretch. Hamstrings, calves, spine.', posture: 'Hands and toes on mat. Hips up high — inverted V shape. Press heels toward floor.', demo: 'https://www.youtube.com/results?search_query=downward+dog+yoga+proper+form' },
  { id: 'lib-ys3', name: 'Pigeon Pose', category: 'yoga', tag: '45 sec each side', weight: null, rest: 0, notes: 'Deep hip flexor + glute stretch. Important post-leg day.', posture: 'From plank, bring one knee forward behind wrist. Back leg extended. Lower hips toward floor.', demo: 'https://www.youtube.com/results?search_query=pigeon+pose+yoga+hip+stretch' },
  { id: 'lib-ys4', name: 'Seated Spinal Twist', category: 'yoga', tag: '30 sec each side', weight: null, rest: 0, notes: 'Spinal mobility. Digestive benefits.', posture: 'Sit tall, cross one leg over. Twist toward raised knee. Look over shoulder. Breathe and lengthen spine.', demo: 'https://www.youtube.com/results?search_query=seated+spinal+twist+yoga+ardha+matsyendrasana' },
  { id: 'lib-ys5', name: 'Sun Salutation', category: 'yoga', tag: '3 rounds', weight: null, rest: 0, notes: 'Full body flow. Breath-linked movement.', posture: 'Stand → Forward fold → Half lift → Plank → Cobra → Downward dog → Forward fold → Stand. Move with breath.', demo: 'https://www.youtube.com/results?search_query=sun+salutation+A+beginners+yoga' },
  // Cooldown
  { id: 'lib-cd1', name: 'Standing Quad Stretch', category: 'cooldown', tag: '30 sec each leg', weight: null, rest: 0, notes: 'Hold wall for balance if needed.', posture: 'Stand on one leg, pull other heel to glute. Keep knees together. Stand tall.', demo: 'https://www.youtube.com/results?search_query=standing+quad+stretch+proper' },
  { id: 'lib-cd2', name: 'Seated Hamstring Stretch', category: 'cooldown', tag: '45 sec each leg', weight: null, rest: 0, notes: 'Lengthen the hamstrings after leg day.', posture: 'Sit on floor, one leg extended. Hinge at hips, reach toward foot. Keep back flat, not rounded.', demo: 'https://www.youtube.com/results?search_query=seated+hamstring+stretch+form' },
  { id: 'lib-cd3', name: 'Chest + Shoulder Opener', category: 'cooldown', tag: '30 sec hold', weight: null, rest: 0, notes: 'Reverses computer/phone posture. Do daily.', posture: 'Clasp hands behind back. Lift arms, open chest. Look up slightly. Hold and breathe.', demo: 'https://www.youtube.com/results?search_query=chest+stretch+shoulder+opener+cooldown' },
  { id: 'lib-cd4', name: 'Lying Spinal Twist', category: 'cooldown', tag: '30 sec each side', weight: null, rest: 0, notes: 'Final spinal release. Excellent for recovery.', posture: 'Lie on back. Pull one knee to chest, guide it across body. Opposite arm extended. Shoulders flat.', demo: 'https://www.youtube.com/results?search_query=lying+spinal+twist+yoga+supine' },
  { id: 'lib-cd5', name: 'Deep Breathing', category: 'cooldown', tag: '2 min', weight: null, rest: 0, notes: 'Activates parasympathetic nervous system. Lowers cortisol.', posture: 'Lie flat or sit. Inhale 4 counts. Hold 2. Exhale 6. Focus on belly rising.', demo: 'https://www.youtube.com/results?search_query=deep+breathing+exercise+relaxation' },
]

export const LIBRARY_CATEGORIES = [
  { key: 'warmup',  label: 'Warm-up',        icon: '🔥' },
  { key: 'legs',    label: 'Legs & Glutes',   icon: '🦵' },
  { key: 'upper',   label: 'Upper Body',      icon: '💪' },
  { key: 'core',    label: 'Core',            icon: '⚡' },
  { key: 'yoga',    label: 'Yoga & Stretch',  icon: '🧘' },
  { key: 'cooldown',label: 'Cooldown',        icon: '❄️' },
]
