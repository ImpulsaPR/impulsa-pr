# Notificaciones push (PWA)

Recibe notificaciones de eventos importantes en tu **dispositivo** — aunque no tengas el dashboard abierto.

## Eventos que disparan push

* Lead nuevo
* Cita agendada / cancelada
* Pago recibido
* Mensaje escalado por el bot (necesita tu atención)
* Tarea próxima a vencer
* Stock bajo

> Configurable cuáles activas.

## Activar push notifications

### En desktop (Chrome, Edge, Brave)

1. Settings → Notificaciones → "Activar push"
2. El navegador te pide permiso → "Permitir"
3. Listo — pruebas con el botón "Enviar prueba"

### En mobile

1. Abre `cliente.impulsapr.com` en Safari (iOS) o Chrome (Android)
2. **"Instalar app"** (PWA) — aparece en home screen como app
3. Abre la app instalada
4. Settings → Notificaciones → "Activar push"
5. Permite cuando el OS pregunta

> En iOS necesitas **iOS 16.4+** y la app instalada como PWA (no abrirla desde Safari directo).

## Política de notificaciones

Puedes elegir qué eventos te notifican:

* **Críticos** (always on): pagos fallidos, errores del bot
* **Importantes** (default): leads, citas, escalamientos
* **Opcionales**: stock bajo, recordatorios

## Horario silencioso

Configura "Do not disturb": de X a Y horas no te llegan pushes (ej. 11pm-7am).

> Las notificaciones se guardan y aparecen acumuladas cuando termina el silencio.

## Múltiples dispositivos

Si activas en celular Y en laptop, te llegan a ambos (con auto-deduplicación si abres una desde un device).

## Privacy

* Las notificaciones NO incluyen contenido sensible (ej. solo "Cita nueva", no el detalle del cliente)
* Para ver detalle, abres el dashboard — toda la info está cifrada en tránsito

## Apagar todo

Settings → Notificaciones → "Apagar todo". O desde tu OS → permisos del sitio.
