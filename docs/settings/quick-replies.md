# Quick Replies

Plantillas de mensajes que **TÚ** usas al responder en chat (no el bot — eso son las KB/prompt).

## Para qué sirven

Cuando tomas control de una conversación o respondes desde `/conversations`, las quick replies son atajos para mensajes que mandas seguido:

* "Confirmación de cita"
* "Política de cancelación"
* "Métodos de pago"
* "Horario de atención"
* "Agradecimiento post-servicio"

> Te ahorra escribir lo mismo 50 veces al día.

## Crear una quick reply

Settings → Quick Replies → "Nueva":

1. **Nombre** (interno, ej. "Confirmacion cita")
2. **Mensaje** (con placeholders opcionales)
3. **Categoría** (opcional, para organizar si tienes muchas)

## Variables disponibles

* `{{nombre}}` — nombre del cliente
* `{{servicio}}` — servicio agendado
* `{{fecha}}` — fecha de la cita
* `{{hora}}` — hora de la cita

## Usar quick replies

En cualquier conversación abierta:

* Click en el icono de plantilla (rayo) sobre el input
* Selecciona la quick reply
* Se inserta en el chat con variables ya reemplazadas
* Puedes editar antes de enviar (o enviar directo)

## Ejemplos prácticos

### Confirmación de cita
```
¡Hola {{nombre}}! Confirmamos tu cita el {{fecha}} a las {{hora}} para {{servicio}}. ¡Nos vemos! 👋
```

### Política de cancelación
```
Hola {{nombre}}. Te recordamos:
✅ Cancelaciones con 24h+ → reagendamos sin cargo
⚠️ Menos de 24h → cargo del 50%
❌ No-show → cargo del 100%

Esto nos ayuda a respetar a otras clientas. ¡Gracias! 💕
```

### Métodos de pago
```
{{nombre}}, aceptamos:
💳 Tarjeta (Stripe)
💰 ATH Móvil Business
🏦 Transferencia
💵 Efectivo

Para servicios mayores a $500 pedimos 50% adelantado.
```

## Industry pack pre-llena

Cada pack viene con 3-5 quick replies típicas. Edítalas y agrega más.

## Quick replies vs Knowledge Base vs Bot Prompt

| Quick Replies | KB | Bot Prompt |
|---|---|---|
| TÚ las usas manual | Bot busca y responde solo | Bot consulta para cada respuesta |
| Plantillas de respuesta | Pares Q&A | Reglas de comportamiento |
| Click → enviar | Búsqueda semántica | System prompt completo |
| Por conversación | Por pregunta | Global del bot |

> Las **quick replies** son tu herramienta para cuando tomas el control. La **KB** y el **prompt** son lo que usa el bot solito.
