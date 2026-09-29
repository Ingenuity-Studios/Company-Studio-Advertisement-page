/* ============================================================
   FORECOURT — main.js (vanilla, no deps)
   nav · reveals · counters · hero countdown · pipeline rail ·
   ROI calculator · FAQ polish
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- nav: solid on scroll ---------- */
  var nav = $('.nav');
  function onScrollNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- nav: mobile toggle ---------- */
  var toggle = $('.nav-toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- reveals + step lighting ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- stats counters ---------- */
  function animateCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    if (!isFinite(to)) return;
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var fmt = function (n) { return pre + n.toFixed(dec) + suf; };
    if (reduceMotion) { el.textContent = fmt(to); return; }
    var dur = 1400, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(to);
    }
    requestAnimationFrame(step);
  }
  var counts = $$('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counts.forEach(function (c) { cio.observe(c); });
  } else {
    counts.forEach(animateCount);
  }

  /* ---------- hero: the twenty-minute countdown ---------- */
  var clock = $('.clock');
  var digits = $$('#clock-digits .digit');
  var stages = $$('#clock-stages li');
  var bar = $('#clock-progress');

  var TOTAL = 20 * 60;            // the claim: twenty minutes
  var RUN = 15000;                // compressed real-time for one pass (ms)
  var HOLD = 2800;                // linger on PUBLISHED
  var THRESH = [0, 0.25, 0.55, 0.8, 0.97, 1];

  function setClock(p) {
    if (!digits.length) return;
    var remain = Math.max(0, Math.ceil(TOTAL * (1 - p)));
    var mm = Math.floor(remain / 60), ss = remain % 60;
    var str = (mm < 10 ? '0' : '') + mm + (ss < 10 ? '0' : '') + ss;
    var dEls = digits;
    for (var i = 0; i < dEls.length; i++) {
      var want = str[i] !== undefined ? str[i] : '';
      if (dEls[i].textContent !== want) {
        dEls[i].textContent = want;
        if (!reduceMotion) {
          dEls[i].classList.add('tick');
          (function (el) { setTimeout(function () { el.classList.remove('tick'); }, 140); })(dEls[i]);
        }
      }
    }
    for (var s = 0; s < stages.length; s++) {
      stages[s].classList.toggle('lit', p >= THRESH[s]);
    }
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
    if (clock) clock.classList.toggle('published', p >= 1);
  }

  if (reduceMotion) {
    setClock(1);                  // show the finished state, still and quiet
  } else if (clock) {
    var running = false, startTime = null, holdUntil = null, clockVisible = true;

    function loop(ts) {
      if (!running) return;
      if (!clockVisible || document.hidden) {
        if (holdUntil === null) startTime = null;   // resume cleanly
        requestAnimationFrame(loop);
        return;
      }
      if (startTime === null) {
        if (holdUntil !== null) {
          if (ts < holdUntil) { requestAnimationFrame(loop); return; }
          holdUntil = null;
        }
        startTime = ts;
      }
      var p = clamp((ts - startTime) / RUN, 0, 1);
      setClock(p);
      if (p >= 1) { holdUntil = ts + HOLD; startTime = null; }
      requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        clockVisible = entries[0].isIntersecting;
      }, { threshold: 0.15 });
      vio.observe(clock);
    }
    running = true;
    requestAnimationFrame(loop);
  }

  /* ---------- pipeline rail: scroll-driven fill ---------- */
  var rail = $('#rail');
  var railFill = $('#rail-fill');
  if (rail && railFill) {
    var rafPending = false;
    function fillRail() {
      rafPending = false;
      var r = rail.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = clamp((vh * 0.62 - r.top) / (r.height * 0.92), 0, 1);
      railFill.style.height = (p * 100).toFixed(2) + '%';
    }
    window.addEventListener('scroll', function () {
      if (!rafPending) { rafPending = true; requestAnimationFrame(fillRail); }
    }, { passive: true });
    window.addEventListener('resize', fillRail);
    fillRail();
  }

  /* ---------- ROI calculator ---------- */
  var form = $('#roi-form');
  if (form) {
    var els = {
      videos:  $('#roi-videos'),
      minutes: $('#roi-minutes'),
      rate:    $('#roi-rate'),
      agency:  $('#roi-agency'),
      vOut:    $('#roi-videos-out'),
      mOut:    $('#roi-minutes-out'),
      rOut:    $('#roi-rate-out'),
      aOut:    $('#roi-agency-out'),
      aField:  $('#roi-agency-field'),
      total:   $('#roi-total'),
      per:     $('#roi-per'),
      hours:   $('#roi-hours'),
      year:    $('#roi-year')
    };
    var mode = 'creator';
    var money = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0
    });

    function num(el, fallback) {
      var v = parseFloat(el && el.value);
      return isFinite(v) ? v : fallback;
    }

    function render() {
      if (!els.videos) return;
      var videosWeek = clamp(num(els.videos, 10), 1, 25);
      var minutes    = clamp(num(els.minutes, 75), 30, 180);
      var rate       = clamp(num(els.rate, 13), 5, 40);
      var agency     = clamp(num(els.agency, 1500), 0, 5000);

      var videosMonth = videosWeek * 4.33;
      var hoursMonth, costMonth;

      if (mode === 'creator') {
        hoursMonth = videosMonth * minutes / 60;
        costMonth  = hoursMonth * rate;
      } else {
        hoursMonth = 0;
        costMonth  = agency;
      }

      if (els.vOut) els.vOut.textContent = videosWeek + ' / week';
      if (els.mOut) els.mOut.textContent = Math.round(minutes) + ' min';
      if (els.rOut) els.rOut.textContent = '$' + Math.round(rate) + ' / hr';
      if (els.aOut) els.aOut.textContent = '$' + Math.round(agency).toLocaleString('en-US') + ' / mo';

      if (els.total) els.total.textContent = money.format(costMonth);
      if (els.per)   els.per.textContent   = money.format(videosMonth > 0 ? costMonth / videosMonth : 0);
      if (els.hours) els.hours.textContent = mode === 'creator'
        ? Math.round(hoursMonth) + ' hrs' : 'delegated';
      if (els.year)  els.year.textContent  = money.format(costMonth * 12);
    }

    ['input', 'change'].forEach(function (ev) {
      [els.videos, els.minutes, els.rate, els.agency].forEach(function (el) {
        if (el) el.addEventListener(ev, render);
      });
    });

    $$('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-mode') === 'agency' ? 'agency' : 'creator';
        $$('.seg button').forEach(function (o) {
          var on = o === b;
          o.classList.toggle('on', on);
          o.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        if (els.aField) els.aField.hidden = mode !== 'agency';
        render();
      });
    });

    render();
  }

  /* ---------- FAQ: one open at a time feels calmer ---------- */
  var faqItems = $$('.faq-item');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqItems.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- active nav link ---------- */
  var linkMap = {};
  $$('.nav-links a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var s = document.getElementById(id);
    if (s) linkMap[id] = a;
  });
  if ('IntersectionObserver' in window && Object.keys(linkMap).length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = linkMap[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkMap).forEach(function (id) {
      sio.observe(document.getElementById(id));
    });
  }

  /* ---------- footer year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
