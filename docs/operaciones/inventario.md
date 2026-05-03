# Inventario interno

Para llevar control de **stock interno** — consumibles, suministros, ingredientes — que NO necesariamente vendes al público pero usas en tu operación.

## Ejemplos por nicho

* **Estética**: pigmentos, agujas, anestésicos, gasas
* **Salón**: tintes profesionales, mascarillas, queratina
* **Restaurante**: ingredientes (harina, aceite, especias)
* **Veterinaria**: vacunas, medicamentos, gasas
* **Taller mecánico**: aceites, filtros, repuestos

## Crear un item

1. Ve a `/inventario` → **"+ Nuevo item"**
2. Llena:
   * **Nombre**
   * **SKU / Código** (opcional)
   * **Categoría** (ej. "Pigmentos", "Agujas")
   * **Cantidad actual**
   * **Cantidad mínima** (alerta de stock bajo)
   * **Unidad** (unidad, ml, g, paquete)
   * **Costo por unidad**
   * **Proveedor**
   * **Última compra**
   * **Notas**

## Ajustar stock

Botones **+** y **−** en la fila te permiten subir o bajar la cantidad rápido.

> Cuando agregas (compras), el sistema actualiza "Última compra" automáticamente.

## Alertas de stock bajo

Si `cantidad_actual ≤ cantidad_mínima` y la mínima es > 0:

* El item aparece **resaltado en amarillo**
* Aparece un badge en la home ("3 items en alerta")
* Push notification (si están activadas)

## Stats

* **Items totales**
* **En alerta** (stock bajo)
* **Valor del inventario** (suma de cantidad × costo)
* **Categorías**

## Diferencia con Productos

| Productos | Inventario |
|---|---|
| Catálogo público para vender | Stock interno operacional |
| Tienen fotos, descripción, link público | Solo internamente |
| Visibles a clientes finales | Solo tú/equipo |

> Algunos productos son ambos (ej. una crema que vendes en el catálogo y también usas en tratamientos). En ese caso lo registras en ambos lugares.

## Auditoría

Cada cambio de stock queda registrado con:

* Quién lo hizo (qué staff)
* Cuándo
* Cantidad delta (+5, −3)

Útil para detectar mermas o errores.

## Exportar

Botón **"Exportar"** → CSV con todo tu inventario actual. Útil para auditoría externa o cambio de sistema.
