-- ============================================================
-- Migración: Métricas de conversión para Dashboard (Roadmap v3)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Idempotente: usa CREATE OR REPLACE
-- ============================================================

-- ============================================================
-- 1. KPIs RESUMEN (últimos N días) — para cards del dashboard
-- ============================================================
CREATE OR REPLACE FUNCTION get_metricas_resumen(
  p_cliente_id UUID,
  p_dias INT DEFAULT 30
)
RETURNS TABLE (
  leads_totales BIGINT,
  citas_agendadas BIGINT,
  citas_canceladas BIGINT,
  citas_completadas BIGINT,
  tasa_conversion NUMERIC,
  tasa_cancelacion NUMERIC,
  mensajes_recibidos BIGINT,
  mensajes_enviados BIGINT,
  tiempo_promedio_horas_hasta_cita NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_desde TIMESTAMP := NOW() - (p_dias || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH leads_stats AS (
    SELECT COUNT(*) AS total
    FROM leads
    WHERE cliente_id = p_cliente_id
      AND deleted = FALSE
      AND fecha_primer_contacto >= v_desde
  ),
  citas_stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE cancelada = TRUE) AS canceladas,
      COUNT(*) FILTER (WHERE estado = 'completada') AS completadas
    FROM citas
    WHERE cliente_id = p_cliente_id
      AND created_at >= v_desde
  ),
  msgs_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE rol = 'user') AS recibidos,
      COUNT(*) FILTER (WHERE rol = 'assistant') AS enviados
    FROM whatsapp_historial
    WHERE cliente_id = p_cliente_id
      AND created_at >= v_desde
  ),
  tiempo_cita AS (
    SELECT AVG(EXTRACT(EPOCH FROM (c.created_at - l.fecha_primer_contacto)) / 3600)::NUMERIC AS horas
    FROM citas c
    JOIN leads l ON l.telefono = c.telefono_cliente AND l.cliente_id = c.cliente_id
    WHERE c.cliente_id = p_cliente_id
      AND c.created_at >= v_desde
      AND c.cancelada = FALSE
  )
  SELECT
    leads_stats.total,
    citas_stats.total,
    citas_stats.canceladas,
    citas_stats.completadas,
    ROUND(
      CASE WHEN leads_stats.total > 0
        THEN (citas_stats.total::NUMERIC / leads_stats.total::NUMERIC) * 100
        ELSE 0 END, 1
    ) AS tasa_conversion,
    ROUND(
      CASE WHEN citas_stats.total > 0
        THEN (citas_stats.canceladas::NUMERIC / citas_stats.total::NUMERIC) * 100
        ELSE 0 END, 1
    ) AS tasa_cancelacion,
    msgs_stats.recibidos,
    msgs_stats.enviados,
    ROUND(COALESCE(tiempo_cita.horas, 0), 1)
  FROM leads_stats, citas_stats, msgs_stats, tiempo_cita;
END;
$$;

-- ============================================================
-- 2. LEADS POR DÍA (para gráfico de línea)
-- ============================================================
CREATE OR REPLACE VIEW v_leads_por_dia AS
SELECT
  cliente_id,
  DATE(fecha_primer_contacto) AS fecha,
  COUNT(*) AS leads_nuevos,
  COUNT(*) FILTER (WHERE nivel_interes = 'alto') AS leads_alto_interes,
  COUNT(*) FILTER (WHERE es_viable = TRUE) AS leads_viables
FROM leads
WHERE deleted = FALSE
  AND fecha_primer_contacto IS NOT NULL
GROUP BY cliente_id, DATE(fecha_primer_contacto);

-- ============================================================
-- 3. CITAS POR DÍA (para gráfico de barras)
-- ============================================================
CREATE OR REPLACE VIEW v_citas_por_dia AS
SELECT
  cliente_id,
  DATE(created_at) AS fecha,
  COUNT(*) AS citas_agendadas,
  COUNT(*) FILTER (WHERE cancelada = TRUE) AS citas_canceladas,
  COUNT(*) FILTER (WHERE estado = 'completada') AS citas_completadas
FROM citas
GROUP BY cliente_id, DATE(created_at);

