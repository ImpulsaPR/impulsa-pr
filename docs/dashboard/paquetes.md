# Paquetes

Vende **bundles** de servicios con descuento. Ideal para fidelizar y aumentar ticket promedio.

## Casos de uso

* **Estética**: paquete "5 sesiones de cavitación + 1 gratis"
* **Fitness**: "10 personal trainings con 15% descuento"
* **Coaching**: "Programa 6 sesiones, ahorras $120"
* **Educación**: "Paquete 4 clases individuales"

## Crear un paquete

1. Ve a `/paquetes` → **"+ Nuevo paquete"**
2. Llena:
   * **Nombre** (ej. "Paquete Verano 5+1")
   * **Servicios incluidos** (uno o varios)
   * **Cantidad de sesiones**
   * **Precio total** (vs precio individual sumado, automáticamente calcula descuento)
   * **Validez** (días — ej. 60 días para usar las sesiones)

## Vender un paquete

* Manualmente desde la ficha de un cliente
* Vía link público (Stripe Checkout) que compartes por WhatsApp
* El bot puede ofrecerlo cuando un cliente pregunta por servicios recurrentes

## Tracking de uso

Cada vez que un cliente usa una sesión del paquete:

* Se descuenta del balance
* Aparece en su ficha (cliente → tab Paquetes)
* Te avisa cuando quedan 1-2 sesiones para que ofrezcas renovar

## Vencimiento

Si un paquete vence con sesiones sin usar:

* El cliente lo pierde (política estándar)
* O puedes extenderlo manualmente desde su ficha (caso a caso)

## Reportes

* Cuántos paquetes activos tienes
* Cuántos vencen pronto
* Revenue total de paquetes
* Paquete más vendido
