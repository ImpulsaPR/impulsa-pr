-- =====================================================================
-- RLS POLICIES — Source of truth multi-tenant
-- =====================================================================
-- Cada tabla con `cliente_id` debe filtrar SELECT/UPDATE/DELETE por
-- `auth_cliente_id()` y validar INSERT con `WITH CHECK (cliente_id = ...)`
-- para impedir que un cliente inserte data con cliente_id ajeno.
--
-- service_role bypasea RLS automáticamente — los API endpoints que
-- necesitan cross-tenant logic (admin, n8n proxies) usan service_role.
-- =====================================================================

-- ----------------------------------
-- Helper: auth_cliente_id()
-- ----------------------------------
create or replace function auth_cliente_id() returns uuid
language sql stable security definer as $$
  select id from clientes where auth_user_id = auth.uid() limit 1
$$;

-- =====================================================================
-- clientes
-- =====================================================================
alter table clientes enable row level security;

drop policy if exists "select_self_cliente" on clientes;
drop policy if exists "update_self_cliente" on clientes;

create policy "select_self_cliente" on clientes
  for select using (auth_user_id = auth.uid());

create policy "update_self_cliente" on clientes
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- INSERT/DELETE solo via service_role (admin onboarding)

-- =====================================================================
-- bots
-- =====================================================================
alter table bots enable row level security;

drop policy if exists "select_own_cliente_data" on bots;
drop policy if exists "update_own_bots" on bots;
drop policy if exists "select_own_bots" on bots;

create policy "select_own_bots" on bots
  for select using (cliente_id = auth_cliente_id());

create policy "update_own_bots" on bots
  for update using (cliente_id = auth_cliente_id())
  with check (cliente_id = auth_cliente_id());

-- INSERT/DELETE solo via service_role (admin onboarding)

-- =====================================================================
-- bot_credentials
-- =====================================================================
alter table bot_credentials enable row level security;

drop policy if exists "select_own_creds" on bot_credentials;
drop policy if exists "delete_own_creds" on bot_credentials;

create policy "select_own_creds" on bot_credentials
  for select using (cliente_id = auth_cliente_id());

create policy "delete_own_creds" on bot_credentials
  for delete using (cliente_id = auth_cliente_id());

-- INSERT/UPDATE solo via service_role (OAuth callback)

-- =====================================================================
-- leads
-- =====================================================================
alter table leads enable row level security;

drop policy if exists "select_own_cliente_data" on leads;
drop policy if exists "update_own_leads" on leads;
drop policy if exists "select_own_leads" on leads;
drop policy if exists "insert_own_leads" on leads;
drop policy if exists "delete_own_leads" on leads;

create policy "select_own_leads" on leads
  for select using (cliente_id = auth_cliente_id());

create policy "insert_own_leads" on leads
  for insert with check (cliente_id = auth_cliente_id());

create policy "update_own_leads" on leads
  for update using (cliente_id = auth_cliente_id())
  with check (cliente_id = auth_cliente_id());

create policy "delete_own_leads" on leads
  for delete using (cliente_id = auth_cliente_id());

-- =====================================================================
-- whatsapp_historial
-- =====================================================================
alter table whatsapp_historial enable row level security;

drop policy if exists "select_own_cliente_data" on whatsapp_historial;
drop policy if exists "select_own_historial" on whatsapp_historial;

create policy "select_own_historial" on whatsapp_historial
  for select using (cliente_id = auth_cliente_id());

-- INSERT solo via service_role (n8n + /api/whatsapp/send).
-- Cliente NO puede insertar/borrar historial directamente.

-- =====================================================================
-- citas
-- =====================================================================
alter table citas enable row level security;

drop policy if exists "select_own_cliente_data" on citas;
drop policy if exists "update_own_citas" on citas;
drop policy if exists "select_own_citas" on citas;
drop policy if exists "insert_own_citas" on citas;
drop policy if exists "delete_own_citas" on citas;

