# Clases recurrentes

> **Activo en**: Fitness, Educación.

Para clases que se **repiten cada semana** — yoga lunes y miércoles, spinning martes y jueves, matemáticas 9no grado los sábados, etc.

## Diferencia con citas

* **Cita** = un solo evento, un cliente específico, una hora específica
* **Clase recurrente** = se repite todos los X-días, varios alumnos inscritos, mismo horario semanal

Si manejas clases grupales recurrentes, usas esta sección. Las citas individuales 1-a-1 siguen yendo a `/calendar`.

## Crear una clase

1. Ve a `/clases` → **"+ Nueva clase"**
2. Llena:
   * **Nombre** (ej. "Yoga Vinyasa", "Matemáticas 9no")
   * **Instructor**
   * **Descripción**
   * **Días de la semana** (toggle Lun-Dom)
   * **Hora de inicio**
   * **Duración** (en minutos)
   * **Capacidad máxima** (cuántos alumnos caben)
   * **Precio por clase**
   * **Fecha inicio / fecha fin** (opcional — si la clase es por temporada)
   * **Color** (para que se distinga visualmente)

## Ejemplo

* **Yoga Vinyasa**
* Instructor: María
* Días: Lunes, Miércoles, Viernes
* Hora: 6:00pm
* Duración: 60 min
* Capacidad: 12 personas
* Precio: $20/clase

> Esto crea entradas recurrentes que se mantienen mientras la clase esté activa.

## Inscribir alumnos

Por cada clase puedes inscribir alumnos individuales:

1. Click en la clase → tab **"Inscritos"**
2. Click "Inscribir alumno"
3. Llena teléfono + nombre

Cada inscripción tiene:

* Fecha de inicio
* Fecha de baja (si dejó la clase)
* # de asistencias

## Capacidad y cupos

* Si la clase tiene cupos llenos, el bot **NO acepta** más inscripciones
* Vas a `/clases` y ves "8/12 inscritos" para saber el estado

## Activar / desactivar

* **Inactiva**: la clase ya no acepta inscripciones nuevas (pero los inscritos siguen)
* Útil para temporadas (ej. clase de verano que termina en agosto)

## Asistencia

Próximamente: marcar asistencia por sesión para tracking individual de cada alumno.

## Pagos

Cada inscripción puede tener su propio plan de cobro:

* Pago semanal automático
* Paquete prepago (10 clases por X)
* Membresía mensual

Configura desde la ficha del alumno.

## Reportes

* Clases más populares
* Inscripciones por mes
* Asistencia promedio
* Revenue por clase
