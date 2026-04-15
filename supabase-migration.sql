-- ============================================
-- IMPULSA PR — Multi-Tenant Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create "clientes" table
CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre text DEFAULT '',
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS on clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/update their own cliente row
CREATE POLICY "Users can view own cliente"
  ON public.clientes FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own cliente"
  ON public.clientes FOR UPDATE
  USING (auth_user_id = auth.uid());

-- 3. Auto-create cliente on signup (trigger on auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.clientes (auth_user_id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Drop if exists to avoid duplicate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Add foreign key on leads.cliente_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'leads_cliente_id_fkey'
    AND table_name = 'leads'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT leads_cliente_id_fkey
      FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);
  END IF;
END $$;

-- 5. Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access leads belonging to their cliente
CREATE POLICY "Users can view own leads"
  ON public.leads FOR SELECT
  USING (
    cliente_id IN (
      SELECT id FROM public.clientes WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    cliente_id IN (
      SELECT id FROM public.clientes WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (
    cliente_id IN (
      SELECT id FROM public.clientes WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own leads"
  ON public.leads FOR DELETE
  USING (
    cliente_id IN (
      SELECT id FROM public.clientes WHERE auth_user_id = auth.uid()
    )
  );

-- 6. Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.clientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;

-- ============================================
-- IMPORTANT: After running this migration,
-- you need to link your existing leads to your
-- cliente. Run this AFTER signing up:
--
-- UPDATE public.leads
-- SET cliente_id = (SELECT id FROM public.clientes WHERE auth_user_id = 'YOUR_AUTH_USER_ID')
-- WHERE cliente_id IS NULL;
-- ============================================
