/* =========================================================
   MENÙ — La Locanda del Tempio
   Questo è l'UNICO file da toccare per cambiare i piatti.
   Lo usano sia menu.html sia asporto.html.

   COME CAMBIARE UN PIATTO IN UN MINUTO
   1. Cerca il piatto (Ctrl+F con il suo nome, es. "Piatto di pesce del giorno").
   2. Sostituisci i testi tra virgolette:
        name  -> nome   (it = italiano, en = inglese)
        desc  -> descrizione (it / en)
        price -> prezzo come testo, es. "18"  (il simbolo € lo aggiunge il sito)
        value -> prezzo come NUMERO, es. 18   (serve ai totali dell'asporto;
                 lascia null finché il prezzo non è confermato)
   3. allergens: elenco di codici dalla tabella ALLERGENS qui sotto,
        es. ["gluten","eggs","milk"]
   4. tags: "veg" (vegetariano), "vegan" (vegano), "gf" (senza glutine)
   5. roman: true  + note.en  -> per i piatti romani: spiegazione in inglese
      (cos'è, come si mangia), mostrata sotto il piatto nella versione EN.
   Per aggiungere un piatto: copia una riga { ... }, incollala dopo un'altra
   (ricordati la virgola) e cambia "id" con un nome mai usato prima.
   Per togliere un piatto: cancella la sua riga.
   Per nascondere un piatto senza cancellarlo: aggiungi  hidden: true
   Attenzione: i testi tra [parentesi quadre] sono SEGNAPOSTO, vanno sostituiti.
   ========================================================= */

/* I 14 allergeni del Reg. UE 1169/2011 */
window.ALLERGENS = [
  { id: "gluten",      icon: "🌾", it: "Cereali contenenti glutine", en: "Cereals containing gluten" },
  { id: "crustaceans", icon: "🦐", it: "Crostacei",                  en: "Crustaceans" },
  { id: "eggs",        icon: "🥚", it: "Uova",                       en: "Eggs" },
  { id: "fish",        icon: "🐟", it: "Pesce",                      en: "Fish" },
  { id: "peanuts",     icon: "🥜", it: "Arachidi",                   en: "Peanuts" },
  { id: "soy",         icon: "🫘", it: "Soia",                       en: "Soy" },
  { id: "milk",        icon: "🥛", it: "Latte e derivati",           en: "Milk" },
  { id: "nuts",        icon: "🌰", it: "Frutta a guscio",            en: "Tree nuts" },
  { id: "celery",      icon: "🌿", it: "Sedano",                     en: "Celery" },
  { id: "mustard",     icon: "🟡", it: "Senape",                     en: "Mustard" },
  { id: "sesame",      icon: "⚪", it: "Semi di sesamo",             en: "Sesame seeds" },
  { id: "sulphites",   icon: "🍷", it: "Anidride solforosa e solfiti", en: "Sulphur dioxide and sulphites" },
  { id: "lupin",       icon: "🌼", it: "Lupini",                     en: "Lupin" },
  { id: "molluscs",    icon: "🐚", it: "Molluschi",                  en: "Molluscs" }
];

window.MENU_CATEGORIES = [
  { id: "antipasti", it: "Antipasti",          en: "Starters" },
  { id: "primi",     it: "Primi",              en: "First courses" },
  { id: "pesce",     it: "Secondi di pesce",   en: "Fish main courses" },
  { id: "carne",     it: "Secondi di carne",   en: "Meat main courses" },
  { id: "contorni",  it: "Contorni",           en: "Side dishes" },
  { id: "dolci",     it: "Dolci",              en: "Desserts" },
  { id: "vini",      it: "Vini",               en: "Wines" }
];

