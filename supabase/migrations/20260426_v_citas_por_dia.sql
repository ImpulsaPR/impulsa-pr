-- v_citas_por_dia: agregación diaria de citas para el dashboard de analytics.
-- El hook use-metricas la consulta para gráficos de citas en el tiempo.

create or replace view v_citas_por_dia as
select
  cliente_id,
  date_trunc('day', fecha)::date as fecha,
  count(*) filter (where estado in ('agendada', 'confirmada')) as citas_agendadas,
  count(*) filter (where coalesce(cancelada, false) = true or estado = 'cancelada') as citas_canceladas,
  count(*) filter (where estado = 'completada') as citas_completadas
from citas
group by cliente_id, date_trunc('day', fecha)
order by fecha desc;
