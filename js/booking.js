/* =========================================================
   PRENOTAZIONE — flusso dimostrativo (nessun dato lascia il browser)

   >>> REGOLE E ORARI: modifica solo questo oggetto <<<
   ========================================================= */
var BOOKING_CONFIG = {
  /* Quando serve la caparra / carta a garanzia. Basta UNA condizione vera. */
  deposit: {
    minParty: 8,                      // gruppi da N persone in su
    specialDates: ['02-14', '12-31'], // giorni speciali, formato 'MM-GG'
    saturdayDinner: true,             // sabato a cena
    perPerson: '[€ — a persona]'      // importo caparra: da confermare
  },
  maxParty: 12,                       // oltre: si rimanda alla pagina Eventi
  /* Fasce di servizio per generare gli orari. DIMOSTRATIVE: orari reali da inserire */
  services: {
    lunch:  { from: '12:30', to: '14:30' },
    dinner: { from: '19:30', to: '22:30' }
  },
  slotMinutes: 15,                    // passo degli orari
  reminderHours: 24,                  // quante ore prima parte il promemoria
  maxDaysAhead: 180,                  // fino a quanti giorni in anticipo si prenota
  soldOutEvery: 5,                    // DEMO: circa 1 orario su N appare "esaurito"
  durationMinutes: 120,               // durata nel file calendario (.ics)
  reviewLink: '[LINK RECENSIONE GOOGLE]'
};

