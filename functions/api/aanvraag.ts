/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Pages Function: POST /api/aanvraag
 * Valideert de aanvraag (honeypot, Turnstile, velden), slaat op in D1 en mailt Wabokkio via Resend.
 * Geen automatische mail naar de klant.
 * Secrets/vars (nooit hardcoden): RESEND_API_KEY, MAIL_FROM, MAIL_TO, TURNSTILE_SECRET_KEY
 */
import { clean, notificationText, parseEnquiry } from '../lib/validate.ts';

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  MAIL_FROM: string; // bv. "Wabokkio <travel@wabokkio.nl>"
  MAIL_TO?: string; // standaard travel@wabokkio.nl
  TURNSTILE_SECRET_KEY?: string; // leeg = Turnstile-check uit
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const j = (await r.json()) as { success?: boolean };
  return !!j.success;
}

async function sendMail(env: Env, payload: Record<string, unknown>) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
    console.warn('RESEND_API_KEY/MAIL_FROM ontbreekt: mail overgeslagen');
    return;
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, ...payload }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

function respond(req: Request, status: number, body: { ok: boolean; error?: string }, lang: 'nl' | 'en' = 'nl') {
  const wantsJson = (req.headers.get('Accept') || '').includes('application/json');
  if (wantsJson) return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const back = lang === 'en' ? '/en/request/' : '/aanvraag/';
  if (body.ok) return Response.redirect(new URL(lang === 'en' ? '/en/thank-you/' : '/bedankt/', req.url).toString(), 303);
  return new Response(`<!doctype html><meta charset="utf-8"><title>${lang === 'en' ? 'Error' : 'Fout'}</title><p>${esc(body.error || (lang === 'en' ? 'Something went wrong.' : 'Er ging iets mis.'))}</p><p><a href="${back}">${lang === 'en' ? 'Back' : 'Terug'}</a></p>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let en = /\/en(\/|$)/.test(new URL(request.headers.get('Referer') || 'https://x/').pathname);
  let lang: 'nl' | 'en' = en ? 'en' : 'nl';
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.includes('multipart/form-data') && !ct.includes('application/x-www-form-urlencoded'))
    return respond(request, 415, { ok: false, error: en ? 'Invalid request.' : 'Ongeldig verzoek.' }, lang);
  if (Number(request.headers.get('Content-Length') || 0) > 50_000)
    return respond(request, 413, { ok: false, error: en ? 'Request is too large.' : 'Aanvraag is te groot.' }, lang);

  let fd: FormData;
  try { fd = await request.formData(); } catch { return respond(request, 400, { ok: false, error: en ? 'Invalid request.' : 'Ongeldig verzoek.' }, lang); }

  const taalVeld = clean(fd.get('taal'), 2);
  if (taalVeld) en = taalVeld === 'en';
  lang = en ? 'en' : 'nl';

  // Honeypot: doe alsof het gelukt is, maar sla niets op en mail niets.
  if (clean(fd.get('website'), 200)) return respond(request, 200, { ok: true }, lang);

  if (env.TURNSTILE_SECRET_KEY) {
    const token = clean(fd.get('cf-turnstile-response'), 2048);
    const ok = token && (await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP')).catch(() => false));
    if (!ok) return respond(request, 400, { ok: false, error: en ? 'The security check failed. Please try again.' : 'De beveiligingscheck is mislukt. Probeer het opnieuw.' }, lang);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = parseEnquiry(fd, en, today);
  if (!data) return respond(request, 422, { ok: false, error }, lang);

  const id = crypto.randomUUID();
  const roomsJson = JSON.stringify([{ adults: data.adults, childAges: data.childAges }]);
  const base = [id, data.name, data.email, data.phone || null, data.destination, data.arrival, data.departure, roomsJson, data.message || null, lang] as const;
  try {
    try {
      await env.DB.prepare(
        `INSERT INTO aanvragen (id, created_at, naam, email, telefoon, bestemming, aankomst, vertrek, kamers_json, bericht, taal, budget)
         VALUES (?1, datetime('now'), ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
      ).bind(...base, data.budget || null).run();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!/budget/i.test(msg)) throw e;
      await env.DB.prepare(
        `INSERT INTO aanvragen (id, created_at, naam, email, telefoon, bestemming, aankomst, vertrek, kamers_json, bericht, taal)
         VALUES (?1, datetime('now'), ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
      ).bind(...base).run();
    }
  } catch (e) {
    console.error('D1 insert failed', e);
    return respond(request, 500, { ok: false, error: en ? 'Saving failed. Please try again later or email travel@wabokkio.nl.' : 'Opslaan is mislukt. Probeer het later opnieuw of mail naar travel@wabokkio.nl.' }, lang);
  }

  const to = env.MAIL_TO || 'travel@wabokkio.nl';
  const ref = id.slice(0, 8).toUpperCase();
  try {
    await sendMail(env, {
      to: [to],
      reply_to: data.email,
      subject: `Nieuwe aanvraag ${ref}: ${data.destination} (${data.name})${en ? ' [EN]' : ''}`,
      text: notificationText(data, ref, lang),
    });
  } catch (e) {
    // Aanvraag staat in D1. De klant krijgt geen fout als alleen de mail mislukt.
    console.error('Notificatie mislukt', e);
  }

  return respond(request, 200, { ok: true }, lang);
};

export const onRequest: PagesFunction<Env> = async () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
