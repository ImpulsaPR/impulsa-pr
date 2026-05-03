# Email marketing (drips & campañas)

Manda **emails branded** desde tu propio dominio — nurture, drips, campaigns.

## Tipos de emails

### 1. Transaccionales

Disparados por eventos del sistema:

* Confirmación de cita
* Recordatorio 24h antes
* Confirmación de pago
* Bienvenida post-onboarding

> Estos siempre van. No requieren consentimiento de marketing.

### 2. Drips (secuencias)

Emails programados que se mandan en intervalos:

* Día 0: bienvenida
* Día 3: tips de uso
* Día 7: oferta inicial
* Día 14: testimonio + CTA

> Cumplen con CAN-SPAM y reglas Gmail bulk sender 2024 (List-Unsubscribe, 1-click unsubscribe).

### 3. Campañas

Emails masivos one-shot:

* Lanzamiento nuevo servicio
* Promo del mes
* Newsletter

## Crear un drip

Ve a `/email` → **"Nueva secuencia"**:

1. **Nombre** (interno)
2. **Filtro de inscripción** (qué leads/clientes entran)
3. **Steps** — cada uno con:
   * Día (0, 1, 3, 7, 14...)
   * Subject
   * HTML body (con merge tags)
4. **Filtro de salida** (cuándo desinscribir)
5. Activar

## Variables disponibles

* `{{nombre}}` — nombre completo
* `{{first_name}}` — primer nombre
* `{{email}}` — email del lead
* `{{telefono}}` — teléfono
* `{{stage}}` — estado actual del lead
* `{{cf.<key>}}` — custom fields (ej. `{{cf.tipo_negocio}}`)

## Branded sin esfuerzo

Cada email automáticamente:

* Header con tu logo + colores
* Footer con tu negocio + link unsubscribe
* From: `<tu negocio> <noreply@mail.impulsapr.com>` (o tu propio dominio si lo configuras)

## Compliance Gmail/Yahoo 2024

Tus emails marketing automáticamente incluyen:

* Header `List-Unsubscribe` (Gmail mostrará botón "Cancelar suscripción")
* Header `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
* Footer visible con link de unsubscribe
* DMARC + SPF + DKIM configurados

> Esto significa que tus emails **NO van a spam** y cumples las reglas para bulk senders (>5,000 emails/día).

## Opt-outs respetados automáticamente

Si alguien se da de baja:

* Su email entra a `email_unsubscribes`
* Sistema lo **excluye automáticamente** de drips y campaigns
* Sigue recibiendo transaccionales (cita confirmada, etc.)

## Estadísticas

Por cada drip / campaña:

* Sends
* Delivers (bounce rate)
* Opens (open rate) — próximamente con tracking pixel
* Clicks (CTR)
* Unsubscribes
* Conversiones (¿cuántos agendaron cita después?)

## Crear una campaña one-shot

Ve a `/email` → **"Nueva campaña"**:

1. Define segmento (qué leads/clientes la reciben)
2. Subject + HTML
3. Programa (enviar ahora o en fecha futura)
4. Click "Enviar"

## Buenas prácticas

* No mandes más de **2 emails marketing por semana** (cansa)
* Limpia tu lista — quita rebotes y opt-outs
* A/B test subjects (próximamente)
* Personaliza con merge tags
* Mobile-first (la mayoría abren en celular)
