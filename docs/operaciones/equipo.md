# Equipo y roles

Maneja a tus staff, sus permisos y (en algunos nichos) sus comisiones.

## Roles

Ver detalle de qué puede hacer cada rol en [Invitar a tu equipo](../getting-started/invitar-equipo.md).

| Rol | Acceso |
|---|---|
| Owner | Todo |
| Admin | Casi todo (excepto borrar la cuenta) |
| Recepcionista | Citas, leads, clientes. NO settings ni pagos |
| Estilista | Solo SUS citas asignadas |
| Staff | Solo lectura |

## Lista del equipo

En `/equipo` ves:

* Owner (tú) — siempre primero
* Cada miembro con: nombre, email, rol, status (activo/desactivado/pendiente)
* Acciones: cambiar rol, desactivar, eliminar

## Comisiones por estilista

> Disponible en nichos: salones, barberías, spa, estética cuando aplica.

### Configuración

Por cada estilista puedes definir:

* **% de comisión sobre servicios**
* **% de comisión sobre productos vendidos**
* **Sueldo base** (opcional)

### Reportes

Al final del mes, en `/equipo/[id]` ves:

* Citas atendidas
* Servicios brindados con monto
* Productos vendidos
* **Comisión calculada** (esa es la cifra que le pagas)

> Útil para liquidar nóminas. Lo puedes exportar a CSV.

## Asignar citas a estilistas

* Al crear una cita, eliges quién atiende
* Si el estilista tiene su Google Calendar conectado, el evento le aparece a él/ella
* Cada estilista solo ve SUS propias citas (rol estilista)

## Pendientes / invitaciones

Si invitaste a alguien y no aceptó todavía, aparece como **"Pendiente"**. Puedes:

* Reenviar invitación
* Cambiar el email si te equivocaste
* Cancelar (borra la invitación)

## Auditoría

Cada acción importante queda registrada. Si algo se rompe, vamos al log y vemos quién tocó qué.

## Mejores prácticas

* Mínimo permiso necesario
* Revoca acceso inmediatamente cuando alguien renuncia
* Revisa el equipo cada cierto tiempo — borra cuentas viejas
* No compartas un mismo login entre 2 personas — cada quien el suyo
