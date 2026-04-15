export type LeadEstado = 'nuevo' | 'contactado' | 'interesado' | 'cerrado'
export type NivelInteres = 'alto' | 'medio' | 'bajo'

export interface Mensaje {
  ts: string
  msg: string
  rol: 'prospecto' | 'bot' | 'humano'
}

export interface Lead {
  id: string
  cliente_id: string | null
  nombre: string
  telefono: string
  contact_name: string | null
  es_contacto_guardado: boolean
  tipo_negocio: string | null
  necesidad: string | null
  estado: LeadEstado
  nivel_interes: NivelInteres
  es_viable: boolean | null
  humano_activo: boolean
  humano_timestamp: string | null
  historial_mensajes: Mensaje[]
  historial_resumen: string
  ultimo_mensaje: string | null
  ultima_respuesta: string | null
  notas_ia: string | null
  fecha_primer_contacto: string
  fecha_ultimo_contacto: string
  created_at: string
  updated_at: string
  email: string
  ubicacion: string
  num_empleados: string
  sitio_web: string
  notas_negocio: string
  origen: string | null
  fuente: string | null
  etapa: string
  tags: string | null
  valor_estimado: number
  valor_real: number
  intencion: string | null
  source: 'manual' | 'automated'
}

export interface DashboardStats {
  totalLeads: number
  revenue: number
  appointments: number
  conversionRate: number
}

export interface Cliente {
  id: string
  auth_user_id: string
  nombre: string
  email: string
  empresa: string | null
  telefono: string | null
  plan: string | null
  created_at: string
  avatar_url?: string | null
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}
