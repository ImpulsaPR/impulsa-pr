export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bot_credentials: {
        Row: {
          access_token: string
          calendar_id: string
          calendar_name: string | null
          cliente_id: string
          created_at: string
          expires_at: string
          google_email: string | null
          id: string
          provider: string
          refresh_token: string | null
          scope: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          calendar_id?: string
          calendar_name?: string | null
          cliente_id: string
          created_at?: string
          expires_at: string
          google_email?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          calendar_id?: string
          calendar_name?: string | null
          cliente_id?: string
          created_at?: string
          expires_at?: string
          google_email?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_credentials_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_dedup: {
        Row: {
          bot_id: string | null
          created_at: string | null
          wamid: string
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          wamid: string
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          wamid?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_dedup_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_sent_messages: {
        Row: {
          created_at: string | null
          message_id: string
          telefono: string
        }
        Insert: {
          created_at?: string | null
          message_id: string
          telefono: string
        }
        Update: {
          created_at?: string | null
          message_id?: string
          telefono?: string
        }
        Relationships: []
      }
      bots: {
        Row: {
          activo: boolean | null
          api_key_evolution: string | null
          catalogo_nichos: Json | null
          cliente_id: string
          created_at: string | null
          email_dueno: string | null
          empresa_contacto: string | null
          empresa_descripcion: string | null
          empresa_nombre: string | null
          empresa_ubicacion: string | null
          followup_horas: number | null
          followup_max_intentos: number | null
          google_calendar_id: string | null
          horario_fin: string | null
          horario_inicio: string | null
          horarios_semana: Json
          id: string
          instancia_evolution: string
          intenciones_override: Json | null
          meet_link: string | null
          mensaje_bienvenida: string | null
          mensaje_fuera_horario: string | null
          nicho: string | null
          nombre: string
          nombre_agente: string | null
          notion_db_notas: string | null
          notion_db_tareas: string | null
          numero_dueno: string | null
          numero_whatsapp_bot: string | null
          personalidad_agente: string | null
          portafolio: Json | null
          precios: Json | null
          servicios: Json | null
          servicios_json: Json
          telefono: string
          webhook_path: string | null
          zona_horaria: string | null
        }
        Insert: {
          activo?: boolean | null
          api_key_evolution?: string | null
          catalogo_nichos?: Json | null
          cliente_id: string
          created_at?: string | null
          email_dueno?: string | null
          empresa_contacto?: string | null
          empresa_descripcion?: string | null
          empresa_nombre?: string | null
          empresa_ubicacion?: string | null
          followup_horas?: number | null
          followup_max_intentos?: number | null
          google_calendar_id?: string | null
          horario_fin?: string | null
          horario_inicio?: string | null
          horarios_semana?: Json
          id?: string
          instancia_evolution: string
          intenciones_override?: Json | null
          meet_link?: string | null
          mensaje_bienvenida?: string | null
          mensaje_fuera_horario?: string | null
          nicho?: string | null
          nombre: string
          nombre_agente?: string | null
          notion_db_notas?: string | null
          notion_db_tareas?: string | null
          numero_dueno?: string | null
          numero_whatsapp_bot?: string | null
          personalidad_agente?: string | null
          portafolio?: Json | null
          precios?: Json | null
          servicios?: Json | null
          servicios_json?: Json
          telefono: string
          webhook_path?: string | null
          zona_horaria?: string | null
        }
        Update: {
          activo?: boolean | null
          api_key_evolution?: string | null
          catalogo_nichos?: Json | null
          cliente_id?: string
          created_at?: string | null
          email_dueno?: string | null
          empresa_contacto?: string | null
          empresa_descripcion?: string | null
          empresa_nombre?: string | null
          empresa_ubicacion?: string | null
          followup_horas?: number | null
          followup_max_intentos?: number | null
          google_calendar_id?: string | null
          horario_fin?: string | null
          horario_inicio?: string | null
          horarios_semana?: Json
          id?: string
          instancia_evolution?: string
          intenciones_override?: Json | null
          meet_link?: string | null
          mensaje_bienvenida?: string | null
          mensaje_fuera_horario?: string | null
          nicho?: string | null
          nombre?: string
          nombre_agente?: string | null
          notion_db_notas?: string | null
          notion_db_tareas?: string | null
          numero_dueno?: string | null
          numero_whatsapp_bot?: string | null
          personalidad_agente?: string | null
          portafolio?: Json | null
          precios?: Json | null
          servicios?: Json | null
          servicios_json?: Json
          telefono?: string
          webhook_path?: string | null
          zona_horaria?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bots_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bots_nicho_fkey"
            columns: ["nicho"]
            isOneToOne: false
            referencedRelation: "nichos_templates"
            referencedColumns: ["nicho_id"]
          },
        ]
      }
      citas: {
        Row: {
          cancelada: boolean | null
          cliente_id: string | null
          created_at: string | null
          estado: string | null
          evento_google_id: string | null
          fecha: string | null
          fecha_fin: string | null
          id: string
          lead_id: string | null
          meet_link: string | null
          nombre_cliente: string | null
          recordatorio_1h_enviado: boolean | null
          recordatorio_24h_enviado: boolean | null
          telefono_cliente: string | null
          titulo: string | null
        }
        Insert: {
          cancelada?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          estado?: string | null
          evento_google_id?: string | null
          fecha?: string | null
          fecha_fin?: string | null
          id?: string
          lead_id?: string | null
          meet_link?: string | null
          nombre_cliente?: string | null
          recordatorio_1h_enviado?: boolean | null
          recordatorio_24h_enviado?: boolean | null
          telefono_cliente?: string | null
          titulo?: string | null
        }
        Update: {
          cancelada?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          estado?: string | null
          evento_google_id?: string | null
          fecha?: string | null
          fecha_fin?: string | null
          id?: string
          lead_id?: string | null
          meet_link?: string | null
          nombre_cliente?: string | null
          recordatorio_1h_enviado?: boolean | null
          recordatorio_24h_enviado?: boolean | null
          telefono_cliente?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          empresa: string | null
          id: string
          nombre: string | null
          plan: string | null
          settings: Json
          telefono: string | null
          telefono_whatsapp: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          empresa?: string | null
          id?: string
          nombre?: string | null
          plan?: string | null
          settings?: Json
          telefono?: string | null
          telefono_whatsapp?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nombre?: string | null
          plan?: string | null
          settings?: Json
          telefono?: string | null
          telefono_whatsapp?: string | null
        }
        Relationships: []
      }
      contactos_bot: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          push_name: string | null
          telefono: string
          tipo: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          push_name?: string | null
          telefono: string
          tipo?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          push_name?: string | null
          telefono?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contactos_bot_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversaciones: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          mensaje: string | null
          rol: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          mensaje?: string | null
          rol?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          mensaje?: string | null
          rol?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          id: string
          tipo: string | null
          valor: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          tipo?: string | null
          valor?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          tipo?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          enviado: boolean | null
          fecha_envio: string | null
          id: string
          lead_id: string | null
          mensaje: string | null
        }
        Insert: {
          enviado?: boolean | null
          fecha_envio?: string | null
          id?: string
          lead_id?: string | null
          mensaje?: string | null
        }
        Update: {
          enviado?: boolean | null
          fecha_envio?: string | null
          id?: string
          lead_id?: string | null
          mensaje?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      human_takeover: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: number
          telefono: string
          timestamp_takeover: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: number
          telefono: string
          timestamp_takeover?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: number
          telefono?: string
          timestamp_takeover?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_takeover_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string | null
          email: string | null
          empresa: string | null
          expires_at: string | null
          nombre: string | null
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          expires_at?: string | null
          nombre?: string | null
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          empresa?: string | null
          expires_at?: string | null
          nombre?: string | null
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          answer: string
          category: string
          cliente_id: string
          created_at: string
          embedding: string | null
          id: string
          last_used_at: string | null
          question: string
          source: string | null
          source_ref: Json | null
          tags: string[] | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          answer: string
          category: string
          cliente_id: string
          created_at?: string
          embedding?: string | null
          id?: string
          last_used_at?: string | null
          question: string
          source?: string | null
          source_ref?: Json | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          answer?: string
          category?: string
          cliente_id?: string
          created_at?: string
          embedding?: string | null
          id?: string
          last_used_at?: string | null
          question?: string
          source?: string | null
          source_ref?: Json | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cliente_id: string
          contact_name: string | null
          created_at: string | null
          deleted: boolean | null
          email: string | null
          es_contacto_guardado: boolean | null
          es_viable: boolean | null
          estado: string | null
          etapa: string | null
          fecha_primer_contacto: string | null
          fecha_ultimo_contacto: string | null
          fuente: string | null
          historial_mensajes: Json | null
          historial_resumen: string | null
          humano_activo: boolean | null
          humano_timestamp: string | null
          id: string
          intencion: string | null
          necesidad: string | null
          nivel_interes: string | null
          nombre: string | null
          nombre_negocio: string | null
          notas_ia: string | null
          notas_negocio: string | null
          num_empleados: string | null
          origen: string | null
          sitio_web: string | null
          tags: string[] | null
          telefono: string
          tipo_negocio: string | null
          ubicacion: string | null
          ultima_respuesta: string | null
          ultimo_mensaje: string | null
          updated_at: string | null
          valor_estimado: number | null
          valor_real: number | null
        }
        Insert: {
          cliente_id: string
          contact_name?: string | null
          created_at?: string | null
          deleted?: boolean | null
          email?: string | null
          es_contacto_guardado?: boolean | null
          es_viable?: boolean | null
          estado?: string | null
          etapa?: string | null
          fecha_primer_contacto?: string | null
          fecha_ultimo_contacto?: string | null
          fuente?: string | null
          historial_mensajes?: Json | null
          historial_resumen?: string | null
          humano_activo?: boolean | null
          humano_timestamp?: string | null
          id?: string
          intencion?: string | null
          necesidad?: string | null
          nivel_interes?: string | null
          nombre?: string | null
          nombre_negocio?: string | null
          notas_ia?: string | null
          notas_negocio?: string | null
          num_empleados?: string | null
          origen?: string | null
          sitio_web?: string | null
          tags?: string[] | null
          telefono: string
          tipo_negocio?: string | null
          ubicacion?: string | null
          ultima_respuesta?: string | null
          ultimo_mensaje?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
          valor_real?: number | null
        }
        Update: {
          cliente_id?: string
          contact_name?: string | null
          created_at?: string | null
          deleted?: boolean | null
          email?: string | null
          es_contacto_guardado?: boolean | null
          es_viable?: boolean | null
          estado?: string | null
          etapa?: string | null
          fecha_primer_contacto?: string | null
          fecha_ultimo_contacto?: string | null
          fuente?: string | null
          historial_mensajes?: Json | null
          historial_resumen?: string | null
          humano_activo?: boolean | null
          humano_timestamp?: string | null
          id?: string
          intencion?: string | null
          necesidad?: string | null
          nivel_interes?: string | null
          nombre?: string | null
          nombre_negocio?: string | null
          notas_ia?: string | null
          notas_negocio?: string | null
          num_empleados?: string | null
          origen?: string | null
          sitio_web?: string | null
          tags?: string[] | null
          telefono?: string
          tipo_negocio?: string | null
          ubicacion?: string | null
          ultima_respuesta?: string | null
          ultimo_mensaje?: string | null
          updated_at?: string | null
          valor_estimado?: number | null
          valor_real?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      message_buffer: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: number
          mensaje: string
          telefono: string
          wamid: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: number
          mensaje: string
          telefono: string
          wamid: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: number
          mensaje?: string
          telefono?: string
          wamid?: string
        }
        Relationships: []
      }
      metricas: {
        Row: {
          citas_total: number | null
          cliente_id: string | null
          fecha: string | null
          id: string
          ingresos_estimados: number | null
          leads_total: number | null
        }
        Insert: {
          citas_total?: number | null
          cliente_id?: string | null
          fecha?: string | null
          id?: string
          ingresos_estimados?: number | null
          leads_total?: number | null
        }
        Update: {
          citas_total?: number | null
          cliente_id?: string | null
          fecha?: string | null
          id?: string
          ingresos_estimados?: number | null
          leads_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      nichos_templates: {
        Row: {
          alias_intenciones: Json
          created_at: string
          horario_ejemplo: Json
          intenciones_default: Json
          mensajes_fallback: Json
          nicho_id: string
          nombre_display: string
          prompt_base: string
          servicios_ejemplo: Json
          updated_at: string
        }
        Insert: {
          alias_intenciones?: Json
          created_at?: string
          horario_ejemplo?: Json
          intenciones_default?: Json
          mensajes_fallback?: Json
          nicho_id: string
          nombre_display: string
          prompt_base: string
          servicios_ejemplo?: Json
          updated_at?: string
        }
        Update: {
          alias_intenciones?: Json
          created_at?: string
          horario_ejemplo?: Json
          intenciones_default?: Json
          mensajes_fallback?: Json
          nicho_id?: string
          nombre_display?: string
          prompt_base?: string
          servicios_ejemplo?: Json
          updated_at?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          id: string
          leido: boolean | null
          mensaje: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          leido?: boolean | null
          mensaje?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          leido?: boolean | null
          mensaje?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          estado: string | null
          id: string
          monto: number | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          monto?: number | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          estado?: string | null
          id?: string
          monto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      portafolio_media: {
        Row: {
          activo: boolean | null
          caption: string | null
          categoria: string
          created_at: string | null
          id: string
          media_type: string
          media_url: string
          subcategoria: string | null
          titulo: string
        }
        Insert: {
          activo?: boolean | null
          caption?: string | null
          categoria: string
          created_at?: string | null
          id?: string
          media_type?: string
          media_url: string
          subcategoria?: string | null
          titulo: string
        }
        Update: {
          activo?: boolean | null
          caption?: string | null
          categoria?: string
          created_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          subcategoria?: string | null
          titulo?: string
        }
        Relationships: []
      }
      rate_limit_buckets: {
        Row: {
          count: number
          created_at: string
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          created_at?: string
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      servicios_precios: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          id: string
          moneda: string | null
          nombre_servicio: string
          precio_desde: number | null
          precio_hasta: number | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          moneda?: string | null
          nombre_servicio: string
          precio_desde?: number | null
          precio_hasta?: number | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          moneda?: string | null
          nombre_servicio?: string
          precio_desde?: number | null
          precio_hasta?: number | null
        }
        Relationships: []
      }
      soporte_mensajes: {
        Row: {
          asunto: string | null
          autor: string
          cliente_id: string
          created_at: string
          estado: string
          id: string
          leido_por_cliente: boolean
          leido_por_soporte: boolean
          mensaje: string
          prioridad: string
          updated_at: string
        }
        Insert: {
          asunto?: string | null
          autor: string
          cliente_id: string
          created_at?: string
          estado?: string
          id?: string
          leido_por_cliente?: boolean
          leido_por_soporte?: boolean
          mensaje: string
          prioridad?: string
          updated_at?: string
        }
        Update: {
          asunto?: string | null
          autor?: string
          cliente_id?: string
          created_at?: string
          estado?: string
          id?: string
          leido_por_cliente?: boolean
          leido_por_soporte?: boolean
          mensaje?: string
          prioridad?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "soporte_mensajes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_purchases: {
        Row: {
          amount_total_cents: number
          billing_interval: string | null
          cliente_id: string | null
          created_at: string
          currency: string
          customer_name: string | null
          email: string
          id: string
          mode: string
          onboarded_at: string | null
          plan_slug: string | null
          price_id: string | null
          product_id: string | null
          raw_event: Json
          status: string
          stripe_customer_id: string | null
          stripe_event_id: string
          stripe_session_id: string
          stripe_subscription_id: string | null
        }
        Insert: {
          amount_total_cents: number
          billing_interval?: string | null
          cliente_id?: string | null
          created_at?: string
          currency?: string
          customer_name?: string | null
          email: string
          id?: string
          mode: string
          onboarded_at?: string | null
          plan_slug?: string | null
          price_id?: string | null
          product_id?: string | null
          raw_event: Json
          status?: string
          stripe_customer_id?: string | null
          stripe_event_id: string
          stripe_session_id: string
          stripe_subscription_id?: string | null
        }
        Update: {
          amount_total_cents?: number
          billing_interval?: string | null
          cliente_id?: string | null
          created_at?: string
          currency?: string
          customer_name?: string | null
          email?: string
          id?: string
          mode?: string
          onboarded_at?: string | null
          plan_slug?: string | null
          price_id?: string | null
          product_id?: string | null
          raw_event?: Json
          status?: string
          stripe_customer_id?: string | null
          stripe_event_id?: string
          stripe_session_id?: string
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_purchases_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_historial: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          id: number
          mensaje: string
          rol: string
          telefono: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: never
          mensaje: string
          rol: string
          telefono: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: never
          mensaje?: string
          rol?: string
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_historial_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_actividad_reciente: {
        Row: {
          cliente_id: string | null
          descripcion: string | null
          detalle: string | null
          ref_id: string | null
          timestamp: string | null
          tipo: string | null
        }
        Relationships: []
      }
      v_citas_estado_actual: {
        Row: {
          cliente_id: string | null
          estado_real: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_citas_por_dia: {
        Row: {
          citas_agendadas: number | null
          citas_canceladas: number | null
          citas_completadas: number | null
          cliente_id: string | null
          fecha: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_embudo_conversion: {
        Row: {
          agendados: number | null
          cerrados: number | null
          contactados: number | null
          pct_agendados: number | null
          pct_cerrados: number | null
          pct_contactados: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      v_leads_mas_activos: {
        Row: {
          estado: string | null
          msgs_bot: number | null
          msgs_cliente: number | null
          nombre: string | null
          telefono: string | null
          tipo_negocio: string | null
          total_mensajes: number | null
          ultimo_mensaje: string | null
        }
        Relationships: []
      }
      v_leads_por_dia: {
        Row: {
          cliente_id: string | null
          fecha: string | null
          leads_alto_interes: number | null
          leads_nuevos: number | null
          leads_viables: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_leads_por_estado: {
        Row: {
          estado: string | null
          porcentaje: number | null
          total: number | null
        }
        Relationships: []
      }
      v_leads_por_nicho: {
        Row: {
          alto_interes: number | null
          cliente_id: string | null
          nicho: string | null
          total: number | null
          viables: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_leads_sin_seguimiento: {
        Row: {
          estado: string | null
          fecha_ultimo_contacto: string | null
          horas_sin_contacto: number | null
          necesidad: string | null
          nombre: string | null
          telefono: string | null
          tipo_negocio: string | null
        }
        Insert: {
          estado?: string | null
          fecha_ultimo_contacto?: string | null
          horas_sin_contacto?: never
          necesidad?: string | null
          nombre?: string | null
          telefono?: string | null
          tipo_negocio?: string | null
        }
        Update: {
          estado?: string | null
          fecha_ultimo_contacto?: string | null
          horas_sin_contacto?: never
          necesidad?: string | null
          nombre?: string | null
          telefono?: string | null
          tipo_negocio?: string | null
        }
        Relationships: []
      }
      v_proximas_citas: {
        Row: {
          cliente_id: string | null
          estado: string | null
          evento_google_id: string | null
          fecha: string | null
          fecha_fin: string | null
          id: string | null
          nivel_interes: string | null
          nombre_cliente: string | null
          recordatorio_1h_enviado: boolean | null
          recordatorio_24h_enviado: boolean | null
          telefono_cliente: string | null
          tipo_negocio: string | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_onboard_cliente: {
        Args: {
          p_auth_user_id: string
          p_email: string
          p_email_dueno: string
          p_empresa: string
          p_nicho: string
          p_nombre: string
          p_nombre_agente: string
          p_numero_dueno: string
          p_numero_whatsapp_bot: string
          p_webhook_path: string
        }
        Returns: {
          bot_id: string
          cliente_id: string
        }[]
      }
      auth_cliente_id: { Args: never; Returns: string }
      consume_invite: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      create_invite: {
        Args: { p_email?: string; p_empresa?: string; p_nombre?: string }
        Returns: string
      }
      get_calendar_credentials: {
        Args: { p_cliente_id: string }
        Returns: {
          access_token: string
          calendar_id: string
          expires_at: string
          google_email: string
          needs_refresh: boolean
          refresh_token: string
        }[]
      }
      get_embudo_conversion: {
        Args: { p_cliente_id: string; p_dias?: number }
        Returns: {
          cantidad: number
          etapa: string
          porcentaje: number
        }[]
      }
      get_metricas_resumen: {
        Args: { p_cliente_id: string; p_dias?: number }
        Returns: {
          citas_agendadas: number
          citas_canceladas: number
          citas_completadas: number
          leads_totales: number
          mensajes_enviados: number
          mensajes_recibidos: number
          tasa_cancelacion: number
          tasa_conversion: number
          tiempo_promedio_horas_hasta_cita: number
        }[]
      }
      get_rendimiento_bot: {
        Args: { p_cliente_id: string; p_dias?: number }
        Returns: {
          conversaciones_sin_respuesta: number
          msgs_promedio_hasta_cita: number
          msgs_promedio_sin_cita: number
        }[]
      }
      kb_search: {
        Args: {
          p_cliente_id: string
          p_embedding: string
          p_limit?: number
          p_threshold?: number
        }
        Returns: {
          answer: string
          category: string
          id: string
          question: string
          similarity: number
        }[]
      }
      rate_limit_check: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: {
          allowed: boolean
          current_count: number
          reset_at: string
          retry_after_seconds: number
        }[]
      }
      rate_limit_cleanup: { Args: never; Returns: number }
      validate_invite: {
        Args: { p_token: string }
        Returns: {
          email: string
          empresa: string
          nombre: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
