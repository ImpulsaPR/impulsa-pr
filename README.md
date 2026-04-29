# cliente.impulsapr.com — Dashboard de cliente Impulsa PR

Dashboard SaaS multi-tenant donde los clientes de Impulsa PR ven sus conversaciones del bot Quasar, gestionan leads, configuran su KB, etc. También aloja la consola admin para que Ulises onboardee clientes y revise pagos Stripe.

**Producción**: https://cliente.impulsapr.com (Vercel project `impulsa-pr`).

## Stack

- **Next.js 16** App Router + React 19 + TypeScript 5
- **Tailwind 4** + **Framer Motion** + **dnd-kit** (kanban pipeline)
- **Supabase**: Auth (password + Google OAuth) + Postgres con RLS centralizada via `auth_cliente_id()` + Realtime postgres_changes + pgvector para KB
- **@vercel/analytics** + **@vercel/speed-insights**

## Modelo multi-tenant

```
auth.users.id  ↔  clientes.auth_user_id  ↔  clientes.id (cliente_id)
                                                ↓
                  bots, bot_credentials, leads, whatsapp_historial,
                  knowledge_base, citas, soporte_mensajes, notificaciones,
                  human_takeover, ... (todas con cliente_id FK)
```

Toda tabla con `cliente_id` tiene RLS policies que filtran por `cliente_id = auth_cliente_id()`. Endpoints API internos usan service_role + verifican `auth.getUser()` manualmente para super-admin.

## Páginas (`(dashboard)` route group)

| Ruta | Quién ve | Qué hace |
|---|---|---|
| `/` | Cliente | Home: stats, funnel, hot leads, AI rate, recent activity |
| `/leads` | Cliente | Tabla, filtros, CSV export, create/edit |
| `/pipeline` | Cliente | Kanban dnd con 4 columnas |
| `/conversations` | Cliente | Chat, sidebar contexto, takeover humano (pausa bot 6h) |
| `/knowledge` | Cliente | KB CRUD con pgvector search |
| `/analytics` | Cliente | 20+ widgets, time filters, ExportMenu CSV/PDF |
| `/demo-ia` | Cliente | Quasar embebido para test |
| `/settings` | Cliente | Profile + bot config + Google Calendar OAuth + toggles + theme + i18n |
| `/soporte` | Cliente | Chat con Impulsa support |
| `/admin/clientes` | Super-admin | Lista clientes, onboarding wizard |
| `/admin/ventas` | Super-admin | Compras Stripe pendientes; modal pre-llenado para onboardear |

## API routes

### Cliente
- `POST /api/whatsapp/send` — outbound WhatsApp via YCloud, registra takeover, marca `humano_activo`. Rate-limit 60/min y 500/h.
- `POST /api/calendar/exec` — proxy Google Calendar (create/update/delete/search/get) con HMAC auth + auto-refresh tokens.
- `GET /api/calendar/{status, disconnect}` — gestión OAuth Google
- `GET/POST /api/oauth/google/{start, callback}` — OAuth flow per-cliente
- `POST /api/kb/{search, upsert}` — Knowledge Base con pgvector

### Webhooks externos
- `POST /api/webhooks/stripe` — recibe `checkout.session.completed` de Stripe (verifica firma HMAC-SHA256 timing-safe), expande line_items, inserta en `stripe_purchases` con `status='pending_onboarding'`. Notifica WhatsApp a Ulises (vía YCloud). Idempotency via `stripe_event_id` UNIQUE.

### Admin (gated por `SUPERADMIN_EMAIL`)
- `POST /api/admin/onboard-cliente` — crea auth user (invite email) + cliente + bot atómico via RPC `admin_onboard_cliente`
- `GET /api/admin/list-clientes` — lista clientes con info de bot
- `GET /api/admin/list-nichos` — catálogo `nichos_templates`
- `GET /api/admin/list-stripe-purchases` — compras Stripe filtrables por status
- `POST /api/admin/mark-purchase` — cambia status (pending_onboarding/onboarded/skipped) + liga `cliente_id`

## Realtime

8 hooks subscriben a `postgres_changes`:
- `use-leads.ts` — filtro explícito `cliente_id` + RLS (defensa en profundidad)
- `use-conversations.ts`, `use-soporte.ts`, `use-notifications.ts`, `use-knowledge-base.ts`, `use-onboarding.ts`, `use-bot.ts`, `use-metricas.ts`

