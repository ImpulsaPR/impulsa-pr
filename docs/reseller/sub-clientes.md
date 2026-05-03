# Sub-clientes

Como reseller, manejas múltiples cuentas — una por cada cliente final que te paga.

## Crear un sub-cliente

Ve a `/sub-clientes` → "Nuevo cliente":

1. **Datos del cliente final**: nombre del negocio, dueño, email, teléfono
2. **Industria** (selecciona el industry pack)
3. **Branding inicial**: logo, color (puedes ajustar después)
4. **Slug** para sus URLs públicas

Sistema crea:

* Cuenta separada con sus propios datos (RLS strict)
* Booking público en `cliente.impulsapr.com/book/[slug]` (o tu propio dominio si configurado)
* Catálogo público en `cliente.impulsapr.com/c/[slug]`
* Email branded saliente
* Login independiente para el cliente

## Panel central

En `/sub-clientes` ves:

* Lista de todos tus sub-clientes
* Métricas agregadas (total revenue, total citas, total leads)
* Estado por cliente: activo, prueba, atrasado en pago, suspendido

## Acceder a un sub-cliente

Click en cualquiera → entras a su dashboard como **admin/owner** (impersonate). Útil para:

* Configurar inicial setup
* Resolver issues técnicos
* Hacer ajustes de branding o flujo

> Cualquier cambio que hagas queda registrado en el log con tu nombre.

## El cliente final tiene su propio login

Cada sub-cliente recibe email de invitación con su URL y credenciales. Entran a SU dashboard, ven solo SUS datos.

* No saben que existes técnicamente como "reseller" — para ellos eres simplemente "el dashboard de su negocio"
* No pueden ver otros sub-clientes tuyos
* No pueden cambiar billing (eso lo manejas tú)

## Aislamiento de datos

* RLS estricto en BD — los datos de tus sub-clientes están **completamente separados**
* Imposible que un sub-cliente vea datos de otro
* Cumple con principios GDPR/Ley 184 PR

## Métricas / reportes consolidados

Ves un dashboard agregado:

* Total clientes activos
* Total revenue procesado (sumado)
* Top 3 clientes por volumen
* Churn (sub-clientes que cancelaron)
* Próximos en aniversario (oportunidad de upsell)

## Suspender / reactivar / eliminar

Si un sub-cliente deja de pagarte:

* **Suspender**: dashboard del cliente queda inaccesible, pero los datos se conservan 90 días por si vuelve
* **Reactivar**: en cualquier momento si vuelve a pagar
* **Eliminar**: borra permanentemente (irreversible)
