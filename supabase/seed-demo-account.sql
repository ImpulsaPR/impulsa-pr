-- ============================================================
-- SEED: Cuenta demo completa (auth + cliente + datos falsos)
-- ============================================================
-- USO:
--   Supabase Dashboard -> SQL Editor -> pega este archivo -> Run
--   Es 100% idempotente: crea el usuario si no existe, o refresca datos.
--
-- Credenciales de la cuenta demo:
--   email:    demo@impulsapr.com
--   password: DemoImpulsa2026!
-- ============================================================

-- pgcrypto es necesario para crypt() / gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  DEMO_EMAIL    TEXT := 'demo@impulsapr.com';
  DEMO_PASSWORD TEXT := 'DemoImpulsa2026!';
  DEMO_NOMBRE   TEXT := 'Demo Business';

  v_user_id    UUID;
  v_cliente_id UUID;
  v_lead_id    UUID;
  v_telefono   TEXT;
  v_nombre     TEXT;
  v_nicho      TEXT;
  v_interes    TEXT;
  v_estado     TEXT;
  v_fecha      TIMESTAMP;
  v_fecha_cita TIMESTAMP;
  v_es_viable  BOOLEAN;
  i            INT;
  j            INT;
  nichos  TEXT[] := ARRAY['restaurante','barbería','gym','spa','dental','abogado','real_estate','e-commerce','agencia','clínica'];
  nombres TEXT[] := ARRAY['Carlos Rivera','María Santos','José Martínez','Ana Rodríguez','Luis Fernández','Carmen Vega','Miguel Torres','Sofía Morales','Roberto Díaz','Laura Pérez','Pedro Ramos','Isabel Cruz','Javier Ortiz','Patricia López','Fernando Silva','Gabriela Ruiz','Andrés Mendoza','Elena Castillo','Raúl Navarro','Daniela Herrera'];
  ciudades TEXT[] := ARRAY['San Juan, PR','Bayamón, PR','Carolina, PR','Ponce, PR','Caguas, PR','Mayagüez, PR','Guaynabo, PR','Arecibo, PR'];
  intereses TEXT[] := ARRAY['alto','alto','alto','medio','medio','bajo'];
  estados   TEXT[] := ARRAY['nuevo','contactado','interesado','cerrado'];