-- ============================================================
-- 4. EMBUDO DE CONVERSIÓN (para gráfico embudo)
-- ============================================================
CREATE OR REPLACE FUNCTION get_embudo_conversion(
  p_cliente_id UUID,
  p_dias INT DEFAULT 30
)
RETURNS TABLE (
  etapa TEXT,
  cantidad BIGINT,
  porcentaje NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_desde TIMESTAMP := NOW() - (p_dias || ' days')::INTERVAL;
  v_contactos BIGINT;
  v_leads_con_datos BIGINT;
  v_leads_viables BIGINT;
  v_citas BIGINT;
  v_completadas BIGINT;
BEGIN
  SELECT COUNT(DISTINCT telefono) INTO v_contactos
  FROM contactos_bot
  WHERE cliente_id = p_cliente_id AND created_at >= v_desde;

  SELECT COUNT(*) INTO v_leads_con_datos
  FROM leads
  WHERE cliente_id = p_cliente_id
    AND deleted = FALSE
    AND fecha_primer_contacto >= v_desde
    AND email IS NOT NULL AND email != '';

  SELECT COUNT(*) INTO v_leads_viables
  FROM leads
  WHERE cliente_id = p_cliente_id
    AND deleted = FALSE
    AND fecha_primer_contacto >= v_desde
    AND es_viable = TRUE;

  SELECT COUNT(*) INTO v_citas
  FROM citas
  WHERE cliente_id = p_cliente_id
    AND created_at >= v_desde;

  SELECT COUNT(*) INTO v_completadas
  FROM citas
  WHERE cliente_id = p_cliente_id
    AND created_at >= v_desde
    AND estado = 'completada';

  RETURN QUERY VALUES
    ('Contactos', v_contactos, 100.0::NUMERIC),
    ('Leads con datos', v_leads_con_datos,
      CASE WHEN v_contactos > 0 THEN ROUND((v_leads_con_datos::NUMERIC / v_contactos) * 100, 1) ELSE 0 END),
    ('Leads viables', v_leads_viables,
      CASE WHEN v_contactos > 0 THEN ROUND((v_leads_viables::NUMERIC / v_contactos) * 100, 1) ELSE 0 END),
    ('Citas agendadas', v_citas,
      CASE WHEN v_contactos > 0 THEN ROUND((v_citas::NUMERIC / v_contactos) * 100, 1) ELSE 0 END),
    ('Citas completadas', v_completadas,
      CASE WHEN v_contactos > 0 THEN ROUND((v_completadas::NUMERIC / v_contactos) * 100, 1) ELSE 0 END);
END;
$$;

-- ============================================================
-- 5. LEADS POR NICHO (pie/bar chart)
-- ============================================================
CREATE OR REPLACE VIEW v_leads_por_nicho AS
SELECT
  cliente_id,
  COALESCE(NULLIF(tipo_negocio, ''), 'sin_especificar') AS nicho,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE es_viable = TRUE) AS viables,
  COUNT(*) FILTER (WHERE nivel_interes = 'alto') AS alto_interes
FROM leads
WHERE deleted = FALSE
GROUP BY cliente_id, COALESCE(NULLIF(tipo_negocio, ''), 'sin_especificar');

-- ============================================================
-- 6. ESTADO ACTUAL DE CITAS (para donut)
-- ============================================================
CREATE OR REPLACE VIEW v_citas_estado_actual AS
SELECT
  cliente_id,
  CASE
    WHEN cancelada = TRUE THEN 'cancelada'
    WHEN estado = 'completada' THEN 'completada'
    WHEN fecha < NOW() THEN 'vencida'
    ELSE 'agendada'
  END AS estado_real,
  COUNT(*) AS total
FROM citas
GROUP BY cliente_id,
  CASE
    WHEN cancelada = TRUE THEN 'cancelada'
    WHEN estado = 'completada' THEN 'completada'
    WHEN fecha < NOW() THEN 'vencida'
    ELSE 'agendada'
  END;

