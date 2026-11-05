(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const pad = n => String(n).padStart(2, '0');
  // "reduzir movimento" do sistema: mantém as animações de rolagem, desliga parallax/loops/smooth
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  root.classList.add('js'); if (reduce) root.classList.add('lite');

  /* ---------- smooth scroll (Lenis no desktop; toque usa a rolagem nativa) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) { try { lenis = new Lenis({ lerp: 0.09, smoothWheel: true }); } catch (e) { lenis = null; } }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.5, easing: t => 1 - Math.pow(1 - t, 4) });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- split text ---------- */
  function splitWords(el, cls) {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          if (cls) { const s = document.createElement('span'); s.className = cls; s.textContent = part; frag.appendChild(s); }
          else { const w = document.createElement('span'); w.className = 'w'; const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i++); wi.textContent = part; w.appendChild(wi); frag.appendChild(w); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  }
  $$('[data-split]').forEach(el => splitWords(el));
  const st = $('#statementText'); const keys = new Set();
  st.textContent = st.textContent.replace(/\*([^*]+)\*/g, (m, w) => { keys.add(w); return w; });
  splitWords(st, 'sw');
  const sWords = $$('.sw', st);
  sWords.forEach(w => { if (keys.has(w.textContent)) w.classList.add('k'); });

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  $$('[data-reveal],[data-split]').forEach(el => { if (!el.closest('#heroCopy')) io.observe(el); });
  const hero = $('#hero');
  let heroDone = false;
  const heroIn = () => { if (heroDone) return; heroDone = true; hero.classList.add('ready'); $$('#heroCopy [data-reveal], #heroCopy [data-split]').forEach(el => el.classList.add('in')); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(heroIn, 100));
  setTimeout(heroIn, 1200);

  /* ---------- contadores ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, t0 = performance.now(), dur = 1800;
    const tick = now => { const p = clamp((now - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(2, -10 * p))); if (p < 1) requestAnimationFrame(tick); else el.textContent = to; };
    requestAnimationFrame(tick);
  }), { threshold: 0.5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- marquee ---------- */
  const segs = ['Clínicas de estética', 'Academias', 'Advocacia', 'Psicologia', 'Saúde', 'Hospedagem boutique', 'Beleza', 'Bem-estar'];
  const mqA = $('#mqA'), mqB = $('#mqB');
  const rowA = segs.map(s => `<span><em>${s}</em><i class="star"></i></span>`).join('');
  const rowB = ['Landing pages', 'Sites institucionais', 'E-commerce', 'SEO', 'Responsivo', 'Copy de conversão', 'WhatsApp integrado', 'Suporte'].map(s => `<span>${s} <span style="color:var(--cobalt-2)">✦</span></span>`).join('');
  mqA.innerHTML = rowA + rowA + rowA; mqB.innerHTML = rowB + rowB + rowB;
  let mqx = 0, mqxB = 0, mqDir = 1, wA = 0, wB = 0;

  /* ---------- FAQ ---------- */
  $$('.qa button').forEach(b => b.addEventListener('click', () => {
    const qa = b.parentElement, open = !qa.classList.contains('open');
    $$('.qa').forEach(q => { q.classList.remove('open'); q.querySelector('button').setAttribute('aria-expanded', 'false'); });
    if (open) { qa.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    setTimeout(measure, 650);
  }));

  /* ---------- cursor + magnético (só com mouse) ---------- */
  const cur = $('#cursor'), dot = $('#cursorDot');
  let mx = innerWidth / 2, my = innerHeight / 2, cx_ = mx, cy_ = my, nmx = 0, nmy = 0, smx = 0, smy = 0;
  if (fine) {
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; nmx = mx / innerWidth - .5; nmy = my / innerHeight - .5; }, { passive: true });
    if (!reduce) {
      root.classList.add('has-cursor');
      document.addEventListener('pointerover', e => {
        const lab = e.target.closest('[data-cursor]'), link = e.target.closest('a,button');
        cur.classList.toggle('big', !!lab); cur.textContent = lab ? lab.dataset.cursor : '';
        cur.classList.toggle('link', !lab && !!link);
      });
      $$('.magnetic').forEach(el => {
        el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .26}px,${(e.clientY - r.top - r.height / 2) * .36}px)`; });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
      });
    }
  }

  /* ---------- elementos ---------- */
  const nav = $('#nav'), bar = $('#progressBar'), wa = $('#wa');
  const layers = $$('#hero .layer'), heroCopy = $('#heroCopy'), heroImg = $('#heroImg');
  const scene = $('#scene'), hsec = $('#portfolio'), htrack = $('#htrack');
  const cards = $$('#stack .card');
  const projs = $$('.proj'), shots = projs.map(p => p.querySelector('.shot'));
  const steps = $$('#steps .step'), stepsEl = $('#steps'), stepsFill = $('#stepsFill'), procBig = $('#procBig');
  const ctaBox = $('#ctaBox'), ctaMedia = $('#ctaMedia'), ctaBg = $('#ctaBg'), ctaPhoto = $('#ctaPhoto'), ctaLines = $$('[data-ctl]');
  const giant = $('#giant'), giantLetters = $$('#giant > *');
  const phases = $$('#phases li'), navLinks = $$('.nav-links a');
  const hudBar = $('#hudBar'), tcEl = $('#timecode'), leadEls = $$('.leadCount'), hBar = $('#hBar'), hIdx = $('#hIdx');
  const totalProj = projs.length;
  $('#hTot').textContent = ' / ' + pad(totalProj);

  let vw = innerWidth, vh = innerHeight, docH = 1, M = { scene: { t: 0, d: 1 }, h: { t: 0, d: 0 }, sections: [], stickyTops: [] }, mobile = vw < 861;
  const top = el => el.getBoundingClientRect().top + scrollY;

  function measure() {
    vw = innerWidth; vh = innerHeight; mobile = vw < 861;
    // cartões: o topo fixo nunca deixa um cartão maior que a tela ser cortado
    const base = mobile ? 72 : 96, stepY = mobile ? 12 : 20;
    cards.forEach((c, i) => { c.style.top = Math.round(Math.min(base + i * stepY, vh - c.offsetHeight - 12)) + 'px'; });
    // portfólio horizontal: distância = fim do último item + margem
    const last = htrack.lastElementChild;
    const padR = parseFloat(getComputedStyle(htrack).paddingRight) || 24;
    const hdist = Math.max(0, last.offsetLeft + last.offsetWidth + padR - vw);
    const pinH = hsec.firstElementChild.offsetHeight || vh;
    hsec.style.height = (hdist + pinH) + 'px';
    M = {
      scene: { t: top(scene), d: Math.max(1, scene.offsetHeight - (scene.firstElementChild.offsetHeight || vh)) },
      h: { t: top(hsec), d: hdist },
      stickyTops: cards.map(c => parseFloat(c.style.top) || base),
      sections: ['services', 'portfolio', 'process', 'faq'].map(id => ({ id, t: top($('#' + id)) })),
    };
    docH = Math.max(1, document.documentElement.scrollHeight - vh);
    wA = mqA.scrollWidth / 3; wB = mqB.scrollWidth / 3;
    sizeCanvas();
  }

  /* ---------- canvas: página sendo construída ---------- */
  const cv = $('#buildCanvas'), g = cv.getContext('2d');
  const video = $('#scrubVideo'), useVideo = !!video.dataset.src;
  if (useVideo) { video.src = video.dataset.src; video.hidden = false; cv.hidden = true; video.load(); }
  let CW = 0, CH = 0, sceneCur = 0, sceneDrawn = -1;
  function sizeCanvas() {
    const r = cv.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2);
    CW = r.width; CH = r.height; cv.width = Math.max(1, Math.round(CW * dpr)); cv.height = Math.max(1, Math.round(CH * dpr)); g.setTransform(dpr, 0, 0, dpr, 0, 0); sceneDrawn = -1;
  }
  const COL = { ink: '#0b0d12', ink2: '#141821', ink3: '#1d2231', paper: '#eceef3', cob: '#4560ff', cob2: '#93a3ff', sig: '#ffd23f', mist: '#8e94a6' };
  const LD = { nav: [.04, .05, .92, .07], img: [.55, .19, .39, .52], h1a: [.06, .22, .42, .09], h1b: [.06, .325, .32, .09], p1: [.06, .45, .4, .028], p2: [.06, .5, .3, .028], cta: [.06, .58, .2, .085], c0: [.06, .77, .27, .17], c1: [.365, .77, .27, .17], c2: [.67, .77, .27, .17] };
  const LM = { nav: [.06, .035, .88, .055], img: [.06, .12, .88, .28], h1a: [.06, .43, .8, .06], h1b: [.06, .5, .55, .06], p1: [.06, .585, .86, .02], p2: [.06, .62, .66, .02], cta: [.06, .67, .6, .065], c0: [.06, .77, .88, .07], c1: [.06, .85, .88, .07], c2: [.06, .93, .88, .05] };
  const ORDER = ['nav', 'img', 'h1a', 'h1b', 'p1', 'p2', 'cta', 'c0', 'c1', 'c2'];
  function rr(x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function drawScene(p) {
    g.clearRect(0, 0, CW, CH);
    if (CW < 10 || CH < 10) return;
    const s1 = seg(p, 0, .2), s2 = seg(p, .16, .42), s3 = seg(p, .42, .62), s4 = seg(p, .6, .8), s5 = seg(p, .78, 1);
    g.strokeStyle = 'rgba(147,163,255,0.06)'; g.lineWidth = 1; g.beginPath();
    for (let x = (CW % 48) / 2; x < CW; x += 48) { g.moveTo(x, 0); g.lineTo(x, CH); }
    for (let y = (CH % 48) / 2; y < CH; y += 48) { g.moveTo(0, y); g.lineTo(CW, y); }
    g.stroke();
    const narrow = CW < 620;
    const side = narrow ? 24 : 0;
    const deskW = Math.min(CW * .9, 980), mobW = narrow ? Math.min(CW - side * 2 - 60, 300) : Math.min(CW * .9, 330);
    const m = easeIO(Math.sin(s3 * Math.PI));
    const mm = narrow ? 1 : m;
    const bw = narrow ? lerp(CW - side * 2, mobW, m) : lerp(deskW, mobW, m);
    const bh = Math.min(CH * (narrow ? .78 : .74), narrow ? 600 : deskW * .64, 640);
    const bx = (CW - bw) / 2, by = (CH - bh) / 2 - (narrow ? 18 : 0);
    g.globalAlpha = ease(seg(p, 0, .05)) || .001;
    g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 60; g.shadowOffsetY = 30;
    rr(bx, by, bw, bh, 18); g.fillStyle = COL.ink2; g.fill();
    g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(236,238,243,.12)'; g.stroke();
    g.fillStyle = COL.ink3;[0, 1, 2].forEach(i => { g.beginPath(); g.arc(bx + 18 + i * 14, by + 16, 4, 0, 7); g.fill(); });
    const ux = bx + 70, uw = Math.max(40, bw - 90);
    rr(ux, by + 7, uw, 18, 9); g.fillStyle = COL.ink; g.fill();
    g.fillStyle = COL.mist; g.font = '500 10px "JetBrains Mono", monospace'; g.textBaseline = 'middle';
    const wpx = Math.round(lerp(narrow ? 390 : 1440, narrow ? 320 : 375, m));
    g.save(); rr(ux, by + 7, uw, 18, 9); g.clip();
    g.fillText('seunegocio.com.br', ux + 10, by + 16.5);
    if (s3 > 0 && s3 < 1) { g.fillStyle = COL.sig; g.textAlign = 'right'; g.fillText(wpx + 'px', ux + uw - 10, by + 16.5); g.textAlign = 'left'; }
    g.restore(); g.globalAlpha = 1;
    const x0 = bx, y0 = by + 32, w = bw, h = bh - 32;
    const R = k => { const a = LD[k], b = LM[k]; return [x0 + w * lerp(a[0], b[0], mm), y0 + h * lerp(a[1], b[1], mm), w * lerp(a[2], b[2], mm), h * lerp(a[3], b[3], mm)]; };
    const press = seg(s4, .7, .8) * (1 - seg(s4, .8, .95));
    ORDER.forEach((k, i) => {
      const wk = ease(seg(s1, i * .06, i * .06 + .45)), fk = ease(seg(s2, i * .05, i * .05 + .42));
      let [x, y, rw, rh] = R(k);
      if (k === 'cta' && press) { const sc = 1 - press * .06; x += rw * (1 - sc) / 2; y += rh * (1 - sc) / 2; rw *= sc; rh *= sc; }
      const rad = k === 'cta' ? rh / 2 : k === 'img' ? 14 : k.length === 2 ? 10 : 4;
      if (wk > 0 && fk < 1) {
        const per = 2 * (rw + rh);
        g.setLineDash([per * wk, per]); g.lineWidth = 1.2; g.strokeStyle = `rgba(147,163,255,${.9 * (1 - fk)})`;
        rr(x, y, rw, rh, rad); g.stroke(); g.setLineDash([]);
        if (wk > .9 && fk < .2 && k === 'img') { g.strokeStyle = `rgba(147,163,255,${.4 * (1 - fk * 5)})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rw, y + rh); g.moveTo(x + rw, y); g.lineTo(x, y + rh); g.stroke(); }
      }
      if (fk <= 0) return;
      g.globalAlpha = fk;
      if (k === 'nav') {
        g.fillStyle = COL.paper; g.font = `800 ${Math.max(10, rh * .5)}px "Bricolage Grotesque", sans-serif`; g.textBaseline = 'middle'; g.fillText('marca.', x, y + rh / 2);
        const n = mm > .5 ? 1 : 4; for (let j = 0; j < n; j++) { rr(x + rw - (j + 1) * (mm > .5 ? 22 : rw * .09), y + rh / 2 - 3, mm > .5 ? 18 : rw * .06, 6, 3); g.fillStyle = mm > .5 ? COL.paper : COL.ink3; g.fill(); }
      } else if (k === 'img') {
        const gr = g.createLinearGradient(x, y, x + rw, y + rh); gr.addColorStop(0, COL.cob); gr.addColorStop(1, '#1b2a9e');
        rr(x, y, rw, rh, rad); g.fillStyle = gr; g.fill();
        g.save(); rr(x, y, rw, rh, rad); g.clip();
        g.fillStyle = COL.sig; g.beginPath(); g.arc(x + rw * .7, y + rh * .35, Math.min(rw, rh) * .14, 0, 7); g.fill();
        g.fillStyle = 'rgba(11,13,18,.45)'; g.beginPath(); g.moveTo(x, y + rh); g.lineTo(x + rw * .35, y + rh * .55); g.lineTo(x + rw * .6, y + rh * .8); g.lineTo(x + rw * .8, y + rh * .6); g.lineTo(x + rw, y + rh * .85); g.lineTo(x + rw, y + rh); g.fill();
        g.restore();
      } else if (k === 'h1a' || k === 'h1b') {
        g.save(); g.beginPath(); g.rect(x, y - 4, rw * 1.3, rh + 8); g.clip();
        g.fillStyle = COL.paper; g.font = `800 ${rh * .88}px "Bricolage Grotesque", sans-serif`; g.textBaseline = 'top';
        g.fillText(k === 'h1a' ? 'Seu próximo' : 'cliente.', x, y + rh * .04 + (1 - fk) * rh);
        if (k === 'h1b') { const tw = g.measureText('cliente').width; g.fillStyle = COL.cob; g.fillRect(x + tw + 2, y + rh * .62, rh * .2, rh * .2); }
        g.restore();
      } else if (k === 'p1' || k === 'p2') {
        rr(x, y, rw, rh, rh / 2); g.fillStyle = COL.ink3; g.fill();
      } else if (k === 'cta') {
        const glow = seg(s4, .8, 1);
        if (glow > 0) { g.shadowColor = `rgba(69,96,255,${.8 * glow})`; g.shadowBlur = 30 * glow; }
        rr(x, y, rw, rh, rad); g.fillStyle = press > .3 ? COL.sig : COL.cob; g.fill(); g.shadowColor = 'transparent';
        g.fillStyle = press > .3 ? COL.ink : '#fff'; g.font = `600 ${Math.max(9, rh * .36)}px "Instrument Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('Fale comigo', x + rw / 2, y + rh / 2); g.textAlign = 'left';
      } else {
        rr(x, y, rw, rh, rad); g.fillStyle = COL.ink3; g.fill(); g.strokeStyle = 'rgba(236,238,243,.08)'; g.stroke();
        g.fillStyle = COL.cob2; g.beginPath(); g.arc(x + 16, y + Math.min(18, rh / 2), 5, 0, 7); g.fill();
        rr(x + 28, y + Math.min(15, rh / 2 - 3), rw * .45, 6, 3); g.fillStyle = 'rgba(236,238,243,.25)'; g.fill();
      }
      g.globalAlpha = 1;
    });
    if (s4 > 0) {
      const [x, y, rw, rh] = R('cta');
      const t = easeIO(seg(s4, 0, .68));
      const sx = bx + bw * .9, sy = by + bh * 1.02;
      const px = lerp(sx, x + rw * .6, t), py = lerp(sy, y + rh * .6, t) - Math.sin(t * Math.PI) * 40;
      const rip = seg(s4, .72, 1);
      if (rip > 0 && rip < 1) { g.strokeStyle = `rgba(255,210,63,${1 - rip})`; g.lineWidth = 2; g.beginPath(); g.arc(px, py, 8 + rip * 60, 0, 7); g.stroke(); }
      g.globalAlpha = seg(s4, 0, .1) * (1 - seg(s5, .6, .9));
      g.save(); g.translate(px, py); const sc = 1 - press * .15; g.scale(sc, sc);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 22); g.lineTo(6, 17); g.lineTo(10, 26); g.lineTo(14, 24); g.lineTo(10, 15); g.lineTo(17, 15); g.closePath();
      g.fillStyle = '#fff'; g.fill(); g.strokeStyle = COL.ink; g.lineWidth = 1.5; g.stroke(); g.restore(); g.globalAlpha = 1;
    }
    const msgs = [['Avaliação agendada', 'Clínica de estética · agora'], ['Consulta solicitada', 'Advocacia · há 2 min'], ['+1 aluno', 'Plano anual · Academia']];
    const tw = Math.min(236, CW - 48);
    msgs.forEach((mg, i) => {
      const t = ease(seg(s5, i * .2, i * .2 + .4)); if (t <= 0) return;
      const tx = Math.min(bx + bw - tw * .6, CW - tw - 24) + (1 - t) * 50, ty = by + 48 + i * 62;
      g.globalAlpha = t;
      g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
      rr(tx, ty, tw, 52, 14); g.fillStyle = COL.paper; g.fill(); g.shadowColor = 'transparent';
      rr(tx + 10, ty + 11, 30, 30, 9); g.fillStyle = i === 2 ? COL.sig : COL.cob; g.fill();
      g.fillStyle = i === 2 ? COL.ink : '#fff'; g.font = '700 14px "Instrument Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i === 2 ? '+1' : '✓', tx + 25, ty + 26.5); g.textAlign = 'left';
      g.fillStyle = COL.ink; g.font = '600 13px "Instrument Sans", sans-serif'; g.fillText(mg[0], tx + 50, ty + 20);
      g.fillStyle = '#5a6072'; g.font = '12px "Instrument Sans", sans-serif'; g.fillText(mg[1], tx + 50, ty + 36);
      g.globalAlpha = 1;
    });
  }

  /* ---------- prévias: rolar a página inteira ao parar o cursor (no celular: ao centralizar) ---------- */
  function peek(card, on) {
    const img = card.querySelector('.full'); if (!img) return;
    const wrap = img.parentElement, thumb = card.querySelector('.scrolltrack i');
    const ih = img.getBoundingClientRect().height, wh = wrap.clientHeight;
    const dist = Math.max(0, ih - wh), th = clamp(wh / Math.max(1, ih), .06, 1);
    thumb.style.setProperty('--th', (th * 100).toFixed(1) + '%');
    if (on && dist > 0) {
      const dur = clamp(dist / 480, 3, 15);
      const t = `transform ${dur}s cubic-bezier(.45,.05,.55,.95) .3s`;
      img.style.transition = t; thumb.style.transition = t;
      img.style.transform = `translate3d(0,${-dist}px,0)`;
      thumb.style.transform = `translate3d(0,${(wh - 12) * (1 - th)}px,0)`;
      card.classList.add('playing');
    } else {
      const back = 'transform .9s cubic-bezier(.65,0,.35,1)';
      img.style.transition = back; thumb.style.transition = back;
      img.style.transform = 'translate3d(0,0,0)'; thumb.style.transform = 'translate3d(0,0,0)';
      card.classList.remove('playing');
    }
  }
  if (!fine) $$('.peek').forEach(el => el.textContent = 'Centralize para ver a página');
  projs.forEach(p => {
    if (!p.querySelector('.full')) return;
    p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') peek(p, true); });
    p.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') peek(p, false); });
    p.addEventListener('focus', () => peek(p, true));
    p.addEventListener('blur', () => peek(p, false));
  });

  /* ---------- loop ---------- */
  let lastY = scrollY, vel = 0, phaseIdx = -1, hIdxLast = '', stepLast = -2, leadsLast = -1;
  function frame(time) {
    if (lenis) lenis.raf(time);
    const y = scrollY, dy = y - lastY; lastY = y; vel += (dy - vel) * .18;
    smx += (nmx - smx) * .07; smy += (nmy - smy) * .07;
    const motion = !reduce;

    bar.style.transform = `scaleX(${clamp(y / docH)})`;
    nav.classList.toggle('solid', y > 30);
    if (y > 300 && vel > 1.5) nav.classList.add('hide'); else if (vel < -1.5 || y < 300) nav.classList.remove('hide');
    wa.classList.toggle('show', y > vh * .8);
    let act = ''; M.sections.forEach(s => { if (y + vh * .4 >= s.t) act = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + act));

    if (fine && motion) { cx_ += (mx - cx_) * .16; cy_ += (my - cy_) * .16; cur.style.transform = `translate3d(${cx_}px,${cy_}px,0)`; dot.style.transform = `translate3d(${mx}px,${my}px,0)`; }

    // hero: parallax de rolagem (+ mouse no desktop) e zoom da foto
    if (y < vh * 1.6) {
      const k = mobile ? .14 : 1.6;
      layers.forEach(l => { const d = +l.dataset.depth || 0, mo = +l.dataset.mouse || 0; l.style.transform = motion ? `translate3d(${smx * mo}px,${smy * mo - y * d * k}px,0)` : ''; });
      if (heroImg && heroDone) heroImg.style.transform = `scale(${1 + clamp(y / vh) * .16})`;
      if (!mobile && motion) { heroCopy.style.transform = `translate3d(0,${y * .22}px,0)`; heroCopy.style.opacity = 1 - clamp(y / (vh * .85)); }
      else { heroCopy.style.transform = ''; heroCopy.style.opacity = ''; }
    }

    // marquee reage à velocidade e à direção da rolagem
    if (Math.abs(vel) > .3) mqDir = vel > 0 ? 1 : -1;
    const sp = (motion ? 1 : .4) + Math.min(Math.abs(vel) * .35, 22);
    mqx -= sp * mqDir; mqxB += sp * .6 * mqDir;
    if (wA) mqx = ((mqx % wA) - wA) % wA;
    if (wB) mqxB = ((mqxB % wB) - wB) % wB;
    mqA.style.transform = `translate3d(${mqx}px,0,0) skewX(${motion ? -clamp(vel * .25, -8, 8) : 0}deg)`;
    mqB.style.transform = `translate3d(${mqxB}px,0,0)`;

    // frase: palavras acendem conforme o texto atravessa a tela
    const sr = st.getBoundingClientRect();
    if (sr.top < vh && sr.bottom > 0) {
      const sp2 = clamp((vh * .88 - sr.top) / (vh * .5 + sr.height * .6));
      const n = sWords.length;
      sWords.forEach((w, i) => { w.style.opacity = (.16 + .84 * clamp(sp2 * n * 1.05 - i)).toFixed(3); });
    }

    // cena guiada pela rolagem: avança/retrocede com a posição e a velocidade
    const target = clamp((y - M.scene.t) / M.scene.d);
    sceneCur += (target - sceneCur) * .14;
    if (Math.abs(sceneCur - target) < .0005) sceneCur = target;
    if (y > M.scene.t - vh * 1.2 && y < M.scene.t + M.scene.d + vh) {
      if (useVideo) { if (video.duration) { const t = sceneCur * video.duration; if (Math.abs(video.currentTime - t) > .03) video.currentTime = t; } }
      else if (Math.abs(sceneCur - sceneDrawn) > .0004) { drawScene(sceneCur); sceneDrawn = sceneCur; }
      hudBar.style.transform = `scaleX(${sceneCur})`;
      const secs = sceneCur * 8; tcEl.textContent = `00:${pad(Math.floor(secs))}:${pad(Math.floor((secs % 1) * 30))}`;
      const pi = sceneCur < .16 ? 0 : sceneCur < .42 ? 1 : sceneCur < .62 ? 2 : sceneCur < .8 ? 3 : 4;
      if (pi !== phaseIdx) { phaseIdx = pi; phases.forEach((l, i) => l.classList.toggle('on', i <= pi)); }
      const leads = Math.round(seg(sceneCur, .78, 1) * 27);
      if (leads !== leadsLast) { leadsLast = leads; leadEls.forEach(e => e.textContent = leads); }
    }

    // serviços: o cartão de baixo cobre o de cima, que encolhe e escurece
    if (cards.length) {
      const tops = cards.map(c => c.getBoundingClientRect().top);
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        const cover = clamp(1 - (tops[i + 1] - M.stickyTops[i]) / (vh * .8));
        c.style.transform = `scale(${1 - cover * .06})`; c.style.setProperty('--dim', (cover * .35).toFixed(3));
      });
    }

    // portfólio: rolagem horizontal
    const hp = M.h.d ? clamp((y - M.h.t) / M.h.d) : 0;
    htrack.style.transform = `translate3d(${-hp * M.h.d}px,0,0)`;
    hBar.style.transform = `scaleX(${hp})`;
    const hi = pad(Math.min(totalProj, 1 + Math.floor(hp * totalProj)));
    if (hi !== hIdxLast) { hIdxLast = hi; hIdx.textContent = hi; }
    if (y > M.h.t - vh && y < M.h.t + M.h.d + vh) {
      const skew = motion ? clamp(vel * .12, -4, 4) : 0;
      projs.forEach((p, i) => {
        const r = p.getBoundingClientRect(); const c = (r.left + r.width / 2) / vw - .5;
        p.style.transform = `skewX(${-skew}deg) translateY(${Math.abs(c) * (mobile ? 18 : 30)}px)`;
        if (shots[i]) shots[i].style.transform = `translate3d(${c * -32}px,0,0)`;
        if (!fine) { const want = Math.abs(c) < .18 && Math.abs(vel) < 3; if (want !== !!p._auto) { p._auto = want; peek(p, want); } }
      });
    }

    // processo: linha que preenche + número que troca
    const er = stepsEl.getBoundingClientRect();
    stepsFill.style.transform = `scaleY(${clamp((vh * .62 - er.top) / er.height)})`;
    let on = -1; steps.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .62) on = i; });
    if (on !== stepLast) {
      stepLast = on; steps.forEach((s, i) => s.classList.toggle('on', i <= on));
      procBig.textContent = pad(Math.max(0, on) + 1);
      if (procBig.animate) procBig.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
    }

    // CTA: a máscara abre e o conteúdo sobe conforme a seção entra
    const cr = ctaBox.getBoundingClientRect();
    if (cr.top < vh * 1.1 && cr.bottom > -50) {
      const cp = clamp((vh - cr.top) / (vh * .8)), ce = ease(cp);
      ctaMedia.style.setProperty('--ci', lerp(mobile ? 3 : 8, 0, ce).toFixed(2) + '%');
      ctaMedia.style.setProperty('--cs', lerp(mobile ? 4 : 16, 0, ce).toFixed(2) + '%');
      ctaMedia.style.setProperty('--cr', lerp(mobile ? 24 : 36, 0, ce).toFixed(1) + 'px');
      ctaBg.style.transform = `scale(${lerp(1.18, 1, ce)})`;
      ctaLines.forEach((l, i) => { const t = ease(seg(cp, .2 + i * .1, .65 + i * .1)); l.style.transform = `translate3d(0,${(1 - t) * 105}%,0)`; });
      ctaPhoto.style.transform = `translate3d(0,${(1 - ce) * 14}%,0) scale(${lerp(.92, 1, ce)})`;
    }

    // rodapé: letras sobem em cascata
    const gr = giant.getBoundingClientRect();
    if (gr.top < vh) {
      const gp = clamp((vh - gr.top) / (vh * .55));
      giantLetters.forEach((l, i) => { const t = ease(seg(gp, i * .06, .55 + i * .06)); l.style.transform = `translate3d(0,${(1 - t) * 60}%,0)`; l.style.opacity = (.15 + .85 * t).toFixed(3); });
    }

    requestAnimationFrame(frame);
  }

  measure();
  // no celular a barra de endereço muda a altura: só recalcula quando a largura muda ou a altura muda muito
  let lastW = innerWidth, lastH = innerHeight, rz;
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 160) return;
    lastW = innerWidth; lastH = innerHeight; clearTimeout(rz); rz = setTimeout(measure, 120);
  });
  addEventListener('orientationchange', () => setTimeout(measure, 300));
  addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);
  $$('img').forEach(im => { if (!im.complete) im.addEventListener('load', measure, { once: true }); });
  requestAnimationFrame(frame);
})();
