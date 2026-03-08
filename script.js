/* ═══════════════════════════════════════════════════════
   LOCKRIDGE CYBERSECURITY — MAIN SCRIPT
   ═══════════════════════════════════════════════════════ */

// ── CUSTOM CURSOR ──────────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

if (cursorDot && cursorRing) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left  = mouseX + 'px';
    cursorDot.style.top   = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .check-btn, .service-card, .resource-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
  });
}

// ── MATRIX CANVAS BACKGROUND ──────────────────────────
const canvas = document.getElementById('matrixCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ!@#$%^&*<>?/\\|{}';
  const fontSize = 13;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00d4ff';
    ctx.font = fontSize + 'px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : '#00d4ff';
      ctx.globalAlpha = Math.random() * 0.5 + 0.1;
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);
      ctx.globalAlpha = 1;

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 55);
}

// ── NAV SCROLL BEHAVIOR ────────────────────────────────
const nav = document.getElementById('mainNav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE HAMBURGER ───────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── BREACH CLOCK ──────────────────────────────────────
// ~1 healthcare record stolen every 2-3 seconds (based on HHS data)
const BREACH_RATE_MS = 2400; // ms per record

let breachStartTime = Date.now();
let totalBreached   = 0;

function updateBreachClock() {
  const elapsed  = Date.now() - breachStartTime;
  const secsSince = Math.floor((elapsed % BREACH_RATE_MS) / 1000 * (BREACH_RATE_MS / 1000));
  const secEl     = document.getElementById('secCounter');
  const statEl    = document.getElementById('statCount');

  if (secEl) {
    const t = (elapsed % BREACH_RATE_MS) / 1000;
    secEl.textContent = t.toFixed(1);
    // Flash on new record
    if (t < 0.15) {
      secEl.style.color = '#ef4444';
      setTimeout(() => { secEl.style.color = ''; }, 150);
    }
  }

  if (statEl) {
    const count = Math.floor(elapsed / BREACH_RATE_MS);
    if (count !== totalBreached) {
      totalBreached = count;
      statEl.textContent = totalBreached.toLocaleString();
    }
  }
}

setInterval(updateBreachClock, 100);

// ── SCROLL REVEAL ──────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── INTERACTIVE CHECKLIST ─────────────────────────────
const questions = [
  {
    q: "Does your team receive phishing simulation training every quarter?",
    context: "The majority of healthcare breaches start with a phishing email."
  },
  {
    q: "Do you have a documented, tested incident response plan?",
    context: "Without a plan, average breach response time is 7x longer."
  },
  {
    q: "Is every device that touches patient data fully encrypted?",
    context: "A stolen unencrypted laptop is an automatic reportable HIPAA breach."
  },
  {
    q: "Has anyone performed a formal HIPAA Security Risk Assessment this year?",
    context: "OCR requires this annually. It's the #1 cited violation in audits."
  },
  {
    q: "Do you know where every copy of your patient data lives right now?",
    context: "Shadow copies in email, spreadsheets, and backups are common blind spots."
  },
  {
    q: "Can a former employee still access your systems today?",
    context: "Ex-employee account abuse accounts for 19% of insider breaches."
  },
  {
    q: "Has your network been professionally assessed for vulnerabilities in the last 12 months?",
    context: "The average vulnerability sits undetected for 206 days before discovery."
  }
];

const checklistQEl = document.getElementById('checklistQuestions');
const checklistResultEl = document.getElementById('checklistResult');

if (checklistQEl) {
  let currentQ = 0;
  let hesitations = 0;

  // Build progress dots
  const progressRow = document.createElement('div');
  progressRow.className = 'checklist-progress';
  questions.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
    dot.id = 'dot-' + i;
    progressRow.appendChild(dot);
  });
  checklistQEl.parentElement.insertBefore(progressRow, checklistQEl);

  function renderQuestion(index) {
    if (index >= questions.length) {
      showResult();
      return;
    }

    const q = questions[index];
    const div = document.createElement('div');
    div.className = 'checklist-q' + (index === 0 ? ' active' : '');
    div.id = 'q-' + index;
    div.innerHTML = `
      <div class="checklist-q-inner">
        <div class="checklist-q-number">Question ${index + 1} of ${questions.length}</div>
        <p class="checklist-q-text">${q.q}</p>
        <div class="checklist-context" style="font-size:0.85rem;color:var(--text-3);margin-bottom:20px;font-family:var(--font-mono);letter-spacing:0.03em;">${q.context}</div>
        <div class="checklist-buttons">
          <button class="check-btn check-btn-yes" data-q="${index}" data-ans="yes">✓ Yes</button>
          <button class="check-btn check-btn-no"  data-q="${index}" data-ans="no">✗ No</button>
        </div>
      </div>
    `;
    checklistQEl.appendChild(div);

    // Animate in
    setTimeout(() => div.classList.add('active'), 50);

    div.querySelectorAll('.check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ans = btn.dataset.ans;
        if (ans === 'no') hesitations++;

        // Mark answered
        div.classList.add('answered');
        div.classList.remove('active');

        // Update dots
        const prevDot = document.getElementById('dot-' + index);
        if (prevDot) { prevDot.classList.remove('active'); prevDot.classList.add('done'); }
        const nextDot = document.getElementById('dot-' + (index + 1));
        if (nextDot) nextDot.classList.add('active');

        currentQ++;
        setTimeout(() => renderQuestion(currentQ), 300);
      });
    });
  }

  function showResult() {
    if (!checklistResultEl) return;
    progressRow.querySelectorAll('.progress-dot').forEach(d => {
      d.classList.add('done');
      d.classList.remove('active');
    });

    checklistResultEl.classList.add('visible');
    // Scroll into view
    setTimeout(() => {
      checklistResultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  renderQuestion(0);
}

// ── GLITCH TEXT EFFECT ─────────────────────────────────
function glitchText(el, original) {
  const glitchChars = '!<>-_\\/[]{}—=+*^?#████';
  let iterations = 0;
  const max = original.length * 3;

  const interval = setInterval(() => {
    el.textContent = original.split('').map((char, i) => {
      if (char === ' ') return ' ';
      if (i < iterations / 3) return char;
      return glitchChars[Math.floor(Math.random() * glitchChars.length)];
    }).join('');

    iterations++;
    if (iterations >= max) {
      el.textContent = original;
      clearInterval(interval);
    }
  }, 30);
}

// Apply glitch on hover to headings with class .glitch
document.querySelectorAll('.glitch').forEach(el => {
  const original = el.textContent;
  el.addEventListener('mouseenter', () => glitchText(el, original));
});

// ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── NUMBER COUNTER ANIMATION ───────────────────────────
function animateCount(el, from, to, duration = 1500) {
  const start = performance.now();
  function step(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + (to - from) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── STAT TICKER IN HERO ───────────────────────────────
const statEl = document.getElementById('heroStat');
if (statEl) {
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statObserver.observe(statEl);
}

// ── SERVICE CARD PARALLAX TILT ─────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left - rect.width / 2;
    const y      = e.clientY - rect.top  - rect.height / 2;
    const rotX   = (-y / rect.height) * 6;
    const rotY   = (x / rect.width)   * 6;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── FORM SUBMISSION HANDLING ───────────────────────────
const ctaForm = document.getElementById('ctaForm');
if (ctaForm) {
  ctaForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = ctaForm.querySelector('.form-submit');
    const orig = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    // Simulate submission (replace with actual backend)
    setTimeout(() => {
      btn.innerHTML = '<span>Request received — we\'ll be in touch!</span>';
      btn.style.background = 'var(--green)';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.disabled = false;
        ctaForm.reset();
      }, 4000);
    }, 1200);
  });
}

// ── TYPEWRITER EFFECT FOR HERO ─────────────────────────
function typewriter(el, text, speed = 60) {
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, speed + Math.random() * 40);
    }
  }
  type();
}

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Stagger reveal delays based on position in grid
  document.querySelectorAll('.services-grid .reveal, .testimonials-grid .reveal, .resources-grid .reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.1) + 's';
  });
});
