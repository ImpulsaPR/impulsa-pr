# Recetas digitales

> **Activo en**: Médico General.

Crea **recetas digitales imprimibles** desde el dashboard. Cada paciente acumula su historial completo.

## Crear una receta

1. Ve a `/recetas` → **"+ Nueva receta"**
2. Llena:
   * **Paciente**: nombre + teléfono + edad
   * **Fecha** (default: hoy)
   * **Diagnóstico** (texto libre)
   * **Medicamentos**: lista, cada uno con:
     * Nombre del medicamento
     * Dosis (ej. 500mg)
     * Frecuencia (ej. cada 8h)
     * Duración (ej. 7 días)
   * **Indicaciones generales** (reposo, hidratación, evitar X)
   * **Próxima visita** (fecha, opcional)
   * **Firmado por** (nombre del médico + número de licencia)

## Imprimir / compartir

Botón **"Imprimir"** en cada receta:

* Abre versión limpia formateada
* Lista para imprimir o guardar como PDF
* Tiene tu logo + datos del consultorio + firma del médico

> El paciente puede recibirla por WhatsApp como PDF o impresa en la consulta.

## Historial por paciente

En la ficha del paciente (en `/clientes`) hay tab **"Recetas"** con todo su historial.

> Útil para ver qué le has recetado antes y evitar duplicados o interacciones medicamentosas.

## Filtros

* Por paciente
* Por estado (activa / archivada)
* Por fecha
* Por medicamento (busca en todas las recetas si recetaste X cosa)

## Privacidad

* RLS estricto — solo tú/staff médico ve las recetas
* Encrypted at rest (AES-256 disco Supabase)
* Las recetas no se comparten por WhatsApp automáticamente — tú decides

## Eliminar / archivar

Recetas viejas se pueden archivar (mantienen histórico) o borrar (irreversible).

> Para auditoría legal: recomendamos archivar, no borrar.

## Próximamente

* Firma digital con e-signature
* Generación de PDF profesional con QR de validación
* Integración con farmacias para auto-envío
