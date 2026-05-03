# Casos legales

> **Activo en**: Legal / Bufete.

Manejo de **casos múltiples por cliente**, áreas legales, tribunales, vencimientos críticos y **horas facturables**.

## Por qué importa

Un cliente puede tener varios casos abiertos (divorcio + caso laboral + sucesión). Cada uno con su tribunal, número, vencimientos y honorarios distintos. El sistema separa todo para que no se mezcle.

## Crear un caso

1. Ve a `/casos` → **"+ Nuevo caso"**
2. Llena:
   * **Título** (ej. "Demanda laboral - Pérez vs ABC Inc")
   * **Cliente**: nombre + teléfono
   * **Área legal**: civil, penal, laboral, familiar, corporativo, inmigración, inmobiliario, sucesiones
   * **Estado**: abierto, en proceso, esperando corte, cerrado, archivado
   * **Número de caso**, **tribunal**, **parte contraria**
   * **Fecha apertura**, **fecha vencimiento**, **fecha cierre**
   * **Tipo de honorarios**: por hora / flat fee / contingente / retainer mensual
   * **Monto honorarios**
   * **Horas trabajadas** (incrementable en cada actualización)
   * **Notas del caso**

## Tracking de horas billables

Cada vez que trabajas en un caso:

* Edita el caso → suma horas
* Sistema calcula: horas × tarifa

> Próximamente: timer integrado para registrar horas en tiempo real.

## Vencimientos críticos

Si un caso tiene **fecha de vencimiento** próxima (≤7 días):

* Aparece **resaltado** con icono de alerta
* Stats arriba muestra "Vencen en 7 días"
* Notificación push antes del vencimiento

## Stats

* **Total casos**
* **Abiertos**
* **Cerrados**
* **Vencen 7 días**
* **Horas totales** trabajadas

## Filtros y búsqueda

* Por estado
* Por área legal
* Por cliente
* Por número de caso
* Búsqueda fuzzy en título

## Confidencialidad

* Acceso restringido por RLS — solo tú/admin del bufete ven estos datos
* Document storage de archivos asociados es **encriptado**
* El bot **NUNCA discute detalles de casos por WhatsApp** — solo coordina citas

## Métodos de honorarios

| Tipo | Cuándo se usa |
|---|---|
| Por hora | Cobro por tiempo real trabajado |
| Flat fee | Tarifa fija por servicio (testamento, contrato) |
| Contingente | Cobro % solo si ganas el caso (típico en daños y perjuicios) |
| Retainer mensual | Cuota mensual recurrente para clientes que necesitan asesoría continua |

## Reportes

* Casos cerrados últimos 90 días
* Honorarios facturados
* Casos por área (gráfica)
* Horas por cliente

## Eliminar

Borrar un caso es **irreversible**. Considera archivarlo en lugar de borrar — mantienes el histórico.