/* Tutti i piatti sono SEGNAPOSTO dimostrativi (da confermare con il ristorante). */
window.MENU_DISHES = [
  /* ---- ANTIPASTI ---- */
  { id: "ant1", cat: "antipasti",
    name: { it: "[Antipasto di pesce della casa]", en: "[House seafood starter]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["fish","molluscs","crustaceans"], tags: [] },
  { id: "ant2", cat: "antipasti",
    name: { it: "[Crudo di pesce fresco]", en: "[Fresh raw fish]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["fish"], tags: ["gf"] },
  { id: "ant3", cat: "antipasti",
    name: { it: "[Antipasto di verdure]", en: "[Vegetable starter]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["celery"], tags: ["veg","vegan","gf"] },
  { id: "ant4", cat: "antipasti",
    name: { it: "[Tagliere di salumi e formaggi]", en: "[Cured meats and cheese board]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["milk"], tags: ["gf"] },

  /* ---- PRIMI ---- */
  { id: "pri1", cat: "primi",
    name: { it: "[Primo di pesce del giorno]", en: "[Fish pasta of the day]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["gluten","fish","molluscs"], tags: [] },
  { id: "pri2", cat: "primi", roman: true,
    name: { it: "[Es. Cacio e pepe]", en: "[E.g. Cacio e pepe]" },
    desc: { it: "[descrizione]", en: "[description]" },
    note: { en: "A Roman classic: spaghetti or tonnarelli with pecorino cheese and black pepper, nothing else. Stir it quickly so the cheese turns into a creamy sauce, and eat it hot." },
    price: "[€ —]", value: null, allergens: ["gluten","milk"], tags: ["veg"] },
  { id: "pri3", cat: "primi",
    name: { it: "[Risotto o pasta vegetariana]", en: "[Vegetarian risotto or pasta]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["gluten","milk"], tags: ["veg"] },
  { id: "pri4", cat: "primi",
    name: { it: "[Pasta senza glutine con sugo di pesce]", en: "[Gluten-free pasta with fish sauce]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["fish"], tags: ["gf"] },

  /* ---- SECONDI DI PESCE ---- */
  { id: "pes1", cat: "pesce",
    name: { it: "[Piatto di pesce del giorno]", en: "[Catch of the day]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["fish"], tags: ["gf"] },
  { id: "pes2", cat: "pesce",
    name: { it: "[Pesce al forno con contorno]", en: "[Oven-baked fish with side]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["fish","celery"], tags: ["gf"] },
  { id: "pes3", cat: "pesce",
    name: { it: "[Fritto misto di mare]", en: "[Mixed fried seafood]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["gluten","fish","molluscs","crustaceans"], tags: [] },

  /* ---- SECONDI DI CARNE ---- */
  { id: "car1", cat: "carne", roman: true,
    name: { it: "[Es. Saltimbocca alla romana]", en: "[E.g. Saltimbocca alla romana]" },
    desc: { it: "[descrizione]", en: "[description]" },
    note: { en: "Thin veal slices topped with prosciutto and sage, pan-cooked in white wine and butter. The name means “jump in the mouth”. Eat it straight away while it is tender." },
    price: "[€ —]", value: null, allergens: ["milk","sulphites"], tags: [] },
  { id: "car2", cat: "carne",
    name: { it: "[Tagliata di manzo]", en: "[Sliced beef steak]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: [], tags: ["gf"] },
  { id: "car3", cat: "carne",
    name: { it: "[Secondo di carne del giorno]", en: "[Meat dish of the day]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["celery"], tags: [] },

  /* ---- CONTORNI ---- */
  { id: "con1", cat: "contorni", roman: true,
    name: { it: "[Es. Carciofi alla romana]", en: "[E.g. Carciofi alla romana]" },
    desc: { it: "[descrizione]", en: "[description]" },
    note: { en: "Artichokes stuffed with mint and garlic, then slowly braised in olive oil and water until meltingly soft. Eat them whole, including the tender stem." },
    price: "[€ —]", value: null, allergens: [], tags: ["veg","vegan","gf"] },
  { id: "con2", cat: "contorni",
    name: { it: "[Verdure di stagione]", en: "[Seasonal vegetables]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: [], tags: ["veg","vegan","gf"] },
  { id: "con3", cat: "contorni",
    name: { it: "[Patate al forno]", en: "[Roast potatoes]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: [], tags: ["veg","vegan","gf"] },

  /* ---- DOLCI ---- */
  { id: "dol1", cat: "dolci",
    name: { it: "[Dolce della casa]", en: "[House dessert]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["gluten","eggs","milk"], tags: ["veg"] },
  { id: "dol2", cat: "dolci",
    name: { it: "[Sorbetto di frutta]", en: "[Fruit sorbet]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: [], tags: ["veg","vegan","gf"] },
  { id: "dol3", cat: "dolci",
    name: { it: "[Tiramisù]", en: "[Tiramisù]" },
    desc: { it: "[descrizione]", en: "[description]" },
    price: "[€ —]", value: null, allergens: ["gluten","eggs","milk"], tags: ["veg"] },

  /* ---- VINI ---- */
  { id: "vin1", cat: "vini",
    name: { it: "[Vino bianco del Lazio, calice]", en: "[Lazio white wine, by the glass]" },
    desc: { it: "[cantina, annata]", en: "[winery, vintage]" },
    price: "[€ —]", value: null, allergens: ["sulphites"], tags: ["veg","vegan","gf"] },
  { id: "vin2", cat: "vini",
    name: { it: "[Vino rosso, bottiglia]", en: "[Red wine, bottle]" },
    desc: { it: "[cantina, annata]", en: "[winery, vintage]" },
    price: "[€ —]", value: null, allergens: ["sulphites"], tags: ["veg","vegan","gf"] },
  { id: "vin3", cat: "vini",
    name: { it: "[Vino pregiato della cantina]", en: "[Fine wine from the cellar]" },
    desc: { it: "[cantina, annata]", en: "[winery, vintage]" },
    price: "[€ —]", value: null, allergens: ["sulphites"], tags: ["veg","vegan","gf"] },
  { id: "vin4", cat: "vini",
    name: { it: "[Bollicine, bottiglia]", en: "[Sparkling wine, bottle]" },
    desc: { it: "[cantina, annata]", en: "[winery, vintage]" },
    price: "[€ —]", value: null, allergens: ["sulphites"], tags: ["veg","vegan","gf"] }
];
