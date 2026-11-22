/* Eden Home Health Services — interactions */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SITE SETTINGS — fill these in before launch.
     Empty contact values stay hidden on the page.
     formEndpoint: a URL that accepts a JSON POST (Formspree, Basin, your own API).
     images.hero: path to a photo for the arch in the hero, e.g. "assets/hero.jpg".
  ------------------------------------------------------------------ */
  var SITE = {
    phone: '',
    email: '',
    hours: '',
    address: '',
    formEndpoint: '',
    images: { hero: '' }
  };

  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Contact details + images from settings ---------- */
  ['phone', 'email', 'hours', 'address'].forEach(function (key) {
    var li = $('[data-contact="' + key + '"]');
    if (!li || !SITE[key]) return;
    var strong = $('strong', li);
    if (key === 'phone' || key === 'email') {
      var a = document.createElement('a');
      a.href = (key === 'phone' ? 'tel:' + SITE.phone.replace(/[^\d+]/g, '') : 'mailto:' + SITE.email);
      a.textContent = SITE[key];
      strong.appendChild(a);
    } else { strong.textContent = SITE[key]; }
    li.hidden = false;
  });
  $$('[data-img]').forEach(function (fig) {
    var src = SITE.images[fig.getAttribute('data-img')];
    if (!src) return;
    fig.style.backgroundImage = 'url("' + src + '")';
    fig.classList.add('has-photo');
  });

  /* ---------- Header: menu, scroll state, progress, current link ---------- */
  var header = $('#header'), toggle = $('#menuToggle'), nav = $('#nav');
  function setMenu(open) {
    doc.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!doc.classList.contains('nav-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  var bar = $('#progressBar'), dot = $('#progressDot'), fab = $('#fab');
  var hero = $('.hero'), contact = $('#contact'), commitText = $('#commitText');
  var words = [];
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = Math.min(1, y / max);
    header.classList.toggle('is-scrolled', y > 8);
    bar.style.transform = 'scaleX(' + p + ')';
    dot.style.left = 'calc(' + (p * 100) + '% + ' + (4 - 8 * p) + 'px)';
    dot.style.opacity = p > 0.005 ? 1 : 0;
    var cTop = contact.getBoundingClientRect().top;
    fab.classList.toggle('is-shown', y > hero.offsetHeight * 0.6 && cTop > vh * 0.7);
    if (words.length && !reduceMotion) {
      var r = commitText.getBoundingClientRect();
      var prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var upto = Math.round(Math.max(0, Math.min(1, prog)) * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < upto);
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  /* Commitment text: split into words that light up as you scroll */
  (function () {
    var parts = commitText.textContent.trim().split(/\s+/);
    commitText.textContent = '';
    parts.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      commitText.appendChild(s);
      if (i < parts.length - 1) commitText.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  })();

  /* ---------- Reveal on scroll + current nav link ---------- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('is-in'); }); }

  if ('IntersectionObserver' in window) {
    var links = $$('.nav a[href^="#"]:not(.btn)');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Button ripple + hero glow ---------- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest('.btn');
    if (!b || reduceMotion) return;
    var r = b.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - r.left - size / 2) + 'px;top:' + (e.clientY - r.top - size / 2) + 'px';
    b.appendChild(s);
    setTimeout(function () { s.remove(); }, 650);
  });
  var glow = $('#heroGlow');
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      glow.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px)';
    });
  }

  /* ---------- Hero promise tabs (auto-cycle until touched) ---------- */
  (function () {
    var tabs = $$('.pillar-tabs button'), line = $('#pillarLine'), idx = 0, timer;
    function show(i) {
      idx = i;
      tabs.forEach(function (t, n) { t.classList.toggle('is-active', n === i); t.setAttribute('aria-selected', String(n === i)); });
      line.classList.add('is-out');
      setTimeout(function () { line.textContent = tabs[i].getAttribute('data-line'); line.classList.remove('is-out'); }, 220);
    }
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { clearInterval(timer); show(i); }); });
    if (!reduceMotion) timer = setInterval(function () { show((idx + 1) % tabs.length); }, 3600);
  })();

  /* ---------- Services (tabs on desktop, accordion on mobile) ---------- */
  var serviceSelect = $('#f-service');
  (function () {
    var tabs = $$('.svc-tab'), panels = $$('.svc-panel');
    var mobile = window.matchMedia('(max-width: 860px)');
    function open(i, fromUser) {
      var already = tabs[i].classList.contains('is-active');
      var close = already && mobile.matches;           // accordion can collapse; tabs cannot
      tabs.forEach(function (t, n) {
        var on = n === i && !close;
        t.classList.toggle('is-active', on); t.setAttribute('aria-expanded', String(on));
        panels[n].classList.toggle('is-active', on);
      });
      if (fromUser && mobile.matches && !close) {
        setTimeout(function () {
          var top = tabs[i].getBoundingClientRect().top;
          if (top < 80 || top > window.innerHeight * 0.6) window.scrollTo({ top: window.scrollY + top - 90, behavior: reduceMotion ? 'auto' : 'smooth' });
        }, 60);
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { open(i, true); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        var n = (i + (e.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus(); if (!mobile.matches) open(n);
      });
    });
  })();
  function chooseService(name) {
    for (var i = 0; i < serviceSelect.options.length; i++) if (serviceSelect.options[i].text === name) serviceSelect.selectedIndex = i;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-service]');
    if (a) chooseService(a.getAttribute('data-service'));
  });

  /* ---------- A day of care: draggable 24-hour dial ---------- */
  (function () {
    var dial = $('#dial'), handle = $('#dialHandle'), orb = $('#orb'), hint = $('#dialHint');
    var skyA = $('#skyA'), skyB = $('#skyB'), stars = $('#stars'), dusk = $('#dusk'), winL = $('#winL'), winR = $('#winR');
    var elTime = $('#dayTime'), elTitle = $('#dayTitle'), elText = $('#dayText'), elTags = $('#dayTags'), chipsEl = $('#dayChips');
    var C = 160, R = 138;
    var photos = $$('#dialPhotos img'), tint = $('#dialTint');

    var SEGMENTS = [
      { from: 6, to: 9, photo: 0, chip: 'Morning', title: 'A gentle start', text: 'Help getting out of bed, bathing, grooming and dressing, then breakfast at the kitchen table.', tags: ['Personal Care', 'Homemaking'] },
      { from: 9, to: 12, photo: 1, chip: 'Late morning', title: 'A home in good order', text: 'Light housekeeping and laundry, a grocery run and the essential errands that keep the week moving.', tags: ['Homemaking & Household Support'] },
      { from: 12, to: 15, photo: 2, chip: 'Midday', title: 'Lunch and good company', text: 'A freshly prepared meal, help with eating if it is needed, and unhurried conversation.', tags: ['Companion Care', 'Personal Care'] },
      { from: 15, to: 18, photo: 3, chip: 'Afternoon', title: 'Out and about', text: 'A ride to an appointment, a social outing, or time for a favorite hobby with someone alongside.', tags: ['Companion Care'] },
      { from: 18, to: 21, photo: 4, chip: 'Evening', title: 'Winding down', text: 'Dinner, a tidy kitchen, and help changing and getting comfortable for the night.', tags: ['Personal Care', 'Homemaking'] },
      { from: 21, to: 30, photo: 5, chip: 'Overnight', title: 'Someone is here', text: 'Overnight assistance with mobility and toileting, and peace of mind for the family while everyone rests.', tags: ['24-Hour Home Care', 'Live-In Care'] }
    ];
    // [hour, top colour, bottom colour]
    var SKY = [[0, '0B1F2A', '16343A'], [5, '1B3344', '3A4A5C'], [6.5, 'F7B58A', 'FCE3C8'], [9, 'BFE3EE', 'EAF6F1'], [13, 'A9DBF0', 'E6F5F3'],
               [17, 'C9E2EC', 'F8E3C4'], [19, 'F2996B', 'F8CFA0'], [20.5, '3A3F63', '7A5C6E'], [22, '10263A', '1C3B45'], [24, '0B1F2A', '16343A']];
    function rgb(h) { return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
    function mix(a, b, t) { a = rgb(a); b = rgb(b); return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(',') + ')'; }

    // ticks
    var ticks = $('#dialTicks'), NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 24; i++) {
      var a = (i - 12) * 15 * Math.PI / 180, major = i % 6 === 0, r1 = R - (major ? 9 : 5), r2 = R + (major ? 9 : 5);
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', C + r1 * Math.sin(a)); l.setAttribute('y1', C - r1 * Math.cos(a));
      l.setAttribute('x2', C + r2 * Math.sin(a)); l.setAttribute('y2', C - r2 * Math.cos(a));
      l.setAttribute('class', 'tick' + (major ? ' major' : ''));
      ticks.appendChild(l);
    }

    var hour = 7.5, segIndex = -1, chips = [];
    SEGMENTS.forEach(function (s, n) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = s.chip;
      b.addEventListener('click', function () { touched(); tweenTo((s.from + Math.min(s.to, s.from + 3)) / 2 % 24); });
      chipsEl.appendChild(b); chips.push(b);
    });

    function fmt(h) {
      var m = Math.round(h * 60) % 1440, hh = Math.floor(m / 60), mm = m % 60;
      return ((hh + 11) % 12 + 1) + ':' + (mm < 10 ? '0' : '') + mm + ' ' + (hh < 12 ? 'AM' : 'PM');
    }
    function segFor(h) {
      for (var n = 0; n < SEGMENTS.length; n++) { var s = SEGMENTS[n]; if ((h >= s.from && h < s.to) || (h + 24 >= s.from && h + 24 < s.to)) return n; }
      return 0;
    }
    function render() {
      var a = (hour - 12) * 15 * Math.PI / 180;
      handle.setAttribute('transform', 'translate(' + (C + R * Math.sin(a)) + ' ' + (C - R * Math.cos(a)) + ')');
      for (var k = 0; k < SKY.length - 1; k++) if (hour >= SKY[k][0] && hour <= SKY[k + 1][0]) break;
      var t = (hour - SKY[k][0]) / (SKY[k + 1][0] - SKY[k][0]);
      skyA.setAttribute('stop-color', mix(SKY[k][1], SKY[k + 1][1], t));
      skyB.setAttribute('stop-color', mix(SKY[k][2], SKY[k + 1][2], t));
      var night = hour < 5 || hour > 21 ? 1 : hour < 7 ? (7 - hour) / 2 : hour > 19 ? (hour - 19) / 2 : 0;
      stars.setAttribute('opacity', night);
      dusk.setAttribute('opacity', night * 0.45);
      tint.style.opacity = segFor(hour) === 5 ? 0 : night * 0.4;   // the night photo is already dark
      var win = night > 0.3 ? '#FFC96B' : '#BFD8CB';
      winL.setAttribute('fill', win); winR.setAttribute('fill', win);
      orb.style.fill = night > 0.5 ? '#F3EFD9' : '';
      var label = fmt(hour);
      elTime.textContent = label;
      dial.setAttribute('aria-valuenow', hour.toFixed(2));
      var n = segFor(hour);
      dial.setAttribute('aria-valuetext', label + ', ' + SEGMENTS[n].title);
      if (n !== segIndex) {
        segIndex = n;
        var s = SEGMENTS[n];
        elTitle.textContent = s.title; elText.textContent = s.text;
        elTags.innerHTML = '';
        s.tags.forEach(function (tg) { var li = document.createElement('li'); li.textContent = tg; elTags.appendChild(li); });
        [elTitle, elText, elTags].forEach(function (el) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
        chips.forEach(function (c, m) { c.classList.toggle('is-active', m === n); });
        photos.forEach(function (ph, m) { ph.classList.toggle('is-on', m === s.photo); });
      }
    }
    function set(h) { hour = ((h % 24) + 24) % 24; render(); }
    function touched() { dial.classList.add('is-touched'); hint.classList.add('is-hidden'); }

    var raf;
    function tweenTo(target) {
      cancelAnimationFrame(raf);
      var start = hour, delta = ((target - start + 36) % 24) - 12;   // shortest way round
      if (reduceMotion) { set(target); return; }
      var t0 = performance.now(), dur = 700;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        set(start + delta * e);
        if (p < 1) raf = requestAnimationFrame(step);
      })(t0);
    }

    function fromPointer(e) {
      var r = dial.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var deg = Math.atan2(dx, -dy) * 180 / Math.PI;
      set(Math.round((deg / 15 + 12) * 4) / 4);
    }
    var dragging = false;
    dial.addEventListener('pointerdown', function (e) {
      dragging = true; cancelAnimationFrame(raf); touched();
      try { dial.setPointerCapture(e.pointerId); } catch (err) {}
      fromPointer(e); e.preventDefault();
    });
    dial.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { dial.addEventListener(ev, function () { dragging = false; }); });
    dial.addEventListener('keydown', function (e) {
      var step = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5, PageUp: 3, PageDown: -3 }[e.key];
      if (step === undefined) return;
      e.preventDefault(); touched(); set(hour + step);
    });
    render();
  })();

  /* ---------- Care finder ---------- */
  (function () {
    var body = $('#quizBody'), dots = $$('#quizDots i'), back = $('#quizBack');
    var STEPS = [
      { key: 'who', q: 'Who is the care for?', opts: [['parent', 'A parent or older relative'], ['self', 'Myself'], ['partner', 'My spouse or partner'], ['caregiver', 'I am the family caregiver, and I need a break']] },
      { key: 'need', q: 'What would help most right now?', opts: [['personal', 'Bathing, dressing and getting around safely'], ['company', 'Company, conversation and getting out of the house'], ['home', 'Meals, laundry, housekeeping and errands'], ['all', 'A bit of everything']] },
      { key: 'time', q: 'How much help is needed?', opts: [['some', 'A few hours, some days of the week'], ['daily', 'Most of the day, most days'], ['always', 'Day and night, including overnight'], ['unsure', 'I am not sure yet']] }
    ];
    var SERVICES = {
      personal: ['Personal Care Assistance', 'Hands-on help with bathing, grooming, dressing, mobility and the routines of daily living, given with patience and respect.'],
      company: ['Companion Care', 'A consistent, friendly caregiver for conversation, hobbies, appointments and social outings.'],
      home: ['Homemaking and Household Support', 'Light housekeeping, laundry, meal preparation, grocery shopping and errands, so home stays comfortable.'],
      livein: ['Live-In Care', 'Personalized in-home support for extended daily assistance: personal care, household routines, companionship and supervision.'],
      always: ['24-Hour Home Care', 'Continuous care through scheduled caregiver shifts, with daytime and overnight assistance and peace of mind for the family.'],
      respite: ['Respite Care', 'Short-term or scheduled support that lets you rest, travel or handle your own responsibilities, knowing your loved one is cared for.']
    };
    var answers = {}, step = 0;

    function recommend() {
      var main, also;
      if (answers.who === 'caregiver') { main = 'respite'; also = answers.time === 'always' ? 'always' : null; }
      else if (answers.time === 'always') { main = 'always'; also = 'livein'; }
      else if (answers.time === 'daily') { main = 'livein'; also = answers.need === 'company' ? 'company' : 'personal'; }
      else if (answers.need === 'all') { main = 'personal'; also = 'home'; }
      else { main = answers.need; also = answers.need === 'personal' ? 'home' : answers.need === 'home' ? 'company' : 'home'; }
      return [main, also];
    }
    function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }

    function draw() {
      body.innerHTML = '';
      back.hidden = step === 0;
      dots.forEach(function (d, i) { d.classList.toggle('on', i <= Math.min(step, 2)); });
      if (step < STEPS.length) {
        var s = STEPS[step], wrap = el('div', 'quiz-step');
        var h = el('h3', '', s.q); h.id = 'quizQ'; wrap.appendChild(h);
        var list = el('div', 'quiz-opts'); list.setAttribute('role', 'group'); list.setAttribute('aria-labelledby', 'quizQ');
        s.opts.forEach(function (o) {
          var b = el('button', 'quiz-opt' + (answers[s.key] === o[0] ? ' is-picked' : ''), o[1]);
          b.type = 'button';
          b.addEventListener('click', function () {
            answers[s.key] = o[0];
            $$('.quiz-opt', list).forEach(function (x) { x.classList.remove('is-picked'); });
            b.classList.add('is-picked');
            setTimeout(function () { step++; draw(); }, reduceMotion ? 0 : 260);
          });
          list.appendChild(b);
        });
        wrap.appendChild(list); body.appendChild(wrap);
      } else {
        var rec = recommend(), svc = SERVICES[rec[0]], res = el('div', 'quiz-step quiz-result');
        res.appendChild(el('span', 'tag', 'A good place to start'));
        res.appendChild(el('h3', '', svc[0]));
        res.appendChild(el('p', '', svc[1]));
        if (rec[1]) res.appendChild(el('p', 'also', 'Families in similar situations also ask about ' + SERVICES[rec[1]][0] + '. Services can be combined into one care plan.'));
        var actions = el('div', 'quiz-actions');
        var go = el('a', 'btn btn-primary', 'Request this care'); go.href = '#contact'; go.setAttribute('data-service', svc[0]);
        var again = el('button', 'btn btn-ghost', 'Start over'); again.type = 'button';
        again.addEventListener('click', function () { answers = {}; step = 0; draw(); });
        actions.appendChild(go); actions.appendChild(again); res.appendChild(actions);
        body.appendChild(res);
      }
    }
    back.addEventListener('click', function () { if (step > 0) { step--; draw(); } });
    draw();
  })();

  /* ---------- Values ---------- */
  (function () {
    var vals = $$('.value');
    function act(i) { vals.forEach(function (v, n) { v.classList.toggle('is-active', n === i); v.setAttribute('aria-expanded', String(n === i)); }); }
    var canHover = window.matchMedia('(hover: hover) and (min-width: 861px)');
    vals.forEach(function (v, i) {
      v.addEventListener('click', function () { act(i); });
      v.addEventListener('pointerenter', function (e) { if (canHover.matches && e.pointerType === 'mouse') act(i); });
      v.addEventListener('focus', function () { act(i); });
    });
  })();

  /* ---------- Contact form ---------- */
  (function () {
    var form = $('#careForm'), err = $('#formError'), done = $('#formDone'), btn = $('#formSubmit');
    function bad(input, on) { input.closest('.field').classList.toggle('is-bad', on); input.setAttribute('aria-invalid', String(on)); }
    function finish(title, text) {
      $('#doneTitle').textContent = title; $('#doneText').textContent = text;
      done.hidden = false; done.focus();
    }
    form.addEventListener('input', function (e) { if (e.target.closest('.field')) bad(e.target, false); err.hidden = true; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#f-name'), phone = $('#f-phone'), email = $('#f-email');
      var okName = name.value.trim().length > 1;
      var okPhone = phone.value.replace(/\D/g, '').length >= 10;
      var okEmail = !email.value.trim() || /^\S+@\S+\.\S+$/.test(email.value.trim());
      bad(name, !okName); bad(phone, !okPhone); bad(email, !okEmail);
      if (!okName || !okPhone || !okEmail) {
        err.textContent = !okName ? 'Please enter your name.' : !okPhone ? 'Please enter a phone number with area code.' : 'That email address does not look right.';
        err.hidden = false; (!okName ? name : !okPhone ? phone : email).focus(); return;
      }
      var first = name.value.trim().split(/\s+/)[0];
      if (!SITE.formEndpoint) {
        finish('Almost there, ' + first + '.', 'This preview form is not connected to an inbox yet, so nothing was sent. Once it is connected, requests will arrive here.');
        return;
      }
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      btn.disabled = true; btn.firstChild.textContent = 'Sending… ';
      fetch(SITE.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); finish('Thank you, ' + first + '.', 'Your request is with our team. We will be in touch soon to talk through care options.'); })
        .catch(function () { err.textContent = 'We could not send your request. Please check your connection and try again.'; err.hidden = false; })
        .then(function () { btn.disabled = false; btn.firstChild.textContent = 'Send my request '; });
    });
  })();

  onScroll();
})();
