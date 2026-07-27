/* ============================================================
   Für Evin · Secret Spa Frankfurt
   ============================================================ */

/* ⬇︎ Evins Geburtstag hier eintragen (JJJJ-MM-TT), dann zählt die Seite
      live mit, wie überfällig das Geschenk ist. Auf null lassen = aus. */
const BIRTHDAY = null;   // z. B. "1994-03-17"

const HOLD_MS = 2000;

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   Partikel-Canvas (Konfetti + Laser teilen sich eine Fläche)
   ============================================================ */

const fx = (() => {
  const cv = $('#fx');
  const ctx = cv.getContext('2d');
  let particles = [];
  let laser = null;          // {x, y} solange Laser-Modus an ist
  let running = false;
  let w = 0, h = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  const tick = () => {
    ctx.clearRect(0, 0, w, h);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.g;
      p.vx *= 0.99;
      p.x += p.vx; p.y += p.vy;
      p.life -= 1;
      p.rot += p.vr;

      if (p.life <= 0 || p.y > h + 60) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.fade));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }

    if (laser) {
      const { x, y } = laser;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 46);
      glow.addColorStop(0, 'rgba(255,77,94,.42)');
      glow.addColorStop(1, 'rgba(255,77,94,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, 46, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,77,94,.9)';
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    }

    if (particles.length || laser) requestAnimationFrame(tick);
    else running = false;
  };

  const start = () => { if (!running) { running = true; requestAnimationFrame(tick); } };

  return {
    burst(x, y, count = 90) {
      const colors = ['#d6b27a', '#ecd6ae', '#f2ede6', '#a8814a', '#fff6e2'];
      const n = reduced ? Math.round(count / 3) : count;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 3 + Math.random() * 11;
        particles.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 5,
          g: 0.22 + Math.random() * 0.14,
          size: 5 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          color: colors[(Math.random() * colors.length) | 0],
          life: 90 + Math.random() * 60,
          fade: 70,
          round: Math.random() < 0.25
        });
      }
      start();
    },
    spark(x, y) {
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
          x, y,
          vx: Math.cos(a) * (1 + Math.random() * 2.5),
          vy: Math.sin(a) * (1 + Math.random() * 2.5),
          g: 0.04,
          size: 2 + Math.random() * 2.5,
          rot: 0, vr: 0,
          color: Math.random() < 0.5 ? '#ff4d5e' : '#ffb3ba',
          life: 16 + Math.random() * 14,
          fade: 22,
          round: true
        });
      }
      start();
    },
    setLaser(pos) { laser = pos; if (pos) start(); }
  };
})();

/* ============================================================
   Türsteher: gedrückt halten
   ============================================================ */

(() => {
  const gate = $('#gate');
  const btn  = $('#hold');
  const fill = $('.hold__fill');
  if (!gate || !btn) return;

  const CIRC = 339.3;
  let raf = null, t0 = 0, done = false;

  document.body.classList.add('is-locked');

  const setProgress = p => { fill.style.strokeDashoffset = String(CIRC * (1 - p)); };

  const step = now => {
    const p = Math.min((now - t0) / HOLD_MS, 1);
    setProgress(p);
    if (p >= 1) open();
    else raf = requestAnimationFrame(step);
  };

  const startHold = e => {
    if (done) return;
    if (e.cancelable) e.preventDefault();
    btn.classList.add('is-holding');
    t0 = performance.now();
    raf = requestAnimationFrame(step);
  };

  const endHold = () => {
    if (done) return;
    btn.classList.remove('is-holding');
    cancelAnimationFrame(raf);
    fill.style.transition = 'stroke-dashoffset .45s cubic-bezier(.22,.61,.36,1)';
    setProgress(0);
    setTimeout(() => { fill.style.transition = ''; }, 460);
  };

  function open() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    setProgress(1);
    btn.classList.remove('is-holding');

    gate.classList.add('is-open');
    document.body.classList.remove('is-locked');

    setTimeout(() => {
      fx.burst(innerWidth / 2, innerHeight * 0.42, 120);
      gate.setAttribute('hidden', '');
    }, 420);

    setTimeout(() => {
      $('#akte').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }, 700);
  }

  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup', endHold);
  btn.addEventListener('pointercancel', endHold);
  btn.addEventListener('pointerleave', endHold);
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); startHold(e); }
  });
  btn.addEventListener('keyup', e => {
    if (e.key === ' ' || e.key === 'Enter') endHold();
  });

  // Wer den Skip-Link nimmt, soll nicht im gesperrten Body hängen bleiben.
  $('.gate__skip')?.addEventListener('click', () => {
    done = true;
    gate.classList.add('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => gate.setAttribute('hidden', ''), 900);
  });
})();

