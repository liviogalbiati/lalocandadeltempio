/* =========================================================
   BUONI REGALO — flusso dimostrativo con anteprima live
   ========================================================= */
var VOUCHER_CONFIG = {
  amounts: [50, 100, 150],       // DA CONFERMARE con il ristorante
  minCustom: 20, maxCustom: 1000,
  experience: '[Cena per due – DA INSERIRE]',
  validity: '[DA INSERIRE: validità]'
};

(function () {
  'use strict';
  var C = VOUCHER_CONFIG, T = LDT.tx, H = LDT.t, E = LDT.esc;
  var root = document.getElementById('voucher-app');
  var S = { kind: '50', custom: '', from: '', to: '', msg: '', delivery: 'email', rEmail: '', date: '', bEmail: '', consent: false };
  var done = null;

  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function amountText() {
    if (S.kind === 'exp') return LDT.ph(E(C.experience));
    var v = S.kind === 'custom' ? parseInt(S.custom, 10) : parseInt(S.kind, 10);
    return isFinite(v) && v > 0 ? '€ ' + v : '€ —';
  }
  function code() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)]; return 'LDT-' + s.slice(0, 4) + '-' + s.slice(4); }

  /* il buono, disegnato nello stile del sito */
  function voucherHTML(codeStr) {
    return '<div class="voucher" id="v-card"><div class="v-band"><span class="arch-mini">' + LDT.arch() + '</span><span class="logo-type">' + LDT.logoHTML() + '</span></div>' +
      '<div class="v-body"><div class="v-title">' + E(T('v.card.title')) + '</div><div class="v-amt" id="v-amt">' + amountText() + '</div>' +
      '<div class="v-to">' + E(T('v.card.for')) + ' ' + (S.to ? E(S.to) : '<span class="ph">[' + E(T('v.recipient')) + ']</span>') + '</div>' +
      '<div class="v-msg">' + (S.msg ? '“' + E(S.msg) + '”' : '') + '</div></div>' +
      '<div class="v-foot"><span>' + (S.from ? E(T('v.card.from')) + ' ' + E(S.from) : '') + '</span><span>' + E(codeStr || 'LDT-XXXX-XXXX') + ' · ' + LDT.ph(E(C.validity)) + '</span></div></div>';
  }
  function updatePreview() {
    var el = document.getElementById('v-card'); if (!el) return;
    var tmp = document.createElement('div'); tmp.innerHTML = voucherHTML();
    el.replaceWith(tmp.firstChild);
  }

  function formHTML() {
    var chips = C.amounts.map(function (a) { return '<label class="opt"><input type="radio" name="kind" value="' + a + '"' + (S.kind === String(a) ? ' checked' : '') + '><span>€ ' + a + '</span></label>'; }).join('') +
      '<label class="opt"><input type="radio" name="kind" value="custom"' + (S.kind === 'custom' ? ' checked' : '') + '><span>' + E(T('v.custom')) + '</span></label>' +
      '<label class="opt"><input type="radio" name="kind" value="exp"' + (S.kind === 'exp' ? ' checked' : '') + '><span>' + E(T('v.exp')) + '</span></label>';
    return '<div class="vgrid"><form class="form-card" id="v-form" novalidate>' +
      '<fieldset><legend>' + E(T('v.q.what')) + '</legend><div class="opts" role="radiogroup">' + chips + '</div>' +
      '<p class="fine" style="margin-top:8px">' + H('v.amountsNote') + '</p>' +
      '<div class="field" id="custom-wrap" style="margin-top:12px"' + (S.kind === 'custom' ? '' : ' hidden') + '><label for="v-custom">' + E(T('v.customLbl', { min: C.minCustom, max: C.maxCustom })) + '</label><input id="v-custom" type="number" min="' + C.minCustom + '" max="' + C.maxCustom + '" step="1" inputmode="numeric" value="' + E(S.custom) + '"><div class="err" id="e-v-custom"></div></div>' +
      '<p class="fine" id="exp-note"' + (S.kind === 'exp' ? '' : ' hidden') + '>' + H('v.expNote') + '</p></fieldset>' +
      '<fieldset><legend>' + E(T('v.q.who')) + '</legend><div class="row2"><div class="field"><label for="v-from">' + E(T('v.from')) + ' *</label><input id="v-from" type="text" maxlength="60" value="' + E(S.from) + '"><div class="err" id="e-v-from"></div></div>' +
      '<div class="field"><label for="v-to">' + E(T('v.to')) + ' *</label><input id="v-to" type="text" maxlength="60" value="' + E(S.to) + '"><div class="err" id="e-v-to"></div></div></div>' +
      '<div class="field"><label for="v-msg">' + E(T('v.msg')) + '</label><textarea id="v-msg" maxlength="160">' + E(S.msg) + '</textarea><div class="hint">' + E(T('v.msgHint')) + '</div></div></fieldset>' +
      '<fieldset><legend>' + E(T('v.q.delivery')) + '</legend><div class="opts" role="radiogroup">' +
      '<label class="opt"><input type="radio" name="delivery" value="email"' + (S.delivery === 'email' ? ' checked' : '') + '><span>' + E(T('v.d.email')) + '</span></label>' +
      '<label class="opt"><input type="radio" name="delivery" value="print"' + (S.delivery === 'print' ? ' checked' : '') + '><span>' + E(T('v.d.print')) + '</span></label></div>' +
      '<div id="email-wrap" style="margin-top:14px"' + (S.delivery === 'email' ? '' : ' hidden') + '><div class="row2"><div class="field"><label for="v-remail">' + E(T('v.rEmail')) + ' *</label><input id="v-remail" type="email" value="' + E(S.rEmail) + '"><div class="err" id="e-v-remail"></div></div>' +
      '<div class="field"><label for="v-date">' + E(T('v.sendOn')) + ' *</label><input id="v-date" type="date" min="' + today() + '" value="' + E(S.date) + '"><div class="err" id="e-v-date"></div></div></div></div></fieldset>' +
      '<fieldset><legend>' + E(T('v.q.you')) + '</legend><div class="field"><label for="v-bemail">' + E(T('v.bEmail')) + ' *</label><input id="v-bemail" type="email" autocomplete="email" value="' + E(S.bEmail) + '"><div class="err" id="e-v-bemail"></div></div>' +
      '<div class="fake-card"><div class="cap">🔒 ' + E(T('b.demoPay')) + '</div><div class="field"><label for="c-num">' + E(T('b.cardNum')) + '</label><input id="c-num" type="text" disabled tabindex="-1" placeholder="•••• •••• •••• ••••"></div><div class="row2"><div class="field"><label for="c-exp">' + E(T('b.cardExp')) + '</label><input id="c-exp" type="text" disabled tabindex="-1" placeholder="MM/AA"></div><div class="field"><label for="c-cvc">CVC</label><input id="c-cvc" type="text" disabled tabindex="-1" placeholder="•••"></div></div></div>' +
      '<div class="check"><input type="checkbox" id="v-consent"' + (S.consent ? ' checked' : '') + '><label for="v-consent">' + H('b.consent') + ' <a href="privacy.html" target="_blank" rel="noopener">' + E(T('b.privacy')) + '</a> *</label></div><div class="err" id="e-v-consent"></div></fieldset>' +
      '<button type="submit" class="btn btn-primary">' + E(T('v.buy')) + '</button></form>' +
      '<div class="live"><p class="eyebrow">' + E(T('v.preview')) + '</p>' + voucherHTML() + '<p class="fine" style="margin-top:10px">' + E(T('v.previewNote')) + '</p></div></div>';
  }

  function fail(id, msg) { var el = document.getElementById(id), b = document.getElementById('e-' + id); if (el) el.classList.add('bad'); if (b) b.textContent = msg; }
  function read() {
    var g = function (i) { var e = document.getElementById(i); return e ? e.value : ''; };
    if (!document.getElementById('v-form')) return;
    S.custom = g('v-custom'); S.from = g('v-from'); S.to = g('v-to'); S.msg = g('v-msg'); S.rEmail = g('v-remail'); S.date = g('v-date'); S.bEmail = g('v-bemail');
    S.consent = document.getElementById('v-consent').checked;
  }
  function submit(e) {
    e.preventDefault(); read();
    root.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); }); root.querySelectorAll('.err').forEach(function (x) { x.textContent = ''; });
    var ok = true, em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (S.kind === 'custom') { var v = parseInt(S.custom, 10); if (!(v >= C.minCustom && v <= C.maxCustom)) { fail('v-custom', T('v.err.amount', { min: C.minCustom, max: C.maxCustom })); ok = false; } }
    if (S.from.trim().length < 2) { fail('v-from', T('v.err.from')); ok = false; }
    if (S.to.trim().length < 2) { fail('v-to', T('v.err.to')); ok = false; }
    if (S.delivery === 'email') {
      if (!em.test(S.rEmail)) { fail('v-remail', T('b.err.email')); ok = false; }
      if (!S.date || S.date < today()) { fail('v-date', T('v.err.date')); ok = false; }
    }
    if (!em.test(S.bEmail)) { fail('v-bemail', T('b.err.email')); ok = false; }
    if (!S.consent) { fail('v-consent', T('b.err.consent')); ok = false; }
    if (!ok) { var bad = root.querySelector('.bad'); if (bad) bad.focus(); return; }
    done = { code: code() }; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function doneHTML() {
    var when = S.delivery === 'email' ? T('v.done.email', { email: S.rEmail, date: new Date(S.date + 'T12:00:00').toLocaleDateString(LDT.locale(), { day: 'numeric', month: 'long', year: 'numeric' }) }) : T('v.done.print');
    return '<div class="narrow"><div class="form-card"><div class="confirm-head"><svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-7"/></svg>' +
      '<h2 tabindex="-1" id="done-h">' + E(T('v.done.title')) + '</h2><p>' + E(T('v.done.lead')) + '</p><p class="lbl">' + E(T('v.done.code')) + '</p><div class="code">' + done.code + '</div></div>' +
      voucherHTML(done.code) + '<p style="margin-top:16px">' + E(when) + '</p><p class="fine">' + E(T('v.done.receipt', { email: S.bEmail })) + '</p>' +
      '<div class="btn-row" style="margin-top:14px"><button type="button" class="btn btn-primary" data-print>' + E(T('v.done.print.btn')) + '</button><button type="button" class="btn btn-ghost" data-new>' + E(T('v.done.new')) + '</button></div></div></div>';
  }
  function printVoucher() {
    var z = document.createElement('div'); z.id = 'print-zone'; z.innerHTML = voucherHTML(done.code);
    document.body.appendChild(z); document.body.classList.add('print-voucher');
    var clean = function () { document.body.classList.remove('print-voucher'); if (z.parentNode) z.remove(); window.removeEventListener('afterprint', clean); };
    window.addEventListener('afterprint', clean);
    window.print();
    setTimeout(function () { if (document.body.classList.contains('print-voucher') && !window.matchMedia('print').matches) clean(); }, 1000);
  }

  function render() {
    root.innerHTML = done ? doneHTML() : formHTML();
    if (done) { var h = document.getElementById('done-h'); if (h) h.focus({ preventScroll: true }); }
    else document.getElementById('v-form').addEventListener('submit', submit);
  }
  root.addEventListener('input', function (e) {
    if (done) return; read(); updatePreview();
    if (e.target.id === 'v-msg') { /* l'anteprima legge S.msg */ }
  });
  root.addEventListener('change', function (e) {
    var t = e.target; if (done) return;
    if (t.name === 'kind') { read(); S.kind = t.value; document.getElementById('custom-wrap').hidden = S.kind !== 'custom'; document.getElementById('exp-note').hidden = S.kind !== 'exp'; updatePreview(); }
    else if (t.name === 'delivery') { read(); S.delivery = t.value; document.getElementById('email-wrap').hidden = S.delivery !== 'email'; }
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-print')) printVoucher();
    else if (b.hasAttribute('data-new')) { done = null; S = { kind: '50', custom: '', from: '', to: '', msg: '', delivery: 'email', rEmail: '', date: '', bEmail: '', consent: false }; render(); window.scrollTo({ top: 0 }); }
  });
  LDT.onLang(function () { read(); render(); });
})();
