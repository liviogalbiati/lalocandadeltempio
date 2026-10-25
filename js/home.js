/* Home: anteprima del menù (legge gli stessi dati di js/menu-data.js) */
(function () {
  'use strict';
  var box = document.getElementById('menu-preview');
  if (!box) return;
  var show = ['antipasti', 'primi', 'pesce'];
  LDT.onLang(function (lang) {
    box.innerHTML = show.map(function (cid) {
      var cat = MENU_CATEGORIES.filter(function (c) { return c.id === cid; })[0];
      var items = MENU_DISHES.filter(function (d) { return d.cat === cid && !d.hidden; }).slice(0, 3);
      return '<div class="card" style="background:rgba(236,227,208,.07);border-color:rgba(231,203,122,.4);box-shadow:none"><h3 style="color:var(--oro-l)">' + LDT.esc(cat[lang]) + '</h3>' +
        '<ul style="list-style:none;padding:0;margin:0">' + items.map(function (d) {
          return '<li style="display:flex;justify-content:space-between;gap:12px;padding:.5rem 0;border-bottom:1px dotted rgba(231,203,122,.3)"><span>' + LDT.ph(LDT.esc(d.name[lang])) + '</span><span>' + LDT.ph(LDT.esc(d.price)) + '</span></li>';
        }).join('') + '</ul></div>';
    }).join('');
  });
})();
