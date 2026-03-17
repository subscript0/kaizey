/* KAIZEY — script.js */

/* year */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── PARTICLES ─────────────────────────────── */
(function(){
  const canvas = document.getElementById('particleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts, raf, tmr;

  function r(a,b){ return a + Math.random()*(b-a); }

  function resize(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function build(){
    const n = Math.min(Math.floor(W*H/14000), 100);
    pts = Array.from({length:n}, ()=>{
      const o = Math.random() < 0.18;
      return { x:r(0,W), y:r(0,H), rad:r(0.3, o?1.6:1.1),
               op:r(0.1,0.55), a:0, sp:r(0.003, o?0.016:0.008),
               ph:r(0,Math.PI*2), o, dx:r(-0.04,0.04), dy:r(-0.03,0.03) };
    });
  }

  let f=0;
  function draw(){
    raf = requestAnimationFrame(draw);
    ctx.clearRect(0,0,W,H);
    f++;
    for(const p of pts){
      p.a = p.op*(0.3+0.7*(0.5+0.5*Math.sin(f*p.sp+p.ph)));
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0) p.x=W; if(p.x>W) p.x=0;
      if(p.y<0) p.y=H; if(p.y>H) p.y=0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.rad, 0, Math.PI*2);
      ctx.fillStyle = p.o
        ? `rgba(255,122,0,${p.a.toFixed(2)})`
        : `rgba(255,255,255,${p.a.toFixed(2)})`;
      ctx.fill();
    }
  }

  resize(); build(); draw();
  window.addEventListener('resize', ()=>{
    clearTimeout(tmr);
    tmr = setTimeout(()=>{ cancelAnimationFrame(raf); resize(); build(); draw(); }, 200);
  });
})();

/* ── GLASS HEADER ───────────────────────────── */
const header     = document.getElementById('header');
const headerPill = document.getElementById('headerPill');
window.addEventListener('scroll', ()=>{
  const y = window.scrollY;
  const p = Math.min(y/40, 1);
  header.classList.toggle('scrolled', y > 40);
  headerPill.style.backdropFilter       = `blur(${(p*20).toFixed(1)}px)`;
  headerPill.style.webkitBackdropFilter = `blur(${(p*20).toFixed(1)}px)`;
  headerPill.style.background           = `rgba(13,16,32,${(p*0.8).toFixed(2)})`;
  headerPill.style.borderColor          = `rgba(255,255,255,${(p*0.12).toFixed(2)})`;
  headerPill.style.boxShadow            = p > 0.05 ? `0 8px 32px rgba(0,0,10,${(p*0.45).toFixed(2)})` : 'none';
}, {passive:true});

/* ── MOBILE NAV ─────────────────────────────── */
/* The hamburger button is set to display:none when the nav
   opens. Only the X close button inside the nav is visible.
   This is the ONLY reliable way to prevent double-X. */
const hamBtn     = document.getElementById('hamBtn');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose= document.getElementById('mobileClose');

function openNav(){
  mobileNav.classList.add('open');
  hamBtn.style.display = 'none';      /* hide ham — close btn takes over */
  document.body.style.overflow = 'hidden';
}
function closeNav(){
  mobileNav.classList.remove('open');
  hamBtn.style.display = '';           /* restore ham */
  document.body.style.overflow = '';
}

/* expose globally so onclick="" in HTML works */
window.closeMobileNav = closeNav;

hamBtn.addEventListener('click', openNav);
mobileClose && mobileClose.addEventListener('click', closeNav);
mobileNav.addEventListener('click', e=>{ if(e.target===mobileNav) closeNav(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeNav(); });

/* ── SKILLS FILTER ──────────────────────────── */
window.filterSkills = function(cat, btn){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.skill-card').forEach(card=>{
    card.style.display = (cat==='all' || card.dataset.cat===cat) ? 'flex' : 'none';
  });
};

/* ── ANIME POWER BARS ───────────────────────── */
const barObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const fill = e.target;
    fill.style.transform = `scaleX(${fill.getAttribute('data-w')||0})`;
    barObs.unobserve(fill);
  });
}, {threshold:0.3});
document.querySelectorAll('.bar-fill').forEach(el=>barObs.observe(el));

/* ── SMOOTH SCROLL ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(!id || id==='#') return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior:'smooth' });
  });
});

/* ── CONTACT FORM ───────────────────────────── */
const sendBtn = document.getElementById('sendBtn');
const sendTxt = document.getElementById('sendTxt');
if(sendBtn && sendTxt){
  sendBtn.addEventListener('click', ()=>{
    const name    = document.getElementById('c-name')?.value.trim();
    const email   = document.getElementById('c-email')?.value.trim();
    const message = document.getElementById('c-message')?.value.trim();
    if(!name || !email || !message){
      sendTxt.textContent = 'Fill all fields ✕';
      sendBtn.style.background = '#c0392b';
      setTimeout(()=>{ sendTxt.innerHTML='Transmit <i class="fas fa-satellite-dish"></i>'; sendBtn.style.background=''; }, 2500);
      return;
    }
    sendTxt.innerHTML = 'Sent! <i class="fas fa-check"></i>';
    sendBtn.style.background = '#1db954';
    setTimeout(()=>{ sendTxt.innerHTML='Transmit <i class="fas fa-satellite-dish"></i>'; sendBtn.style.background=''; }, 3000);
  });
}