-- ============================================================
-- 7. PRÓXIMAS CITAS (tabla — próximos 7 días)
-- ============================================================
CREATE OR REPLACE VIEW v_proximas_citas AS
SELECT
  c.id,
  c.cliente_id,
  c.nombre_cliente,
  c.telefono_cliente,
  c.titulo,
  c.fecha,
  c.fecha_fin,
  c.estado,
  c.recordatorio_24h_enviado,
  c.recordatorio_1h_enviado,
  c.evento_google_id,
  l.tipo_negocio,
  l.nivel_interes
FROM citas c
LEFT JOIN leads l ON l.telefono = c.telefono_cliente AND l.cliente_id = c.cliente_id
WHERE c.cancelada = FALSE
  AND c.fecha >= NOW()
  AND c.fecha <= NOW() + INTERVAL '7 days'
ORDER BY c.fecha ASC;

-- ============================================================
-- 8. ACTIVIDAD RECIENTE (últimas 50 acciones — feed)
-- ============================================================
CREATE OR REPLACE VIEW v_actividad_reciente AS
(
  SELECT
    cliente_id,
    'lead_nuevo' AS tipo,
    id::TEXT AS ref_id,
    nombre AS descripcion,
    tipo_negocio AS detalle,
    fecha_primer_contacto AS timestamp
  FROM leads
  WHERE deleted = FALSE AND fecha_primer_contacto IS NOT NULL
  ORDER BY fecha_primer_contacto DESC
  LIMIT 50
)
UNION ALL
(
  SELECT
    cliente_id,
    CASE WHEN cancelada THEN 'cita_cancelada' ELSE 'cita_agendada' END AS tipo,
    id::TEXT AS ref_id,
    nombre_cliente AS descripcion,
    titulo AS detalle,
    created_at AS timestamp
  FROM citas
  ORDER BY created_at DESC
  LIMIT 50
)
ORDER BY timestamp DESC
LIMIT 50;

-- ============================================================
-- 9. RENDIMIENTO DEL BOT (mensajes promedio por lead)
-- ============================================================
CREATE OR REPLACE FUNCTION get_rendimiento_bot(
  p_cliente_id UUID,
  p_dias INT DEFAULT 30
)
RETURNS TABLE (
  msgs_promedio_hasta_cita NUMERIC,
  msgs_promedio_sin_cita NUMERIC,
  conversaciones_sin_respuesta BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_desde TIMESTAMP := NOW() - (p_dias || ' days')::INTERVAL;
BEGIN
  RETURN QUERY
  WITH msgs_por_lead AS (
    SELECT
      l.telefono,
      l.fecha_primer_contacto,
      MIN(c.created_at) AS primera_cita,
      COUNT(w.id) FILTER (WHERE c.id IS NOT NULL) AS msgs_con_cita,
      COUNT(w.id) FILTER (WHERE c.id IS NULL) AS msgs_sin_cita
    FROM leads l
    LEFT JOIN citas c ON c.telefono_cliente = l.telefono AND c.cliente_id = l.cliente_id
    LEFT JOIN whatsapp_historial w ON w.telefono = l.telefono AND w.cliente_id = l.cliente_id
      AND w.created_at BETWEEN l.fecha_primer_contacto AND COALESCE(c.created_at, NOW())
    WHERE l.cliente_id = p_cliente_id
      AND l.deleted = FALSE
      AND l.fecha_primer_contacto >= v_desde
    GROUP BY l.telefono, l.fecha_primer_contacto
  )
  SELECT
    ROUND(AVG(msgs_con_cita) FILTER (WHERE primera_cita IS NOT NULL)::NUMERIC, 1),
    ROUND(AVG(msgs_sin_cita) FILTER (WHERE primera_cita IS NULL)::NUMERIC, 1),
    COUNT(*) FILTER (WHERE msgs_con_cita = 0 AND msgs_sin_cita = 0)::BIGINT
  FROM msgs_por_lead;
END;
$$;

-- ============================================================
-- PERMISOS (multi-tenant con RLS asumido)
-- ============================================================
GRANT EXECUTE ON FUNCTION get_metricas_resumen TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_embudo_conversion TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_rendimiento_bot TO authenticated, anon;
GRANT SELECT ON v_leads_por_dia, v_citas_por_dia, v_leads_por_nicho,
  v_citas_estado_actual, v_proximas_citas, v_actividad_reciente
  TO authenticated, anon;
