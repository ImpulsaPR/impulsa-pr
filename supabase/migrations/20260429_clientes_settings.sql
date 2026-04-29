-- Persistir toggles de notificación, automation y timezone del cliente en DB
-- en vez de localStorage. Resuelve el bug de que los toggles se reseteaban al
-- cambiar de browser. Schema flexible (jsonb) para no migrar cada nueva
-- preferencia.

alter table clientes add column if not exists settings jsonb not null default '{}'::jsonb;

-- RLS: el cliente puede leer/escribir su propio settings (no afecta otras
-- columnas). Las policies existentes ya filtran por auth_cliente_id().