/* ============================================================
   Einblenden beim Scrollen
   ============================================================ */

(() => {
  const items = $$('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();

/* ============================================================
   Zahlen hochzählen
   ============================================================ */

(() => {
  const nums = $$('[data-count]');
  if (!nums.length || !('IntersectionObserver' in window)) {
    nums.forEach(el => { el.textContent = Number(el.dataset.count).toLocaleString('de-DE'); });
    return;
  }

  const run = el => {
    const target = Number(el.dataset.count);
    if (reduced || target === 0) { el.textContent = target.toLocaleString('de-DE'); return; }

    const dur = 1600;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('de-DE');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
})();

/* ============================================================
   Verjährungs-Status
   ============================================================ */

(() => {
  if (!BIRTHDAY) return;
  const value = $('#verdictValue');
  const note  = $('#verdictNote');
  const bday  = new Date(BIRTHDAY);
  if (!value || Number.isNaN(bday.getTime())) return;

  const today = new Date();
  const last = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (last > today) last.setFullYear(last.getFullYear() - 1);

  const days = Math.floor((today - last) / 86400000);
  value.textContent = `${days} Tage überfällig`;
  note.textContent = 'Einspruch eingelegt. Geschenke verjähren nämlich nicht.';
})();

/* ============================================================
   Video
   ============================================================ */

(() => {
  const video = $('#clip');
  const btn = $('#play');
  if (!video || !btn) return;

  btn.addEventListener('click', async () => {
    btn.classList.add('is-gone');
    video.setAttribute('controls', '');
    try {
      video.muted = false;
      await video.play();
    } catch {
      // Manche Browser erlauben Ton erst nach mehr Zutun – dann eben stumm.
      video.muted = true;
      video.play().catch(() => {});
    }
  });

  video.addEventListener('ended', () => {
    btn.classList.remove('is-gone');
    video.removeAttribute('controls');
  });
})();

/* ============================================================
   Leichter Tilt auf den Fotos (nur mit Maus)
   ============================================================ */

(() => {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) translateZ(6px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ============================================================
   Gutschein umdrehen
   ============================================================ */

(() => {
  const card = $('#voucherCard');
  if (!card) return;
  let firstFlip = true;

  card.addEventListener('click', () => {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(flipped));

    if (flipped && firstFlip) {
      firstFlip = false;
      const r = card.getBoundingClientRect();
      setTimeout(() => fx.burst(r.left + r.width / 2, r.top + r.height / 2, 110), 380);
    }
  });
})();

/* ============================================================
   Laser-Modus
   ============================================================ */

(() => {
  const toggle = $('#laserToggle');
  if (!toggle) return;

  let on = false;
  let last = 0;

  const move = e => {
    const pos = { x: e.clientX, y: e.clientY };
    fx.setLaser(pos);
    const now = performance.now();
    if (now - last > 40) { last = now; fx.spark(pos.x, pos.y); }
  };

  const leave = () => fx.setLaser(null);

  toggle.addEventListener('click', () => {
    on = !on;
    toggle.setAttribute('aria-pressed', String(on));
    document.body.classList.toggle('laser-on', on);
    toggle.querySelector('.laser-toggle__text').textContent = on ? 'Laser läuft' : 'Laser-Modus';

    if (on) {
      addEventListener('pointermove', move, { passive: true });
      addEventListener('pointerleave', leave, { passive: true });
      const r = toggle.getBoundingClientRect();
      fx.setLaser({ x: r.left + r.width / 2, y: r.top - 20 });
    } else {
      removeEventListener('pointermove', move);
      removeEventListener('pointerleave', leave);
      fx.setLaser(null);
    }
  });

  // Erst zeigen, wenn die Akte im Blick ist – vorher lenkt er nur ab.
  const akte = $('#akte');
  if (akte && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { toggle.classList.add('is-visible'); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(akte);
  } else {
    toggle.classList.add('is-visible');
  }
})();
