/* ═══════════════════════════════════════════════════════
   KAIZEY — script.js  (performance-optimised)
═══════════════════════════════════════════════════════ */

document.getElementById('year').textContent = new Date().getFullYear();


/* ═══════════════════════════════════════════════════════
   PARTICLE CANVAS
   FIX: removed shadowBlur — it forces GPU layer flush
   every single frame and is the #1 cause of canvas lag.
   Particles now draw as plain filled circles only.
═══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, rafId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function createParticles() {
    /* Cap at 120 max — on large screens density formula
       would create 300+ particles which tanks performance */
    const count = Math.min(Math.floor((W * H) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
      const isOrange = Math.random() < 0.18;
      particles.push({
        x: rand(0, W), y: rand(0, H),
        r: rand(0.4, isOrange ? 1.8 : 1.2),
        opacity: rand(0.12, 0.65),
        alpha: rand(0.1, 0.6),
        speed: rand(0.003, isOrange ? 0.018 : 0.009),
        phase: rand(0, Math.PI * 2),
        isOrange,
        dx: rand(-0.05, 0.05),
        dy: rand(-0.04, 0.04),
      });
    }
  }

  /* Pre-build colour strings so we don't allocate strings inside the loop */
  let frame = 0;
  function animate() {
    rafId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);
    frame++;

    /* NO shadowBlur — removed entirely. It was causing a full
       compositing layer flush on every frame = the lag you felt. */
    for (const p of particles) {
      p.alpha = p.opacity * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * p.speed + p.phase)));
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.isOrange
        ? `rgba(255,122,0,${p.alpha.toFixed(2)})`
        : `rgba(255,255,255,${p.alpha.toFixed(2)})`;
      ctx.fill();
    }
  }

  resize();
  createParticles();
  animate();

  /* Debounce resize so it doesn't fire 30x while dragging */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      resize();
      createParticles();
      animate();
    }, 150);
  });
})();


/* ═══════════════════════════════════════════════════════
   DYNAMIC GLASS HEADER
═══════════════════════════════════════════════════════ */
const header     = document.getElementById('header');
const headerPill = document.getElementById('headerPill');
const THRESHOLD  = 40;

function updateHeader() {
  const scrollY  = window.scrollY;
  const progress = Math.min(scrollY / THRESHOLD, 1);
  header.classList.toggle('scrolled', scrollY > THRESHOLD);
  const blur    = (progress * 20).toFixed(1);
  const bgA     = (progress * 0.60).toFixed(3);
  const bdA     = (progress * 0.12).toFixed(3);
  const shadowA = (progress * 0.45).toFixed(2);
  headerPill.style.backdropFilter       = `blur(${blur}px)`;
  headerPill.style.webkitBackdropFilter = `blur(${blur}px)`;
  headerPill.style.background           = `rgba(13,16,32,${bgA})`;
  headerPill.style.borderColor          = `rgba(255,255,255,${bdA})`;
  headerPill.style.boxShadow            = progress > 0.05
    ? `0 8px 32px rgba(0,0,10,${shadowA}), inset 0 1px 0 rgba(255,255,255,${(progress*0.06).toFixed(3)})`
    : 'none';
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();


/* ═══════════════════════════════════════════════════════
   HAMBURGER / MOBILE NAV
   FIX: hide ham-btn when mobile nav is open so the
   animated X spans don't show alongside the close button.
═══════════════════════════════════════════════════════ */
const hamBtn    = document.getElementById('hamBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

function openMobileNav() {
  mobileNav.classList.add('open');
  hamBtn.classList.add('open');
  hamBtn.style.visibility = 'hidden'; /* hide ham-btn — close btn takes over */
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNav.classList.remove('open');
  hamBtn.classList.remove('open');
  hamBtn.style.visibility = 'visible';
  document.body.style.overflow = '';
}

hamBtn.addEventListener('click', () => {
  mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
});
mobileClose?.addEventListener('click', closeMobileNav);
mobileNav.addEventListener('click', e => { if (e.target === mobileNav) closeMobileNav(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });


/* ═══════════════════════════════════════════════════════
   SKILLS FILTER
═══════════════════════════════════════════════════════ */
function filterSkills(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  let delay = 0;
  document.querySelectorAll('.skill-card').forEach(card => {
    const visible = cat === 'all' || card.dataset.cat === cat;
    if (visible) {
      card.style.display = 'flex';
      card.classList.remove('anime-entered');
      setTimeout(() => card.classList.add('anime-entered'), delay);
      delay += 40;
    } else {
      card.style.opacity   = '0';
      card.style.transform = 'scale(0.8)';
      setTimeout(() => { card.style.display = 'none'; }, 200);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.skill-level').forEach(el => {
    el.setAttribute('data-rank', el.textContent.trim());
  });
});


/* ═══════════════════════════════════════════════════════
   ANIME POWER BARS
═══════════════════════════════════════════════════════ */
const animeBarObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill = entry.target;
    const w    = parseFloat(fill.getAttribute('data-w')) || 0;
    const items = Array.from(fill.closest('.anime-bar-item')?.parentElement?.querySelectorAll('.anime-bar-item') ?? []);
    const delay = items.indexOf(fill.closest('.anime-bar-item')) * 180;
    setTimeout(() => {
      fill.style.transform = `scaleX(${w})`;
      fill.classList.add('bar-animated');
    }, delay);
    animeBarObserver.unobserve(fill);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.anime-bar__fill').forEach(el => animeBarObserver.observe(el));


/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
   FIX: removed multiple IntersectionObservers — merged
   into one to reduce overhead.
═══════════════════════════════════════════════════════ */
const revealEls = document.querySelectorAll(
  '.skill-card, .project-card, .anime-bar-item, .about__img-wrap, .about__text, .channel-card'
);

revealEls.forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const isSkill = el.classList.contains('skill-card');
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
      if (isSkill) el.classList.add('anime-entered');
    }, (i % 6) * 55);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.08 });

revealEls.forEach(el => revealObserver.observe(el));


/* ═══════════════════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ═══════════════════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════════════════ */
const sendBtn = document.getElementById('sendBtn');
if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    const name    = document.getElementById('c-name')?.value.trim();
    const email   = document.getElementById('c-email')?.value.trim();
    const message = document.getElementById('c-message')?.value.trim();
    const textEl  = sendBtn.querySelector('.connect__send-btn-text');

    if (!name || !email || !message) {
      textEl.textContent = 'Fill all fields ✕';
      sendBtn.style.background = '#c0392b';
      setTimeout(() => {
        textEl.innerHTML = 'Transmit <i class="fas fa-satellite-dish"></i>';
        sendBtn.style.background = '';
      }, 2500);
      return;
    }
    textEl.innerHTML = 'Transmission sent! <i class="fas fa-check"></i>';
    sendBtn.style.background = '#1db954';
    setTimeout(() => {
      textEl.innerHTML = 'Transmit <i class="fas fa-satellite-dish"></i>';
      sendBtn.style.background = '';
    }, 3500);
  });
}
