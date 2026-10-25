# La Locanda del Tempio – sito web (anteprima)

Sito statico in HTML, CSS e JavaScript puro: nessun framework, nessuna build. Si apre con doppio clic su `index.html` e funziona anche su GitHub Pages nel sottopercorso `/locandadeltempio/` (tutti i percorsi sono relativi).

> **Da fare subito:** copiare la foto dell'ingresso in `img/facciata.jpg`. Finché il file manca, al suo posto compare un riquadro segnaposto. Poi controllare la grafia dell'insegna (vedi sotto, "Logotipo").

## Struttura dei file

| File | Contenuto |
|---|---|
| `index.html` | Home (hero, presentazione, anteprima menù, servizi, recensioni, dove siamo, orari, contatti, JSON-LD) |
| `menu.html`, `prenota.html`, `asporto.html`, `buoni-regalo.html`, `eventi.html` | Pagine funzionali |
| `privacy.html`, `cookie.html`, `404.html` | Testi legali standard e pagina di errore |
| `gestione.html` | Area ristoratore dimostrativa (solo link nel footer, `noindex`) |
| `css/style.css` | Tutto lo stile; palette nelle variabili `:root` |
| `js/menu-data.js` | **Piatti, categorie, allergeni** (unico file da toccare per il menù) |
| `js/i18n.js` | Dizionario IT/EN |
| `js/main.js` | Lingua, logotipo, arco SVG, header/footer/barra azioni, animazioni |
| `js/dishes.js` | Icone allergeni e tag condivisi da menù e asporto |
| `js/menu.js`, `booking.js`, `takeaway.js`, `vouchers.js`, `events.js`, `admin.js`, `home.js` | Logica di ogni pagina |
| `favicon.svg` | Arco con raggiera |
| `img/facciata.jpg` | **Da aggiungere**: l'unica foto reale |

## Come cambiare le cose

- **Un piatto:** `js/menu-data.js`. In cima c'è la spiegazione passo passo (nome, descrizione, prezzo, `value` numerico per i totali dell'asporto, allergeni, tag `veg`/`vegan`/`gf`). Vale sia per il menù sia per l'asporto.
- **Orari di apertura:** sono segnaposto in HTML. Cercare `DA INSERIRE: orari` in `index.html` e in `js/main.js` (footer). Gli orari **usati per generare gli slot** di prenotazione sono in `BOOKING_CONFIG.services` (`js/booking.js`) e per l'asporto in `TAKEAWAY_CONFIG.pickup` (`js/takeaway.js`): oggi sono valori dimostrativi.
- **Regole della caparra:** `BOOKING_CONFIG.deposit` in cima a `js/booking.js` (numero minimo di persone, date speciali `'MM-GG'`, sabato a cena, importo). Lì anche massimo persone, passo degli slot, ore del promemoria, link recensione.
- **Importi dei buoni:** `VOUCHER_CONFIG` in `js/vouchers.js`.
- **Grafia dell'insegna / logotipo:** `LDT.brand` in `js/main.js` (`la`, `locanda`, `del`, `tempio`). Il logotipo di tutto il sito (header, hero, footer, buoni) si aggiorna da lì. Attualmente è "La Locanda del Tempio" come nei dati verificati: la foto non era disponibile, quindi **la maiuscola/minuscola di "la" e "del" va confrontata con l'insegna reale.**
- **Testi e traduzioni:** il testo italiano è nell'HTML (attributo `data-i18n`), l'inglese in `js/i18n.js` (`en`); i testi dinamici (moduli, messaggi) hanno entrambe le lingue in `it`/`en`.
- **Colori:** variabili CSS in `:root` di `css/style.css`.

## Segnaposto `[ ]` rimasti

