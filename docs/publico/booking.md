# Booking público (mini-Calendly)

Tu **página de reservas pública** — los clientes finales agendan online sin pasar por WhatsApp, con depósito automático Stripe directo a tu cuenta.

## Cómo se ve

URL pública:

```
https://cliente.impulsapr.com/book/[tu-slug]
```

El cliente ve:

1. Header con tu **logo + colores propios**
2. Lista de servicios (con duración y precio)
3. Calendario para elegir día (solo días con disponibilidad)
4. Slots de hora disponibles (respetando buffer y bloqueos)
5. Formulario para llenar datos
6. Si requiere depósito → redirige a Stripe Checkout
7. Pantalla de confirmación

## Activar

Ve a **Settings → Booking público**:

1. Activa el toggle "Booking activo"
2. Define tu **slug** (ej. `lipsbylyzz`)
3. Ajusta los parámetros:
   * **Buffer** entre citas (15-60 min)
   * **Anticipación mínima** (cuánto antes pueden reservar — ej. 2h)
   * **Anticipación máxima** (cuán lejos en el futuro — ej. 60 días)
   * **Requiere depósito** (toggle)
   * **Monto del depósito** (si aplica)
4. Click "Guardar"

## Compartir el link

* WhatsApp: "Reserva tu cita aquí: cliente.impulsapr.com/book/lipsbylyzz"
* Bio de Instagram
* QR para imprimir
* Link en email firma

## Stripe directo a TU cuenta

Si conectaste Stripe (ver [Conectar Stripe](../getting-started/conectar-stripe.md)):

* Cliente paga depósito
* **El dinero va directo a tu cuenta Stripe**
* Webhook confirma cita automáticamente
* Recibes email de confirmación

Si NO conectaste Stripe propio:

* Cliente paga depósito a la cuenta central de Impulsa PR
* Te transferimos al final del mes (menos comisión)

## Branded white-label

* Tu logo en el header
* Tu color primario en botones
* Tu nombre del negocio
* Texto "Powered by Impulsa PR" en footer (puedes ocultarlo en plan Business)

## Servicios visibles

Solo los servicios marcados como **"Visible en booking"** aparecen. Útil para:

* Ocultar servicios que solo das a clientes existentes
* Esconder paquetes promocionales temporales
* Servicios privados (consultas VIP)

## Slots disponibles

El sistema calcula slots automáticamente:

* ✅ Dentro de horario de atención
* ✅ Sin conflicto con citas existentes
* ✅ Respetando buffer
* ✅ Sin caer en bloqueos
* ✅ Después de la anticipación mínima
* ✅ Antes de la anticipación máxima

## Mobile-friendly

La página pública está optimizada para celular (donde el 80% de tus clientes la abrirán).

## Multi-staff

Si tienes equipo:

* El cliente puede elegir profesional al reservar
* O el sistema asigna automáticamente al disponible

> Configura desde Settings → Booking → "Permitir elegir profesional".

## Estadísticas

En `/calendar` → "Stats" ves:

* Reservas vía bot vs vía booking público
* Tasa de conversión del booking
* Servicios más reservados online

## Seguridad

* No requiere login del cliente final (mejor experiencia)
* Cada slot bloqueado tiene timeout de 10 min para completar pago
* Si no completa, slot se libera para otro cliente
* Token único anti-doble-cobro
