# Mesas (restaurante)

> **Activo en**: Restaurante.

Configura tus **mesas físicas** para asociarlas con reservaciones.

## Crear una mesa

1. Ve a `/mesas` → **"+ Nueva mesa"**
2. Llena:
   * **Número** (1, 2, A1, "Terraza 1") — debe ser único
   * **Capacidad** (cuántas personas caben)
   * **Ubicación** (Salón principal, Terraza, Bar, Privado)
   * **Notas** (opcional — ej. "junto a la ventana", "ruidosa")
   * **Activa** — si está disponible para reservas

## Stats

* **Total mesas**
* **Activas**
* **Capacidad total** (suma de todas las mesas activas)

## Reservar una mesa

Cuando alguien reserva:

* Vía bot WhatsApp ("queremos una mesa para 4 el viernes a las 8pm") → el bot busca mesa que cumpla y reserva
* Manualmente desde `/calendar` — al crear cita asocias mesa específica

## Mesas inactivas

Si una mesa está en mantenimiento o reservada para evento privado:

* Marca como **inactiva**
* El bot no la ofrece
* Cuando vuelva a estar lista, marca activa

## Buscar mesa libre

El bot busca mesa así:

1. Filtra por capacidad ≥ # personas solicitadas
2. Filtra mesas activas
3. Filtra mesas sin otra reserva en ese horario
4. Devuelve la primera disponible

## Asignación manual

Si quieres reservar una mesa específica (ej. "la mejor de la terraza para esta pareja"):

* Al crear la cita en `/calendar` eliges la mesa explícitamente
* Asegúrate de que el cliente la reciba (puedes mandar foto de la mesa por WhatsApp)

## Próximamente

* Layout visual del restaurante (drag-and-drop)
* Bloqueos de mesas por evento
* Reportes: mesas más usadas, capacidad usada, horarios pico
