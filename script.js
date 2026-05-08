/* ============================================================
   Birthday Countdown Timer — Enhanced Script
   ============================================================ */

// ── DOM refs ──────────────────────────────────────────────
const daysEl    = document.getElementById('days');
const hoursEl   = document.getElementById('hours');
const minsEl    = document.getElementById('mins');
const secsEl    = document.getElementById('secs');
const input     = document.getElementById('birthdayInput');
const setBtn    = document.getElementById('setBtn');
const bdayMsg   = document.getElementById('birthday-msg');
const fillBar   = document.getElementById('progress-fill');
const pctLabel  = document.getElementById('progress-pct');
const eventName = document.getElementById('event-name');
const canvas    = document.getElementById('confetti-canvas');
const ctx       = canvas.getContext('2d');

// ── State ─────────────────────────────────────────────────
const STORAGE_KEY = 'bday_countdown_target';

// Default: Sep 16 2026 (original date kept as fallback)
let targetDate = new Date(2026, 8, 16);

// Load saved date from localStorage if available
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  const d = new Date(saved);
  if (!isNaN(d)) targetDate = d;
}

// Sync input field to current target
function syncInputToTarget() {
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  input.value = `${y}-${m}-${d}`;
  updateEventName();
}
syncInputToTarget();

function updateEventName() {
  const opts = { month: 'long', day: 'numeric', year: 'numeric' };
  eventName.textContent = targetDate.toLocaleDateString(undefined, opts);
}

// ── Set button ────────────────────────────────────────────
setBtn.addEventListener('click', () => {
  if (!input.value) return shake(input);
  const chosen = new Date(input.value + 'T00:00:00');
  if (isNaN(chosen)) return shake(input);

  targetDate = chosen;
  localStorage.setItem(STORAGE_KEY, chosen.toISOString());
  updateEventName();
  bdayMsg.classList.add('hidden');
  stopConfetti();

  // Reset prev values so all cards re-render immediately
  prevValues = { d: -1, h: -1, m: -1, s: -1 };

  // Force instant update then restart the interval cleanly
  updateCountdown();
  clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdown, 1000);
});

function shake(el) {
  el.style.animation = 'none';
  el.style.borderColor = '#ff4444';
  setTimeout(() => { el.style.borderColor = ''; }, 600);
}

// ── Countdown ─────────────────────────────────────────────
let prevValues = { d: -1, h: -1, m: -1, s: -1 };

// One year ago from target (for progress bar baseline)
function getYearAgo(date) {
  return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
}

function pad(n) {
  return String(Math.max(0, n)).padStart(2, '0');
}

function updateCountdown() {
  const now  = Date.now();
  let   diff = targetDate.getTime() - now;

  if (diff <= 0) {
    // Birthday is today (or past)
    ['days','hours','mins','secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    bdayMsg.classList.remove('hidden');
    fillBar.style.width = '100%';
    pctLabel.textContent = '100%';
    launchConfetti();
    return;
  }

  bdayMsg.classList.add('hidden');

  const totalMs = diff;
  const d  = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const h  = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m  = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const s  = Math.floor((totalMs % (1000 * 60)) / 1000);

  // Animate each unit when value changes
  setWithFlip('days',  daysEl,  d, 'card-days',  prevValues.d);
  setWithFlip('hours', hoursEl, h, 'card-hours', prevValues.h);
  setWithFlip('mins',  minsEl,  m, 'card-mins',  prevValues.m);
  setWithFlip('secs',  secsEl,  s, 'card-secs',  prevValues.s);

  prevValues = { d, h, m, s };

  // Progress bar: fraction elapsed from (target - 1 year) to target
  const yearAgo   = getYearAgo(targetDate).getTime();
  const totalSpan = targetDate.getTime() - yearAgo;
  const elapsed   = now - yearAgo;
  const pct       = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
  fillBar.style.width = pct.toFixed(2) + '%';
  pctLabel.textContent = pct.toFixed(1) + '%';
}

function setWithFlip(id, el, value, cardId, prev) {
  const formatted = pad(value);
  const unchanged = el.textContent === formatted;
  el.textContent = formatted;
  if (unchanged) return;
  // Tick animation
  el.classList.remove('tick');
  void el.offsetWidth;
  el.classList.add('tick');
  // Flash the card on value change
  if (prev !== -1 && value !== prev) {
    const card = document.getElementById(cardId);
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
  }
}

// ── Confetti ──────────────────────────────────────────────
let confettiActive = false;
let confettiPieces = [];
let animFrame;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function randomColor() {
  const colors = ['#ff6b9d','#ffd93d','#6bcb77','#4d96ff','#ff6bdf','#fff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function spawnPiece() {
  return {
    x:     Math.random() * canvas.width,
    y:     -10,
    w:     6 + Math.random() * 8,
    h:     3 + Math.random() * 4,
    color: randomColor(),
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.15,
    vx:    (Math.random() - 0.5) * 3,
    vy:    2 + Math.random() * 3,
    alpha: 1,
  };
}

function drawConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
    p.x   += p.vx;
    p.y   += p.vy;
    p.rot += p.rotV;
    if (p.y > canvas.height * 0.7) p.alpha -= 0.015;
  });
  confettiPieces = confettiPieces.filter(p => p.alpha > 0);
  if (confettiActive) {
    for (let i = 0; i < 4; i++) confettiPieces.push(spawnPiece());
  }
  if (confettiPieces.length > 0 || confettiActive) {
    animFrame = requestAnimationFrame(drawConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function launchConfetti() {
  if (confettiActive) return;
  confettiActive = true;
  confettiPieces = [];
  drawConfetti();
  // Auto-stop spawning after 6 s
  setTimeout(stopConfetti, 6000);
}

function stopConfetti() {
  confettiActive = false;
}

// ── Start ─────────────────────────────────────────────────
updateCountdown();
let countdownInterval = setInterval(updateCountdown, 1000);
