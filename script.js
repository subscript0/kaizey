/* ═══════════════════════════════════════════════════════
   KAIZEY — script.js
═══════════════════════════════════════════════════════ */

document.getElementById('year').textContent = new Date().getFullYear();


/* ═══════════════════════════════════════════════════════
   BLINKING PARTICLE CANVAS
   Mix of white + orange dots at varying speeds/sizes
   Some blink fast, some slow — like stars + fireflies
═══════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticles() {
    const count = Math.floor((W * H) / 8000); // density responsive
    particles = [];
    for (let i = 0; i < count; i++) {
      // Mix of white + orange particles (80% white, 20% orange)
      const isOrange = Math.random() < 0.20;
      particles.push({
        x:        randomBetween(0, W),
        y:        randomBetween(0, H),
        r:        randomBetween(0.4, isOrange ? 2.2 : 1.4),
        // base opacity
        opacity:  randomBetween(0.15, 0.75),
        // current rendered opacity (animated)
        alpha:    randomBetween(0.1, 0.7),
        // blink speed — fast (firefly) or slow (star)
        speed:    randomBetween(0.003, isOrange ? 0.022 : 0.010),
        // each particle has its own phase offset
        phase:    randomBetween(0, Math.PI * 2),
        isOrange,
        // subtle drift
        dx: randomBetween(-0.06, 0.06),
        dy: randomBetween(-0.04, 0.04),
      });
    }
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    frame++;

    for (const p of particles) {
      // Blink: sine wave on alpha
      p.alpha = p.opacity * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * p.speed + p.phase)));

      // Slow drift
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.isOrange) {
        ctx.fillStyle = `rgba(255, 122, 0, ${p.alpha})`;
        // tiny glow for orange ones
        ctx.shadowBlur  = 6;
        ctx.shadowColor = `rgba(255,122,0,${p.alpha * 0.6})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowBlur  = 0;
      }
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
})();


/* ═══════════════════════════════════════════════════════
   DYNAMIC GLASS HEADER — smooth scroll-driven transitions
═══════════════════════════════════════════════════════ */
const header     = document.getElementById('header');
const headerPill = document.getElementById('headerPill');
const THRESHOLD  = 40;

function updateHeader() {
  const scrollY   = window.scrollY;
  const progress  = Math.min(scrollY / THRESHOLD, 1);

  header.classList.toggle('scrolled', scrollY > THRESHOLD);

  const blur   = (progress * 20).toFixed(1);
  const bgA    = (progress * 0.60).toFixed(3);
  const bdA    = (progress * 0.12).toFixed(3);
  const shadowA= (progress * 0.45).toFixed(2);

  headerPill.style.backdropFilter       = `blur(${blur}px)`;
  headerPill.style.webkitBackdropFilter = `blur(${blur}px)`;
  headerPill.style.background           = `rgba(13, 16, 32, ${bgA})`;
  headerPill.style.borderColor          = `rgba(255, 255, 255, ${bdA})`;
  headerPill.style.boxShadow            = progress > 0.05
    ? `0 8px 32px rgba(0,0,10,${shadowA}), inset 0 1px 0 rgba(255,255,255,${(progress*0.06).toFixed(3)})`
    : 'none';
}
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();


/* ═══════════════════════════════════════════════════════
   HAMBURGER / MOBILE NAV
═══════════════════════════════════════════════════════ */
const hamBtn     = document.getElementById('hamBtn');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose= document.getElementById('mobileClose');

function closeMobileNav() {
  hamBtn.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}
hamBtn.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamBtn.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
mobileClose?.addEventListener('click', closeMobileNav);
mobileNav.addEventListener('click', e => { if (e.target === mobileNav) closeMobileNav(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileNav(); });


/* ═══════════════════════════════════════════════════════
   SKILLS FILTER — with anime pop entrance
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
      setTimeout(() => {
        card.classList.add('anime-entered');
      }, delay);
      delay += 40;
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      setTimeout(() => { card.style.display = 'none'; }, 200);
    }
  });
}

/* Anime-pop entrance on initial load */
window.addEventListener('DOMContentLoaded', () => {
  // Tag rank labels on skill levels
  document.querySelectorAll('.skill-level').forEach(el => {
    el.setAttribute('data-rank', el.textContent.trim());
  });
});


/* ═══════════════════════════════════════════════════════
   ANIME POWER BARS — animate on scroll into view
═══════════════════════════════════════════════════════ */
const animeBarObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const w    = parseFloat(fill.getAttribute('data-w')) || 0;
      // Stagger: each bar animates in sequence
      const idx  = fill.closest('.anime-bar-item')
                       ?.parentElement
                       ?.querySelectorAll('.anime-bar-item') ?? [];
      let delay = 0;
      if (idx.length) {
        const arr = Array.from(idx);
        delay = arr.indexOf(fill.closest('.anime-bar-item')) * 180;
      }
      setTimeout(() => {
        fill.style.transform = `scaleX(${w})`;
        fill.classList.add('bar-animated');
      }, delay);
      animeBarObserver.unobserve(fill);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.anime-bar__fill').forEach(el => animeBarObserver.observe(el));


/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL — skill cards anime pop, others fade up
═══════════════════════════════════════════════════════ */
// Skill cards — anime pop
const skillCardObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const card = entry.target;
      setTimeout(() => {
        card.style.opacity = '1';
        card.classList.add('anime-entered');
      }, (i % 8) * 55);
      skillCardObserver.unobserve(card);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.skill-card').forEach(el => {
  el.style.opacity = '0';
  skillCardObserver.observe(el);
});

// Other elements — standard fade up
const fadeSelectors = [
  '.project-card', '.contact__link-card',
  '.anime-bar-item', '.about__img-wrap', '.about__text'
].join(', ');

const fadeEls = document.querySelectorAll(fadeSelectors);
fadeEls.forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s cubic-bezier(0.23,1,0.32,1), transform 0.6s cubic-bezier(0.23,1,0.32,1)';
});

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
      }, (i % 5) * 80);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.10 });
fadeEls.forEach(el => fadeObserver.observe(el));


/* ═══════════════════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ═══════════════════════════════════════════════════════
   CONTACT FORM — new connect section IDs
═══════════════════════════════════════════════════════ */
const sendBtn = document.getElementById('sendBtn');
if (sendBtn) {
  sendBtn.addEventListener('click', () => {
    const name    = document.getElementById('c-name')?.value.trim();
    const email   = document.getElementById('c-email')?.value.trim();
    const message = document.getElementById('c-message')?.value.trim();

    if (!name || !email || !message) {
      sendBtn.querySelector('.connect__send-btn-text').innerHTML =
        'Fill all fields ✕';
      sendBtn.style.background = '#c0392b';
      sendBtn.style.boxShadow  = '0 4px 20px rgba(192,57,43,0.4)';
      setTimeout(() => {
        sendBtn.querySelector('.connect__send-btn-text').innerHTML =
          'Transmit <i class="fas fa-satellite-dish"></i>';
        sendBtn.style.background = '';
        sendBtn.style.boxShadow  = '';
      }, 2500);
      return;
    }

    sendBtn.querySelector('.connect__send-btn-text').innerHTML =
      'Transmission sent! <i class="fas fa-check"></i>';
    sendBtn.style.background = '#1db954';
    sendBtn.style.boxShadow  = '0 4px 20px rgba(29,185,84,0.4)';
    setTimeout(() => {
      sendBtn.querySelector('.connect__send-btn-text').innerHTML =
        'Transmit <i class="fas fa-satellite-dish"></i>';
      sendBtn.style.background = '';
      sendBtn.style.boxShadow  = '';
    }, 3500);
  });
}