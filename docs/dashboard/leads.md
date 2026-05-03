# Leads

Un **lead** es cualquier persona que ha contactado tu WhatsApp por primera vez y todavía no es cliente formal. Aquí los manejas todos.

## Cómo se crean los leads

* **Automático**: cada vez que un número nuevo te escribe a WhatsApp, el bot crea un lead automáticamente
* **Manual**: puedes crear uno tú desde el botón **"+ Nuevo Lead"**
* **Importado**: puedes pegar una lista (próximamente)

## La tabla de leads

Por defecto ves estas columnas:

| Columna | Qué muestra |
|---|---|
| Nombre | Como lo registró el bot o tú |
| Teléfono | E.164 (con +) — clickeable abre WhatsApp |
| Estado | Lead nuevo, Calificado, En negociación, Cerrado, Perdido |
| Tags | Etiquetas que le pusiste (ej. "Promoción Mayo", "Re-engagement") |
| Última actividad | Hace cuánto te escribió o lo contactaste |
| Score | Calificación de "calor" del lead (1-10) |
| Acciones | WhatsApp, Editar, Borrar |

> Puedes **personalizar columnas** con el botón ⚙️ encima de la tabla.

## Filtros

Arriba de la tabla hay filtros:

* **Estado** — selecciona uno o varios
* **Tags** — filtra por etiqueta
* **Fecha de creación** — last 7 days, 30 days, custom
* **Score mínimo** — solo leads calientes
* **Sin email** / **Con email** — útil para campañas
* **Source** — de dónde vino (manual, automático, ad)

Los filtros se guardan en la URL — comparte el link con tu equipo y verán el mismo set.

## Acciones masivas (Bulk Actions)

Selecciona múltiples leads (checkboxes) y aparece la barra inferior con:

* **Mover a stage** (cambiar estado)
* **Agregar tag**
* **Quitar tag**
* **Eliminar**
* **Exportar** a CSV

> Bulk action máximo: 100 leads por operación. Para más, repítela.

## Vista detalle de un lead

Click en cualquier lead para abrir su ficha completa:

* **Info básica**: nombre, teléfono, email, tags
* **Custom fields** — los que definiste en Settings (ej. tipo de negocio, ubicación, fecha de nacimiento)
* **Conversación** — historial completo de WhatsApp con este lead
* **Notas privadas** — solo tú las ves, el bot no
* **Citas pasadas/futuras**
* **Tareas asignadas**
* **Pagos** (si hubo)

## Convertir un lead en cliente

Un lead se convierte en cliente cuando:

* Le agendas su primera cita real
* O manualmente desde la ficha → botón **"Promover a cliente"**

Ver [Clientes](clientes.md) para detalle.

## Score de leads (cómo lo calculamos)

El score 1-10 considera:

* Frecuencia de mensajes
* Tiempo de respuesta del lead
* Palabras clave usadas (precio, agendar, cuándo)
* Sentimiento general (positivo/negativo)
* Tags que aplicó el bot

Score 8+ = lead muy caliente, atiéndelo personalmente.
Score 1-3 = lead frío, en cola para drip de re-engagement.

## Realtime

La lista se actualiza en vivo. Si el bot está conversando con un lead nuevo en este momento, aparece en la lista al instante sin que tengas que recargar.

## Atajos de teclado

* `N` — crear nuevo lead
* `/` — buscar
* `J` / `K` — navegar arriba/abajo
* `Enter` — abrir lead seleccionado
