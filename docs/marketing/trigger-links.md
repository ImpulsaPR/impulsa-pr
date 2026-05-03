# Trigger Links

Links **inteligentes** que cuando alguien los abre, automáticamente:

* Crean un lead con un tag específico
* Lo enrolan a una campaña
* Disparan un mensaje pre-configurado
* Track la fuente del lead

## Casos de uso

* **QR en mostrador**: cuando alguien lo escanea, se enrola a tu drip de bienvenida
* **Link en bio Instagram**: tag "Lead Instagram" automático
* **Anuncios de FB ads**: tag por campaña, así sabes qué ad funciona
* **Link en tarjeta de presentación**: tag "Networking"
* **Link en email firma**: tag "Email outbound"

## Crear un trigger link

Ve a `/trigger-links`:

1. **Nombre interno** (ej. "QR mostrador estética")
2. **Tags a aplicar** al lead que llega (ej. "qr-mostrador", "lead-walkin")
3. **Action** al abrir:
   * Solo crear lead con tags
   * Crear lead + enrolar a campaña
   * Crear lead + abrir WhatsApp con mensaje pre-llenado
4. **Mensaje pre-llenado** (si aplica)

Sistema te genera URL única tipo:

```
cliente.impulsapr.com/r/[id]
```

## Trackear performance

Por cada link ves:

* Visitas totales
* Conversiones (cuántos se hicieron lead)
* Tasa de conversión
* Lifetime value de los leads que entraron por ahí

> Útil para saber qué canal de marketing funciona MEJOR.

## Combinar con redirects

El link puede redirigir después de capturar al lead:

* A WhatsApp (con mensaje pre-llenado)
* A tu booking público
* A tu catálogo público
* A una landing externa

## Ejemplo completo

**Escenario**: Posters en cafeterías con QR.

1. Creas trigger link "QR cafetería":
   * Tags: `qr-cafe`, `walkin-potencial`
   * Action: crear lead + abrir WhatsApp con mensaje "Vi tu poster en la cafetería..."
2. Imprimes 50 QRs y los pegas
3. Una persona escanea → se crea lead con tag → se abre WhatsApp con mensaje pre-llenado → cliente envía → bot responde y agenda cita

Ahora sabes que esos QRs trajeron 23 leads y 4 cerraron cita = ROI medible.
