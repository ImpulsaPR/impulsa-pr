# Branding white-label

Cambia el aspecto del dashboard y de **todas las páginas públicas** para que se vean con tu marca.

## Lo que se branded

* Dashboard (sidebar, headers, badges, botones)
* Booking público (`/book/[slug]`)
* Catálogo público (`/c/[slug]`)
* Emails transaccionales (header con logo)
* Mensajes WhatsApp del bot (firma del negocio)
* PWA / app instalable (icono + theme color)

## Configurar

Settings → Branding:

### 1. Logo

* Sube **PNG con fondo transparente** (mínimo 512×512px, ratio cuadrado)
* Aparece en sidebar, headers, OG image, email
* También se usa para el **favicon** automáticamente

### 2. Color primario

* Hex (ej. `#8b5cf6`)
* Sistema calcula automáticamente:
  * Color foreground sobre primary (white o black según luminosidad)
  * Hover state (más oscuro)
  * Disabled state (más claro)
  * Focus ring

### 3. Color secundario (opcional)

* Para gradientes y acentos secundarios

### 4. Favicon

* Si subiste logo, se genera automático
* Si quieres uno distinto, sube ICO o PNG

### 5. Nombre del negocio

* Aparece en headers, emails, OG meta tags
* Distinto del nombre legal — usa el comercial

### 6. Slug público

* Define la URL de tus páginas públicas
* Ej: `lipsbylyzz` → `/book/lipsbylyzz` y `/c/lipsbylyzz`

## CSS variables inyectadas

El sistema usa **CSS variables** para que TODO el dashboard cambie con un click:

```css
--brand: #8b5cf6;
--brand-foreground: #ffffff;
--brand-hover: #7c3aed;
```

Cualquier botón / badge / accent en el dashboard usa estas vars.

## Branded en emails transaccionales

Los emails que el sistema manda (confirmación de cita, recetas, reportes) salen automáticamente con:

* Header navy + tu logo
* CTA con tu color primario
* Footer con tu nombre del negocio

## Modo oscuro / claro

Tu cliente final puede cambiar entre dark / light. Tu branding se adapta automático en ambos.

## Vista previa

Después de guardar, refresca la página y todos los componentes se actualizan al instante.

## Tu propio dominio (próximamente)

Plan Business: en lugar de `cliente.impulsapr.com/c/tuslug` puedes tener `tienda.tudominio.com/c/...` con SSL automático.
