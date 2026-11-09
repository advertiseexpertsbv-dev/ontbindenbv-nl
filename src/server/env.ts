import { env } from 'cloudflare:workers'

export type AppEnv = Cloudflare.Env & {
  RESEND_API_KEY?: string
  RESEND_FROM?: string
  NOTIFICATIE_EMAIL?: string
  INTAKE_NOTIFICATIE_EMAIL?: string
  /** HubSpot Forms API (portaal en formulieren in lib/site.ts): 'aan' = leads ook server-side naar HubSpot. Alleen als secret. */
  HUBSPOT_FORMS_API?: string
  ZAPIER_WEBHOOK_URL?: string
  /** CRM BBase: volledige webhook-URL inclusief ?secret=… (zelfde als de Gravity Forms-webhooks van de oude site) */
  CRM_WEBHOOK_URL?: string
  /** Wachtrij voor het doorsturen naar BBase (alleen het lead-id), consumer = deze Worker (src/server.ts → server/crm.ts) */
  CRM_QUEUE?: Queue<{ id: number }>
}

export const appEnv = () => env as AppEnv
