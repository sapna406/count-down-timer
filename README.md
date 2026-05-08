# Birthday Countdown Timer

A beautiful, animated birthday countdown timer built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.


## ✨ Features

- **Live Countdown** — Shows days, hours, minutes, and seconds ticking in real time
- **Custom Date Picker** — Set any birthday date using the date input
- **Persistent Storage** — Your chosen date is saved in `localStorage` and survives page refreshes
- **Progress Bar** — Visual progress showing how far through the year you are toward the birthday
- **Confetti Burst** — Canvas-based confetti launches automatically when the birthday arrives
- **Floating Balloons** — Animated balloons float up continuously in the background
- **Flip Animations** — Each number animates smoothly every time it changes
- **Birthday Message** — A glowing alert appears when the countdown hits zero
- **Responsive Design** — Works on desktop, tablet, and mobile screens



##  Getting Started

No installation or build step needed. Just open the file in a browser:

```bash
# Clone or download the project, then simply open:
index.html
```




##  How It Works

### Countdown Logic (`script.js`)

- On page load, the target date is read from `localStorage` (falls back to Sep 16 2026)
- `setInterval` runs every **1000ms** and calculates the difference between now and the target date
- Days, hours, minutes, and seconds are derived using modulo arithmetic
- On each tick, only changed values trigger DOM updates and animations

### Set Button

- Reads the date input value and parses it as a local midnight timestamp (`T00:00:00`)
- Saves to `localStorage` under the key `bday_countdown_target`
- Resets `prevValues` to `-1` so all four cards re-render immediately
- Clears and restarts the interval to avoid stale closures

### Progress Bar

- Baseline is set to exactly **1 year before** the target date
- Progress = `(now - oneYearAgo) / (target - oneYearAgo) × 100`
- Clamped between `0%` and `100%`

### Confetti (`script.js`)

- Uses the HTML5 `<canvas>` API
- Spawns colored rectangular pieces from the top of the screen
- Each piece has random velocity, rotation speed, and fade-out
- Auto-stops spawning after 6 seconds; existing pieces fade naturally

---

##  Customization

### Change the Default Birthday Date

In `script.js`, find this line:

```js
let targetDate = new Date(2026, 8, 16); // Month is 0-indexed: 8 = September
```

Change the values to `(year, monthIndex, day)` — note that months are **0-indexed** (0 = January, 11 = December).

### Change the Color Theme

In `style.css`, edit the CSS variables at the top:


### Change the Title / Event Name

In `index.html`:


<h1>🎂 Happy Birthday!</h1>
<p id="event-name" class="event-name">Someone Special's Big Day</p>
```

The `event-name` paragraph is auto-updated by JS when a date is set. You can change the `<h1>` freely.

---

## 🐛 Known Limitations

- The countdown uses the **local system time** of the user's browser — no server sync
- If the target date is in the past, the timer shows `00:00:00:00` and fires confetti
- `localStorage` is not available in some private/incognito modes on certain browsers

---

## 📄 License

Free to use and modify for personal projects.