BEGIN
  -- ------------------------------------------------------------
  -- 1. Crear usuario en auth.users si no existe
  -- ------------------------------------------------------------
  SELECT id INTO v_user_id FROM auth.users WHERE email = DEMO_EMAIL LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      DEMO_EMAIL,
      crypt(DEMO_PASSWORD, gen_salt('bf')),
      NOW(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      jsonb_build_object('provider','email','providers',ARRAY['email']),
      jsonb_build_object('full_name', DEMO_NOMBRE),
      FALSE,
      NOW(),
      NOW(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      FALSE,
      FALSE
    );

    -- Identity ligada al usuario (provider email) — requerido para login
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::TEXT, 'email', DEMO_EMAIL, 'email_verified', true),
      'email',
      DEMO_EMAIL,
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'auth.users creado: %', v_user_id;
  ELSE
    -- Refrescar la contraseña por si cambió
    UPDATE auth.users
    SET encrypted_password = crypt(DEMO_PASSWORD, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at         = NOW()
    WHERE id = v_user_id;
    RAISE NOTICE 'auth.users ya existía: %, password refrescado', v_user_id;
  END IF;

  -- ------------------------------------------------------------
  -- 2. Upsert fila en clientes
  -- ------------------------------------------------------------
  SELECT id INTO v_cliente_id FROM clientes WHERE auth_user_id = v_user_id LIMIT 1;

  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (auth_user_id, email, nombre, empresa, telefono, plan, created_at)
    VALUES (v_user_id, DEMO_EMAIL, DEMO_NOMBRE, 'Impulsa PR Demo', '+17875550100', 'pro', NOW())
    RETURNING id INTO v_cliente_id;
  ELSE
    UPDATE clientes
    SET nombre = DEMO_NOMBRE, empresa = 'Impulsa PR Demo', telefono = '+17875550100', plan = 'pro'
    WHERE id = v_cliente_id;
  END IF;

  RAISE NOTICE 'cliente_id: %', v_cliente_id;

  -- ------------------------------------------------------------
  -- 3. Limpiar datos previos del demo
  -- ------------------------------------------------------------
  DELETE FROM citas              WHERE cliente_id = v_cliente_id;
  DELETE FROM whatsapp_historial WHERE cliente_id = v_cliente_id;
  DELETE FROM contactos_bot      WHERE cliente_id = v_cliente_id;
  DELETE FROM leads              WHERE cliente_id = v_cliente_id;

  -- ------------------------------------------------------------
  -- 4. Contactos del bot (80 en últimos 30 días)
  -- ------------------------------------------------------------
  FOR i IN 1..80 LOOP
    v_telefono := '+1787555' || LPAD((1000 + i)::TEXT, 4, '0');
    v_fecha    := NOW() - (random() * 30 || ' days')::INTERVAL;
    INSERT INTO contactos_bot (cliente_id, telefono, push_name, tipo, created_at)
    VALUES (
      v_cliente_id,
      v_telefono,
      nombres[1 + (i % array_length(nombres, 1))],
      'whatsapp',
      v_fecha
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  -- ------------------------------------------------------------
  -- 5. Leads + conversaciones + citas
  -- ------------------------------------------------------------
  FOR i IN 1..50 LOOP
    v_telefono  := '+1787555' || LPAD((2000 + i)::TEXT, 4, '0');
    v_nombre    := nombres[1 + (i % array_length(nombres, 1))];
    v_nicho     := nichos[1 + (i % array_length(nichos, 1))];
    v_interes   := intereses[1 + (i % array_length(intereses, 1))];
    v_estado    := estados[1 + (i % array_length(estados, 1))];
    v_fecha     := NOW() - (random() * 30 || ' days')::INTERVAL;
    v_es_viable := (random() > 0.35);

    INSERT INTO leads (
      cliente_id, telefono, nombre, contact_name, es_contacto_guardado,
      tipo_negocio, necesidad, estado, nivel_interes, es_viable,
      humano_activo, historial_resumen, ultimo_mensaje, ultima_respuesta,
      fecha_primer_contacto, fecha_ultimo_contacto,
      email, ubicacion, num_empleados, sitio_web,
      origen, fuente, etapa, valor_estimado, valor_real,
      intencion, deleted, created_at, updated_at
    ) VALUES (
      v_cliente_id, v_telefono, v_nombre, v_nombre, TRUE,
      v_nicho,
      'Necesita automatizar su ' || v_nicho || ' con bot de WhatsApp',
      v_estado, v_interes, v_es_viable,
      FALSE,
      'Prospecto interesado en ' || v_nicho || '. Pidió información sobre planes.',
      'Me interesa, ¿cuánto cuesta?',
      'Nuestro plan Pro comienza en $297/mes. ¿Quieres agendar una demo?',
      v_fecha, v_fecha + INTERVAL '2 hours',
      LOWER(REPLACE(v_nombre, ' ', '.')) || i || '@gmail.com',
      ciudades[1 + (i % array_length(ciudades, 1))],
      (CASE i % 4 WHEN 0 THEN '1-5' WHEN 1 THEN '6-10' WHEN 2 THEN '11-50' ELSE '50+' END),
      'https://ejemplo-' || i || '.com',
      (CASE i % 3 WHEN 0 THEN 'instagram' WHEN 1 THEN 'referido' ELSE 'facebook' END),
      (CASE i % 3 WHEN 0 THEN 'ads' WHEN 1 THEN 'orgánico' ELSE 'referido' END),
      v_estado,
      (500 + (random() * 4500))::INT,
      CASE WHEN v_estado = 'cerrado' THEN (500 + (random() * 4500))::INT ELSE 0 END,
      CASE v_interes WHEN 'alto' THEN 'comprar' WHEN 'medio' THEN 'evaluar' ELSE 'explorar' END,
      FALSE,
      v_fecha, v_fecha + INTERVAL '2 hours'
    ) RETURNING id INTO v_lead_id;

    -- Historial WhatsApp (4-12 mensajes por lead)
    FOR j IN 1..(4 + (random() * 8)::INT) LOOP
      INSERT INTO whatsapp_historial (cliente_id, telefono, mensaje, rol, created_at)
      VALUES (
        v_cliente_id,
        v_telefono,
        CASE j % 4
          WHEN 0 THEN 'Hola, vi su anuncio'
          WHEN 1 THEN 'Queremos información sobre sus servicios'
          WHEN 2 THEN 'Sí, me interesa'
          ELSE 'Perfecto, gracias'
        END,
        CASE j % 2 WHEN 0 THEN 'user' ELSE 'assistant' END,
        v_fecha + (j || ' minutes')::INTERVAL
      );
    END LOOP;

    -- 50% de leads viables agendan cita
    IF v_es_viable AND random() < 0.5 THEN
      v_fecha_cita := v_fecha + ((1 + random() * 14) || ' days')::INTERVAL;
      INSERT INTO citas (
        cliente_id, lead_id, nombre_cliente, telefono_cliente,
        titulo, fecha, fecha_fin,
        estado, cancelada,
        recordatorio_24h_enviado, recordatorio_1h_enviado,
        created_at
      ) VALUES (
        v_cliente_id, v_lead_id, v_nombre, v_telefono,
        'Demo ' || v_nicho || ' — ' || v_nombre,
        v_fecha_cita, v_fecha_cita + INTERVAL '30 minutes',
        CASE
          WHEN v_fecha_cita < NOW() AND random() < 0.75 THEN 'completada'
          WHEN v_fecha_cita < NOW() THEN 'pendiente'
          ELSE 'agendada'
        END,
        (random() < 0.12),
        TRUE, (random() > 0.5),
        v_fecha + INTERVAL '3 hours'
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Seed completado: 50 leads, 80 contactos, ~15 citas, ~400 mensajes';
END $$;

-- Verificación
SELECT
  (SELECT id    FROM auth.users WHERE email = 'demo@impulsapr.com') AS auth_user_id,
  (SELECT id    FROM clientes   WHERE email = 'demo@impulsapr.com') AS cliente_id,
  (SELECT COUNT(*) FROM leads              WHERE cliente_id = (SELECT id FROM clientes WHERE email = 'demo@impulsapr.com')) AS leads,
  (SELECT COUNT(*) FROM citas              WHERE cliente_id = (SELECT id FROM clientes WHERE email = 'demo@impulsapr.com')) AS citas,
  (SELECT COUNT(*) FROM contactos_bot      WHERE cliente_id = (SELECT id FROM clientes WHERE email = 'demo@impulsapr.com')) AS contactos,
  (SELECT COUNT(*) FROM whatsapp_historial WHERE cliente_id = (SELECT id FROM clientes WHERE email = 'demo@impulsapr.com')) AS mensajes;
