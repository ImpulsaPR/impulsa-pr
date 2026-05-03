# Solución de problemas comunes

## El bot no responde

### Verifica:

1. **Tu WhatsApp Business está activo** y no está bloqueado por Meta
2. **El bot está activado** en Settings → Bot Config (toggle "Bot activo")
3. **No has tomado control manual** de esa conversación específica
4. **El número del que te escribe NO está en silenciado**
5. **No estás fuera de horario** (si configuraste mensaje fuera de horario, ese se manda en su lugar)

### Si todo OK pero sigue sin responder:

Escríbenos al WhatsApp con:

* Tu cuenta (email)
* Número del cliente que no recibe respuesta
* Hora aproximada del último mensaje

Revisamos los logs.

## Las citas no aparecen en mi Google Calendar

### Verifica:

1. **Conexión activa** en Settings → Google Calendar (debe decir "Conectado ✓")
2. **El calendario correcto** está seleccionado (no el de Cumpleaños o uno secundario)
3. **Permisos de Google** aún válidos (a veces caducan, hay que reconectar)

### Solución:

Settings → Google Calendar → "Reconectar" → autoriza de nuevo.

## Stripe webhook no llega / cita no se confirma después de pagar

### Verifica:

1. **Webhook URL configurado** en Stripe: `https://cliente.impulsapr.com/api/webhooks/stripe`
2. **Eventos suscritos**: `checkout.session.completed`
3. **Signing secret pegado** en Settings → Stripe

### Solución:

Si pago llegó a Stripe pero cita no se confirmó:

* Manualmente en `/calendar` → marca cita como confirmada
* Avísanos para revisar logs del webhook

## Push notifications no me llegan

### iOS:

* iOS 16.4+ requerido
* App tiene que estar instalada como **PWA** desde Safari (no abrirla en pestaña)
* Permisos: Settings del iPhone → Notificaciones → Impulsa PR → todo en ON

### Android:

* Chrome / Edge / Brave permiten push directo
* Permisos: Settings del navegador → Notificaciones → permitir para `cliente.impulsapr.com`

### Desktop:

* Chrome / Edge / Brave funcionan
* Safari macOS: requiere permisos especiales (System Settings → Notifications)
* Firefox: limitado

## Los emails llegan a SPAM

### Causas comunes:

1. DMARC / SPF / DKIM no configurados en tu dominio (ver [Email](../settings/email.md))
2. Reputación nueva del dominio (mejora con uso)
3. Subjects con palabras spam-trigger ("GRATIS", "URGENTE", todo en mayúsculas)
4. HTML mal formado del email
5. Mucho ratio de imágenes vs texto

### Solución:

* Verifica DMARC/SPF/DKIM en Resend
* Pide a tus contactos que marquen como "no spam" + agreguen a contactos
* Usa subjects naturales, no agresivos

## El catálogo público no se ve

### Verifica:

1. **Slug configurado** en Settings → Catálogo público
2. **Toggle activo**
3. **Al menos 1 producto creado y visible al público**
4. **URL correcta**: `cliente.impulsapr.com/c/[tu-slug]`

## Los productos no aparecen en el catálogo aunque estén creados

### Verifica:

1. **Activo** = sí
2. **Visible al público** = sí
3. **Stock** > 0 (productos sin stock se ven con overlay "Sin stock")

## "Error 500" / pantalla en blanco

* Refresca (Ctrl+Shift+R / Cmd+Shift+R)
* Cierra sesión y vuelve a entrar
* Vacía cache del navegador
* Si persiste, escríbenos con screenshot + URL exacta

## "Sesión expirada" cada rato

Causa común: cookies bloqueadas o privacidad muy estricta del navegador.

Solución: permite cookies para `cliente.impulsapr.com` en tu navegador.

## Mi calendario muestra horarios duplicados

Posible causa: tienes Google Calendar y otro calendario externo (Apple Cal, Outlook) sincronizados con la misma cuenta.

Solución: en Settings → Calendar → elige solo UN calendario fuente.

## Dashboard muy lento

### Diagnóstico:

* Abre DevTools → Network → recarga la página
* Si las llamadas API tardan >2s, puede ser problema de tu internet o nuestro lado
* Si todo carga rápido pero la UI lagea, problema del navegador (cierra otras tabs)

### Soluciones:

* Refresca con cache vaciado
* Prueba en otro navegador
* Si sigue, contáctanos

## "No autorizado" al intentar entrar

* Tu cuenta puede haber sido suspendida (pago atrasado o admin removió tu acceso)
* Tu invitación de staff caducó (7 días)
* Email/contraseña incorrectos

Si crees que es un error, contáctanos.

---

## Contactar soporte

Si nada de esto resuelve:

* WhatsApp: [+1 (939) 905-2410](https://wa.me/19399052410) (rápido)
* Email: [info@impulsapr.com](mailto:info@impulsapr.com) (formal, con screenshots)
* Agendar llamada: link en footer de tu dashboard