create policy "select_own_citas" on citas
  for select using (cliente_id = auth_cliente_id());

create policy "update_own_citas" on citas
  for update using (cliente_id = auth_cliente_id())
  with check (cliente_id = auth_cliente_id());

create policy "delete_own_citas" on citas
  for delete using (cliente_id = auth_cliente_id());

-- INSERT solo via service_role (n8n agenda)

-- =====================================================================
-- contactos_bot
-- =====================================================================
alter table contactos_bot enable row level security;

drop policy if exists "select_own_cliente_data" on contactos_bot;
drop policy if exists "select_own_contactos" on contactos_bot;

create policy "select_own_contactos" on contactos_bot
  for select using (cliente_id = auth_cliente_id());

-- INSERT/UPDATE/DELETE solo via service_role (n8n)

-- =====================================================================
-- human_takeover
-- =====================================================================
alter table human_takeover enable row level security;

drop policy if exists "select_own_cliente_data" on human_takeover;
drop policy if exists "select_own_takeover" on human_takeover;
drop policy if exists "delete_own_takeover" on human_takeover;

create policy "select_own_takeover" on human_takeover
  for select using (cliente_id = auth_cliente_id());

create policy "delete_own_takeover" on human_takeover
  for delete using (cliente_id = auth_cliente_id());

-- INSERT/UPDATE solo via service_role

-- =====================================================================
-- eventos
-- =====================================================================
alter table eventos enable row level security;

drop policy if exists "select_own_cliente_data" on eventos;
drop policy if exists "select_own_eventos" on eventos;

create policy "select_own_eventos" on eventos
  for select using (cliente_id = auth_cliente_id());

-- INSERT solo via service_role

-- =====================================================================
-- knowledge_base
-- =====================================================================
alter table knowledge_base enable row level security;

drop policy if exists "select_own_kb" on knowledge_base;
drop policy if exists "insert_own_kb" on knowledge_base;
drop policy if exists "update_own_kb" on knowledge_base;
drop policy if exists "delete_own_kb" on knowledge_base;

create policy "select_own_kb" on knowledge_base
  for select using (cliente_id = auth_cliente_id());

create policy "insert_own_kb" on knowledge_base
  for insert with check (cliente_id = auth_cliente_id());

create policy "update_own_kb" on knowledge_base
  for update using (cliente_id = auth_cliente_id())
  with check (cliente_id = auth_cliente_id());

create policy "delete_own_kb" on knowledge_base
  for delete using (cliente_id = auth_cliente_id());

-- =====================================================================
-- soporte_mensajes (chat interno cliente↔Ulises)
-- =====================================================================
alter table soporte_mensajes enable row level security;

drop policy if exists "select_own_soporte" on soporte_mensajes;
drop policy if exists "insert_own_soporte" on soporte_mensajes;
drop policy if exists "update_own_soporte" on soporte_mensajes;

create policy "select_own_soporte" on soporte_mensajes
  for select using (cliente_id = auth_cliente_id());

create policy "insert_own_soporte" on soporte_mensajes
  for insert with check (
    cliente_id = auth_cliente_id() and autor = 'cliente'
  );

create policy "update_own_soporte" on soporte_mensajes
  for update using (cliente_id = auth_cliente_id())
  with check (cliente_id = auth_cliente_id());

-- =====================================================================
-- bot_sent_messages (sin cliente_id, solo service_role)
-- =====================================================================
alter table bot_sent_messages enable row level security;

drop policy if exists "service_only" on bot_sent_messages;
-- No policies → bloqueado para anon/authenticated, service_role bypasa

-- =====================================================================
-- rate_limit_buckets (solo service_role)
-- =====================================================================
alter table rate_limit_buckets enable row level security;
-- Sin policies por diseño

-- =====================================================================
-- Verificación final
-- =====================================================================
-- Ejecutar después de aplicar:
--   select schemaname, tablename, policyname, cmd, qual, with_check
--   from pg_policies where schemaname = 'public'
--   order by tablename, policyname;
