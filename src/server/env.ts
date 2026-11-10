import { env } from 'cloudflare:workers'

export type AppEnv = Cloudflare.Env & {
  RESEND_API_KEY?: string
  RESEND_FROM?: string
  NOTIFICATIE_EMAIL?: string
  INTAKE_NOTIFICATIE_EMAIL?: string
  /** HubSpot Forms API (portaal en formulieren in lib/site.ts): 'aan' = leads ook server-side naar HubSpot. Alleen als secret. */
  HUBSPOT_FORMS_API?: string
  ZAPIER_WEBHOOK_URL?: string
  /** CRM BBase: hook van ontbindenbv.nl (var in wrangler.jsonc) */
  CRM_WEBHOOK_URL?: string
  /** CRM BBase: geheim voor de header x-obv-secret (alleen als secret, `wrangler secret put CRM_WEBHOOK_SECRET`) */
  CRM_WEBHOOK_SECRET?: string
  /** Wachtrij voor het doorsturen naar BBase (alleen het lead-id), consumer = deze Worker (src/server.ts → server/crm.ts) */
  CRM_QUEUE?: Queue<{ id: number }>
}

export const appEnv = () => env as AppEnv
