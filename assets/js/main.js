/*
 * Sakthi Kumaran Pediatrics — site script.
 *
 * Security notes:
 * - No innerHTML / insertAdjacentHTML / document.write anywhere. All dynamic text is
 *   written with textContent through the h() helper, so user input can never become markup.
 * - No eval, new Function, or string timers.
 * - Nothing is sent to a server and nothing personal is stored. The appointment form only
 *   builds a WhatsApp link, encoded with encodeURIComponent, to the clinic's fixed number.
 * - The only browser storage is the child's date of birth for the vaccine planner,
 *   kept in this browser's localStorage and validated before use.
 */
(function () {
  'use strict';

  var CLINIC_WA = '918754442145';
  var CLINIC_TEL = '+91 87544 42145';
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, '0'); }

  // Build an element safely: h('span', {className: 'x'}, 'text', childNode, ...)
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === 'className') el.className = props[k];
        else if (k === 'style') Object.keys(props.style).forEach(function (p) { el.style[p] = props.style[p]; });
        else el.setAttribute(k, props[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return el;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  var tt;
  function say(m) {
    var t = $('toast'); t.textContent = m; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- menu ---------- */
  var burger = $('burger'), links = $('links');
  function closeMenu() { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
  burger.addEventListener('click', function () {
    var o = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(o));
    burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) { closeMenu(); burger.focus(); } });

  /* ---------- hours, always in India time (UTC+5:30) ---------- */
  var SESS = [[360, 930], [990, 1320]]; // minutes: 6:00–15:30, 16:30–22:00
  function fmt(m) { var hh = Math.floor(m / 60), mm = m % 60, ap = hh >= 12 ? 'pm' : 'am'; hh = hh % 12 || 12; return hh + (mm ? ':' + pad(mm) : '') + ' ' + ap; }
  function ist() {
    var d = new Date(Date.now() + 330 * 60000);
    return { h: d.getUTCHours(), m: d.getUTCMinutes(), dow: d.getUTCDay(), d: d.getUTCDate(), mo: d.getUTCMonth(), y: d.getUTCFullYear(), iso: d.toISOString().slice(0, 10) };
  }
  function state(min) {
    for (var i = 0; i < SESS.length; i++) if (min >= SESS[i][0] && min < SESS[i][1]) return { open: true, long: 'Open now. Closes at ' + fmt(SESS[i][1]) + '.', short: 'Open now · until ' + fmt(SESS[i][1]) + ' IST' };
    if (min >= SESS[0][1] && min < SESS[1][0]) return { open: false, long: 'Short break. Opens again at ' + fmt(SESS[1][0]) + '.', short: 'Short break · back at ' + fmt(SESS[1][0]) + ' IST' };
    return { open: false, long: 'Closed now. Opens at 6 am' + (min >= SESS[1][1] ? ' tomorrow' : '') + '.', short: 'Closed · opens 6 am IST' };
  }
  var week = $('week');
  [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
    var bar = h('div', { className: 'bar' });
    SESS.forEach(function (s) { bar.appendChild(h('span', { className: 'seg', style: { left: (s[0] / 14.4) + '%', width: ((s[1] - s[0]) / 14.4) + '%' } })); });
    var row = h('div', { className: 'wd', 'aria-hidden': 'true', 'data-d': String(d) }, h('span', null, DAYS[d]), bar);
    week.appendChild(row);
  });
  function tick() {
    var t = ist(), min = t.h * 60 + t.m, s = state(min);
    $('bigclock').textContent = pad(t.h) + ':' + pad(t.m);
    $('today').textContent = DAYS[t.dow] + ', ' + t.d + ' ' + months[t.mo];
    $('stateline').textContent = s.long;
    $('liveText').textContent = s.short;
    $('live').classList.toggle('shut', !s.open);
    document.querySelectorAll('.wd').forEach(function (r) {
      var on = Number(r.getAttribute('data-d')) === t.dow, n = r.querySelector('.nowmark');
      r.classList.toggle('today', on);
      if (on) {
        if (!n) { n = h('span', { className: 'nowmark' }); r.querySelector('.bar').appendChild(n); }
        n.style.left = 'calc(' + (min / 14.4) + '% - 1px)';
      } else if (n) n.remove();
    });
    $('yr').textContent = String(t.y);
  }
  tick(); setInterval(tick, 20000);

  /* ---------- copy number ---------- */
  $('copyPhone').addEventListener('click', function () {
    function fb() { var r = document.createRange(); r.selectNodeContents($('phoneTxt')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); say('Number selected. Copy it with your keyboard.'); }
    try { navigator.clipboard.writeText(CLINIC_TEL).then(function () { say('Number copied'); }, fb); } catch (_) { fb(); }
  });

  /* ---------- tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tablist"] [role="tab"]'));
  function pick(tab) { tabs.forEach(function (t) { var on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $(t.getAttribute('aria-controls')).hidden = !on; }); }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t); });
    t.addEventListener('keydown', function (e) {
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); tabs[j].focus(); pick(tabs[j]); }
    });
  });

  /* ---------- vaccine planner ---------- */
  var VAX = [
    { d: 0, label: 'At birth', v: 'BCG, OPV-0, Hepatitis B-1' },
    { d: 42, label: '6 weeks', v: 'DTP-1, IPV-1, Hib-1, Hep B-2, Rotavirus-1, PCV-1' },
    { d: 70, label: '10 weeks', v: 'DTP-2, IPV-2, Hib-2, Hep B-3, Rotavirus-2, PCV-2' },
    { d: 98, label: '14 weeks', v: 'DTP-3, IPV-3, Hib-3, Hep B-4, Rotavirus-3, PCV-3' },
    { d: 183, label: '6 months', v: 'Influenza-1, Typhoid conjugate (6–9 months)' },
    { d: 213, label: '7 months', v: 'Influenza-2' },
    { d: 274, label: '9 months', v: 'MMR-1' },
    { d: 365, label: '12 months', v: 'Hepatitis A-1' },
    { d: 456, label: '15 months', v: 'MMR-2, Varicella-1, PCV booster' },
    { d: 487, label: '16–18 months', v: 'DTP booster-1, IPV booster, Hib booster' },
    { d: 548, label: '18–19 months', v: 'Hepatitis A-2, Varicella-2' },
    { d: 1461, label: '4–6 years', v: 'DTP booster-2, IPV booster-2, MMR-3' },
    { d: 3653, label: '10–12 years', v: 'Tdap, HPV (2 doses)' }
  ];
  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  var dob = $('dob');
  function fmtDate(dt) { return dt.getUTCDate() + ' ' + months[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear(); }
  function vaxRow(cls, label, names, tag) {
    return h('li', { className: 'vax' + (cls ? ' ' + cls : '') }, h('span', { className: 'when' }, label), h('span', { className: 'names' }, names), h('span', { className: 'tag' }, tag));
  }
  function renderVax() {
    var t = ist(), today = Date.UTC(t.y, t.mo, t.d), base = null;
    if (ISO_DATE.test(dob.value)) { var p = dob.value.split('-').map(Number); base = Date.UTC(p[0], p[1] - 1, p[2]); }
    var list = $('vaxList'), sum = $('vaxSum'), nextFound = false, done = 0, due = 0;
    clear(list); clear(sum);
    VAX.forEach(function (x) {
      if (base === null || base > today) { list.appendChild(vaxRow('', x.label, x.v, base !== null && base > today ? 'Check the date' : 'Add date of birth')); return; }
      var at = base + x.d * 864e5, dt = new Date(at), days = Math.round((at - today) / 864e5), cls, txt;
      if (days < -60) { cls = 'st-done'; txt = 'Was due ' + fmtDate(dt); done++; }
      else if (days <= 7) { cls = 'st-due'; txt = days < 0 ? 'Due now: ask us' : (days === 0 ? 'Due today' : 'Due ' + fmtDate(dt)); due++; }
      else if (!nextFound) { cls = 'st-next'; txt = 'Next · ' + fmtDate(dt); nextFound = true; }
      else { cls = ''; txt = fmtDate(dt); }
      list.appendChild(vaxRow(cls, x.label, x.v, txt));
    });
    if (base !== null && base <= today) {
      sum.appendChild(h('span', { className: 'sum-ok' }, done + ' likely given'));
      sum.appendChild(h('span', { className: 'sum-due' }, due + ' due around now'));
    }
  }
  try { var saved = localStorage.getItem('skp-dob'); if (saved && ISO_DATE.test(saved)) dob.value = saved; } catch (_) {}
  if (!dob.value) {
    var t0 = ist();
    dob.value = new Date(Date.UTC(t0.y, t0.mo - 5, t0.d)).toISOString().slice(0, 10);
    $('dobHint').hidden = false;
    dob.addEventListener('input', function () { $('dobHint').hidden = true; }, { once: true });
  }
  dob.max = ist().iso;
  dob.addEventListener('input', function () {
    renderVax();
    try { if (ISO_DATE.test(dob.value)) localStorage.setItem('skp-dob', dob.value); } catch (_) {}
  });
  renderVax();

  /* ---------- appointment form → WhatsApp ---------- */
  var F = { parent: $('f-parent'), phone: $('f-phone'), child: $('f-child'), age: $('f-age'), date: $('f-date'), type: $('f-type'), reason: $('f-reason') };
  var TYPES = ['Sick visit', 'Vaccination', 'Check-up / growth', 'Newborn check', 'Follow-up'];
  var SESSIONS = ['Morning (6 am – 12 pm)', 'Afternoon (12 – 3:30 pm)', 'Evening (4:30 – 10 pm)'];
  var todayIso = ist().iso; F.date.min = todayIso;
  (function () { var t = ist(); F.date.value = new Date(Date.UTC(t.y, t.mo, t.d + 1)).toISOString().slice(0, 10); })();

  // Strip control characters and cap length; values only ever become text, never markup.
  function clean(v, max) { return String(v || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
  function values() {
    var sessEl = document.querySelector('input[name="sess"]:checked');
    return {
      parent: clean(F.parent.value, 60),
      phone: clean(F.phone.value, 16).replace(/[^\d+]/g, ''),
      child: clean(F.child.value, 60),
      age: clean(F.age.value, 30),
      date: ISO_DATE.test(F.date.value) ? F.date.value : '',
      type: TYPES.indexOf(F.type.value) >= 0 ? F.type.value : TYPES[0],
      session: sessEl && SESSIONS.indexOf(sessEl.value) >= 0 ? sessEl.value : SESSIONS[0],
      reason: clean(F.reason.value, 500)
    };
  }
  function validate(v) {
    var bad = [];
    function set(el, errId, ok) { el.setAttribute('aria-invalid', ok ? 'false' : 'true'); $(errId).hidden = ok; if (!ok) bad.push(el); }
    set(F.parent, 'e-parent', v.parent.length > 1);
    set(F.phone, 'e-phone', /^[6-9]\d{9}$/.test(v.phone.replace(/^\+?91/, '')));
    set(F.child, 'e-child', v.child.length > 0);
    set(F.date, 'e-date', !!v.date && v.date >= todayIso);
    if (bad.length) bad[0].focus();
    return !bad.length;
  }
  function niceDate(iso) { var p = iso.split('-'); return Number(p[2]) + ' ' + months[Number(p[1]) - 1] + ' ' + p[0]; }
  function waText(v) {
    return 'Hello Dr. Raja Ramalingam V, I would like an appointment.\n' +
      'Parent: ' + v.parent + '\nMobile: ' + v.phone +
      '\nChild: ' + v.child + (v.age ? ' (' + v.age + ')' : '') +
      '\nVisit: ' + v.type + '\nPreferred: ' + niceDate(v.date) + ', ' + v.session +
      (v.reason ? '\nReason: ' + v.reason : '');
  }
  var banner = $('formBanner');
  $('book').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = values();
    if (!validate(v)) return;
    var url = 'https://wa.me/' + CLINIC_WA + '?text=' + encodeURIComponent(waText(v));
    var a = h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' });
    document.body.appendChild(a); a.click(); a.remove();
    banner.className = 'banner ok';
    banner.textContent = 'WhatsApp should open with your message ready. Press send there. If it did not open, call ' + CLINIC_TEL + '.';
    banner.hidden = false;
  });
})();