| Segnaposto | Dove si trova |
|---|---|
| `[DA INSERIRE: orari]`, `[DA INSERIRE: giorno di chiusura]` | `index.html`, `js/main.js` (footer), chiavi `ph.hours` / `ph.closed` in `js/i18n.js` |
| `[email]`, `[Instagram]`, `[NUMERO WHATSAPP]` | `index.html`, `js/main.js` (footer e `LDT.info.whatsapp`, usato dalla barra azioni) |
| `[P.IVA]`, `[ragione sociale]`, `[email titolare]` | `js/main.js` (footer), `privacy.html`, `cookie.html` |
| `[valutazione Google]`, `[N. recensioni]`, `[DA INSERIRE: recensione]` ×3, `[nome del cliente]` | `index.html` |
| `[LINK RECENSIONE GOOGLE]` | `index.html` (bottone), `js/booking.js` (`reviewLink`, messaggio del giorno dopo), `js/i18n.js`/`js/admin.js` (anteprime) |
| `[DA INSERIRE: storia del locale, anno di apertura, nome dello chef e dei titolari]` | `index.html` |
| `[DA INSERIRE: coperti]` | `eventi.html` |
| `[24 ore]` (promemoria e ricontatto eventi) | `js/booking.js` (`reminderHours`), `js/i18n.js` |
| `[€ — a persona]` (caparra) | `js/booking.js` (`deposit.perPerson`) |
| `[DA INSERIRE: policy di cancellazione]` | `js/i18n.js` (chiave `b.g.policy`) |
| Piatti, descrizioni, prezzi `[€ —]`, allergeni | `js/menu-data.js` (tutte le voci tra `[ ]`, inclusi gli esempi romani) |
| `[Importi 50 / 100 / 150 € da confermare]`, `[Cena per due – DA INSERIRE]`, `[DA INSERIRE: validità]` | `js/vouchers.js`, `js/i18n.js` |
| `[DA INSERIRE: periodo di conservazione]`, `[DA INSERIRE: elenco fornitori]`, `[DA INSERIRE: eventuale banner di consenso…]` | `privacy.html`, `cookie.html` |
| Prezzi asporto | `value`/`price` in `js/menu-data.js` (finché `value` è `null` il totale mostra `[€ —]`) |
| Foto da scattare (riquadri tratteggiati) | `index.html`, `eventi.html` (chiavi `photo.*` in `js/i18n.js`) |
| Orari reali per slot prenotazione/asporto | `js/booking.js`, `js/takeaway.js` (valori dimostrativi) |

## Cosa serve per rendere reali le funzioni dimostrative

Oggi **nessun dato lascia il browser** e nessun pagamento è reale. In produzione servono:

1. **Backend/API** (o un gestionale di prenotazioni) che riceva prenotazioni, ordini, buoni ed eventi, con database, controllo reale della disponibilità (oggi gli slot "esauriti" sono finti) e invio dei codici.
2. **Invio messaggi:** provider email transazionale; SMS (gateway SMS); WhatsApp Business API con template approvati; uno scheduler per promemoria (`reminderHours` prima) e richiesta di recensione il giorno dopo; gestione dei consensi e della disiscrizione.
3. **Pagamenti:** un PSP (es. Stripe o simili) per caparra, carta a garanzia (pre-autorizzazione/SetupIntent), asporto online e buoni regalo. I campi carta dimostrativi vanno sostituiti dai componenti ospitati dal PSP: non toccare mai i dati carta nel proprio codice. Servono anche policy di cancellazione e rimborso.
4. **Buoni regalo:** generazione e verifica dei codici univoci, PDF scaricabile, invio programmato alla data scelta, registro degli utilizzi.
5. **Area ristoratore:** vero login (autenticazione e ruoli), dati live al posto di quelli fittizi, modifica del menù salvata (database o CMS al posto di `menu-data.js`).
6. **Legale e privacy:** testi definitivi di privacy e cookie, dati societari, eventuale banner di consenso (Google Fonts e Google Maps sono servizi di terzi), registro dei trattamenti.
7. **Contenuti:** foto reali, orari, recensioni vere, Open Graph con immagine in URL assoluto, `sitemap.xml`.

## Note tecniche

- `404.html` usa percorsi relativi: su GitHub Pages funziona per i percorsi a un solo livello sotto `/locandadeltempio/`.
- `localStorage` è usato solo per lingua (`ldt_lang`) e carrello (`ldt_cart`), sempre in `try/catch`.
- Il JSON-LD (in `index.html`) contiene solo i dati verificati; i campi mancanti sono omessi.
