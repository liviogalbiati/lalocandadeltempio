/* =========================================================
   ASPORTO — flusso dimostrativo. Il carrello (solo id, quantità, note)
   resta nel localStorage del browser. Nessun ordine viene inviato.
   ========================================================= */
var TAKEAWAY_CONFIG = {
  pickup: { from: '12:30', to: '21:45' },  // DIMOSTRATIVO: orari reali da inserire
  step: 15,                                // minuti tra uno slot e l'altro
  leadMinutes: 30,                         // tempo minimo di preparazione
  days: 2                                  // oggi e domani
};

(function () {
  'use strict';
  var C = TAKEAWAY_CONFIG, T = LDT.tx, H = LDT.t, E = LDT.esc;
  var root = document.getElementById('take-root');
  var KEY = 'ldt_cart';
  var cart = load();
  var view = 'shop', cartOpen = false;
  var form = { day: 0, time: '', name: '', phone: '', email: '', notes: '', pay: 'pickup', consent: false };
  var done = null;
  var byId = {};
  MENU_DISHES.forEach(function (d) { byId[d.id] = d; });

  function load() {
    try {
      var o = JSON.parse(LDT.store.get(KEY) || '{}'), out = {};
      Object.keys(o).forEach(function (k) { if (typeof o[k] === 'object' && o[k] && o[k].qty > 0) out[k] = { qty: Math.min(20, o[k].qty | 0), note: String(o[k].note || '').slice(0, 140) }; });
      return out;
    } catch (e) { return {}; }
  }
  function save() { LDT.store.set(KEY, JSON.stringify(cart)); }
  function ids() { return Object.keys(cart).filter(function (k) { return byId[k]; }); }
  function count() { return ids().reduce(function (n, k) { return n + cart[k].qty; }, 0); }
  function totalHTML() {
    var all = ids().every(function (k) { return typeof byId[k].value === 'number'; });
    if (!ids().length || !all) return LDT.ph('[€ —]');
    return '€ ' + ids().reduce(function (s, k) { return s + byId[k].value * cart[k].qty; }, 0).toFixed(2).replace('.', ',');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function toMin(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }

  /* ---- vetrina ---- */
  function shopHTML(lang) {
    var cats = MENU_CATEGORIES.map(function (c) {
      var items = MENU_DISHES.filter(function (d) { return d.cat === c.id && !d.hidden; });
      return '<section id="cat-' + c.id + '" style="padding:0"><div class="cat-title"><h2>' + E(c[lang]) + '</h2></div><div class="dishes" style="grid-template-columns:1fr">' + items.map(function (d) {
        var inCart = cart[d.id] ? cart[d.id].qty : 0;
        return '<article class="dish"><div class="dish-top"><h3>' + LDT.ph(E(d.name[lang])) + '</h3><span class="price">' + LDT.ph(E(d.price)) + '</span></div><p>' + LDT.ph(E(d.desc[lang])) + '</p>' +
          '<div class="tags">' + LDT.tagsHTML(d) + LDT.allergenHTML(d, lang) + '</div>' +
          '<div class="add-row"><span class="fine">' + (inCart ? E(T('t.inCart', { n: inCart })) : '') + '</span><button type="button" class="btn btn-primary btn-sm" data-add="' + d.id + '" aria-label="' + E(T('t.add') + ': ' + d.name[lang]) + '">+ ' + E(T('t.add')) + '</button></div></article>';
      }).join('') + '</div></section>';
    }).join('');
    var chips = '<nav class="chips" aria-label="' + E(T('m.cats')) + '" style="margin-bottom:6px">' + MENU_CATEGORIES.map(function (c) { return '<a href="#cat-' + c.id + '">' + E(c[lang]) + '</a>'; }).join('') + '</nav>';
    return '<div class="shop"><div>' + chips + cats + '</div>' + cartHTML() + '</div>' +
      '<button type="button" class="btn btn-primary cart-fab" data-open-cart>🛍 ' + E(T('t.cart')) + ' <span class="badge">' + count() + '</span></button><div class="cart-scrim' + (cartOpen ? ' on' : '') + '" data-close-cart></div>';
  }
  function cartHTML() {
    var list = ids();
    var body = list.length ? '<ul>' + list.map(function (k) {
      var d = byId[k], c = cart[k];
      return '<li><div class="dish-top"><strong>' + LDT.ph(E(d.name[LDT.lang()])) + '</strong><span>' + LDT.ph(E(d.price)) + '</span></div>' +
        '<div class="qty"><button type="button" data-q="-1" data-id="' + k + '" aria-label="' + E(T('t.less')) + '">−</button><span aria-live="polite">' + c.qty + '</span><button type="button" data-q="1" data-id="' + k + '" aria-label="' + E(T('t.more')) + '">+</button></div>' +
        '<label class="sr-only" for="n-' + k + '">' + E(T('t.noteFor')) + '</label><input class="note" id="n-' + k + '" type="text" maxlength="140" data-note="' + k + '" value="' + E(c.note) + '" placeholder="' + E(T('t.notePh')) + '"></li>';
    }).join('') + '</ul>' : '<p class="fine">' + E(T('t.empty')) + '</p>';
    return '<aside class="cart' + (cartOpen ? ' open' : '') + '" id="cart" aria-label="' + E(T('t.cart')) + '"><div class="dish-top"><h2>' + E(T('t.cart')) + '</h2><button type="button" class="btn btn-ghost btn-sm" data-close-cart style="display:' + (window.innerWidth < 1000 ? 'inline-flex' : 'none') + '">✕ ' + E(T('t.close')) + '</button></div>' + body +
      '<div class="dish-top" style="padding:8px 0"><strong>' + E(T('t.total')) + '</strong><strong>' + totalHTML() + '</strong></div>' +
      '<p class="fine">📍 ' + E(T('t.pickupAt')) + ' Via di Pietra 85 · ' + E(T('t.noDelivery')) + '</p>' +
      '<div class="btn-row"><button type="button" class="btn btn-primary" data-checkout' + (list.length ? '' : ' disabled') + '>' + E(T('t.checkout')) + '</button>' + (list.length ? '<button type="button" class="btn btn-ghost btn-sm" data-clear>' + E(T('t.clear')) + '</button>' : '') + '</div></aside>';
  }

  /* ---- ritiro e dati ---- */
  function pickupSlots(dayOffset) {
    var now = new Date(), out = [], earliest = dayOffset === 0 ? now.getHours() * 60 + now.getMinutes() + C.leadMinutes : 0;
    for (var m = toMin(C.pickup.from); m <= toMin(C.pickup.to); m += C.step) if (m >= earliest) out.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
    return out;
  }
  function dayDate(o) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + o); return d; }
  function checkoutHTML(lang) {
    var days = [];
    for (var i = 0; i < C.days; i++) if (i > 0 || pickupSlots(0).length) days.push(i);
    if (days.indexOf(form.day) < 0) form.day = days[0];
    var slots = pickupSlots(form.day);
    if (slots.indexOf(form.time) < 0) form.time = '';
    return '<div class="form-card"><button type="button" class="btn btn-ghost btn-sm" data-back-shop>← ' + E(T('t.backShop')) + '</button>' +
      '<h2 tabindex="-1" id="co-h" style="margin-top:14px">' + E(T('t.checkoutT')) + '</h2>' +
      '<dl class="summary" style="margin-bottom:22px">' + ids().map(function (k) { return '<div><dt>' + cart[k].qty + ' × ' + LDT.ph(E(byId[k].name[lang])) + (cart[k].note ? '<br><small>' + E(cart[k].note) + '</small>' : '') + '</dt><dd>' + LDT.ph(E(byId[k].price)) + '</dd></div>'; }).join('') +
      '<div><dt><strong>' + E(T('t.total')) + '</strong></dt><dd>' + totalHTML() + '</dd></div></dl>' +
      '<fieldset><legend>' + E(T('t.pickupT')) + '</legend><p class="fine">📍 Via di Pietra 85, 00186 Roma · ' + E(T('t.noDelivery')) + '</p><div class="opts" role="radiogroup">' + days.map(function (o) {
        return '<label class="opt"><input type="radio" name="day" value="' + o + '"' + (form.day === o ? ' checked' : '') + '><span>' + E(o === 0 ? T('t.today') : T('t.tomorrow')) + ' · ' + E(dayDate(o).toLocaleDateString(LDT.locale(), { day: 'numeric', month: 'short' })) + '</span></label>';
      }).join('') + '</div><div class="field" style="margin-top:14px"><label for="o-time">' + E(T('t.time')) + ' *</label><select id="o-time"><option value="">' + E(T('t.chooseTime')) + '</option>' +
      slots.map(function (s) { return '<option' + (form.time === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select><div class="err" id="e-o-time"></div></div></fieldset>' +
      '<fieldset><legend>' + E(T('t.you')) + '</legend><div class="row2"><div class="field"><label for="o-name">' + E(T('b.name')) + ' *</label><input id="o-name" type="text" autocomplete="name" value="' + E(form.name) + '"><div class="err" id="e-o-name"></div></div>' +
      '<div class="field"><label for="o-phone">' + E(T('b.phone')) + ' *</label><input id="o-phone" type="tel" autocomplete="tel" value="' + E(form.phone) + '"><div class="err" id="e-o-phone"></div></div></div>' +
      '<div class="field"><label for="o-email">Email *</label><input id="o-email" type="email" autocomplete="email" value="' + E(form.email) + '"><div class="err" id="e-o-email"></div></div>' +
      '<div class="field"><label for="o-notes">' + E(T('t.orderNotes')) + '</label><textarea id="o-notes">' + E(form.notes) + '</textarea></div></fieldset>' +
      '<fieldset><legend>' + E(T('t.payT')) + '</legend><div class="opts" role="radiogroup" style="flex-direction:column">' +
      '<label class="opt block"><input type="radio" name="pay" value="pickup"' + (form.pay === 'pickup' ? ' checked' : '') + '><span>' + E(T('t.pay.pickup')) + '</span></label>' +
      '<label class="opt block"><input type="radio" name="pay" value="online"' + (form.pay === 'online' ? ' checked' : '') + '><span>' + E(T('t.pay.online')) + '</span></label></div>' +
      (form.pay === 'online' ? '<div class="fake-card"><div class="cap">🔒 ' + E(T('b.demoPay')) + '</div><div class="field"><label for="c-num">' + E(T('b.cardNum')) + '</label><input id="c-num" type="text" disabled tabindex="-1" placeholder="•••• •••• •••• ••••"></div><div class="row2"><div class="field"><label for="c-exp">' + E(T('b.cardExp')) + '</label><input id="c-exp" type="text" disabled tabindex="-1" placeholder="MM/AA"></div><div class="field"><label for="c-cvc">CVC</label><input id="c-cvc" type="text" disabled tabindex="-1" placeholder="•••"></div></div></div>' : '') +
      '</fieldset><div class="check"><input type="checkbox" id="o-consent"' + (form.consent ? ' checked' : '') + '><label for="o-consent">' + H('b.consent') + ' <a href="privacy.html" target="_blank" rel="noopener">' + E(T('b.privacy')) + '</a> *</label></div><div class="err" id="e-o-consent"></div>' +
      '<div class="wiz-nav"><span></span><button type="button" class="btn btn-primary" data-place>' + E(T('t.place')) + '</button></div></div>';
  }
  function readForm() {
    var g = function (i) { var e = document.getElementById(i); return e ? e.value : null; };
    if (!document.getElementById('o-name')) return;
    form.time = g('o-time'); form.name = g('o-name'); form.phone = g('o-phone'); form.email = g('o-email'); form.notes = g('o-notes');
    form.consent = document.getElementById('o-consent').checked;
  }
  function err(id, msg) { var el = document.getElementById(id), b = document.getElementById('e-' + id); if (el) el.classList.add('bad'); if (b) b.textContent = msg; }
  function place() {
    readForm();
    root.querySelectorAll('.bad').forEach(function (x) { x.classList.remove('bad'); }); root.querySelectorAll('.err').forEach(function (x) { x.textContent = ''; });
    var ok = true;
    if (!form.time) { err('o-time', T('t.err.time')); ok = false; }
    if (form.name.trim().length < 2) { err('o-name', T('b.err.name')); ok = false; }
    if (form.phone.replace(/\D/g, '').length < 6) { err('o-phone', T('b.err.phone')); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { err('o-email', T('b.err.email')); ok = false; }
    if (!form.consent) { err('o-consent', T('b.err.consent')); ok = false; }
    if (!ok) { var bad = root.querySelector('.bad'); if (bad) bad.focus(); return; }
    var n = 'ASP-' + String(Math.floor(10000 + Math.random() * 89999));
    done = { n: n, items: ids().map(function (k) { return { id: k, qty: cart[k].qty, note: cart[k].note }; }), total: totalHTML(), day: form.day, time: form.time, pay: form.pay, name: form.name };
    cart = {}; save(); view = 'done'; render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function doneHTML(lang) {
    var d = dayDate(done.day);
    return '<div class="form-card"><div class="confirm-head"><svg class="tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-7"/></svg>' +
      '<h2 tabindex="-1" id="done-h">' + E(T('t.done.title')) + '</h2><p>' + H('t.done.lead', { name: E(done.name.trim().split(/\s+/)[0]) }) + '</p><p class="lbl">' + E(T('t.done.num')) + '</p><div class="code">' + done.n + '</div></div>' +
      '<dl class="summary"><div><dt>' + E(T('t.done.when')) + '</dt><dd>' + E(d.toLocaleDateString(LDT.locale(), { weekday: 'long', day: 'numeric', month: 'long' })) + ' · ' + done.time + '</dd></div>' +
      '<div><dt>' + E(T('t.done.where')) + '</dt><dd>Via di Pietra 85, 00186 Roma</dd></div>' +
      done.items.map(function (i) { return '<div><dt>' + i.qty + ' × ' + LDT.ph(E(byId[i.id].name[lang])) + (i.note ? '<br><small>' + E(i.note) + '</small>' : '') + '</dt><dd>' + LDT.ph(E(byId[i.id].price)) + '</dd></div>'; }).join('') +
      '<div><dt>' + E(T('t.total')) + '</dt><dd>' + done.total + '</dd></div><div><dt>' + E(T('t.payT')) + '</dt><dd>' + E(T(done.pay === 'pickup' ? 't.pay.pickup' : 't.pay.online')) + '</dd></div></dl>' +
      '<p class="fine" style="margin-top:12px">' + E(T('t.done.note')) + '</p><div class="btn-row" style="margin-top:16px"><a class="btn btn-primary" href="index.html">' + E(T('b.done.home')) + '</a><button type="button" class="btn btn-ghost" data-new>' + E(T('t.done.new')) + '</button></div></div>';
  }

  function render() {
    var lang = LDT.lang();
    root.innerHTML = view === 'shop' ? shopHTML(lang) : view === 'checkout' ? checkoutHTML(lang) : doneHTML(lang);
    document.body.style.overflow = (view === 'shop' && cartOpen && window.innerWidth < 1000) ? 'hidden' : '';
  }
  function focusId(id) { var e = document.getElementById(id); if (e) e.focus({ preventScroll: true }); }

  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var d = b.dataset;
    if (d.add) { cart[d.add] = cart[d.add] || { qty: 0, note: '' }; cart[d.add].qty = Math.min(20, cart[d.add].qty + 1); save(); render(); var nb = root.querySelector('[data-add="' + d.add + '"]'); if (nb) nb.focus({ preventScroll: true }); return; }
    if (d.q) { var k = d.id; cart[k].qty += +d.q; if (cart[k].qty <= 0) delete cart[k]; save(); render(); return; }
    if ('openCart' in d) { cartOpen = true; render(); return; }
    if ('closeCart' in d) { cartOpen = false; render(); return; }
    if ('clear' in d) { cart = {}; save(); render(); return; }
    if ('checkout' in d) { cartOpen = false; view = 'checkout'; render(); window.scrollTo({ top: 0 }); focusId('co-h'); return; }
    if ('backShop' in d) { readForm(); view = 'shop'; render(); return; }
    if ('place' in d) { place(); return; }
    if ('new' in d) { view = 'shop'; done = null; render(); window.scrollTo({ top: 0 }); }
  });
  root.addEventListener('click', function (e) { if (e.target.hasAttribute && e.target.hasAttribute('data-close-cart') && e.target.tagName === 'DIV') { cartOpen = false; render(); } });
  root.addEventListener('input', function (e) { if (e.target.dataset.note) { cart[e.target.dataset.note].note = e.target.value; save(); } });
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'day') { readForm(); form.day = +t.value; form.time = ''; render(); }
    else if (t.name === 'pay') { readForm(); form.pay = t.value; render(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cartOpen) { cartOpen = false; render(); } });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1000 && cartOpen) { cartOpen = false; render(); } });
  LDT.bindAllergens(root);
  LDT.onLang(function () { readForm(); render(); });
})();
