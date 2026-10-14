/// <reference types="@cloudflare/workers-types" />
// Kleine Worker met cron trigger: verwijdert aanvragen ouder dan 12 maanden (zie privacyverklaring).
interface Env { DB: D1Database }
export default {
  async scheduled(_c: ScheduledController, env: Env) {
    const res = await env.DB.prepare(`DELETE FROM aanvragen WHERE created_at < datetime('now', '-12 months')`).run();
    console.log(`Opschonen: ${res.meta.changes ?? 0} aanvragen verwijderd`);
  },
} satisfies ExportedHandler<Env>;
