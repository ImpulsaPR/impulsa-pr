# Email branded saliente

Configura tu **dominio propio** para que los emails (transaccionales + marketing) salgan desde `noreply@tudominio.com` en lugar del default.

## ¿Por qué importa?

* **Profesionalismo**: emails con tu dominio se ven más serios
* **Deliverability**: emails desde tu dominio + DMARC/SPF/DKIM tienen mejor inbox placement
* **Branding**: el cliente ve tu marca en cada email, no Impulsa PR
* **Reseller**: si eres reseller white-label, esto es **obligatorio** — tus sub-clientes no ven Impulsa PR en ningún lado

## Setup

### 1. Tu propio dominio

Si ya tienes `tunegocio.com`, vamos al paso 2.

Si no, **compra un dominio** primero. Recomendamos:

* Namecheap (~$10/año)
* Cloudflare Registrar (~$10/año, sin markup)
* GoDaddy (más caro pero conocido)

### 2. Crea cuenta Resend

[resend.com/signup](https://resend.com/signup) — gratis hasta 3,000 emails/mes.

### 3. Verifica tu dominio en Resend

En Resend → "Add Domain" → entra `tunegocio.com` o `mail.tunegocio.com` (subdominio recomendado).

Resend te da 3-4 DNS records:

* **SPF**: `v=spf1 include:amazonses.com ~all` (TXT)
* **DKIM**: record largo (TXT)
* **MX**: `feedback-smtp.us-east-1.amazonses.com` (MX)
* **DMARC** (recomendado): `v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com`

### 4. Agrega los records en tu DNS

Donde tengas tu dominio (Namecheap, Cloudflare, GoDaddy):

* Pega cada record
* Espera 5-30 min a que propague
* Resend valida automáticamente cuando estén OK

### 5. Crea API key en Resend

Resend → API Keys → "Create" → permission: Sending. Copia la key (`re_...`).

### 6. Pégala en Impulsa PR

Settings → Email → "Conectar Resend":

* API key
* Dominio verificado (ej. `mail.tunegocio.com`)
* From address (ej. `noreply@mail.tunegocio.com`)
* From name (ej. "Tu Negocio")

Click **"Conectar"**. Sistema valida pegándole a Resend en vivo.

## Estado verificado

Si todo bien, ves:

```
✅ Email branded conectado
From: Tu Negocio <noreply@mail.tunegocio.com>
DMARC: ✓  SPF: ✓  DKIM: ✓
```

## Tipos de email afectados

* Confirmación de cita → desde tu dominio
* Recordatorios → desde tu dominio
* Recetas digitales (médico) → desde tu dominio
* Reportes mensuales → desde tu dominio
* Drips/campaigns → desde tu dominio
* Invitaciones a tu equipo → desde tu dominio
* Magic links de auth → desde tu dominio (si configurado)

## Sin Resend propio

Si no configuras esto, todos los emails salen desde `noreply@mail.impulsapr.com`. Sigue funcionando, pero con marca de Impulsa PR.

## Troubleshooting

### Los emails caen a spam

* Verifica DMARC, SPF, DKIM (todos tienen que estar OK en Resend)
* Tu reputación de dominio es nueva — con uso, mejora
* Evita palabras spam-trigger en subjects ("GRATIS", "CLICK YA", todo en mayúsculas)
* Asegúrate de que el HTML del email no tiene errores

### "Error 451 — domain not verified"

DNS no terminó de propagar. Espera 30 min más.
