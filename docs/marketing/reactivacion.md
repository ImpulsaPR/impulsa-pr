# Reactivación automática

Re-engancha a **clientes que no han venido en X tiempo** con mensajes automáticos personalizados.

## Para qué sirve

El cliente que **no vino en 60-90 días** es lead caliente — ya te conoce, ya pagó antes, solo necesita un empujoncito. Reactivación automática los trae de vuelta.

## Configurar

Ve a `/reactivacion`:

1. Define los **triggers** (cuándo se activa):
   * "Sin cita en últimos 60 días"
   * "Sin cita en últimos 90 días"
   * "Sin contacto en últimos 6 meses"
2. Define el **mensaje** que se envía
3. Define qué pasa si responden / no responden

## Mensaje ejemplo

```
¡Hola [nombre]! 👋 Hace tiempo no nos vemos.
Tenemos una promo especial este mes que pensamos sería perfecta para ti.
¿Te gustaría que te cuente?
```

## Variables disponibles

* `{{nombre}}` — primer nombre del cliente
* `{{servicio_ultimo}}` — último servicio que compró
* `{{fecha_ultima_visita}}` — cuándo vino por última vez

## Frecuencia

Por default: **1 vez por cliente cada 90 días** (no spamearlos).

## Tracking

Por cada campaña de reactivación ves:

* Cuántos clientes recibieron el mensaje
* Cuántos respondieron
* Cuántos agendaron cita
* ROI (revenue generado / costo)

## Combina con drips

Si quieres una secuencia (no solo 1 mensaje):

* Día 0: "Hace tiempo no nos vemos"
* Día 7: "¿Todavía interesado?"
* Día 14: "Te dejo este descuento especial..."

Eso lo configuras en [Email marketing (drips)](email.md) — funciona también con WhatsApp.
