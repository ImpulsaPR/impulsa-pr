# Contratos firmables

> **Activo en**: Estética, Dental, Médico, Eventos, Legal, Tatuajes.

Maneja **contratos de consentimiento** y otros documentos legales con tus clientes — firmables digital.

## Casos de uso

* **Estética/Tatuajes**: consentimiento informado pre-procedimiento
* **Dental**: consentimiento de tratamiento, autorización seguros
* **Médico**: HIPAA acknowledgment, consentimiento de procedimientos
* **Eventos**: contrato de servicios, política de depósito
* **Legal**: acuerdo de honorarios

## Crear un contrato

1. Ve a `/contratos` → **"+ Nuevo contrato"**
2. Llena:
   * **Título** (ej. "Consentimiento informado — Aumento labial")
   * **Cliente** (selecciona o crea)
   * **Plantilla** (si tienes pre-creadas) o **texto libre**
   * **Servicio asociado** (opcional)

## Plantillas

En Settings → Contratos → Plantillas:

* Crea plantillas reutilizables con placeholders ({{nombre_cliente}}, {{fecha}}, {{servicio}})
* Cada Industry Pack viene con plantillas comunes — edítalas

## Firma del cliente

3 formas:

### 1. Firma digital en persona

* Cliente firma con dedo en tu tablet/celular
* Queda registrado: timestamp, firma, IP

### 2. Firma remota

* Le mandas link único al cliente por WhatsApp
* Cliente abre, lee, firma (con dedo en pantalla o nombre escrito)
* Tú recibes notificación al firmarse

### 3. Firma manual + escaneo

* Imprimes el contrato
* Cliente firma a mano
* Subes el PDF firmado al sistema

## Estados

* **Borrador** — todavía editas
* **Pendiente firma**
* **Firmado**
* **Vencido** (si tiene fecha de expiración)
* **Anulado**

## Almacenamiento

* PDFs en storage cifrado
* Acceso restringido (RLS)
* Disponible para descarga/imprimir cuando lo necesites
* Auditoría: quién firmó, cuándo, IP, user agent

## Vincular a citas

Si un servicio requiere consentimiento previo:

* Configura en el servicio: "Requiere contrato firmado"
* El bot al agendar pregunta automáticamente si ya está firmado
* Si no, manda el link al cliente antes de la cita

## Renovación / vencimiento

Algunos contratos vencen (ej. consentimientos cada año):

* Configura fecha de expiración
* El sistema avisa 30 días antes
* Renuevas con un click (genera versión nueva con misma plantilla)
