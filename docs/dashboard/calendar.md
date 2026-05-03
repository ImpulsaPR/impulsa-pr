# Calendario

Tu agenda completa de citas — sincronizada con Google Calendar.

## Vistas disponibles

* **Mes** (default) — vista panorámica
* **Semana** — más detalle, ideal para gestionar
* **Día** — para días con muchas citas
* **Lista** — útil en mobile o para imprimir

Cambia con los botones arriba a la derecha.

## Crear una cita

3 formas:

### 1. Desde el calendario

* Click en cualquier día/hora libre → modal de nueva cita
* Llenas: cliente, servicio, hora, notas

### 2. Desde un cliente o lead

* Abre la ficha → botón **"Agendar cita"**
* Pre-llena con los datos del cliente

### 3. Automática (vía bot)

* El bot agenda solo cuando un lead/cliente lo pide por WhatsApp
* Verás aparecer la cita en tiempo real

## Editar / mover

* **Click + drag** en la vista de mes/semana para mover de fecha/hora
* Click en la cita → modal de edición

## Estados de una cita

| Estado | Color | Significado |
|---|---|---|
| Agendada | Violeta | Confirmada, futura |
| En curso | Amarillo | Pasando ahora mismo |
| Completada | Verde | Cliente vino, servicio dado |
| Cancelada | Rojo | Cancelada antes de la hora |
| No-show | Gris | Cliente no apareció |

> Cambia el estado desde la ficha de la cita o haciendo click derecho.

## Buffer entre citas

En `Settings → Booking` defines el **buffer** que el bot respeta al agendar:

* Estética: 15-30 min (esterilización + transición)
* Restaurante: 30 min (limpiar mesa)
* Dental: 15 min (notas + esterilización)
* Salón: 0-15 min según servicio

> Las citas que **TÚ creas manualmente** ignoran el buffer (asumimos que sabes lo que haces).

## Bloqueos (vacaciones, almuerzo)

Para que el bot **no agende** en ciertos días/horas:

1. Ve a `/bloqueos`
2. Click "Nuevo bloqueo"
3. Define: fecha desde/hasta, motivo, todo el día o rango específico

Ejemplos:

* Vacaciones (todo el día desde X hasta Y)
* Almuerzo recurrente (12-1pm cada día)
* Día festivo

> El bot **respeta automáticamente** estos bloqueos al ofrecer slots.

## Recordatorios automáticos

Para cada cita, el bot puede mandar recordatorios:

* **48h antes** — confirmación temprana
* **24h antes** — recordatorio principal
* **2h antes** — alerta final

Configurables en `Settings → Notificaciones automáticas`.

> Esto **reduce no-shows masivamente** (típicamente del 30% al 8%).

## Cancelaciones y reagendamientos

Cuando un cliente cancela:

* Manualmente desde `/calendar` → editar cita → cambiar a "Cancelada"
* Por WhatsApp ("necesito cancelar mañana") → el bot lo procesa solo

Lo mismo para reagendar — el bot puede mover la cita por WhatsApp y se sincroniza con Google Calendar.

## Mostrar info detallada

Click en cualquier cita abre un panel con:

* Cliente (nombre, teléfono, link a ficha)
* Servicio
* Duración
* Notas del cliente
* Estado de pago (depósito recibido o no)
* Botones rápidos: WhatsApp al cliente, Marcar completada, Cancelar

## Sincronización con Google Calendar

* Las citas creadas aquí **aparecen en tu Google Calendar** en menos de 30 segundos
* Las citas que **TÚ creas manualmente en Google Calendar** se sincronizan al dashboard en máximo 5 minutos
* Las citas borradas en Google Calendar se marcan como canceladas en el dashboard

## Múltiples calendarios (multi-staff)

Si tienes equipo, cada estilista/profesional puede tener su propio calendario:

1. Cada miembro conecta su Google Calendar personal
2. Las citas asignadas a Juan van al calendario de Juan; las de María al de María
3. La vista del dashboard puede mostrar uno solo o todos juntos (filtros arriba)

## Exportar

Puedes exportar tu agenda:

* **CSV** — para Excel/análisis
* **iCal** — para suscribirse desde Apple Calendar, Outlook, etc.
* **PDF** — versión imprimible para colgar en pared

## Comportamiento mobile

En celular:

* Por default ves la vista **Lista** (más legible que el grid)
* Tap larga = mover cita
* Click cita = ver detalles
* Botón flotante "+" = nueva cita
