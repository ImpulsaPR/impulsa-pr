# Mascotas (vet & pet grooming)

> **Activo en**: Veterinaria, Pet Grooming.

Maneja **multi-mascota por dueño** con historial individual, vacunas, condiciones médicas y todo.

## Por qué importa

Un dueño típico tiene 1-3 mascotas. Cada una con su raza, edad, peso, vacunas distintas. Manejar esto en una sola "ficha de cliente" es un desastre.

Aquí cada mascota tiene su propia ficha, **agrupadas por dueño**.

## Crear una mascota

1. Ve a `/mascotas` → **"+ Nueva mascota"**
2. Llena:
   * **Datos del dueño**: teléfono (clave única), nombre
   * **Datos de la mascota**:
     * Nombre
     * Especie (perro/gato/ave/conejo/reptil/otro)
     * Raza
     * Color
     * Fecha de nacimiento
     * Peso
     * Microchip
     * Esterilizado (sí/no)
   * **Vacunas** (lista, ver abajo)
   * **Alergias**
   * **Condiciones médicas conocidas**
   * **Notas**

## Multi-mascota por dueño

Las mascotas se **agrupan automáticamente** por teléfono del dueño. Si registras "Firulais" y "Pelusa" con el mismo teléfono, ves:

```
📞 +1 (787) 555-1234 — Carmen Ríos · 2 mascotas
   🐶 Firulais (Labrador, 4 años)
   🐱 Pelusa (Persa, 2 años)
```

## Tracking de vacunas

Por cada vacuna registras:

* **Nombre** (Triple, Antirrábica, Bordetella, etc.)
* **Fecha aplicada**
* **Fecha de vencimiento** (opcional pero recomendado)

Si la fecha de vencimiento se acerca:

* La mascota aparece **resaltada**
* Aparece notificación push 30 días antes del vencimiento
* El bot puede recordarle al dueño cuando agenda

## Stats

* **Total mascotas**
* **Activas**
* **🐶 Perros / 🐱 Gatos / etc**
* **Dueños únicos**

## Búsqueda

Búsqueda fuzzy por:

* Nombre de la mascota ("firulais")
* Nombre del dueño ("carmen")
* Teléfono del dueño ("787")

## Vinculación con citas

Al crear una cita en `/calendar`, puedes asociarla a una mascota específica. Útil cuando tienes una clienta con 2 perros y quieres saber a cuál de los dos atendiste el martes.

## Eliminar

Borra la mascota (no al dueño). Si era la única mascota del dueño, queda como "dueño sin mascotas activas" — no se borra al dueño.

## Diferencia entre vet y pet grooming

| Veterinaria | Pet Grooming |
|---|---|
| Historia clínica completa | Historia de grooming (cortes pasados) |
| Vacunas críticas | Vacunas requeridas para entrar al salón |
| Tratamientos médicos | Estilo de corte preferido |
| Recordatorios de revacunación | Recordatorios de baño/corte cada N semanas |
