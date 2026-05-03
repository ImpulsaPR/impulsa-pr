# Preguntas frecuentes

## General

### ¿Cuánto tarda en estar listo después de pagar?

3-5 días hábiles. El proceso:

1. Setup técnico (WhatsApp + dashboard) — 1-2 días
2. Entrenamiento del bot con tu info — 1-2 días
3. Demo en vivo + ajustes — 1 día
4. Lanzamiento

### ¿Necesito tener WhatsApp Business antes?

Sí. Si no lo tienes, te ayudamos a configurarlo en el setup inicial.

### ¿Puedo cancelar cuando quiera?

Sí. Mes a mes, sin contratos largos ni penalidades. Cancelas y al final del mes en curso se desactiva.

### ¿Qué pasa con mis datos si cancelo?

Los conservamos 90 días por si vuelves. Después de eso, se eliminan permanentemente (o antes si lo pides).

## El bot

### ¿El bot habla inglés y español?

Sí. Detecta automáticamente el idioma del cliente y responde en el mismo. Si el cliente cambia de idioma a media conversación, el bot también.

### ¿Qué pasa si el bot no sabe responder algo?

Te notifica por WhatsApp para que tú respondas. La conversación queda registrada en `/aprendizaje` para que la conviertas en KB y el bot aprenda.

### ¿Puedo "tomar control" de una conversación?

Sí, en cualquier momento. Click "Tomar control" en la conversación y el bot se calla hasta que lo liberes.

### ¿El cliente final sabe que es un bot?

Por default no — el bot habla como persona. Si quieres que aclare que es IA, configurable en Settings → Bot Config.

## Citas y calendario

### ¿Qué pasa si dos clientes piden la misma hora a la vez?

Sistema usa **lock optimista**. El primero que confirma se queda con la hora. Al segundo le ofrece automáticamente alternativas.

### ¿Puedo aceptar walk-ins?

Sí. Si tu nicho usa walk-ins (ej. barbería, automotriz), el bot lo informa y agenda con tiempo estimado de espera.

### ¿Cómo manejo emergencias o cosas urgentes?

Configurado en el prompt del bot — palabras clave de urgencia (dolor, accidente, emergencia) escalan inmediato a ti vía WhatsApp con notificación push.

## Pagos

### ¿Cobran comisión por transacción?

No. Lo que cobra Stripe (~2.9% + $0.30) es de Stripe directo a Stripe — no pasa por nosotros.

### ¿El dinero va directo a mi cuenta?

Sí. Si conectas tu propia cuenta Stripe, el dinero va de tu cliente final → tu Stripe → tu banco. No somos intermediarios.

### ¿Qué pasa con reembolsos?

Los manejas tú directo desde Stripe (o desde nuestro dashboard, que llama a Stripe). El reembolso vuelve al cliente en 5-10 días hábiles.

## Equipo

### ¿Cuántos staff puedo agregar?

* Plan Starter: 1 staff
* Plan Pro: hasta 3 staff
* Plan Business: ilimitado

### ¿Cada staff puede ver TODAS las citas o solo las suyas?

Depende del rol. Estilistas ven solo sus propias citas. Admins/recepcionistas ven todas.

### Si despido a alguien, ¿cómo le quito acceso?

Settings → Equipo → Desactivar (instantáneo). El acceso se revoca al siguiente request.

## Branding

### ¿Puedo usar mi propio dominio?

Sí, en plan Business. Necesitamos config DNS de tu lado, sistema instala SSL automático.

### ¿Puedo ocultar "Powered by Impulsa PR"?

En plan Business sí. Plan Starter / Pro mantienen el badge en footer del booking público.

## Seguridad / privacidad

### ¿Mis datos están seguros?

Sí. Encryption AES-256, RLS en BD, TLS 1.3 en transit. Ver [Seguridad](https://impulsapr.com/seguridad).

### ¿Cumplen HIPAA?

No estamos certificados HIPAA, pero seguimos los principios (encryption, RLS, audit logs). Para nichos médicos serios, podemos firmar BAA específicos.

### ¿Comparten mis datos con terceros?

No. Tus datos no se comparten ni venden a nadie. Solo se procesan a través de:

* WhatsApp Business API (vía YCloud, autorizado oficial)
* Stripe (para procesar pagos)
* Resend (para email)
* OpenAI/Anthropic (para el bot, sin almacenar conversaciones)

## Soporte

### ¿Cuál es el horario de soporte?

Lunes a viernes 9am-6pm AST (Puerto Rico). Respondemos por WhatsApp típicamente en menos de 1 hora.

### ¿Puedo agendar una llamada?

Sí — en el footer de cualquier email transaccional o en la sección Soporte del dashboard, hay link para agendar 30 min con nuestro equipo.

### ¿Hay onboarding personalizado?

Sí. Plan Pro y Business incluyen 1 sesión de kickoff de 60 min. Plan Starter es self-service con docs y soporte WhatsApp.
