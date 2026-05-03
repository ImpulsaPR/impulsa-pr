# Cobros y márgenes

Cómo funciona el flujo de dinero entre tú, tus clientes y Impulsa PR.

## Tu cliente final paga a TI

Tú decides:

* **Precio público** que cobras (ej. $497/mes)
* **Forma de cobro** (Stripe, ATH Móvil Business, transferencia, factura mensual)
* **Frecuencia** (mensual, anual con descuento)

Sistema te ayuda con:

* **Stripe Subscriptions** integrado en sus dashboards
* Recordatorios automáticos antes del cobro mensual
* Notificación si falla un pago

## Tú pagas a Impulsa PR

Costo mayorista mensual por **cuentas activas**.

* Pagas el día 1 de cada mes
* Sistema te envía factura
* Cobramos via Stripe (puedes pagar con tarjeta, ACH, o transferencia)

## Margen

```
Margen = Precio público × N clientes − (Costo mayorista × N clientes)
```

### Ejemplo realista

| | |
|---|---|
| 5 clientes activos | |
| Precio público (a tu cliente) | $497/mes |
| Tu ingreso bruto | $2,485/mes |
| Costo mayorista (por cliente) | ~$200/mes |
| Tu costo total | $1,000/mes |
| **Margen neto** | **$1,485/mes** |

## Pricing tiers

El **costo mayorista baja** según volumen:

* 1-3 clientes: ~$220/mes c/u
* 4-10 clientes: ~$200/mes c/u
* 11-25 clientes: ~$175/mes c/u
* 26+ clientes: ~$150/mes c/u

(Cifras ilustrativas — los números exactos los confirmamos en la conversación inicial.)

## Si un cliente no paga

* Tú le suspendes el dashboard desde tu panel
* Sigues pagando a Impulsa PR mientras la cuenta esté activa
* O eliminas su cuenta para no seguir pagando por ella
* Datos se mantienen 90 días por si vuelve

## Métodos de pago

Impulsa PR te acepta:

* Stripe (tarjeta crédito/débito)
* ACH (transferencia desde cuenta bancaria USA)
* Transferencia internacional (con costo extra)

## Reportes financieros

En tu panel reseller ves:

* MRR (Monthly Recurring Revenue) total
* Por sub-cliente
* Costos hacia Impulsa PR
* **Margen neto** automáticamente calculado
* Próximos cobros / cobros fallidos

## Set-up fee opcional

Si quieres cobrar **set-up fee** a tus clientes (ej. $500 onboarding):

* Cobras directo via Stripe one-time
* No tiene costo mayorista para Impulsa PR
* 100% para ti

Recomendamos cobrar set-up — alinea expectativas y filtra clientes serios.

## Política de no-show / churn

Si un cliente termina su contrato:

* Notifícalo en `/sub-clientes` para dejar de pagarlo el siguiente mes
* Sistema lo desactiva al final del ciclo actual
* Mantenemos sus datos 90 días por si reactiva
