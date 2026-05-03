# Catálogo público (mini-Shopify)

Tu **catálogo de productos** público y compartible. Los clientes ven, navegan y piden info por WhatsApp con un click.

## URL pública

```
https://cliente.impulsapr.com/c/[tu-slug]
```

## Activar

Settings → Catálogo público:

1. Activa toggle
2. Define slug (ej. `mistore`)
3. Agrega descripción corta (aparece en header)
4. Guarda

> Antes de activar, ten al menos 3-5 productos creados — un catálogo vacío se ve mal. Ver [Productos](../operaciones/productos.md).

## Lo que ven los clientes

1. **Header** con tu logo, nombre del negocio, descripción y botón **WhatsApp directo**
2. **Search bar** + chips de categorías
3. **Grid responsive** (4 columnas desktop, 2 mobile) con:
   * Foto principal
   * Nombre
   * Categoría
   * Precio (con tachado si hay oferta)
4. **Click en producto** → modal con:
   * Carousel de fotos (hasta 6)
   * Descripción larga
   * Stock visible
   * Custom fields ("ingredientes", "talla", etc.)
   * **Botón "Pedir info por WhatsApp"** con mensaje pre-llenado

## Mensaje pre-llenado de WhatsApp

Cuando el cliente click en "Pedir info":

```
Hola, me interesa el producto: *Kit Post-Procedimiento Premium* ($65). ¿Tienes disponible?
```

Llega a tu WhatsApp con todo el contexto. Tú o el bot responden y cierran venta.

## Branded

* Tu logo
* Tu color primario en botones, badges y acentos
* Tu nombre del negocio en el header

## Comportamiento sin stock

Productos con stock = 0:

* Aparecen en el catálogo con overlay **"SIN STOCK"**
* No son clickeables
* El cliente sabe que existen pero no puede pedirlos ahora

> Cuando llegue stock nuevo, edita el producto y los clientes los vuelven a ver.

## Comportamiento con oferta

Si un producto tiene `precio_oferta` < `precio`:

* Aparece badge "OFERTA" en el grid
* Precio normal tachado
* Precio oferta resaltado en color de marca

## Compartir

* **WhatsApp**: "Mira mi catálogo: cliente.impulsapr.com/c/mistore"
* **Bio de Instagram**: link directo
* **QR**: imprime y pon en tu local
* **Email firma**: anchor link

## Tracking de visitas

Próximamente: ver cuántas personas visitaron tu catálogo, qué productos miraron más, cuáles tuvieron más clicks.

## Categorías

Free text por ahora. Si tipeas "Skincare" en 3 productos, los 3 se agrupan automáticamente con un chip filtrable.

## Stripe Checkout (próximamente)

Hoy el catálogo es **vitrina** — el cliente pide info por WhatsApp y tú procesas.

Próximamente: botón "Comprar ahora" con Stripe directo en cada producto. Cuando esté, el dinero va directo a tu cuenta Stripe.

## Diferencia con e-commerce completo (Shopify)

Si vendes 1000+ productos con variantes, carrito, descuentos complejos, devoluciones, integración con shipping — Shopify sigue siendo mejor.

Si vendes 5-50 productos, quieres evitar pagar Shopify ($29-79/mes), y prefieres cerrar por WhatsApp con relación humana — esto es más que suficiente.
