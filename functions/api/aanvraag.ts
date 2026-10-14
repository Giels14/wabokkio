/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Pages Function: POST /api/aanvraag
 * - valideert de aanvraag (incl. honeypot en optioneel Turnstile)
 * - slaat op in D1 (binding DB)
 * - stuurt notificatie naar Wabokkio en bevestiging naar de familie via Resend
 * Secrets/vars (nooit hardcoden): RESEND_API_KEY, MAIL_FROM, MAIL_TO, TURNSTILE_SECRET_KEY
 */
interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  MAIL_FROM: string; // bv. "Wabokkio <aanvraag@send.wabokkio.nl>"
  MAIL_TO?: string; // standaard travel@wabokkio.nl
  TURNSTILE_SECRET_KEY?: string; // leeg = Turnstile-check uit
}

type Room = { adults: number; childAges: number[] };
type Enquiry = {
  destination: string; arrival: string; departure: string; rooms: Room[];
  name: string; email: string; phone: string; message: string;
};

const MAX_ROOMS = 4, MAX_ADULTS = 4, MAX_KIDS = 4;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const str = (v: File | string | null, max: number) =>
  (typeof v === 'string' ? v : '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const int = (v: File | string | null) => (typeof v === 'string' && /^\d{1,2}$/.test(v) ? parseInt(v, 10) : NaN);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function parse(fd: FormData, en: boolean): { data?: Enquiry; error?: string } {
  const destination = str(fd.get('bestemming'), 200);
  const arrival = str(fd.get('aankomst'), 10);
  const departure = str(fd.get('vertrek'), 10);
  const name = str(fd.get('naam'), 120);
  const email = str(fd.get('email'), 200).toLowerCase();
  const phone = str(fd.get('telefoon'), 40);
  const message = str(fd.get('bericht'), 3000);

  if (!destination) return { error: (en ? 'Please enter a destination or resort.' : 'Vul een bestemming of resort in.') };
  if (!DATE_RE.test(arrival) || !DATE_RE.test(departure) || isNaN(Date.parse(arrival)) || isNaN(Date.parse(departure)))
    return { error: (en ? 'Please enter valid arrival and departure dates.' : 'Vul geldige aankomst- en vertrekdata in.') };
  const today = new Date().toISOString().slice(0, 10);
  if (arrival < today) return { error: (en ? 'The arrival date is in the past.' : 'De aankomstdatum ligt in het verleden.') };
  if (departure <= arrival) return { error: (en ? 'The departure date must be after the arrival date.' : 'De vertrekdatum moet na de aankomstdatum liggen.') };
  if (!name) return { error: (en ? 'Please enter your name.' : 'Vul je naam in.') };
  if (!EMAIL_RE.test(email)) return { error: (en ? 'Please enter a valid email address.' : 'Vul een geldig e-mailadres in.') };
  if (phone && !/^[+()\d\s-]{6,40}$/.test(phone)) return { error: (en ? 'The phone number does not look right.' : 'Het telefoonnummer lijkt niet te kloppen.') };

  const roomCount = int(fd.get('kamers'));
  if (!(roomCount >= 1 && roomCount <= MAX_ROOMS)) return { error: (en ? 'Invalid number of rooms.' : 'Ongeldig aantal kamers.') };
  const rooms: Room[] = [];
  for (let r = 1; r <= roomCount; r++) {
    const adults = int(fd.get(`kamer-${r}-volwassenen`));
    const kids = int(fd.get(`kamer-${r}-kinderen`));
    if (!(adults >= 1 && adults <= MAX_ADULTS)) return { error: (en ? `Invalid number of adults in room ${r}.` : `Ongeldig aantal volwassenen in kamer ${r}.`) };
    if (!(kids >= 0 && kids <= MAX_KIDS)) return { error: (en ? `Invalid number of children in room ${r}.` : `Ongeldig aantal kinderen in kamer ${r}.`) };
    const childAges: number[] = [];
    for (let c = 1; c <= kids; c++) {
      const age = int(fd.get(`kamer-${r}-kind-${c}-leeftijd`));
      if (!(age >= 0 && age <= 17)) return { error: (en ? `Please enter the age of child ${c} in room ${r}.` : `Vul de leeftijd van kind ${c} in kamer ${r} in.`) };
      childAges.push(age);
    }
    rooms.push({ adults, childAges });
  }
  return { data: { destination, arrival, departure, rooms, name, email, phone, message } };
}

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  const body = new FormData();
  body.append('secret', secret); body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const j = (await r.json()) as { success?: boolean };
  return !!j.success;
}

