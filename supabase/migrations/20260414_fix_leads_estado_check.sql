-- Fix leads_estado_check constraint to allow pipeline stages
ALTER TABLE leads
DROP CONSTRAINT IF EXISTS leads_estado_check;

ALTER TABLE leads
ADD CONSTRAINT leads_estado_check
CHECK (estado IN ('nuevo', 'contactado', 'interesado', 'cerrado'));

-- Migrate existing leads with old estado values to new valid values
UPDATE leads SET estado = 'contactado' WHERE estado IN ('caliente', 'tibio');
UPDATE leads SET estado = 'cerrado' WHERE estado = 'perdido';
UPDATE leads SET estado = 'nuevo' WHERE estado = 'frio';
