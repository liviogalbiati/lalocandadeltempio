/* Eventi privati — flusso dimostrativo: la richiesta non viene inviata */
(function () {
  'use strict';
  var T = LDT.tx, H = LDT.t, E = LDT.esc;
  var app = document.getElementById('ev-app');
  var form = document.getElementById('ev-form');
  var formHTML = app.innerHTML;
  var done = null;
  function bind() {
    form = document.getElementById('ev-form');
    var now = new Date();
    document.getElementById('ev-date').min = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
    form.addEventListener('submit', submit);
    form.addEventListener('change', function (e) {
      if (e.target.name === 'type') document.getElementById('company-box').hidden = e.target.value !== 'corporate';
    });
  }
  function val(n) { var e = form.elements[n]; return e ? e.value : ''; }
  function fail(id, msg) { var el = document.getElementById(id), b = document.getElementById('e-' + id); if (el) el.classList.add('bad'); if (b) b.textContent = msg; }
  function submit(e) {
    e.preventDefault();
    form.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); }); form.querySelectorAll('.err').forEach(function (x) { x.textContent = ''; });
    var ok = true, type = (form.querySelector('input[name=type]:checked') || {}).value;
    if (!type) { document.getElementById('e-type').textContent = T('e.err.type'); ok = false; }
    if (!val('date')) { fail('ev-date', T('e.err.date')); ok = false; }
    if (!val('slot')) { fail('ev-slot', T('e.err.slot')); ok = false; }
    if (!(parseInt(val('guests'), 10) >= 2)) { fail('ev-guests', T('e.err.guests')); ok = false; }
    if (type === 'corporate' && val('company').trim().length < 2) { fail('ev-company', T('e.err.company')); ok = false; }
    if (val('name').trim().length < 2) { fail('ev-name', T('b.err.name')); ok = false; }
    if (val('phone').replace(/\D/g, '').length < 6) { fail('ev-phone', T('b.err.phone')); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) { fail('ev-email', T('b.err.email')); ok = false; }
    if (!form.elements.consent.checked) { fail('ev-consent', T('b.err.consent')); ok = false; }
    if (!ok) { var bad = form.querySelector('.bad') || form.querySelector('#e-type'); if (bad && bad.focus) bad.focus(); else document.getElementById('ev-types').scrollIntoView({ block: 'center' }); return; }
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = 'EVT-'; for (var i = 0; i < 5; i++) c += a[Math.floor(Math.random() * a.length)];
    done = { code: c, type: type, date: val('date'), slot: val('slot'), guests: val('guests'), name: val('name'), email: val('email'), reply: val('reply') || (form.querySelector('input[name=reply]:checked') || {}).value, menu: (form.querySelector('input[name=menutype]:checked') || {}).value, exclusive: (form.querySelector('input[name=exclusive]:checked') || {}).value, company: val('company') };
    renderDone(); app.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderDone() {
    var dt = new Date(done.date + 'T12:00:00');
    var rows = [[T('e.q.type'), T('e.t.' + done.type)], [T('e.date').replace(' *', ''), LDT.fmtDate(dt)], [T('e.slot').replace(' *', ''), T('e.slot.' + done.slot)], [T('e.guests').replace(' *', ''), done.guests], [T('e.menuType'), T('e.menu.' + done.menu)], [T('e.exclusive'), T(done.exclusive === 'yes' ? 'e.yes' : 'e.no')]];
    if (done.company) rows.push([T('e.company').replace(' *', ''), done.company]);
    rows.push([T('e.reply'), done.reply === 'phone' ? T('e.r.phone') : done.reply === 'email' ? 'Email' : 'WhatsApp']);
    app.innerHTML = '<div class="form-card"><div class="confirm-head"><svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-7"/></svg>' +
      '<h2 tabindex="-1" id="done-h">' + E(T('e.done.title')) + '</h2><p>' + H('e.done.lead', { name: E(done.name.trim().split(/\s+/)[0]) }) + '</p><p class="lbl">' + E(T('e.done.code')) + '</p><div class="code">' + done.code + '</div></div>' +
      '<dl class="summary">' + rows.map(function (r) { return '<div><dt>' + E(r[0]) + '</dt><dd>' + E(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="fine" style="margin-top:12px">' + E(T('e.done.note', { email: done.email })) + '</p><div class="btn-row" style="margin-top:16px"><a class="btn btn-primary" href="index.html">' + E(T('b.done.home')) + '</a><button type="button" class="btn btn-ghost" data-new>' + E(T('e.done.new')) + '</button></div></div>';
    var h = document.getElementById('done-h'); if (h) h.focus({ preventScroll: true });
  }
  app.addEventListener('click', function (e) {
    if (e.target.closest('[data-new]')) { done = null; app.innerHTML = formHTML; bind(); LDT.applyI18n(app); window.scrollTo({ top: 0 }); }
  });
  bind();
  LDT.onLang(function () { if (done) renderDone(); });
})();
