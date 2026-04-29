-- Realtime requiere REPLICA IDENTITY FULL en tablas con filter por columnas
-- distintas a la PK. Sin esto, Realtime no envía rows completos en UPDATE/DELETE
-- y los filtros tipo `cliente_id=eq.X` pueden fallar silenciosamente.
-- Esto es lo que causaba que las conversaciones NO se actualizaran en tiempo real
-- en /conversations del dashboard.

alter table whatsapp_historial replica identity full;
alter table leads replica identity full;
alter table citas replica identity full;

-- citas no estaba en la publicacion realtime - se agrega para ver agendamientos en vivo
alter publication supabase_realtime add table citas;

-- Verificación (informativa):
-- select c.relname, c.relreplident from pg_class c
--   where c.relname in ('whatsapp_historial','leads');
