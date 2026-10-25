/* =========================================================
   Nucleo del sito: lingua, logotipo, arco, header/footer, animazioni.
   Caricato da tutte le pagine dopo js/i18n.js
   ========================================================= */
(function () {
  'use strict';
  var LDT = window.LDT = {};
  document.documentElement.classList.add('js');

  /* ---------- LOGOTIPO: unico punto dove cambiare la grafia dell'insegna ---------- */
  LDT.brand = { la: 'La', locanda: 'Locanda', del: 'del', tempio: 'Tempio' };
  LDT.brandName = 'La Locanda del Tempio';

  /* ---------- Dati verificati ---------- */
  LDT.info = {
    address: 'Via di Pietra 85, 00186 Roma',
    phone: '06 4754 5886', tel: 'tel:+390647545886',
    facebook: 'https://www.facebook.com/lalocandadeltempioroma',
    lat: 41.8999875, lng: 12.4803759,
    directions: 'https://www.google.com/maps/dir/?api=1&destination=41.8999875,12.4803759',
    whatsapp: 'https://wa.me/[NUMERO WHATSAPP]'
  };

  /* ---------- Storage sicuro ---------- */
  LDT.store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignora */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignora */ } }
  };

  /* ---------- i18n ---------- */
  var I18N = window.I18N || { it: {}, en: {} };
  var lang = 'it';
  var saved = LDT.store.get('ldt_lang');
  if (saved === 'it' || saved === 'en') lang = saved;
  var itCache = {}, itAttr = {};
  var listeners = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* Rende riconoscibili i segnaposto [ ... ] */
  function wrapPh(s) {
    if (s.indexOf('class="ph"') !== -1) return s;
    return s.replace(/\[[^\]\n]+\]/g, '<span class="ph">$&</span>');
  }
  function raw(key, l) {
    var d = I18N[l || lang] || {};
    if (d[key] != null) return d[key];
    if (itCache[key] != null) return itCache[key];
    return (I18N.it && I18N.it[key] != null) ? I18N.it[key] : key;
  }
  function vars(s, v) {
    if (!v) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; });
  }
  LDT.tx = function (key, v) { return vars(raw(key), v); };           /* testo semplice */
  LDT.t = function (key, v) { return wrapPh(vars(raw(key), v)); };     /* HTML con segnaposto evidenziati */
  LDT.esc = esc;
  LDT.ph = wrapPh;
  LDT.lang = function () { return lang; };
  LDT.locale = function () { return lang === 'en' ? 'en-GB' : 'it-IT'; };

  function applyI18n(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (!(k in itCache) && !(I18N.it && k in I18N.it)) itCache[k] = el.innerHTML;
      el.innerHTML = wrapPh(raw(k));
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length < 2) return;
        var a = p[0].trim(), k = p[1].trim(), ck = a + '|' + k;
        if (!(ck in itAttr)) itAttr[ck] = el.getAttribute(a);
        var v = lang === 'it' ? ((I18N.it && I18N.it[k]) != null ? I18N.it[k] : itAttr[ck]) : (I18N.en[k] != null ? I18N.en[k] : itAttr[ck]);
        if (v != null) el.setAttribute(a, v);
      });
    });
  }
  LDT.applyI18n = applyI18n;

  var pageKey = document.body.getAttribute('data-page') || 'home';
  var metaDesc = document.querySelector('meta[name="description"]');
  var origTitle = document.title, origDesc = metaDesc ? metaDesc.getAttribute('content') : '';
  function applyMeta() {
    document.documentElement.setAttribute('lang', lang);
    var tk = 'meta.' + pageKey + '.title', dk = 'meta.' + pageKey + '.desc';
    var title = lang === 'en' && I18N.en[tk] ? I18N.en[tk] : origTitle;
    var desc = lang === 'en' && I18N.en[dk] ? I18N.en[dk] : origDesc;
    document.title = title;
    if (metaDesc) metaDesc.setAttribute('content', desc);
    var ot = document.querySelector('meta[property="og:title"]'), od = document.querySelector('meta[property="og:description"]'), ol = document.querySelector('meta[property="og:locale"]');
    if (ot) ot.setAttribute('content', title);
    if (od) od.setAttribute('content', desc);
    if (ol) ol.setAttribute('content', lang === 'en' ? 'en_GB' : 'it_IT');
  }
  function syncButtons() {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }
  LDT.setLang = function (l) {
    if (l !== 'it' && l !== 'en') return;
    lang = l; LDT.store.set('ldt_lang', l);
    applyI18n(); applyMeta(); syncButtons();
    listeners.forEach(function (fn) { try { fn(l); } catch (e) { console.error(e); } });
  };
  /* registra una funzione di (ri)disegno: parte subito e a ogni cambio lingua */
  LDT.onLang = function (fn) { listeners.push(fn); fn(lang); };

  LDT.fmtDate = function (d, opts) {
    return d.toLocaleDateString(LDT.locale(), opts || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  /* ---------- Motivo firma: portale ad arco con raggiera ---------- */
  LDT.arch = function () {
    var cx = 100, cy = 100, r0 = 11, r1 = 74, n = 12, step = 180 / n, gap = 1.3, out = '';
    function pt(r, a) { var rad = a * Math.PI / 180; return (cx + r * Math.cos(rad)).toFixed(2) + ' ' + (cy + r * Math.sin(rad)).toFixed(2); }
    for (var i = 0; i < n; i++) {
      var a0 = 180 + i * step + gap, a1 = 180 + (i + 1) * step - gap;
      out += '<path d="M' + pt(r0, a0) + ' L' + pt(r1, a0) + ' A' + r1 + ' ' + r1 + ' 0 0 1 ' + pt(r1, a1) + ' L' + pt(r0, a1) + ' A' + r0 + ' ' + r0 + ' 0 0 0 ' + pt(r0, a0) + 'Z" fill="' + (i % 2 ? '#4A2E1E' : '#3A2418') + '" stroke="#5E3C27" stroke-width=".6"/>';
    }
    return '<svg class="arch-svg" viewBox="0 0 200 112" role="img" aria-label="" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M4 112V100A96 96 0 0 1 196 100V112Z" fill="#ECE3D0" stroke="#B9A988" stroke-width="1.5"/>' +
      '<path d="M16 112V100A84 84 0 0 1 184 100V112Z" fill="#2A190F"/>' + out +
      '<path d="M100 100m-11 0a11 11 0 0 1 22 0Z" fill="#ECE3D0" stroke="#C29A45" stroke-width="1"/>' +
      '<path d="M26 100H174" stroke="#C29A45" stroke-width="1.2"/></svg>';
  };
  var camera = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';

  function logoHTML() {
    var b = LDT.brand;
    return '<span class="lg-la">' + b.la + '</span> ' + b.locanda + ' <span class="lg-del">' + b.del + '</span> ' + b.tempio;
  }
  LDT.logoHTML = logoHTML;
  LDT.fillStatic = function (root) {
    root = root || document;
    root.querySelectorAll('[data-logo]').forEach(function (el) { el.innerHTML = logoHTML(); });
    root.querySelectorAll('[data-arch]').forEach(function (el) { el.innerHTML = LDT.arch(); });
    root.querySelectorAll('[data-divider]').forEach(function (el) { el.classList.add('divider'); el.setAttribute('aria-hidden', 'true'); el.innerHTML = LDT.arch(); });
    root.querySelectorAll('[data-photo]').forEach(function (el) {
      el.classList.add('photo'); el.setAttribute('role', 'img');
      var k = el.getAttribute('data-photo');
      el.setAttribute('aria-label', LDT.tx(k));
      el.innerHTML = '<div class="p-in">' + camera + '<span data-i18n="' + k + '">' + esc(LDT.tx(k)) + '</span></div>';
    });
  };

  /* ---------- Icone ---------- */
  var ic = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5A8.5 8.5 0 1 1 21 11.5z"/></svg>',
    nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
  };
  LDT.icons = ic;

  /* ---------- Header / footer / barra azioni ---------- */
  var links = [
    ['home', 'index.html', 'nav.home', 'Home'],
    ['menu', 'menu.html', 'nav.menu', 'Menù'],
    ['asporto', 'asporto.html', 'nav.takeaway', 'Asporto'],
    ['buoni', 'buoni-regalo.html', 'nav.vouchers', 'Buoni regalo'],
    ['eventi', 'eventi.html', 'nav.events', 'Eventi']
  ];
  function buildLayout() {
    var hdr = document.getElementById('site-header');
    if (hdr) {
      var nav = links.map(function (l) {
        return '<a href="' + l[1] + '"' + (l[0] === pageKey ? ' aria-current="page"' : '') + ' data-i18n="' + l[2] + '">' + l[3] + '</a>';
      }).join('') + '<a class="nav-book-m" href="prenota.html"' + (pageKey === 'prenota' ? ' aria-current="page"' : '') + ' data-i18n="nav.book">Prenota</a>';
      hdr.className = 'site-header';
      hdr.innerHTML = '<div class="container bar">' +
        '<a class="brand" href="index.html" aria-label="' + LDT.brandName + '"><span class="arch-mini" data-arch aria-hidden="true"></span><span class="logo-type" data-logo></span></a>' +
        '<nav class="nav" id="nav" aria-label="Principale" data-i18n-attr="aria-label:nav.aria">' + nav + '</nav>' +
        '<div class="header-tools"><div class="lang" role="group" aria-label="Lingua / Language"><button type="button" data-lang="it" aria-pressed="false">IT</button><button type="button" data-lang="en" aria-pressed="false">EN</button></div>' +
        '<a class="btn btn-primary btn-sm btn-book-h" href="prenota.html" data-i18n="nav.book">Prenota</a>' +
        '<button class="burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu" data-i18n-attr="aria-label:nav.menuBtn"><span></span><span></span><span></span></button></div></div>';
      var burger = hdr.querySelector('.burger'), navEl = hdr.querySelector('.nav');
      burger.addEventListener('click', function () {
        var o = navEl.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { navEl.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
      hdr.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { LDT.setLang(b.getAttribute('data-lang')); }); });
    }
    var ftr = document.getElementById('site-footer');
    if (ftr) {
      ftr.className = 'site-footer';
      ftr.innerHTML = '<div class="container"><div class="foot-grid">' +
        '<div><a class="logo-band" href="index.html" aria-label="' + LDT.brandName + '"><span class="logo-type logo-sm" data-logo></span></a>' +
        '<p style="margin-top:14px" data-i18n="foot.tag">Cucina italiana tradizionale, pesce fresco e vini pregiati, nel cuore di Roma.</p>' +
        '<p>' + LDT.info.address + '</p></div>' +
        '<div><h3 data-i18n="foot.contacts">Contatti</h3><ul>' +
        '<li><a href="' + LDT.info.tel + '">' + LDT.info.phone + '</a></li>' +
        '<li><span class="ph">[email]</span></li>' +
        '<li><a href="' + LDT.info.facebook + '" target="_blank" rel="noopener">Facebook</a></li>' +
        '<li><span class="ph">[Instagram]</span></li></ul></div>' +
        '<div><h3 data-i18n="foot.hours">Orari</h3><p><span class="ph" data-i18n="ph.hours">[DA INSERIRE: orari]</span></p><p><span class="ph" data-i18n="ph.closed">[DA INSERIRE: giorno di chiusura]</span></p></div>' +
        '<div><h3 data-i18n="foot.info">Informazioni</h3><ul>' +
        '<li><a href="prenota.html" data-i18n="nav.book">Prenota</a></li>' +
        '<li><a href="privacy.html">Privacy</a></li>' +
        '<li><a href="cookie.html">Cookie</a></li>' +
        '<li><a href="gestione.html" data-i18n="foot.admin">Area ristoratore (demo)</a></li></ul></div></div>' +
        '<div class="foot-bottom"><span>© <span id="yr"></span> ' + LDT.brandName + ' · <span class="ph">[P.IVA]</span></span><span data-i18n="foot.demo">Sito dimostrativo: nessun dato viene inviato, nessun pagamento è reale.</span></div></div>';
      var y = ftr.querySelector('#yr'); if (y) y.textContent = new Date().getFullYear();
    }
    var bar = document.getElementById('action-bar');
    if (bar) {
      bar.className = 'action-bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Azioni rapide');
      bar.setAttribute('data-i18n-attr', 'aria-label:bar.aria');
      bar.innerHTML = '<a href="' + LDT.info.tel + '">' + ic.phone + '<span data-i18n="bar.call">Chiama</span></a>' +
        '<a href="' + LDT.info.whatsapp + '" target="_blank" rel="noopener">' + ic.chat + '<span>WhatsApp</span></a>' +
        '<a href="' + LDT.info.directions + '" target="_blank" rel="noopener">' + ic.nav + '<span data-i18n="bar.dir">Indicazioni</span></a>';
    }
    var m = document.querySelector('main'); if (m && !m.id) m.id = 'main';
    if (!document.querySelector('.skip') && m) {
      var s = document.createElement('a'); s.className = 'skip'; s.href = '#main'; s.setAttribute('data-i18n', 'skip'); s.textContent = 'Vai al contenuto';
      document.body.insertBefore(s, document.body.firstChild);
    }
  }
  /* nasconde il link "Prenota" duplicato in navigazione su desktop */
  var st = document.createElement('style');
  st.textContent = '@media(min-width:1040px){.nav-book-m{display:none}}';
  document.head.appendChild(st);

  /* ---------- Foto mancanti: fallback elegante ---------- */
  function fixImg(img) {
    if (img.__fixed) return; img.__fixed = true;
    var ph = document.createElement('div');
    ph.className = 'photo'; ph.setAttribute('role', 'img'); ph.setAttribute('aria-label', img.alt || '');
    ph.style.setProperty('--ar', img.getAttribute('data-ar') || '4/5');
    ph.innerHTML = '<div class="p-in">' + camera + '<span data-i18n="photo.facade">' + esc(LDT.tx('photo.facade')) + '</span></div>';
    if (img.parentNode) img.parentNode.replaceChild(ph, img);
  }
  function watchImgs() {
    document.querySelectorAll('img[data-fallback]').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) fixImg(img);
      else img.addEventListener('error', function () { fixImg(img); });
    });
  }

  /* ---------- Animazioni di ingresso ---------- */
  function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (e) { e.classList.add('in'); }); return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Avvio ---------- */
  buildLayout();
  LDT.fillStatic();
  listeners.push(function () {
    document.querySelectorAll('[data-photo]').forEach(function (el) { el.setAttribute('aria-label', LDT.tx(el.getAttribute('data-photo'))); });
  });
  watchImgs();
  applyI18n(); applyMeta(); syncButtons();
  reveal();
  document.dispatchEvent(new CustomEvent('ldt:ready'));
})();
