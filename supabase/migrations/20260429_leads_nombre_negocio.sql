-- Bot Quasar extrae nombre_negocio (nombre comercial del negocio del lead) en
-- el JSON datos_lead pero la columna no existía. La data se descartaba al hacer
-- upsert. Agregar columna para que persista. Diferente de tipo_negocio (que es
-- categoría tipo "barbería", "consultoría") y empresa_nombre (atributo de bots).

alter table leads add column if not exists nombre_negocio text;
