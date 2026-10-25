/* Parti condivise da menu.html e asporto.html: allergeni e tag dei piatti */
(function () {
  'use strict';
  var algById = {};
  ALLERGENS.forEach(function (a) { algById[a.id] = a; });
  LDT.algById = algById;

  /* HTML delle icone allergeni di un piatto: toccando l'icona compare il nome */
  LDT.allergenHTML = function (d, lang) {
    if (!d.allergens || !d.allergens.length) return '';
    return '<span class="alg" role="group" aria-label="' + LDT.esc(LDT.tx('m.allergens')) + '">' + d.allergens.map(function (id) {
      var a = algById[id]; if (!a) return '';
      return '<button type="button" class="alg-btn" aria-expanded="false" aria-label="' + LDT.esc(a[lang]) + '" title="' + LDT.esc(a[lang]) + '" data-alg="' + id + '"><span aria-hidden="true">' + a.icon + '</span></button>';
    }).join('') + '<span class="alg-name" hidden></span></span>';
  };
  LDT.tagsHTML = function (d) {
    var out = '';
    if (d.tags.indexOf('vegan') > -1) out += '<span class="tag">' + LDT.esc(LDT.tx('m.f.vegan')) + '</span>';
    else if (d.tags.indexOf('veg') > -1) out += '<span class="tag">' + LDT.esc(LDT.tx('m.f.veg')) + '</span>';
    if (d.tags.indexOf('gf') > -1) out += '<span class="tag">' + LDT.esc(LDT.tx('m.f.gf')) + '</span>';
    return out;
  };
  /* un solo gestore per tutte le icone allergeni dentro `scope` */
  LDT.bindAllergens = function (scope) {
    scope.addEventListener('click', function (e) {
      var b = e.target.closest('.alg-btn'); if (!b) return;
      var wrap = b.parentNode, label = wrap.querySelector('.alg-name');
      var open = b.getAttribute('aria-expanded') === 'true';
      wrap.querySelectorAll('.alg-btn').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
      if (open) { label.hidden = true; return; }
      b.setAttribute('aria-expanded', 'true');
      label.textContent = algById[b.getAttribute('data-alg')][LDT.lang()];
      label.hidden = false;
    });
  };
})();
