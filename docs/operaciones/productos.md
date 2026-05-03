# Productos / Catálogo público

Tu **mini-Shopify** integrado. Crea productos con fotos, precios, stock y compártelos vía link público.

## Para qué sirve

* Vender productos físicos por WhatsApp sin necesidad de tienda online aparte
* Que tus clientes vean tu catálogo en bio de Instagram, en mensajes, en QR
* Llevar inventario básico

## Crear un producto

1. Ve a `/productos` → **"+ Nuevo producto"**
2. Llena:
   * **Nombre** (obligatorio)
   * **Descripción corta** (1 línea, aparece en el grid)
   * **Descripción completa** (detalles, ingredientes, instrucciones)
   * **Precio**
   * **Precio oferta** (opcional — aparece como "OFERTA")
   * **Stock** (número de unidades)
   * **SKU** (opcional)
   * **Categoría** (free text, ej. "Skincare", "Maquillaje")
   * **Fotos** — hasta 6, drag-to-reorder, primera es la principal
   * **Activo** / **Visible al público**

## Catálogo público

Tu link público es:

```
https://cliente.impulsapr.com/c/[tu-slug]
```

Donde `[tu-slug]` lo defines en Settings → Catálogo Público.

### Lo que ven tus clientes

* Header con tu logo y nombre
* Grid de productos con fotos
* Filtros por categoría
* Búsqueda
* Click en producto → carousel de fotos + descripción + botón **"Pedir info por WhatsApp"** que abre WhatsApp con mensaje pre-llenado

## Toggle activo / visible

* **Activo** — producto sigue existiendo internamente. Si está inactivo, no aparece nunca.
* **Visible al público** — aparece o no en el catálogo público (pero sigue activo internamente).

> Útil para productos descontinuados temporalmente, productos exclusivos para clientes existentes, etc.

## Stock 0

Si un producto está activo + visible pero stock = 0:

* Aparece en el catálogo con overlay **"SIN STOCK"**
* No es clickeable
* Las personas pueden ver que existe pero no pedirlo

## Categorías

Free text por ahora — el sistema agrupa los productos que comparten categoría. Si tipeas "Skincare" en 3 productos, los tres salen agrupados en el filtro.

## Multi-foto + reordenar

* Subes hasta 6 fotos por producto
* La primera es la **principal** (la que se ve en el grid)
* Las demás aparecen en el carousel del modal
* Puedes reordenar arrastrando

## Eliminar

⚠️ Borra el producto **y sus fotos** del bucket de storage. Es irreversible.

> Alternativa: marcarlo como inactivo en lugar de borrar. Mantiene el histórico.

## Activar el catálogo público

Ve a **Settings → Catálogo Público**:

1. Define tu **slug** (ej. `mistore`)
2. Activa el toggle "Catálogo público activo"
3. (Opcional) Agrega descripción corta para el header

Tu link queda live: `cliente.impulsapr.com/c/mistore`

## Compartir el link

* WhatsApp ("Mira mi catálogo: ...")
* Bio de Instagram (link)
* QR code para imprimir y poner en tu local
* Email firma

## Stripe Checkout (próximamente)

Hoy el catálogo es **vitrina** — los clientes piden info por WhatsApp y tú procesas el pago. Próximamente: botón "Comprar ahora" con Stripe directo en el catálogo.

## Diferencia con Inventario

* **Productos** = catálogo público para vender
* **Inventario** = stock interno (ej. consumibles, suministros)

Algunos negocios usan ambos (estética: productos para venta + inventario de pigmentos/agujas). Otros solo uno.

Ver [Inventario](inventario.md).
