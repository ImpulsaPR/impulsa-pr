# Branding por sub-cliente

Cada sub-cliente puede tener **su propio look** completo — logo, colores, dominio.

## Niveles de white-label

### Nivel 1: usar el dominio default

`cliente.impulsapr.com/book/[slug]`

* Funciona out-of-the-box
* Tu cliente NO ve "Impulsa PR" en el header — solo su propio logo
* En el footer aparece "Powered by Impulsa PR" (puedes ocultarlo en plan business)

### Nivel 2: subdominio tuyo (recomendado para resellers)

`booking.tudominio.com/[slug]`

Configuración:

1. Apunta `booking` (CNAME) en tu DNS hacia `cliente.impulsapr.com`
2. Sistema instala SSL automático
3. Tu cliente accede vía `booking.tudominio.com/lipsbylyzz`

### Nivel 3: dominio propio del cliente

`reservas.lipsbylyzz.com`

Configuración:

1. Tu cliente apunta `reservas` (CNAME) en su DNS hacia `cliente.impulsapr.com`
2. Sistema instala SSL automático
3. Acceso vía dominio del cliente

> Más esfuerzo de setup, pero máximo profesionalismo.

## Personalización por sub-cliente

Para cada uno configuras:

* **Logo** (sube PNG con fondo transparente)
* **Color primario** (hex)
* **Color secundario** (opcional)
* **Favicon** (auto-generado del logo si no subes uno custom)
* **Nombre del negocio**
* **Descripción corta**

## Email branded por sub-cliente

Cada sub-cliente puede tener su propio dominio de email:

* `noreply@mail.lipsbylyzz.com`
* `noreply@mail.dentalclinicasanjuan.com`

Configuración via Resend (cada sub-cliente con su API key).

> Si NO configuras esto, los emails salen desde un dominio genérico tuyo (ej. `noreply@mail.tuagencia.com`) — funciona, pero menos profesional.

## Tu propio logo encima

Si quieres que cuando entras a un sub-cliente como impersonate veas TU logo (no el del cliente):

Settings → Reseller → "Mi marca como reseller":

* Logo de tu agencia
* Color de tu agencia

Aparece en el panel central `/sub-clientes` y en headers cuando estás en modo reseller.

## Email/teléfono de soporte

Cada sub-cliente puede tener:

* Tu email/teléfono como soporte (si tú haces el soporte)
* O su propio email/teléfono (si el cliente atiende por su lado)

Configurable por sub-cliente.
