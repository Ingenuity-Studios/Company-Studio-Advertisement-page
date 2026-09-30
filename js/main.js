/* ============================================================
   FORECOURT · section F classifieds — vanilla JS, no deps
   nav · reveals · counters · auto-rewriting ad · ROI calculator
   ============================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- dateline + year ---------------- */
  var dl = document.getElementById('dateline');
  if (dl) {
    var now = new Date();
    dl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }).toUpperCase() + ' · VOL. I';
  }
  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------------- mobile nav ---------------- */
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------- scroll reveals ---------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- stat counters ---------------- */
  function animateCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (!isFinite(to)) { el.textContent = '—'; return; }
    if (reduced) { el.textContent = to.toFixed(dec) + suffix; return; }
    var t0 = null, dur = 1500;
    function fmt(v) { return v.toFixed(dec) + suffix; }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = fmt(to);
    }
    requestAnimationFrame(frame);
  }
  var counts = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counts.forEach(function (el) { cio.observe(el); });
  } else {
    counts.forEach(animateCount);
  }

  /* ---------------- the self-rewriting classified ad ---------------- */
  var ads = [
    { cat: 'SEDAN',  car: '2019 Civic Sport · 62,140 mi',          price: '$18,900', hook: '“Runs like the day it left the lot.”',      fmt: 'Vertical Reel · 0:22 · captions burned in',  posted: 'Instagram · YouTube Shorts · TikTok' },
    { cat: 'TRUCK',  car: '2021 Tacoma TRD Off-Road · 41,875 mi',  price: '$36,450', hook: '“The bed’s empty. That’s the whole pitch.”', fmt: 'TikTok · 0:18 · trending audio pick',        posted: 'TikTok · Instagram Reels' },
    { cat: 'SUV',    car: '2020 Explorer XLT · 58,202 mi',         price: '$24,990', hook: '“Seven seats. One tank of no regrets.”',    fmt: 'Shorts · 0:25 · chapters auto-cut',            posted: 'YouTube Shorts · VDP embed' },
    { cat: 'MILEAGE DEAL', car: '2018 Camry LE · 88,004 mi',       price: '$14,200', hook: '“90K miles in. It’s just getting started.”',fmt: 'Reel · 0:20 · price-drop angle',             posted: 'Instagram · Facebook' },
    { cat: 'ICON',   car: '2017 Wrangler Sport · 71,510 mi',       price: '$21,750', hook: '“Weekend machine. Weekday story.”',         fmt: 'One-to-many · 3 cuts, one film',               posted: 'IG · YT · TT · VDP' }
  ];
  var els = {
    cat: document.getElementById('ad-cat'),
    car: document.getElementById('list-car'),
    hook: document.getElementById('list-hook'),
    fmt: document.getElementById('list-format'),
    posted: document.getElementById('list-posted'),
    price: document.getElementById('price-tag'),
    dots: document.getElementById('ad-dots')
  };
  if (els.car && els.cat) {
    var idx = 0, adTimer = null, t0rewrite = Date.now(), pausedAt = null;
    if (els.dots) {
      ads.forEach(function (_, i) {
        var d = document.createElement('i');
        if (i === 0) d.className = 'on';
        els.dots.appendChild(d);
      });
    }
    function paint(d, text) {
      if (!d) return;
      if (reduced) { d.textContent = text; return; }
      d.classList.add('swap');
      setTimeout(function () { d.textContent = text; d.classList.remove('swap'); }, 320);
    }
    function paintDots() {
      if (!els.dots) return;
      var ds = els.dots.children;
      for (var i = 0; i < ds.length; i++) ds[i].className = (i === idx) ? 'on' : '';
    }
    function rewrite() {
      idx = (idx + 1) % ads.length;
      var a = ads[idx];
      els.cat.textContent = a.cat;
      if (els.price) els.price.textContent = a.price;
      paint(els.car, a.car);
      paint(els.hook, a.hook);
      paint(els.fmt, a.fmt);
      paint(els.posted, a.posted);
      paintDots();
      t0rewrite = Date.now();
    }
    function startAd() {
      if (pausedAt !== null) { t0rewrite += Date.now() - pausedAt; pausedAt = null; }
      adTimer = setInterval(rewrite, 7000);
    }
    function stopAd() {
      if (adTimer) { clearInterval(adTimer); adTimer = null; }
      pausedAt = Date.now();
    }
    startAd();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAd(); else if (!adTimer) startAd();
    });
    var frame = document.querySelector('.ad-inner');
    if (frame) { frame.addEventListener('mouseenter', stopAd); frame.addEventListener('mouseleave', function(){ if(!adTimer) startAd(); }); }

    var rt = document.getElementById('rewrite-timer');
    if (rt) {
      setInterval(function () {
        if (pausedAt !== null) return; // frozen while the ad is paused — timer only runs live
        var s = Math.max(0, Math.floor((Date.now() - t0rewrite) / 1000));
        var hh = String(Math.floor(s / 3600)).padStart(2, '0');
        var mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        var ss = String(s % 60).padStart(2, '0');
        rt.textContent = hh + ':' + mm + ':' + ss;
      }, 1000);
    }
  }

  /* ---------------- ROI calculator ---------------- */
  var form = document.getElementById('roi-form');
  if (form) {
    var vVideos = document.getElementById('roi-videos');
    var vMins = document.getElementById('roi-mins');
    var vRate = document.getElementById('roi-rate');
    var vRet = document.getElementById('roi-retainer');
    var oVideos = document.getElementById('out-videos');
    var oMins = document.getElementById('out-mins');
    var oRate = document.getElementById('out-rate');
    var oRet = document.getElementById('out-retainer');
    var roCost = document.getElementById('ro-cost');
    var roHours = document.getElementById('ro-hours');
    var roYear = document.getElementById('ro-year');
    var modeFields = form.querySelectorAll('[data-mode]');

    function num(el, lo, hi, dflt) {
      var v = parseFloat(el.value);
      if (!isFinite(v)) v = dflt;
      v = Math.min(hi, Math.max(lo, v));
      return v;
    }
    function usd(n) {
      if (!isFinite(n)) n = 0;
      return '$' + Math.round(n).toLocaleString('en-US');
    }
    function calc() {
      var mode = form.querySelector('input[name="roi-mode"]:checked');
      mode = mode ? mode.value : 'creator';
      var videos = num(vVideos, 1, 25, 5);
      var mins = num(vMins, 10, 120, 75);
      var rate = num(vRate, 10, 16, 13);
      var retainer = num(vRet, 500, 3000, 1500);

      oVideos.textContent = String(videos);
      oMins.textContent = String(mins);
      oRate.textContent = '$' + rate;
      oRet.textContent = '$' + Math.round(retainer).toLocaleString('en-US');

      var monthly, hours, note;
      if (mode === 'creator') {
        hours = videos * 4.33 * (mins / 60);
        monthly = hours * rate;
        note = 'Assumes 4.33 weeks/month · creator labor only — not the hours someone spends choosing, scripting and remembering to post.';
      } else {
        hours = 0;
        monthly = retainer;
        note = 'Agency retainer as billed. Hours shown as zero because the work isn’t yours — the invoice is.';
      }
      roCost.textContent = usd(monthly);
      roHours.replaceChildren(
        document.createTextNode((mode === 'creator' ? hours.toFixed(1) : '0')),
        (function () { var u = document.createElement('span'); u.className = 'ro-unit'; u.textContent = 'hr / mo'; return u; })()
      );
      roYear.textContent = usd(monthly * 12);

      var assume = document.getElementById('ro-assume');
      if (assume) {
        assume.textContent = (mode === 'creator'
          ? 'Creator mode: ' + videos + ' videos/wk × ' + mins + ' min × $' + rate + '/hr × 4.33 wks. '
          : 'Agency mode: retainer billed monthly. ') + note;
      }
      // toggle mode-specific fields
      modeFields.forEach(function (f) {
        var want = f.getAttribute('data-mode');
        if (want === 'creator') f.hidden = (mode !== 'creator');
        if (want === 'agency') f.hidden = (mode !== 'agency');
      });
    }
    form.addEventListener('input', calc);
    calc();
  }

  /* ---------------- FAQ: close others when one opens (accordion feel) ---------------- */
  var faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