async function sendMail(env: Env, payload: Record<string, unknown>) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) { console.warn('RESEND_API_KEY/MAIL_FROM ontbreekt: mail overgeslagen'); return; }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, ...payload }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

const nlDate = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });
const enDate = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });
const roomsTextEn = (rooms: Room[]) => rooms.map((r, i) =>
  `Room ${i + 1}: ${r.adults} adult${r.adults > 1 ? 's' : ''}` +
  (r.childAges.length ? `, ${r.childAges.length} child${r.childAges.length > 1 ? 'ren' : ''} (age ${r.childAges.join(', ')})` : '')).join('\n');
const roomsText = (rooms: Room[]) => rooms.map((r, i) =>
  `Kamer ${i + 1}: ${r.adults} volwassene${r.adults > 1 ? 'n' : ''}` +
  (r.childAges.length ? `, ${r.childAges.length} kind${r.childAges.length > 1 ? 'eren' : ''} (leeftijd ${r.childAges.join(', ')})` : '')).join('\n');

function respond(req: Request, status: number, body: { ok: boolean; error?: string }, lang: 'nl' | 'en' = 'nl') {
  const wantsJson = (req.headers.get('Accept') || '').includes('application/json');
  if (wantsJson) return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  if (body.ok) return Response.redirect(new URL(lang === 'en' ? '/en/thank-you/' : '/bedankt/', req.url).toString(), 303);
  return new Response(`<!doctype html><meta charset="utf-8"><title>${lang === 'en' ? 'Error' : 'Fout'}</title><p>${esc(body.error || (lang === 'en' ? 'Something went wrong.' : 'Er ging iets mis.'))}</p><p><a href="${lang === 'en' ? '/en/' : '/'}#aanvraag">${lang === 'en' ? 'Back' : 'Terug'}</a></p>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Taal: eerst uit het formulierveld 'taal', tot die gelezen is uit de Referer (/en/...)
  let en = /\/en(\/|$)/.test(new URL(request.headers.get('Referer') || 'https://x/').pathname);
  let lang: 'nl' | 'en' = en ? 'en' : 'nl';
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.includes('multipart/form-data') && !ct.includes('application/x-www-form-urlencoded'))
    return respond(request, 415, { ok: false, error: (en ? 'Invalid request.' : 'Ongeldig verzoek.') }, lang);
  if (Number(request.headers.get('Content-Length') || 0) > 50_000)
    return respond(request, 413, { ok: false, error: (en ? 'Request is too large.' : 'Aanvraag is te groot.') }, lang);

  let fd: FormData;
  try { fd = await request.formData(); } catch { return respond(request, 400, { ok: false, error: (en ? 'Invalid request.' : 'Ongeldig verzoek.') }, lang); }

  const taalVeld = str(fd.get('taal'), 2);
  if (taalVeld) en = taalVeld === 'en';
  lang = en ? 'en' : 'nl';

  // Honeypot: doe alsof het gelukt is, maar sla niets op
  if (str(fd.get('website'), 200)) return respond(request, 200, { ok: true }, lang);

  if (env.TURNSTILE_SECRET_KEY) {
    const token = str(fd.get('cf-turnstile-response'), 2048);
    const ok = token && (await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP')).catch(() => false));
    if (!ok) return respond(request, 400, { ok: false, error: (en ? 'The security check failed. Please try again.' : 'De beveiligingscheck is mislukt. Probeer het opnieuw.') }, lang);
  }

  const { data, error } = parse(fd, en);
  if (!data) return respond(request, 422, { ok: false, error }, lang);

  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      `INSERT INTO aanvragen (id, created_at, naam, email, telefoon, bestemming, aankomst, vertrek, kamers_json, bericht, taal)
       VALUES (?1, datetime('now'), ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
    ).bind(id, data.name, data.email, data.phone || null, data.destination, data.arrival, data.departure, JSON.stringify(data.rooms), data.message || null, lang).run();
  } catch (e) {
    console.error('D1 insert failed', e);
    return respond(request, 500, { ok: false, error: (en ? 'Saving failed. Please try again later or email travel@wabokkio.nl.' : 'Opslaan is mislukt. Probeer het later opnieuw of mail naar travel@wabokkio.nl.') }, lang);
  }

  const to = env.MAIL_TO || 'travel@wabokkio.nl';
  const summaryNl = `Bestemming: ${data.destination}\nAankomst: ${nlDate(data.arrival)}\nVertrek: ${nlDate(data.departure)}\n${roomsText(data.rooms)}`;
  const summaryEn = `Destination: ${data.destination}\nArrival: ${enDate(data.arrival)}\nDeparture: ${enDate(data.departure)}\n${roomsTextEn(data.rooms)}`;
  const summary = summaryNl;
  const ref = id.slice(0, 8).toUpperCase();

  try {
    await sendMail(env, {
      to: [to], reply_to: data.email,
      subject: `Nieuwe aanvraag ${ref}: ${data.destination} (${data.name})${en ? ' [EN]' : ''}`,
      text: `Nieuwe aanvraag via wabokkio.nl (ref ${ref})\nTaal: ${en ? 'Engels' : 'Nederlands'}\n\nNaam: ${data.name}\nE-mail: ${data.email}\nTelefoon: ${data.phone || '-'}\n\n${summary}\n\nBericht:\n${data.message || '-'}\n`,
    });
  } catch (e) {
    // Aanvraag staat in D1; niet blokkeren voor de klant, wel loggen
    console.error('Notificatie mislukt', e);
  }

  try {
    await sendMail(env, en ? {
      to: [data.email], reply_to: to,
      subject: 'We have received your request – Wabokkio',
      text: `Hi ${data.name},\n\nThank you for your request! You will hear from us within 2 working days with a personal proposal.\n\nYour request (ref ${ref}):\n${summaryEn}\n\nWould you like to add anything? Just reply to this email.\n\nKind regards,\nGiels and Marjanne\nWabokkio · travel@wabokkio.nl · +31 6 43779858\n`,
      html: `<p>Hi ${esc(data.name)},</p><p>Thank you for your request! You will hear from us <strong>within 2 working days</strong> with a personal proposal.</p><p><strong>Your request (ref ${ref}):</strong><br>${esc(summaryEn).replace(/\n/g, '<br>')}</p><p>Would you like to add anything? Just reply to this email.</p><p>Kind regards,<br>Giels and Marjanne<br>Wabokkio · <a href="mailto:travel@wabokkio.nl">travel@wabokkio.nl</a> · +31 6 43779858</p>`,
    } : {
      to: [data.email], reply_to: to,
      subject: 'We hebben je aanvraag ontvangen – Wabokkio',
      text: `Hoi ${data.name},\n\nBedankt voor je aanvraag! Binnen 2 werkdagen krijg je een reactie van ons met een persoonlijk voorstel.\n\nJe aanvraag (ref ${ref}):\n${summaryNl}\n\nWil je nog iets aanvullen? Beantwoord dan gewoon deze e-mail.\n\nHartelijke groet,\nGiels en Marjanne\nWabokkio · travel@wabokkio.nl · +31 6 43779858\n`,
      html: `<p>Hoi ${esc(data.name)},</p><p>Bedankt voor je aanvraag! <strong>Binnen 2 werkdagen</strong> krijg je een reactie van ons met een persoonlijk voorstel.</p><p><strong>Je aanvraag (ref ${ref}):</strong><br>${esc(summaryNl).replace(/\n/g, '<br>')}</p><p>Wil je nog iets aanvullen? Beantwoord dan gewoon deze e-mail.</p><p>Hartelijke groet,<br>Giels en Marjanne<br>Wabokkio · <a href="mailto:travel@wabokkio.nl">travel@wabokkio.nl</a> · +31 6 43779858</p>`,
    });
  } catch (e) {
    console.error('Bevestiging mislukt', e);
  }

  return respond(request, 200, { ok: true }, lang);
};

export const onRequest: PagesFunction<Env> = async () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
