# Wabokkio website (fase 1)

Statische Astro-site voor **wabokkio.nl**, gehost op **Cloudflare Pages**, met één Pages Function (`functions/api/aanvraag.ts`) voor het aanvraagformulier.

Wabokkio B.V. · KvK 58114262 · Groot Emiclaer 157, 3822 TL Amersfoort · IATA TIDS 96223061 · travel@wabokkio.nl

## Structuur
| Pad | Inhoud |
|---|---|
| `src/pages/` | Home, Bestemmingen, Over ons, Privacyverklaring, Algemene voorwaarden, Bedankt, 404 |
| `src/content/*.md` | Teksten (over ons, privacy, voorwaarden) |
| `src/data/site.ts` | Bedrijfsgegevens en resortkaarten (volgorde = volgorde op site) |
| `src/config.ts` | `SHOW_PARTNERS` (standaard `false`): strook "Onze partners" (Ratehawk, Expedia TAAP, alleen tekst) boven de footer op home |
| `public/wabokkio-logo-*.svg`, `favicon*` | Merkbestanden uit `/workspace/wabokkio/brand/`: `header` (header), `header-white` (donkere footer; er is geen witte stacked-versie), `stacked` (Nederlandse slogan, voor lichte achtergrond, mail en print; staat klaar maar wordt op de site nog niet gebruikt). In de logo's is de `<text>` omgezet naar paden met `scripts/svg-text-to-paths.py` (Nunito 800 / Inter 400), zodat ze als `<img>` overal gelijk renderen. Bij een nieuw logo opnieuw draaien. |
| `src/styles/tokens.css` | Merktokens (kleuren, fonts, radius) |
| `public/js/form.js` | Formulierlogica (kamers, leeftijden kinderen, prefill vanuit "Vraag prijs aan") |
| `public/_headers` | Security headers (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors 'none') |
| `functions/api/aanvraag.ts` | Validatie, honeypot, Turnstile, opslag in D1, mails via Resend |
| `db/schema.sql` | D1-schema |
| `worker/` | Cron-Worker die aanvragen ouder dan 12 maanden verwijdert |

Er staan nergens prijzen op de site: alles is "op aanvraag" / "Vraag prijs aan". Er is (nog) geen Ratehawk-API-koppeling.

## Lokaal
```bash
npm install
npm run dev          # alleen de statische site
npm run build        # bouwt naar dist/
# Site + function + lokale D1:
npx wrangler d1 execute wabokkio-aanvragen --local --file db/schema.sql
cp .dev.vars.example .dev.vars   # vul eigen waarden in, staat in .gitignore
npx wrangler pages dev dist
```

## Deploy naar Cloudflare Pages
1. Zet de repo op GitHub/GitLab (nog niet gedaan) en kies in Cloudflare: *Workers & Pages → Create → Pages → Connect to Git*.
2. Build-instellingen: framework **Astro**, build command `npm run build`, output `dist`, env var `NODE_VERSION=22`.
   (Alternatief zonder Git: `npm run build && npx wrangler pages deploy dist --project-name wabokkio-site`.)
3. **D1 aanmaken**
   ```bash
   npx wrangler d1 create wabokkio-aanvragen     # zet het database_id in wrangler.toml én worker/wrangler.toml
   npx wrangler d1 execute wabokkio-aanvragen --remote --file db/schema.sql
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
- Aanvragen bekijken: `npx wrangler d1 execute wabokkio-aanvragen --remote --command "SELECT * FROM aanvragen ORDER BY created_at DESC LIMIT 20"`.

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
