-- ============================================================
-- Invite tokens para signup cerrado (SECURE version)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Idempotente: puede correrse varias veces
-- ============================================================

-- pgcrypto para gen_random_bytes (vive en schema "extensions" en Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Tabla
CREATE TABLE IF NOT EXISTS invites (
  token        TEXT PRIMARY KEY,
  email        TEXT,
  nombre       TEXT,
  empresa      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  used_at      TIMESTAMPTZ,
  used_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Limpiar policies previas si ya existen (idempotencia)
DROP POLICY IF EXISTS "read own token" ON invites;
DROP POLICY IF EXISTS "mark used on signup" ON invites;
DROP POLICY IF EXISTS "validate own token" ON invites;
DROP POLICY IF EXISTS "consume own token" ON invites;

-- ============================================================
-- NUEVAS RPC (SECURITY DEFINER) — reemplazan el acceso directo
-- Evitan que anon pueda listar todos los invites activos.
-- ============================================================

-- 1. Validar un token específico (devuelve la metadata sin filtrar nada más)
CREATE OR REPLACE FUNCTION validate_invite(p_token TEXT)
RETURNS TABLE (valid BOOLEAN, email TEXT, nombre TEXT, empresa TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nunca hacer SELECT * FROM invites; solo devolver si el token exacto existe
  RETURN QUERY
  SELECT
    (i.used_at IS NULL AND i.expires_at > NOW()) AS valid,
    i.email,
    i.nombre,
    i.empresa
  FROM invites i
  WHERE i.token = p_token
  LIMIT 1;
  -- Si no existe, la query devuelve 0 filas (no confirma ni niega)
END;
$$;

-- 2. Consumir un token atómicamente (marca usado en la misma operación)
-- Devuelve TRUE si el consumo fue válido, FALSE si ya estaba usado/expirado/no existe
CREATE OR REPLACE FUNCTION consume_invite(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows INT;
BEGIN
  UPDATE invites
  SET used_at = NOW(), used_by = p_user_id
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > NOW();
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- Permisos: anon SÍ puede llamar las RPCs, NO puede leer la tabla directa
GRANT EXECUTE ON FUNCTION validate_invite(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION consume_invite(TEXT, UUID) TO anon, authenticated;

-- NO hay policy que permita SELECT/UPDATE/INSERT/DELETE directo sobre invites
-- Con RLS activo y sin policies, nadie excepto service_role puede acceder a la tabla directa.

-- ============================================================
-- HELPER: crear un nuevo invite (solo service_role, vía SQL Editor)
-- ============================================================
CREATE OR REPLACE FUNCTION create_invite(
  p_email   TEXT DEFAULT NULL,
  p_nombre  TEXT DEFAULT NULL,
  p_empresa TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT := encode(extensions.gen_random_bytes(24), 'base64');
BEGIN
  v_token := translate(v_token, '/+=', '_-');
  INSERT INTO invites (token, email, nombre, empresa)
  VALUES (v_token, p_email, p_nombre, p_empresa);
  RETURN 'https://cliente.impulsapr.com/signup?invite=' || v_token;
END;
$$;

REVOKE EXECUTE ON FUNCTION create_invite FROM anon, authenticated;
-- create_invite solo corre desde service_role (SQL Editor del dashboard)

SELECT 'invites table + RPCs ready (secure)' AS status;