## Setup local

```bash
npm install
cp .env.local.example .env.local  # llenar valores
npm run types:gen   # regenera src/lib/database.types.ts desde Supabase schema
npm run dev         # http://localhost:3000
```

### Variables de entorno requeridas

| Cliente (`NEXT_PUBLIC_*`) | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SUPERADMIN_EMAIL` | CSV de emails super-admin |

| Servidor | Para qué |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Bypass RLS desde endpoints admin |
| `SUPERADMIN_EMAIL` | CSV de emails super-admin (server-side) |
| `YCLOUD_API_KEY` | Mandar WhatsApp |
| `NOTIFY_OWNER_PHONE` | Celular E.164 para notif Stripe webhook |
| `YCLOUD_FROM_NUMBER` | (opcional) default `+19399052410` |
| `STRIPE_WEBHOOK_SECRET` | Verificar firma HMAC del webhook |
| `STRIPE_SECRET_KEY` | Expandir line_items del checkout (recomendado: rk_live_* restricted con permisos read solo) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth Google Calendar |
| `OAUTH_STATE_SECRET` | Firma del state en OAuth flow |
| `TOKEN_ENCRYPTION_KEY` | Cifrado de tokens en bot_credentials |
| `CALENDAR_PROXY_TOKEN` | Auth legacy del calendar proxy (n8n) |
| `SUPABASE_ACCESS_TOKEN` | Solo para `npm run types:gen` |

## Scripts útiles

```bash
npm run dev          # dev server
npm run build        # production build
npm run types:gen    # regenera database.types.ts (requiere supabase CLI/access token)
npm run report:pdf   # genera PDF de reporte (puppeteer)
npm run lint         # ESLint
```

## Migrations Supabase

En `supabase/migrations/`. Aplicar via Supabase CLI (`supabase db push`) o via Management API. Lista actual:

| Archivo | Qué hace |
|---|---|
| `20260414_fix_leads_estado_check.sql` | Fix constraint estado en leads |
| `20260417_metricas_dashboard_v3.sql` | RPCs `get_metricas_resumen`, `get_embudo_conversion`, `get_rendimiento_bot` + vistas |
| `20260418_soporte_mensajes.sql` | Tabla soporte_mensajes |
| `20260422_invites.sql` | RPCs `validate_invite`, `consume_invite` |
| `20260425_admin_onboard.sql` | RPC `admin_onboard_cliente` |
| `20260425_rate_limit.sql` | RPC `rate_limit` |
| `20260425_rls_policies_complete.sql` | RLS policies centralizadas con helper `auth_cliente_id()` |
| `20260425_stripe_purchases.sql` | Tabla `stripe_purchases` para webhook checkout |
| `20260426_realtime_replica_identity.sql` | `replica identity full` para postgres_changes |
| `20260426_v_citas_por_dia.sql` | Vista para analytics |
| `20260429_leads_nombre_negocio.sql` | Columna nombre_negocio (bot la extraía pero no se persistía) |
| `20260429_clientes_settings.sql` | Columna settings jsonb (toggles + timezone, antes solo localStorage) |

## Onboarding de un cliente nuevo (flujo)

1. Cliente paga en Stripe payment link (con phone_collection)
2. Stripe webhook → `/api/webhooks/stripe` → INSERT en `stripe_purchases` (status pending_onboarding)
3. Webhook manda WhatsApp a Ulises con detalles + link a `/admin/ventas`
4. Ulises entra → click "Onboardear ahora" → modal pre-llenado con email/nombre/plan
5. Llena: empresa, nicho, número WhatsApp business, número dueño
6. Click → `admin_onboard_cliente` RPC crea cliente + bot atómicamente; `mark-purchase` marca onboarded + liga cliente_id
7. Cliente recibe email invite → crea password → entra al dashboard

## Headers de seguridad

Configurados en `next.config.ts`: HSTS preload, X-Frame-Options DENY, CSP estricta (whitelist Vercel + Supabase), Permissions-Policy bloqueando camera/mic/geo, `metadata.robots = { index: false, follow: false }` (no se indexa).

## Deploy

Auto-deploy desde `master` via Vercel. Para deploy manual: `vercel --prod`.

Repo: https://github.com/ImpulsaPR/impulsa-pr (privado).
