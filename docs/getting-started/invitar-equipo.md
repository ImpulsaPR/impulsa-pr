# Invitar a tu equipo

Si tienes staff que también atiende clientes (recepcionistas, estilistas, asistentes), pueden tener su propio login con permisos específicos.

## Roles disponibles

| Rol | Permisos |
|---|---|
| **Owner** (tú) | Todo, incluido borrar la cuenta. Solo hay 1. |
| **Admin** | Todo lo que hace el owner, excepto borrar la cuenta. Puede invitar a otros. |
| **Recepcionista** | Ver/crear citas, leads, clientes. NO toca settings, pagos, ni equipo. |
| **Estilista** | Ve solo SUS citas asignadas, marca completadas, agrega notas. |
| **Staff** | Solo lectura. Útil para asistentes que necesitan ver agenda pero no editar. |

## Cómo invitar

1. Ve a **Equipo** en el sidebar
2. Click **"Invitar miembro"**
3. Llena:
   * Nombre completo
   * Email (recibirá la invitación)
   * Rol
4. Click **"Enviar invitación"**

## Lo que recibe el invitado

Le llega un email branded de Impulsa PR con asunto:

> **Te invitaron a unirte a [tu negocio]**

Hace clic en **"Aceptar invitación"**, crea su contraseña y entra al dashboard con los permisos que le diste.

> El link expira en **7 días**. Si no lo usa a tiempo, mándale otra invitación.

## Cambiar rol o desactivar

En la lista de equipo:

* **Cambiar rol**: dropdown al lado del nombre
* **Desactivar**: el usuario sigue existiendo pero no puede entrar (útil si alguien renuncia y quieres conservar su historial)
* **Eliminar**: lo borra permanentemente

> Solo el **owner** puede modificar/eliminar staff. Esto previene que un Admin se promueva a sí mismo o borre al owner.

## Asignar citas a estilistas

Si tienes varios estilistas/profesionales, puedes asignarles citas específicas:

1. Al crear/editar una cita en `/calendar`, hay un campo **"Asignado a"**
2. Si el rol del staff es **estilista**, solo verá las citas asignadas a él/ella

## Comisiones por estilista

Si tu industria usa comisiones (salones, barberías), ver [Comisiones por estilista](../operaciones/equipo.md#comisiones-por-estilista).

## Buenas prácticas

* **Comparte solo la mínima permisividad necesaria** — un recepcionista no necesita acceso a Stripe ni Settings
* **Revoca acceso inmediatamente** cuando alguien renuncia (sin esperar)
* **Revisa el equipo cada cierto tiempo** — si hay nombres que ya no recuerdas, desactívalos por seguridad

## Auditoría

Cada acción importante (crear cita, mover lead, editar cliente) queda registrada con quién la hizo. Si algo se rompe, podemos ver quién tocó qué y cuándo.

## ¿Y si alguien del equipo se va?

1. Cambiar su rol a **Staff** (solo lectura) o **desactivarlo** inmediatamente
2. Cambiar las contraseñas de cuentas compartidas (si las hay)
3. Si tenía acceso a tu Google Calendar como editor, revisa permisos en Google
