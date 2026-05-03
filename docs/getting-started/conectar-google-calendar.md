# Conectar Google Calendar

Si manejas citas, este paso es esencial. El bot agendará usando TU Google Calendar real.

## Beneficios de conectarlo

* **El bot ve tu disponibilidad real** — no agenda en horarios ocupados
* **Las citas creadas por el bot aparecen en tu Google Calendar** — recibes invitaciones, recordatorios
* **Tu equipo puede ver las citas** desde sus propios celulares (Calendar app)
* **Buffer entre citas** configurable (ej. 30 min entre cita y cita)
* **Bloqueos** que pongas en Calendar (vacaciones, almuerzo) son respetados por el bot

## Cómo conectarlo

### Paso 1: ir a Settings

Dashboard → **Settings** → sección **"Google Calendar"**.

### Paso 2: hacer clic en "Conectar Google Calendar"

Te redirige al consentimiento OAuth de Google. **Inicia sesión con la cuenta donde tienes el calendario que quieres usar** (puede ser personal o de empresa).

### Paso 3: aprobar permisos

Google te pedirá autorizar:

* ✅ Ver y editar tu calendario
* ✅ Crear, mover y borrar eventos

**No te pedimos** acceso a Gmail, Drive ni nada más.

### Paso 4: elegir el calendario

Si tienes múltiples calendarios en esa cuenta (personal + trabajo), elige cuál es **el calendario de citas del negocio**.

> Recomendamos un calendario dedicado solo para citas de clientes — así no se mezcla con eventos personales.

### Paso 5: configurar buffer y horario

* **Buffer entre citas**: tiempo mínimo entre una cita y la siguiente (ej. 15 min para esterilización en estética, 30 min en restaurante para limpiar mesa)
* **Horario de atención**: días y horas en que el bot puede agendar
* **Anticipación mínima**: cuánto antes debe pedirse una cita (ej. mínimo 2h antes)
* **Anticipación máxima**: cuánto tiempo en el futuro puede agendar (ej. máximo 60 días)

## ¿Cómo se ven las citas en mi Calendar?

Cada cita creada por el bot tiene:

* **Título**: "Nombre Cliente — Servicio"
* **Descripción**: detalles del cliente, teléfono, notas
* **Invitado**: el cliente final (recibe email de confirmación si dio email)
* **Recordatorio**: 24h y 1h antes (configurable)

## ¿Y si el cliente cancela o reagenda?

* **Cancelación**: el evento se borra de tu Calendar y aparece como "cancelada" en `/calendar` del dashboard
* **Reagenda**: el evento se mueve a la nueva fecha/hora
* **Sync bidireccional**: si TÚ borras o mueves un evento desde Google Calendar manualmente, el dashboard se entera en máximo 5 minutos

## Múltiples calendarios (multi-staff)

Si tienes equipo y cada quien maneja sus propias citas:

1. Conecta el calendario **principal** del negocio
2. Invita a tu equipo (ver [Invitar a tu equipo](invitar-equipo.md))
3. Cada estilista puede tener su propio calendario asignado en `Settings`

## Próximo paso

Continúa con [Conectar Stripe →](conectar-stripe.md) si vas a cobrar online.
