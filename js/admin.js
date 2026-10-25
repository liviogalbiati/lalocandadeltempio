/* Area ristoratore (demo): nessun salvataggio, nessun login */
(function () {
  'use strict';
  var T = LDT.tx, E = LDT.esc;

  /* ---- automatismi ---- */
  var autos = [
    { id: 'confirm', on: true },
    { id: 'remind', on: true },
    { id: 'review', on: false }
  ];
  var edited = {};              // testi modificati dal ristoratore (restano anche cambiando lingua)
  var grid = document.getElementById('auto-grid');

  function sample(txt) {
    var d = new Date(); d.setDate(d.getDate() + 3);
    var dd = LDT.fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }), map = { nome: 'Marco', name: 'Marco', data: dd, date: dd, ora: '20:30', time: '20:30', persone: '4', guests: '4', link: '[LINK RECENSIONE GOOGLE]' };
    return LDT.ph(E(txt).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; }));
  }
  function drawAutos() {
    grid.innerHTML = autos.map(function (a) {
      var txt = edited[a.id] != null ? edited[a.id] : T('g.a.' + a.id + '.tpl');
      return '<div class="card"><div class="switch"><input type="checkbox" role="switch" id="sw-' + a.id + '"' + (a.on ? ' checked' : '') + ' aria-label="' + E(T('g.a.' + a.id)) + '"><label for="sw-' + a.id + '"><h3 style="margin:0;font-size:1.25rem">' + E(T('g.a.' + a.id)) + '</h3></label></div>' +
        '<p class="fine" style="margin:6px 0 10px">' + E(T('g.a.' + a.id + '.when')) + '</p>' +
        '<label class="lbl" for="tx-' + a.id + '">' + E(T('g.a.text')) + '</label><textarea id="tx-' + a.id + '" data-auto="' + a.id + '" ' + (a.on ? '' : 'disabled') + '>' + E(txt) + '</textarea>' +
        '<p class="msg-when" style="margin-top:12px">' + E(T('g.a.preview')) + '</p><div class="phone"><div class="bubble sms" id="pv-' + a.id + '" style="' + (a.on ? '' : 'opacity:.45') + '">' + sample(txt) + '</div></div>' +
        '<p class="fine" id="st-' + a.id + '" style="margin-top:8px"><span class="pill ' + (a.on ? '' : 'off') + '">' + E(T(a.on ? 'g.a.on' : 'g.a.off')) + '</span></p></div>';
    }).join('');
  }
  grid.addEventListener('input', function (e) {
    var id = e.target.dataset.auto; if (!id) return;
    edited[id] = e.target.value; document.getElementById('pv-' + id).innerHTML = sample(e.target.value);
  });
  grid.addEventListener('change', function (e) {
    if (e.target.id && e.target.id.indexOf('sw-') === 0) {
      var id = e.target.id.slice(3); autos.forEach(function (a) { if (a.id === id) a.on = e.target.checked; });
      drawAutos(); var s = document.getElementById('sw-' + id); if (s) s.focus();
    }
  });

  /* ---- modifica piatto ---- */
  var sel = document.getElementById('ed-dish'), nm = document.getElementById('ed-name'), ds = document.getElementById('ed-desc'), pr = document.getElementById('ed-price'), vg = document.getElementById('ed-veg'), gf = document.getElementById('ed-gf'), pv = document.getElementById('ed-preview');
  var drafts = {};
  MENU_DISHES.forEach(function (d) { drafts[d.id] = { name: d.name.it, desc: d.desc.it, price: d.price, veg: d.tags.indexOf('veg') > -1 || d.tags.indexOf('vegan') > -1, gf: d.tags.indexOf('gf') > -1 }; });
  function current() { return MENU_DISHES.filter(function (d) { return d.id === sel.value; })[0]; }
  function loadFields() { var x = drafts[sel.value]; nm.value = x.name; ds.value = x.desc; pr.value = x.price; vg.checked = x.veg; gf.checked = x.gf; drawPreview(); }
  function drawPreview() {
    var x = drafts[sel.value], d = current();
    var price = /^\d+([.,]\d+)?$/.test(x.price.trim()) ? '€ ' + x.price.trim() : x.price;
    pv.innerHTML = '<div class="dish-top"><h3>' + LDT.ph(E(x.name)) + '</h3><span class="price">' + LDT.ph(E(price)) + '</span></div><p>' + LDT.ph(E(x.desc)) + '</p><div class="tags">' +
      (x.veg ? '<span class="tag">' + E(T('m.f.veg')) + '</span>' : '') + (x.gf ? '<span class="tag">' + E(T('m.f.gf')) + '</span>' : '') + LDT.allergenHTML(d, LDT.lang()) + '</div>';
  }
  function fill() {
    var keep = sel.value;
    sel.innerHTML = MENU_DISHES.map(function (d) { return '<option value="' + d.id + '">' + E(MENU_CATEGORIES.filter(function (c) { return c.id === d.cat; })[0][LDT.lang()]) + ' – ' + E(d.name[LDT.lang()]) + '</option>'; }).join('');
    sel.value = keep || MENU_DISHES[0].id; if (!sel.value) sel.value = MENU_DISHES[0].id;
    loadFields();
  }
  sel.addEventListener('change', loadFields);
  [nm, ds, pr].forEach(function (el) { el.addEventListener('input', function () { var x = drafts[sel.value]; x.name = nm.value; x.desc = ds.value; x.price = pr.value; drawPreview(); }); });
  [vg, gf].forEach(function (el) { el.addEventListener('change', function () { var x = drafts[sel.value]; x.veg = vg.checked; x.gf = gf.checked; drawPreview(); }); });
  LDT.bindAllergens(pv);

  LDT.onLang(function () { drawAutos(); fill(); });
})();
