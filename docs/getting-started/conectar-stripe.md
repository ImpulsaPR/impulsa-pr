# Conectar Stripe (recibir pagos)

Si quieres cobrar **depósitos automáticos** al agendar citas o vender productos directo desde tu catálogo público, necesitas conectar Stripe.

## ¿Por qué Stripe?

* **El dinero va DIRECTO a tu cuenta** — Impulsa PR no es intermediario financiero
* **PCI compliant** (Level 1, el más alto)
* **Acepta tarjetas, ATH Móvil, Apple Pay, Google Pay**
* **Comisión**: ~2.9% + $0.30 por transacción (estándar de Stripe, no nosotros)
* **Payouts a tu banco** automáticos cada 2 días hábiles

## Cómo se ve para tu cliente final

Cuando un cliente quiere agendar una cita que requiere depósito:

1. Llena el formulario en tu booking público (`cliente.impulsapr.com/book/tu-slug`)
2. Hace clic en **"Confirmar y pagar depósito"**
3. Lo redirige a una página de Stripe Checkout (con TU logo y colores)
4. Paga con tarjeta o Apple Pay
5. El depósito **va directo a tu cuenta Stripe**
6. La cita queda confirmada automáticamente

## Cómo conectarlo

### Paso 1: crear cuenta Stripe (si no la tienes)

Ve a [dashboard.stripe.com/register](https://dashboard.stripe.com/register), llena con info de tu negocio. Puerto Rico está soportado.

> Stripe pedirá tu información fiscal (EIN o SSN), info bancaria y verificación de identidad. Toma 10-30 minutos.

### Paso 2: activar tu cuenta para producción

En el dashboard de Stripe, asegúrate de activarla para **modo Live** (no test). Stripe te puede pedir verificación adicional para esto.

### Paso 3: copiar tu Secret Key

1. En tu dashboard Stripe → **Developers** → **API Keys**
2. Copia la **Secret Key** (empieza con `sk_live_...`)
3. ⚠️ **No la compartas con nadie** ni la pegues en chats. Solo en el dashboard de Impulsa PR.

### Paso 4: pegarla en Impulsa PR

En tu dashboard Impulsa PR → **Settings** → sección **"Pasarela de pago Stripe"**:

1. Pega tu Secret Key en el campo
2. (Opcional pero recomendado) Pega el Webhook Signing Secret (ver abajo)
3. Click **"Conectar Stripe"**

El sistema **verifica** la key contra Stripe en vivo. Si todo OK, ves el badge:

```
✅ Stripe conectado · sk_live_•••XXXX · PRODUCCIÓN
```

### Paso 5 (recomendado): configurar webhook

Para que tu cita se confirme automáticamente al pagar:

1. En Stripe → **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://cliente.impulsapr.com/api/webhooks/stripe`
3. Eventos: `checkout.session.completed`
4. Copia el **Signing Secret** que aparece (empieza con `whsec_...`)
5. Pégalo en `Settings` → Stripe → campo "Webhook Signing Secret"

## Configurar el monto del depósito

En **Settings** → **Booking público** → activa "Requerir depósito" y define el monto (ej. $35).

## ¿Cómo aparece en mi cuenta Stripe?

Cada pago aparece como:

* **Descripción**: "Depósito — [Nombre del servicio]"
* **Customer**: email del cliente final
* **Metadata**: `booking=1, slug=..., cliente_id=..., servicio_nombre=...`

Puedes ver todos los pagos en tu dashboard de Stripe normal.

## Encryption

Tu Stripe Secret Key se **encripta con AES-256-GCM** antes de almacenarse en nuestra base de datos. Solo se desencripta dentro de nuestro servidor para crear los Checkout Sessions. Nunca aparece en frontend ni en logs.

## Recomendación: usar Restricted Key

Para máxima seguridad, en lugar de la Secret Key normal puedes crear una **Restricted Key** con permisos solo para:

* Checkout Sessions (lectura/escritura)
* Customers (lectura/escritura)
* Webhook Endpoints (lectura)

Esto limita el daño si por alguna razón la key se filtra.

## ¿Y si no quiero conectar Stripe?

Está OK. Si no conectas, los depósitos **van a la cuenta central de Impulsa PR** y se te transfieren manualmente al final del mes (menos comisión). Es menos automático pero igual funciona.

> La mayoría de clientes prefieren conectar Stripe propio — el dinero llega más rápido y la contabilidad es más limpia.

## Próximo paso

Continúa con [Invitar a tu equipo →](invitar-equipo.md).
