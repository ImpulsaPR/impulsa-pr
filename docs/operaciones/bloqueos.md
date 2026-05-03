# Bloqueos de calendario

Para que el bot **no agende** en ciertos días/horas — vacaciones, almuerzo, días festivos, etc.

## Crear un bloqueo

1. Ve a `/bloqueos`
2. Click **"Nuevo bloqueo"**
3. Llena:
   * **Tipo**: Todo el día / Rango específico
   * **Fecha desde / hasta**
   * **Motivo** (interno, opcional)

## Ejemplos

* **Vacaciones de Semana Santa**: Todo el día, 10-13 de abril
* **Almuerzo diario**: 12-1pm cada día (recurrente, próximamente)
* **Día de la madre**: Todo el día, 11 de mayo

## Comportamiento del bot

Cuando un cliente pide cita:

* Si el slot solicitado **cae dentro de un bloqueo** → el bot lo rechaza con un mensaje amable y ofrece alternativas
* Los bloqueos NO aparecen en el booking público

## Diferencia con eventos de Google Calendar

* **Bloqueo** = decisión que TÚ tomaste para no atender en ese tiempo
* **Evento de Google Calendar** = puede ser una cita real, una reunión, etc.

Ambos son respetados por el bot al ofrecer slots.

## Editar / borrar

Edita o borra cualquier bloqueo desde la lista. Los cambios se aplican inmediato — el bot deja de respetarlos.
