-- ============================================================
-- Migración: Soporte — canal directo cliente → equipo de impulsa
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Idempotente: IF NOT EXISTS + CREATE OR REPLACE POLICY
-- ============================================================

-- ============================================================
-- 1. Tabla soporte_mensajes
-- ============================================================
CREATE TABLE IF NOT EXISTS soporte_mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  autor TEXT NOT NULL CHECK (autor IN ('cliente', 'soporte')),
  asunto TEXT,
  mensaje TEXT NOT NULL CHECK (char_length(mensaje) > 0 AND char_length(mensaje) <= 4000),
  prioridad TEXT NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  estado TEXT NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
  leido_por_soporte BOOLEAN NOT NULL DEFAULT FALSE,
  leido_por_cliente BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soporte_mensajes_cliente
  ON soporte_mensajes (cliente_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_soporte_mensajes_estado
  ON soporte_mensajes (estado, created_at DESC)
  WHERE estado IN ('abierto', 'en_progreso');

-- ============================================================
-- 2. Trigger para updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION touch_soporte_mensajes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_soporte_mensajes_touch ON soporte_mensajes;
CREATE TRIGGER trg_soporte_mensajes_touch
  BEFORE UPDATE ON soporte_mensajes
  FOR EACH ROW EXECUTE FUNCTION touch_soporte_mensajes_updated_at();

-- ============================================================
-- 3. RLS — clientes sólo ven/escriben sus propios mensajes
-- ============================================================
ALTER TABLE soporte_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cliente_read_own_soporte" ON soporte_mensajes;
CREATE POLICY "cliente_read_own_soporte" ON soporte_mensajes
  FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cliente_insert_own_soporte" ON soporte_mensajes;
CREATE POLICY "cliente_insert_own_soporte" ON soporte_mensajes
  FOR INSERT
  WITH CHECK (
    autor = 'cliente'
    AND cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "cliente_update_leido_own_soporte" ON soporte_mensajes;
CREATE POLICY "cliente_update_leido_own_soporte" ON soporte_mensajes
  FOR UPDATE
  USING (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    cliente_id IN (
      SELECT id FROM clientes WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- NOTA: El equipo de soporte (tú) lee/escribe desde el Supabase
-- Dashboard usando la service role. Para habilitar un panel
-- admin en el app, crear rol/claim 'soporte' y una política extra.
-- ============================================================
