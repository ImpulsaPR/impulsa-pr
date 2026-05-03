# Configuración del bot

El cerebro de tu agente IA — aquí ajustas cómo se comporta.

## Lo que configuras

### 1. Identidad

* **Nombre del agente** (ej. "Sofi", "Quasar", "Carlos")
* **Personalidad** (descriptivo: "cálida y profesional", "directa y eficiente", "amigable y cercana")
* **Idioma principal** (ES / EN)

### 2. Negocio

* **Nombre del negocio**
* **Descripción corta**
* **Ubicación** (dirección)
* **Contacto del dueño** (para escalación)

### 3. Servicios

Lista de servicios con:

* Nombre
* Duración (minutos)
* Precio
* Descripción
* (Opcional) Visible en booking público

> El industry pack pre-llena esto. Edítalo según tu negocio real.

### 4. Horarios

* Días que atiendes (Lun-Dom)
* Hora apertura / cierre por día
* Zona horaria (default: America/Puerto_Rico)
* Mensaje fuera de horario ("Estamos cerrados, abrimos lunes 9am")

### 5. Reglas críticas

Ajustes que afectan el comportamiento del bot:

* **Anticipación mínima** para agendar (ej. 2h)
* **Anticipación máxima** (ej. 60 días)
* **Buffer entre citas**
* **Política de cancelación** (texto que el bot comunica)
* **Política de depósito** (si aplica)
* **Métodos de pago aceptados**

### 6. Flujos especiales

Para nichos médicos/sensibles:

* "Si mencionan dolor 8/10+ → escalar urgente"
* "Si mencionan suicidio → derivar a Línea PAS 1-800-981-0023"
* "Para emergencias veterinarias → escalar inmediato"

> Estos flujos vienen pre-configurados según tu industry pack.

### 7. Prompt avanzado

Para usuarios técnicos: editar directo el system prompt del bot.

> ⚠️ Editar mal el prompt puede romper el bot. Si no estás seguro, déjalo y contáctanos.

## Probar cambios

Después de cualquier ajuste, **prueba el bot** mandándote a ti mismo un mensaje de WhatsApp para confirmar que se comporta como esperas.

## Versionado

Cada cambio queda registrado con timestamp y autor. Puedes revertir a versión anterior si algo se rompe.

## Múltiples agentes (multi-rol, plan Business)

En plan Business puedes tener varios agentes especializados:

* Agente de Ventas (atiende leads, agenda demos)
* Agente de Soporte (resuelve dudas post-venta)
* Agente Admin (manejo de pagos, facturación)

Cada uno con su prompt, idioma, identidad. El sistema enruta el mensaje al agente correcto.
