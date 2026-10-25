/* Pagina menù: rendering e filtri. I dati stanno in js/menu-data.js */
(function () {
  'use strict';
  var root = document.getElementById('menu-root');
  var nav = document.getElementById('cat-nav');
  var legend = document.getElementById('legend');
  var empty = document.getElementById('menu-empty');
  var active = {};

  function matches(d) {
    if (active.veg && d.tags.indexOf('veg') < 0 && d.tags.indexOf('vegan') < 0) return false;
    if (active.vegan && d.tags.indexOf('vegan') < 0) return false;
    if (active.gf && d.tags.indexOf('gf') < 0) return false;
    return true;
  }

  function render(lang) {
    nav.innerHTML = MENU_CATEGORIES.map(function (c) { return '<a href="#cat-' + c.id + '">' + LDT.esc(c[lang]) + '</a>'; }).join('');
    legend.innerHTML = ALLERGENS.map(function (a) { return '<li><span aria-hidden="true">' + a.icon + '</span> ' + LDT.esc(a[lang]) + '</li>'; }).join('');
    var any = false;
    root.innerHTML = MENU_CATEGORIES.map(function (c) {
      var items = MENU_DISHES.filter(function (d) { return d.cat === c.id && !d.hidden && matches(d); });
      if (!items.length) return '';
      any = true;
      return '<section id="cat-' + c.id + '" style="padding:0" aria-labelledby="h-' + c.id + '"><div class="cat-title"><h2 id="h-' + c.id + '">' + LDT.esc(c[lang]) + '</h2></div><div class="dishes">' +
        items.map(function (d) {
          var note = (lang === 'en' && d.roman && d.note) ? '<p class="note">' + LDT.esc(d.note.en) + '</p>' : '';
          return '<article class="dish"><div class="dish-top"><h3>' + LDT.ph(LDT.esc(d.name[lang])) + '</h3><span class="price">' + LDT.ph(LDT.esc(d.price)) + '</span></div>' +
            '<p>' + LDT.ph(LDT.esc(d.desc[lang])) + '</p>' + note +
            '<div class="tags">' + LDT.tagsHTML(d) + LDT.allergenHTML(d, lang) + '</div></article>';
        }).join('') + '</div></section>';
    }).join('');
    empty.style.display = any ? 'none' : 'block';
    LDT.applyI18n(document.querySelector('.menu-tools'));
  }

  document.querySelectorAll('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter'), on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false'); active[f] = on;
      render(LDT.lang());
    });
  });
  LDT.bindAllergens(root);
  LDT.onLang(render);
})();
