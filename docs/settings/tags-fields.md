# Tags y campos personalizados

Personaliza qué info adicional capturas de tus leads y clientes.

## Tags

Etiquetas de texto que aplicas a leads/clientes. Útil para segmentar.

### Ejemplos

* `vip`, `referido`, `promo-mayo`, `tiene-mascota`, `embarazada`, `cabello-virgen`, `lead-instagram`

### Crear / editar

Settings → Tags → "Nuevo tag":

* Nombre
* Color (visual)
* Descripción interna (opcional)

### Aplicar tags

* Manualmente desde la ficha del lead/cliente
* Bulk en `/leads` (selecciona varios y aplica)
* **Automáticamente por el bot** (si configuras el prompt para que aplique tags según señales)
* Vía Trigger Links (lead que entra por X link recibe tag automático)

### Filtrar por tag

Cualquier tabla del dashboard permite filtrar por tags.

## Custom fields

Campos personalizados que aparecen en la ficha de leads/clientes.

### Ejemplos por nicho

* **Estética**: tipo de piel, embarazo, alergias a pigmentos
* **Veterinaria**: especie, raza, peso, vacunas al día
* **Inmobiliaria**: presupuesto, financiamiento aprobado, tipo de propiedad buscada
* **Restaurante**: alergia alimentaria, mesa preferida, ocasión especial
* **Educación**: grado del estudiante, materia, escuela actual

### Tipos de campo

* **Text** (free text)
* **Textarea** (multi-línea)
* **Number**
* **Select** (dropdown con opciones predefinidas)
* **Multi-select** (varias opciones a la vez)
* **Date**
* **Checkbox** (sí/no)
* **Phone** (con validación)
* **Email** (con validación)
* **URL**

### Crear custom field

Settings → Custom Fields → "Nuevo campo":

1. **Key** (nombre interno, sin espacios — ej. `tipo_piel`)
2. **Label** (cómo se ve en UI — ej. "Tipo de piel")
3. **Tipo de campo**
4. **Opciones** (si es select/multi-select)
5. **Required** (sí/no)
6. **Posición** en el formulario

### Industry pack pre-llena

Al aplicar tu pack, llegan custom fields típicos de tu nicho. Edítalos según tu necesidad real.

### Acceso desde el bot

El bot puede:

* **Leer** el custom field para personalizar respuestas (ej. "Veo que tu última micropigmentación fue hace 2 años, ¿te interesa retoque?")
* **Escribir** custom fields cuando captura info en conversación

> Ej: si cliente dice "soy diabético", el bot guarda automáticamente en `condiciones_medicas`.

## Diferencia entre tags y custom fields

| Tags | Custom fields |
|---|---|
| Sí/no — está aplicado o no | Tienen valor (texto, número, fecha) |
| Para categorizar / filtrar | Para guardar info específica |
| Multi-aplicación (varios tags a la vez) | Generalmente 1 valor por campo |
| Visuales (colores) | Estructurales |

> Buena práctica: usa **tags** para segmentación y filtros; **custom fields** para datos específicos del cliente.
