-- Atomic admin onboarding: insert clientes + insert bots in single
-- Postgres transaction. Used by /api/admin/onboard-cliente.

create or replace function admin_onboard_cliente(
  p_auth_user_id uuid,
  p_email text,
  p_nombre text,
  p_empresa text,
  p_nicho text,
  p_numero_whatsapp_bot text,
  p_numero_dueno text,
  p_email_dueno text,
  p_nombre_agente text,
  p_webhook_path text
) returns table (cliente_id uuid, bot_id uuid)
language plpgsql volatile security definer as $$
declare
  v_cliente_id uuid;
  v_bot_id uuid;
begin
  insert into clientes (auth_user_id, email, nombre, empresa)
  values (p_auth_user_id, p_email, p_nombre, p_empresa)
  returning id into v_cliente_id;

  insert into bots (
    cliente_id, webhook_path, numero_whatsapp_bot, numero_dueno,
    email_dueno, nicho, nombre_agente, empresa_nombre,
    horario_inicio, horario_fin, zona_horaria,
    mensaje_bienvenida, mensaje_fuera_horario,
    servicios_json, activo, telefono, instancia_evolution
  ) values (
    v_cliente_id, p_webhook_path, p_numero_whatsapp_bot, p_numero_dueno,
    p_email_dueno, p_nicho, coalesce(p_nombre_agente, 'Asistente'), p_empresa,
    '09:00', '18:00', 'America/Puerto_Rico',
    'Hola! Gracias por escribirnos. Te respondo en un momento.',
    'Hola! En este momento estamos fuera de horario. Te respondemos pronto.',
    '[]'::jsonb, true,
    p_numero_whatsapp_bot, p_webhook_path
  )
  returning id into v_bot_id;

  return query select v_cliente_id, v_bot_id;
exception
  when others then
    raise;
end;
$$;
