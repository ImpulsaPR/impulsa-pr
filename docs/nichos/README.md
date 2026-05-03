# Funcionalidades por nicho

Tu dashboard se **adapta automáticamente** al nicho que elijas. Algunas secciones aparecen solo cuando aplican.

## Cómo funciona

Cada **Industry Pack** activa un set de **features específicas** en el sidebar. Por ejemplo:

* **Veterinaria** → activa la sección **Mascotas** (multi-mascota por dueño + vacunas)
* **Legal** → activa la sección **Casos** (multi-caso + horas facturables)
* **Médico** → activa la sección **Recetas** (recetas digitales imprimibles)
* **Restaurante** → activa la sección **Mesas**
* **Fitness** / **Educación** → activa la sección **Clases recurrentes**

Si tu nicho no necesita una feature, **no aparece** — para no llenar el sidebar.

## Features universales (todos los nichos)

Estas las tienes siempre, sin importar el nicho:

* Leads
* Clientes
* Calendario
* Conversaciones
* Pipeline
* Tasks
* Pagos
* Equipo
* Knowledge Base
* Settings
* Booking público
* Reputation

## Features por nicho

| Feature | Nichos que la activan |
|---|---|
| **Mascotas** | Veterinaria, Pet Grooming |
| **Casos** | Legal |
| **Recetas digitales** | Médico General |
| **Mesas** | Restaurante |
| **Clases recurrentes** | Fitness, Educación |
| **Historia clínica** | Estética, Dental, Médico, Psicología, Veterinaria, Salones, Tatuajes |
| **Portafolio antes/después** | Estética, Tatuajes |
| **Contratos firmables** | Estética, Dental, Médico, Eventos, Legal, Tatuajes |
| **Catálogo público (productos)** | Estética, Salón, Restaurante, Retail, Pet Grooming, Inmobiliaria |
| **Inventario** | Estética, Salón, Dental, Veterinaria, Restaurante, Retail, Automotriz |
| **Paquetes** | Estética, Salón, Spa, Coaching, Eventos, Limpieza, Dental |

> Hay 65+ features distintas. La lista completa está en `src/lib/nicho-features.ts` (interno).

## Cambiar de nicho

Si elegiste el nicho equivocado o tu negocio cambió:

1. Ve a **Settings → Industry Pack**
2. Elige el nuevo
3. Dale "Aplicar"

Los datos existentes **NO se pierden**. Lo que cambia es:

* Qué features aparecen en el sidebar
* Plantillas, tags, KB del nuevo nicho se agregan
* El prompt del bot se actualiza

## Profundizar

* [Mascotas (vet & pet grooming)](mascotas.md)
* [Casos legales](casos.md)
* [Recetas digitales](recetas.md)
* [Mesas (restaurante)](mesas.md)
* [Clases recurrentes](clases.md)
* [Historia clínica](historia-clinica.md)
* [Portafolio antes/después](portafolio.md)
* [Contratos firmables](contratos.md)
