# Wabokkio website (fase 1)

Statische Astro-site voor **wabokkio.nl**, gehost op **Cloudflare Pages**, met één Pages Function (`functions/api/aanvraag.ts`) voor het aanvraagformulier.

Wabokkio B.V. · KvK 58114262 · Groot Emiclaer 157, 3822 TL Amersfoort · IATA TIDS 96223061 · travel@wabokkio.nl

## Structuur
| Pad | Inhoud |
|---|---|
| `src/views/` | Paginasjablonen (één per paginatype, taal als prop) |
| `src/pages/`, `src/pages/en/` | Dunne routebestanden NL (`/`) en EN (`/en/`) |
| `src/i18n/` | `nl.ts` en `en.ts` (alle UI-teksten), `routes.ts` (URL's per taal, taalwisselaar, hreflang) |
| `src/content/en/*.md` | Engelse teksten over ons, privacy, voorwaarden |
| `src/content/*.md` | Teksten (over ons, privacy, voorwaarden) |
| `src/data/site.ts` | Bedrijfsgegevens en resortkaarten (volgorde = volgorde op site) |
| `src/config.ts` | `SHOW_PARTNERS` (standaard `false`): strook "Onze partners" (Ratehawk, Expedia TAAP, alleen tekst) boven de footer op home |
| `public/wabokkio-logo-*.svg`, `favicon*` | Merkbestanden uit `/workspace/wabokkio/brand/`: `header` (header), `stacked-white` (donkere footer), `header-white` en `stacked` (reserve, mail/print). Omgezet met `python scripts/svg-text-to-paths.py <in.svg> <out.svg> wabokkio-mark-vector.svg`: tekst wordt paden (Nunito 800 / Inter 400) en de ingesloten raster-pinguïn wordt de vector-mark. Bij nieuwe logo's opnieuw draaien. |
| `src/styles/tokens.css` | Merktokens (kleuren, fonts, radius) |
| `public/js/form.js` | Formulierlogica (kamers, leeftijden kinderen, prefill vanuit "Vraag prijs aan") |
| `public/_headers` | Security headers (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors 'none') |
| `functions/api/aanvraag.ts` | Validatie, honeypot, Turnstile, opslag in D1, mails via Resend |
| `db/schema.sql` | D1-schema |
| `worker/` | Cron-Worker die aanvragen ouder dan 12 maanden verwijdert |

Er staan nergens prijzen op de site: alles is "op aanvraag" / "Vraag prijs aan". Er is (nog) geen Ratehawk-API-koppeling.

## Talen (NL/EN)
- Nederlands is standaard op `/`, Engels staat onder `/en/` (Astro i18n, `prefixDefaultLocale: false`). Elke pagina heeft `<html lang>`, canonical en hreflang `nl`, `en` en `x-default` (= nl).
- **Engelse teksten zijn CONCEPT** (zelf geschreven). Vervangen door de vertaling van de designer op deze plekken:
  - `src/i18n/en.ts` – alle knoppen, formulier, home, foutmeldingen in de browser
  - `src/data/site.ts` – de `en:`-velden van de resortkaarten
  - `src/content/en/about.md`, `privacy.md`, `terms.md` (haal de regel "DRAFT translation" weg)
  - `functions/api/aanvraag.ts` – Engelse foutmeldingen en bevestigingsmail (zoek op `en ?`)
- Engelse privacy en voorwaarden tonen bovenaan: "This is a translation. In case of differences, the Dutch version prevails." met een link naar de Nederlandse pagina.
- Het formulier stuurt `taal` mee; de function antwoordt in die taal, stuurt de bevestiging in die taal en zet `[EN]` in het onderwerp van de notificatie. De taal wordt in D1 opgeslagen (kolom `taal`).

## Foto's
Zet foto's in `src/assets/photos/` (jpg, jpeg, webp, avif of png; liefst minstens 1600 px breed, liggend). Astro maakt er automatisch webp in meerdere formaten van, met lazy loading en alt-tekst. Ontbreekt een bestand, dan blijft de gradient met icoon staan. **Gebruik alleen eigen foto's of foto's met licentie, geen foto's van hotelwebsites.**

| Bestand (zonder extensie) | Waar |
|---|---|
| `hero` | Achtergrond hero homepage (tekst staat links, dus onderwerp liefst rechts) |
| `feature` | Foto naast "Hoe het werkt" |
| `bestemmingen` | Header van de pagina Bestemmingen |
| `resorts/ikos-porto-petro` | Kaart Ikos Porto Petro |
| `resorts/martinhal-sagres` | Kaart Martinhal Sagres |
| `resorts/hof-van-saksen` | Kaart Hof van Saksen |
| `resorts/ikos-olivia` | Kaart Ikos Olivia |
| `resorts/rixos-premium-belek` | Kaart Rixos Premium Belek |
| `resorts/maxx-royal-belek` | Kaart Maxx Royal Golf Belek |
| `resorts/grande-real-santa-eulalia` | Kaart Grande Real Santa Eulália Resort & Spa |
| `resorts/fairmont-taghazout-bay` | Kaart Fairmont Taghazout Bay |
| `resorts/paradis-plage` | Kaart Paradis Plage Surf Yoga & Spa |

Voorbeeld: `src/assets/photos/resorts/martinhal-sagres.jpg`. Daarna `npm run build` en opnieuw deployen.

## Lokaal
```bash
npm install
npm run dev          # alleen de statische site
npm run build        # bouwt naar dist/
# Site + function + lokale D1:
npx wrangler d1 execute wabokkio --local --file db/schema.sql
cp .dev.vars.example .dev.vars   # vul eigen waarden in, staat in .gitignore
npx wrangler pages dev dist
```

## Deploy naar Cloudflare Pages
1. Zet de repo op GitHub/GitLab (nog niet gedaan) en kies in Cloudflare: *Workers & Pages → Create → Pages → Connect to Git*.
2. Build-instellingen: framework **Astro**, build command `npm run build`, output `dist`, env var `NODE_VERSION=22`.
   (Alternatief zonder Git: `npm run build && npx wrangler pages deploy dist --project-name wabokkio`.)
3. **D1 aanmaken**
   ```bash
   npx wrangler d1 create wabokkio     # zet het database_id in wrangler.toml én worker/wrangler.toml
   npx wrangler d1 execute wabokkio --remote --file db/schema.sql
   # bestaande database van vóór de Engelse versie: eenmalig
   npx wrangler d1 execute wabokkio --remote --file db/migrations-0002-taal.sql
   ```
   Koppel in het Pages-project (*Settings → Bindings*) de D1-database als binding **`DB`** (of laat `wrangler.toml` het doen).
4. **Omgevingsvariabelen** (Pages → Settings → Variables and secrets, voor Production en Preview):
   | Naam | Type | Waarde |
   |---|---|---|
   | `RESEND_API_KEY` | Secret | API-key uit Resend (alleen "sending access", domein send.wabokkio.nl) |
   | `MAIL_FROM` | Variable | `Wabokkio <aanvraag@send.wabokkio.nl>` |
   | `MAIL_TO` | Variable | `travel@wabokkio.nl` |
   | `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key (leeg = check uit) |
   | `PUBLIC_TURNSTILE_SITE_KEY` | Build-variable | Turnstile site key; zonder deze waarde wordt de widget niet getoond |
   Nooit secrets in de code of in git zetten.
5. **Turnstile**: Cloudflare → Turnstile → widget toevoegen voor `wabokkio.nl` (mode *Managed*), keys invullen zoals hierboven, opnieuw deployen.
6. **Custom domain**: Pages → Custom domains → `wabokkio.nl` en `www.wabokkio.nl` (www kan via een Redirect Rule naar de apex).
7. **Opschoon-Worker** (bewaartermijn 12 maanden uit de privacyverklaring). Pages Functions hebben geen cron, daarom een losse Worker:
   ```bash
   cd worker && npx wrangler deploy     # cron: dagelijks 03:00 UTC
   ```
   Hij voert uit: `DELETE FROM aanvragen WHERE created_at < datetime('now','-12 months')`. Logs: `npx wrangler tail wabokkio-aanvragen-cleanup`.

## Formulier en verwerking
- Per kamer aantal volwassenen en kinderen; per kind alleen de leeftijd (geen namen/geboortedata).
- Werkt met JavaScript (fetch → `/bedankt/`) en zonder (gewone POST → 303 naar `/bedankt/`).
- Honeypotveld `website`: bots krijgen "ok" maar er wordt niets opgeslagen of gemaild.
- Na opslaan in D1: notificatie naar `MAIL_TO` (reply-to = klant) en bevestiging naar de familie ("reactie binnen 2 werkdagen"). Mislukt Resend, dan staat de aanvraag wél in D1 en wordt de fout gelogd.
- Aanvragen bekijken: `npx wrangler d1 execute wabokkio --remote --command "SELECT * FROM aanvragen ORDER BY created_at DESC LIMIT 20"`.

## DNS-plan
1. Voeg **wabokkio.nl** en **wabokkio.com** toe aan Cloudflare (Free plan) en laat Cloudflare de bestaande records scannen.
2. Controleer/maak in de zone **wabokkio.nl** deze records vóór de nameserverwissel:
   | Type | Naam | Waarde | Proxy |
   |---|---|---|---|
   | MX | `@` | `mailfilter.hostnet.nl` (prioriteit 10) | n.v.t. |
   | TXT | `@` | `v=spf1 a mx include:_spf.hostnet.nl -all` | n.v.t. |
   | TXT | `_dmarc` | `v=DMARC1; p=reject` | n.v.t. |
   | A | `mail` | `91.184.0.112` | **DNS only** (grijze wolk) |
   - **Verwijder** de wildcard `*.wabokkio.nl`.
   - Let op: de SPF bevat `a`; zodra `@` naar Cloudflare Pages wijst, dekt dat geen Hostnet-mail meer. `mx` en `include:_spf.hostnet.nl` blijven werken, dus dat is in orde.
3. Wijzig bij Hostnet de **nameservers** van beide domeinen naar de twee die Cloudflare opgeeft.
4. **Resend** op subdomein `send.wabokkio.nl`: voeg in Resend het domein `send.wabokkio.nl` toe en neem de getoonde records over in Cloudflare (allemaal DNS only): DKIM (`resend._domainkey.send` TXT), SPF voor het bounce-subdomein (`send.send` MX `feedback-smtp.<regio>.amazonses.com` en TXT `v=spf1 include:amazonses.com ~all`). Gebruik exact de waarden uit het Resend-dashboard. DMARC `p=reject` op het hoofddomein geldt ook voor het subdomein, dus eerst verifiëren in Resend en daarna pas live mailen.
5. **wabokkio.com → wabokkio.nl (301)**: in de zone wabokkio.com een proxied record (bv. `A @ 192.0.2.1` en `CNAME www @`, oranje wolk) plus een **Redirect Rule** (*Rules → Redirect Rules*): alle requests → `https://wabokkio.nl${http.request.uri.path}`, statuscode 301, query string behouden. Daarom staat er geen `_redirects`-bestand in dit project; dat is alleen nodig als je redirects binnen wabokkio.nl wilt.
   Heeft wabokkio.com geen mail? Voeg dan als bescherming toe: `TXT @ "v=spf1 -all"` en `TXT _dmarc "v=DMARC1; p=reject"`.
6. Na de wissel: test mail in/uit via Hostnet, `dig MX wabokkio.nl`, en het formulier op productie.

## Security headers
Zie `public/_headers`. De CSP staat alleen eigen bestanden toe plus `challenges.cloudflare.com` voor Turnstile; fonts (Nunito, Inter) zijn self-hosted via Fontsource, dus geen Google Fonts-verzoeken. Voeg je later analytics of andere scripts toe, pas dan de CSP aan. Zet HSTS `preload` alleen aan als alle subdomeinen HTTPS hebben (mail.wabokkio.nl!); haal `preload` anders weg vóór je het domein bij hstspreload.org indient.