(function () {
  'use strict';
  var C = BOOKING_CONFIG, T = LDT.tx, H = LDT.t, E = LDT.esc;
  var root = document.getElementById('wizard');
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var S = { step: 0, date: null, party: 2, meal: 'dinner', time: null, name: '', phone: '', email: '', notes: '', allergies: '', channels: [], consent: false, depType: 'deposit', depOk: false, done: null };
  var view = { y: today.getFullYear(), m: today.getMonth() };
  var msgChannel = 'email';

  /* ---- regole ---- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function reasons() {
    var r = [], D = C.deposit;
    if (S.party >= D.minParty) r.push('party');
    if (S.date && D.specialDates.indexOf(pad(S.date.getMonth() + 1) + '-' + pad(S.date.getDate())) > -1) r.push('date');
    if (S.date && D.saturdayDinner && S.date.getDay() === 6 && S.meal === 'dinner') r.push('sat');
    return r;
  }
  function stepIds() { return reasons().length ? ['date', 'party', 'time', 'details', 'guarantee', 'summary'] : ['date', 'party', 'time', 'details', 'summary']; }
  function toMin(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }
  function fmtMin(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function slotList() {
    var cfg = C.services[S.meal], out = [], now = new Date();
    for (var m = toMin(cfg.from); m <= toMin(cfg.to); m += C.slotMinutes) {
      var t = fmtMin(m), past = false;
      if (S.date && S.date.getTime() === today.getTime()) past = (m <= now.getHours() * 60 + now.getMinutes() + 30);
      out.push({ t: t, off: past || soldOut(t) });
    }
    return out;
  }
  function soldOut(t) { /* "esaurito" finto ma stabile: dipende da data e ora */
    var s = S.date.toDateString() + t + S.meal, h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % C.soldOutEvery === 0;
  }
  function when() { var p = S.time.split(':'); var d = new Date(S.date); d.setHours(+p[0], +p[1], 0, 0); return d; }
  function fmtLong(d) { return LDT.fmtDate(d); }

  /* ---- helpers UI ---- */
  function fail(id, msg) {
    var el = document.getElementById(id); if (el) el.classList.add('bad');
    var box = document.getElementById('e-' + id); if (box) box.textContent = msg;
  }
  function clearErr() { root.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); }); root.querySelectorAll('.err').forEach(function (x) { x.textContent = ''; }); }
  function progress(ids) {
    return '<ol class="progress" aria-label="' + E(T('b.progress')) + '">' + ids.map(function (id, i) {
      return '<li class="' + (i < S.step ? 'done' : i === S.step ? 'cur' : '') + '"' + (i === S.step ? ' aria-current="step"' : '') + '>' + (i + 1) + '<span> · ' + E(T('b.s.' + id)) + '</span></li>';
    }).join('') + '</ol>';
  }
  function nav(ids, nextLabel) {
    var last = S.step === ids.length - 1;
    return '<div class="wiz-nav">' + (S.step > 0 ? '<button type="button" class="btn btn-ghost" data-act="back">← ' + E(T('b.back')) + '</button>' : '<span></span>') +
      '<button type="button" class="btn btn-primary" data-act="next">' + E(nextLabel || (last ? T('b.confirm') : T('b.next'))) + (last ? '' : ' →') + '</button></div>';
  }

  /* ---- calendario ---- */
  function calendar() {
    var loc = LDT.locale(), first = new Date(view.y, view.m, 1), lead = (first.getDay() + 6) % 7, days = new Date(view.y, view.m + 1, 0).getDate();
    var max = new Date(today); max.setDate(max.getDate() + C.maxDaysAhead);
    var h = '<div class="cal"><div class="cal-head"><button type="button" data-cal="-1" aria-label="' + E(T('b.prevMonth')) + '"' + ((view.y === today.getFullYear() && view.m === today.getMonth()) ? ' disabled' : '') + '>←</button><strong>' + E(first.toLocaleDateString(loc, { month: 'long', year: 'numeric' })) + '</strong><button type="button" data-cal="1" aria-label="' + E(T('b.nextMonth')) + '"' + (new Date(view.y, view.m + 1, 1) > max ? ' disabled' : '') + '>→</button></div><div class="cal-grid">';
    for (var i = 0; i < 7; i++) h += '<div class="dow" aria-hidden="true">' + E(new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: 'short' })) + '</div>';
    for (i = 0; i < lead; i++) h += '<span></span>';
    for (var d = 1; d <= days; d++) {
      var dt = new Date(view.y, view.m, d), dis = dt < today || dt > max, sel = S.date && dt.getTime() === S.date.getTime();
      h += '<button type="button" data-day="' + d + '"' + (dis ? ' disabled' : '') + ' aria-pressed="' + (sel ? 'true' : 'false') + '" class="' + (dt.getTime() === today.getTime() ? 'today' : '') + '" aria-label="' + E(fmtLong(dt)) + '">' + d + '</button>';
    }
    return h + '</div></div>';
  }

  /* ---- passi ---- */
  var views = {
    date: function () {
      return '<fieldset><legend>' + E(T('b.q.date')) + '</legend>' + calendar() + '<p class="fine" style="margin-top:10px">' + (S.date ? '✓ ' + E(fmtLong(S.date)) : E(T('b.pickDate'))) + '</p><div class="err" id="e-date" role="alert"></div></fieldset>';
    },
    party: function () {
      return '<fieldset><legend>' + E(T('b.q.party')) + '</legend><div class="stepper"><button type="button" data-p="-1" aria-label="' + E(T('b.fewer')) + '">−</button><output id="party-out" aria-live="polite">' + S.party + '</output><button type="button" data-p="1" aria-label="' + E(T('b.more')) + '">+</button></div>' +
        '<p class="fine" style="margin-top:8px">' + H('b.bigger', { n: C.maxParty }) + ' <a href="eventi.html">' + E(T('b.eventsLink')) + '</a></p></fieldset>' +
        '<fieldset><legend>' + E(T('b.q.meal')) + '</legend><div class="opts">' +
        ['lunch', 'dinner'].map(function (m) { return '<label class="opt"><input type="radio" name="meal" value="' + m + '"' + (S.meal === m ? ' checked' : '') + '><span>' + E(T('b.meal.' + m)) + '</span></label>'; }).join('') +
        '</div></fieldset><div id="dep-hint" class="notice" ' + (reasons().length ? '' : 'hidden') + '>' + E(T('b.depHint')) + '</div>';
    },
    time: function () {
      return '<fieldset><legend>' + E(T('b.q.time')) + ' · ' + E(T('b.meal.' + S.meal)) + '</legend><div class="slots" role="radiogroup">' + slotList().map(function (s) {
        return '<label class="opt"><input type="radio" name="slot" value="' + s.t + '"' + (S.time === s.t ? ' checked' : '') + (s.off ? ' disabled' : '') + '><span>' + s.t + '</span></label>';
      }).join('') + '</div><p class="fine" style="margin-top:10px">' + E(T('b.slotNote')) + '</p><div class="err" id="e-time" role="alert"></div></fieldset>';
    },
    details: function () {
      var ch = ['sms', 'email', 'whatsapp'];
      return '<fieldset><legend>' + E(T('b.q.details')) + '</legend>' +
        '<div class="row2"><div class="field"><label for="f-name">' + E(T('b.name')) + ' *</label><input id="f-name" type="text" autocomplete="name" value="' + E(S.name) + '" required><div class="err" id="e-f-name"></div></div>' +
        '<div class="field"><label for="f-phone">' + E(T('b.phone')) + ' *</label><input id="f-phone" type="tel" autocomplete="tel" value="' + E(S.phone) + '" required><div class="err" id="e-f-phone"></div></div></div>' +
        '<div class="field"><label for="f-email">Email *</label><input id="f-email" type="email" autocomplete="email" value="' + E(S.email) + '" required><div class="err" id="e-f-email"></div></div>' +
        '<div class="field"><label for="f-allergies">' + E(T('b.allergies')) + '</label><input id="f-allergies" type="text" value="' + E(S.allergies) + '"></div>' +
        '<div class="field"><label for="f-notes">' + E(T('b.notes')) + '</label><textarea id="f-notes">' + E(S.notes) + '</textarea></div></fieldset>' +
        '<fieldset><legend>' + E(T('b.q.channels')) + '</legend><div class="opts">' + ch.map(function (c) {
          return '<label class="opt"><input type="checkbox" name="ch" value="' + c + '"' + (S.channels.indexOf(c) > -1 ? ' checked' : '') + '><span>' + (c === 'sms' ? 'SMS' : c === 'email' ? 'Email' : 'WhatsApp') + '</span></label>';
        }).join('') + '</div><p class="fine" style="margin-top:8px">' + E(T('b.channelsNote')) + '</p></fieldset>' +
        '<div class="check"><input type="checkbox" id="f-consent"' + (S.consent ? ' checked' : '') + '><label for="f-consent">' + H('b.consent') + ' <a href="privacy.html" target="_blank" rel="noopener">' + E(T('b.privacy')) + '</a> *</label></div><div class="err" id="e-f-consent"></div>';
    },
    guarantee: function () {
      var r = reasons();
      return '<fieldset><legend>' + E(T('b.g.title')) + '</legend>' +
        '<p>' + E(T('b.g.why')) + '</p><ul>' + r.map(function (x) { return '<li>' + H('b.g.r.' + x, { n: C.deposit.minParty }) + '</li>'; }).join('') + '</ul>' +
        '<div class="opts" role="radiogroup" style="flex-direction:column">' +
        '<label class="opt block"><input type="radio" name="dep" value="deposit"' + (S.depType === 'deposit' ? ' checked' : '') + '><span>' + H('b.g.deposit', { amt: C.deposit.perPerson }) + '</span></label>' +
        '<label class="opt block"><input type="radio" name="dep" value="card"' + (S.depType === 'card' ? ' checked' : '') + '><span>' + E(T('b.g.card')) + '</span></label></div>' +
        '<div class="fake-card"><div class="cap">🔒 ' + E(T('b.demoPay')) + '</div>' +
        '<div class="field"><label for="c-num">' + E(T('b.cardNum')) + '</label><input id="c-num" type="text" disabled tabindex="-1" placeholder="•••• •••• •••• ••••"></div>' +
        '<div class="row2"><div class="field"><label for="c-exp">' + E(T('b.cardExp')) + '</label><input id="c-exp" type="text" disabled tabindex="-1" placeholder="MM/AA"></div><div class="field"><label for="c-cvc">CVC</label><input id="c-cvc" type="text" disabled tabindex="-1" placeholder="•••"></div></div></div>' +
        '<p class="fine"><strong>' + E(T('b.g.policyT')) + '</strong> ' + H('b.g.policy') + '</p>' +
        '<div class="check"><input type="checkbox" id="f-depok"' + (S.depOk ? ' checked' : '') + '><label for="f-depok">' + E(T('b.g.accept')) + ' *</label></div><div class="err" id="e-f-depok"></div></fieldset>';
    },
    summary: function () {
      var d = when(), r = reasons().length;
      var rows = [
        [T('b.sum.when'), fmtLong(d) + ' · ' + S.time], [T('b.sum.party'), S.party + ' · ' + T('b.meal.' + S.meal)],
        [T('b.name'), S.name], [T('b.phone'), S.phone], ['Email', S.email]
      ];
      if (S.allergies) rows.push([T('b.allergies'), S.allergies]);
      if (S.notes) rows.push([T('b.notes'), S.notes]);
      rows.push([T('b.sum.reminders'), (S.channels.length ? S.channels.map(chName).join(', ') : 'Email')]);
      var html = '<fieldset><legend>' + E(T('b.q.summary')) + '</legend><dl class="summary">' + rows.map(function (x) { return '<div><dt>' + E(x[0]) + '</dt><dd>' + E(x[1]) + '</dd></div>'; }).join('');
      if (r) html += '<div><dt>' + E(T('b.sum.guarantee')) + '</dt><dd>' + (S.depType === 'deposit' ? H('b.g.deposit', { amt: C.deposit.perPerson }) : E(T('b.g.card'))) + '</dd></div>';
      return html + '</dl><p class="fine" style="margin-top:12px">' + E(T('b.sum.note')) + '</p></fieldset>';
    }
  };
  function chName(c) { return c === 'sms' ? 'SMS' : c === 'email' ? 'Email' : 'WhatsApp'; }

  /* ---- validazione ---- */
  var valid = {
    date: function () { if (!S.date) { fail('date', T('b.err.date')); return false; } return true; },
    party: function () { return true; },
    time: function () { if (!S.time) { fail('time', T('b.err.time')); return false; } return true; },
    details: function () {
      var ok = true;
      if (S.name.trim().length < 2) { fail('f-name', T('b.err.name')); ok = false; }
      if (S.phone.replace(/\D/g, '').length < 6) { fail('f-phone', T('b.err.phone')); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email)) { fail('f-email', T('b.err.email')); ok = false; }
      if (!S.consent) { fail('f-consent', T('b.err.consent')); ok = false; }
      return ok;
    },
    guarantee: function () { if (!S.depOk) { fail('f-depok', T('b.err.accept')); return false; } return true; },
    summary: function () { return true; }
  };

  /* ---- render principale ---- */
  function render(focus) {
    if (S.done) { renderDone(); return; }
    var ids = stepIds(); if (S.step >= ids.length) S.step = ids.length - 1;
    var id = ids[S.step];
    root.innerHTML = progress(ids) + '<div id="step-body">' + views[id]() + '</div>' + nav(ids);
    if (focus) { var lg = root.querySelector('legend'); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); } root.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  }
  function readDetails() {
    var g = function (i) { var e = document.getElementById(i); return e ? e.value : ''; };
    if (!document.getElementById('f-name')) return;
    S.name = g('f-name'); S.phone = g('f-phone'); S.email = g('f-email'); S.allergies = g('f-allergies'); S.notes = g('f-notes');
    S.consent = document.getElementById('f-consent').checked;
    S.channels = Array.prototype.map.call(root.querySelectorAll('input[name=ch]:checked'), function (x) { return x.value; });
  }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.cal) { view.m += +b.dataset.cal; if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; } render(); var f = root.querySelector('[data-cal]:not(:disabled)'); return; }
    if (b.dataset.day) { S.date = new Date(view.y, view.m, +b.dataset.day); S.time = null; render(); var sel = root.querySelector('[aria-pressed=true]'); if (sel) sel.focus(); return; }
    if (b.dataset.p) { S.party = Math.max(1, Math.min(C.maxParty, S.party + +b.dataset.p)); document.getElementById('party-out').textContent = S.party; var h = document.getElementById('dep-hint'); if (h) h.hidden = !reasons().length; return; }
    if (b.dataset.act === 'back') { readDetails(); S.step--; render(true); return; }
    if (b.dataset.act === 'next') {
      readDetails(); clearErr();
      var ids = stepIds(), id = ids[S.step];
      if (!valid[id]()) { var bad = root.querySelector('.bad'); if (bad) bad.focus(); return; }
      if (S.step === ids.length - 1) { finish(); return; }
      S.step++; render(true);
    }
  });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'meal') { S.meal = t.value; S.time = null; var h = document.getElementById('dep-hint'); if (h) h.hidden = !reasons().length; }
    else if (t.name === 'slot') { S.time = t.value; }
    else if (t.name === 'dep') { S.depType = t.value; }
    else if (t.id === 'f-depok') { S.depOk = t.checked; }
  });

  /* ---- conferma ---- */
  function newCode() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = 'LDT-'; for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function finish() { S.done = { code: newCode() }; msgChannel = S.channels[0] || 'email'; render(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  function icsDate(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function downloadIcs() {
    var s = when(), e = new Date(s.getTime() + C.durationMinutes * 60000), n = new Date();
    var stamp = n.getUTCFullYear() + pad(n.getUTCMonth() + 1) + pad(n.getUTCDate()) + 'T' + pad(n.getUTCHours()) + pad(n.getUTCMinutes()) + pad(n.getUTCSeconds()) + 'Z';
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La Locanda del Tempio//Prenotazione//IT', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + S.done.code + '@locandadeltempio.demo', 'DTSTAMP:' + stamp, 'DTSTART;TZID=Europe/Rome:' + icsDate(s), 'DTEND;TZID=Europe/Rome:' + icsDate(e),
      'SUMMARY:' + icsEsc(T('b.ics.summary')), 'LOCATION:' + icsEsc(LDT.info.address.replace(',', ', ')), 'GEO:' + LDT.info.lat + ';' + LDT.info.lng,
      'DESCRIPTION:' + icsEsc(T('b.ics.desc', { code: S.done.code, n: S.party })),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(T('b.ics.summary')), 'TRIGGER:-PT' + C.reminderHours + 'H', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'prenotazione-' + S.done.code + '.ics'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function messages() {
    var d = when(), rem = new Date(d.getTime() - C.reminderHours * 3600000), nxt = new Date(d); nxt.setDate(nxt.getDate() + 1); nxt.setHours(11, 0, 0, 0);
    var first = S.name.trim().split(/\s+/)[0] || S.name;
    var v = { name: E(first), date: E(LDT.fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })), time: S.time, n: S.party, code: S.done.code, addr: LDT.info.address, link: C.reviewLink };
    var tm = function (dt) { return LDT.fmtDate(dt, { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()); };
    return [
      { k: 'c', when: T('b.when.c'), v: v },
      { k: 'r', when: T('b.when.r', { h: '[' + C.reminderHours + (LDT.lang() === 'en' ? ' hours]' : ' ore]'), dt: tm(rem) }), v: v },
      { k: 'v', when: T('b.when.v', { dt: tm(nxt) }), v: v }
    ];
  }
  function bubble(m, ch) {
    var short = H('msg.' + m.k + '.short', m.v);
    if (ch === 'sms') return '<div class="phone"><div class="bubble sms">' + short + '<div class="meta">SMS · La Locanda</div></div></div>';
    if (ch === 'whatsapp') return '<div class="phone wa-bg"><div class="bubble wa">' + short + '<div class="meta">La Locanda del Tempio ✓✓</div></div></div>';
    return '<div class="mail"><div class="mh">La Locanda del Tempio</div><div class="mm">' + E(T('b.mail.to')) + ': ' + E(S.email) + '<br><strong>' + H('msg.' + m.k + '.sub', m.v) + '</strong></div><div class="mb">' + H('msg.' + m.k + '.body', m.v) + '</div></div>';
  }
  function renderDone() {
    var d = when(), tabs = ['sms', 'whatsapp', 'email'];
    root.innerHTML = '<div class="confirm-head"><svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-7"/></svg>' +
      '<h2 tabindex="-1" id="done-h">' + E(T('b.done.title')) + '</h2><p>' + H('b.done.lead', { name: E(S.name.trim().split(/\s+/)[0]) }) + '</p><p class="lbl">' + E(T('b.done.code')) + '</p><div class="code">' + S.done.code + '</div></div>' +
      '<dl class="summary"><div><dt>' + E(T('b.sum.when')) + '</dt><dd>' + E(fmtLong(d)) + ' · ' + S.time + '</dd></div><div><dt>' + E(T('b.sum.party')) + '</dt><dd>' + S.party + ' · ' + E(T('b.meal.' + S.meal)) + '</dd></div><div><dt>' + E(T('b.done.where')) + '</dt><dd>' + E(LDT.info.address) + '</dd></div>' +
      (reasons().length ? '<div><dt>' + E(T('b.sum.guarantee')) + '</dt><dd>' + (S.depType === 'deposit' ? H('b.g.deposit', { amt: C.deposit.perPerson }) : E(T('b.g.card'))) + '</dd></div>' : '') + '</dl>' +
      '<div class="btn-row" style="margin:18px 0 8px"><button type="button" class="btn btn-primary" data-ics>' + E(T('b.done.ics')) + '</button><a class="btn btn-ghost" href="index.html">' + E(T('b.done.home')) + '</a></div>' +
      '<h3 style="margin-top:34px">' + E(T('b.done.msgs')) + '</h3><p class="fine">' + E(T('b.done.msgsNote')) + '</p>' +
      '<div class="tabs" role="tablist" aria-label="' + E(T('b.done.channel')) + '">' + tabs.map(function (c) { return '<button type="button" role="tab" data-ch="' + c + '" aria-selected="' + (c === msgChannel ? 'true' : 'false') + '">' + chName(c) + '</button>'; }).join('') + '</div>' +
      '<div class="msgs">' + messages().map(function (m) { return '<div><div class="msg-when">' + H('dyn.when', { w: E(m.when) }) + '</div>' + bubble(m, msgChannel) + '</div>'; }).join('') + '</div>' +
      '<div class="center" style="margin-top:26px"><button type="button" class="btn btn-ghost btn-sm" data-restart>' + E(T('b.done.again')) + '</button></div>';
    var h = document.getElementById('done-h'); if (h) h.focus({ preventScroll: true });
  }
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ics],[data-ch],[data-restart]'); if (!t) return;
    if (t.hasAttribute('data-ics')) downloadIcs();
    else if (t.dataset.ch) { msgChannel = t.dataset.ch; renderDone(); var a = root.querySelector('[data-ch="' + msgChannel + '"]'); if (a) a.focus(); }
    else if (t.hasAttribute('data-restart')) { S = { step: 0, date: null, party: 2, meal: 'dinner', time: null, name: '', phone: '', email: '', notes: '', allergies: '', channels: [], consent: false, depType: 'deposit', depOk: false, done: null }; render(true); }
  });

  LDT.onLang(function () { readDetails(); render(); });
})();
