# Clientes

Un **cliente** es alguien que ya tiene **historia clínica** o **al menos una cita** confirmada contigo. Es decir, leads que ya cerraste.

## Diferencia con Leads

| Leads | Clientes |
|---|---|
| Personas que escribieron una vez por WhatsApp | Personas que ya son clientes pagantes |
| Sin historia ni citas | Con historia, citas pasadas o activas |
| El bot los maneja a casi todos | Tú/tu equipo los manejan más cercano |
| Se descalifican si no responden en X días | Se mantienen aunque no hablen |

## Crear un cliente

### Desde un lead existente (recomendado)

1. Ve al lead en `/leads`
2. Botón **"Promover a cliente"**
3. El sistema te lleva al wizard de crear ficha

### Manualmente

1. Ve a `/clientes`
2. Click **"+ Nuevo cliente"** (te lleva a `/clientes/nuevo`)
3. Tienes 2 opciones:
   * **Desde prospecto**: busca uno de tus leads existentes y promuévelo
   * **Manual**: llena el formulario (nombre, teléfono, email, etc.)

> El sistema **previene duplicados** por teléfono — si ya existe alguien con ese número, te avisa.

## Ficha del cliente

Click en cualquier cliente abre su ficha completa con tabs:

### Tab "Info general"

* Datos personales
* Tags y custom fields
* Notas privadas (solo tú)
* Métodos de contacto preferidos

### Tab "Historia clínica" (si tu nicho es clínico)

Activo automáticamente para nichos: estética, dental, médico, psicología, veterinaria, salones, tatuajes.

* Alergias
* Condiciones médicas
* Medicamentos actuales
* Tratamientos previos
* Documentos adjuntos (radiografías, PDFs)

Ver [Historia Clínica](../nichos/historia-clinica.md).

### Tab "Citas"

* Citas pasadas (con servicios y montos)
* Citas próximas
* Botón rápido para agendar nueva

### Tab "Galería" (si tu nicho lo permite)

Para estética, dental, tatuajes — fotos antes/después con consentimiento documentado. Ver [Portafolio](../nichos/portafolio.md).

### Tab "Pagos"

Historial de transacciones del cliente:

* Depósitos pagados
* Servicios completos
* Productos comprados del catálogo

### Tab "Conversaciones"

Historial completo de WhatsApp con este cliente. Mismo contenido que en `/conversations` pero filtrado a solo este número.

## Stats del cliente

Cada ficha tiene métricas en el header:

* **Total gastado** (lifetime value)
* **# de citas completadas**
* **Última visita** (hace cuánto)
* **Próxima cita** (si hay)
* **NPS** (si configuraste reviews) — Net Promoter Score

## Filtros y búsqueda

* **Buscar** por nombre, teléfono, email
* **Filtrar** por:
  * Tags
  * Tiene historia clínica / no
  * Última visita (>30, >60, >90 días)
  * Total gastado (>$X)
  * Tiene cita próxima

## Clientes que necesitan atención

Hay un filtro especial **"Necesita atención"** que muestra:

* Clientes que no han venido en >60 días
* Clientes con cita cancelada que no reagendaron
* Clientes con cumpleaños esta semana
* Clientes con alertas médicas (ej. alergia recién agregada)

> Útil para activar campañas de re-engagement o llamarlos personalmente.

## Eliminar un cliente

⚠️ **Borrar un cliente borra TODA su info**: historia clínica, galería, citas, conversaciones, pagos.

Esto es irreversible. Por GDPR/right-to-be-forgotten lo permitimos pero **piénsalo bien**.

> Alternativa: **desactivar** en lugar de borrar. Mantienes el histórico y puedes reactivarlo después.

## Realtime

La lista se actualiza en vivo. Si tu equipo agrega una cita o nota, lo ves al instante.
