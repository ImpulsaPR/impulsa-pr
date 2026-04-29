-- Stripe checkout completion log. El webhook /api/webhooks/stripe inserta
-- aquí cuando llega checkout.session.completed; super-admin completa el
-- onboarding manual desde /admin/clientes usando estos datos.

create table if not exists stripe_purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,            -- idempotency: Stripe reintenta webhooks
  stripe_session_id text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  email text not null,
  customer_name text,
  amount_total_cents integer not null,
  currency text not null default 'usd',
  price_id text,
  product_id text,
  plan_slug text,                                   -- 'starter'|'pro'|'business'|'founder'|'setup'
  billing_interval text,                            -- 'month'|'year'|'one_time'
  mode text not null,                               -- 'subscription'|'payment'
  status text not null default 'pending_onboarding', -- pending_onboarding|onboarded|skipped
  cliente_id uuid references clientes(id) on delete set null,
  raw_event jsonb not null,
  created_at timestamptz not null default now(),
  onboarded_at timestamptz
);

create index if not exists stripe_purchases_email_idx on stripe_purchases (email);
create index if not exists stripe_purchases_status_idx on stripe_purchases (status);
create index if not exists stripe_purchases_created_at_idx on stripe_purchases (created_at desc);

alter table stripe_purchases enable row level security;

-- Solo super-admin puede leer (via service role en /api/admin)
-- No hay policy para anon/authenticated → bloqueado por default con RLS on.
