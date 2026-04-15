'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Locale = 'en' | 'es'

const dictionaries = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.pipeline': 'Pipeline',
    'nav.conversations': 'Conversations',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Your business performance overview',
    'dashboard.totalLeads': 'Total Leads',
    'dashboard.revenue': 'Revenue Generated',
    'dashboard.closedLeads': 'Closed Leads',
    'dashboard.conversionRate': 'Close Rate',
    'dashboard.newLead': 'New Lead',
    'dashboard.vsLastMonth': 'vs last month',
    'dashboard.vsPrev': 'vs prev period',
    'dashboard.pipelineValue': 'Pipeline Value',
    'dashboard.openLeads': 'open leads',
    'dashboard.aiRate': 'AI Response Rate',
    'dashboard.aiRateDesc': 'of messages handled by AI',
    'dashboard.hotLeads': 'Hot Leads',
    'dashboard.noHotLeads': 'No hot leads',
    'dashboard.hotLeadsDesc': 'High-interest leads will appear here',
    'dashboard.overallConversion': 'Overall conversion',

    // Time filters
    'time.today': 'Today',
    'time.7d': '7 days',
    'time.30d': '30 days',
    'time.all': 'All',

    // Pipeline
    'pipeline.title': 'Pipeline',
    'pipeline.subtitle': 'Drag leads between stages to update their status',
    'pipeline.salesPipeline': 'Sales Pipeline',
    'pipeline.dropHere': 'Drop here',
    'pipeline.noLeads': 'No leads',
    'pipeline.movedTo': 'Lead moved to',
    'pipeline.moveError': 'Error moving lead',

    // Pipeline stages
    'stage.nuevo': 'New',
    'stage.contactado': 'Contacted',
    'stage.interesado': 'Interested',
    'stage.cerrado': 'Closed',

    // Lead statuses
    'status.nuevo': 'New',
    'status.contactado': 'Contacted',
    'status.interesado': 'Interested',
    'status.cerrado': 'Closed',

    // Interest levels
    'interest.alto': 'High',
    'interest.medio': 'Medium',
    'interest.bajo': 'Low',

    // Leads page
    'leads.title': 'Leads',
    'leads.subtitle': 'Manage and monitor all your leads',
    'leads.search': 'Search leads...',
    'leads.all': 'All',
    'leads.name': 'Name',
    'leads.phone': 'Phone',
    'leads.status': 'Status',
    'leads.interest': 'Interest',
    'leads.business': 'Business',
    'leads.estValue': 'Est. Value',
    'leads.lastContact': 'Last Contact',
    'leads.actions': 'Actions',
    'leads.noLeads': 'No leads found',
    'leads.of': 'of',
    'leads.auto': 'Auto',
    'leads.deleteLead': 'Delete lead',

    // Create lead modal
    'createLead.title': 'New Lead',
    'createLead.subtitle': 'Add a new prospect',
    'createLead.name': 'Name',
    'createLead.namePlaceholder': 'Prospect name',
    'createLead.phone': 'Phone',
    'createLead.phonePlaceholder': '+1 787 555 1234',
    'createLead.estValue': 'Estimated Value',
    'createLead.submit': 'Create Lead',
    'createLead.success': 'Lead created',
    'createLead.successMsg': 'was added successfully',
    'createLead.created': 'Lead created successfully',
    'createLead.accountError': 'Could not get your account. Please sign in again.',

    // Edit lead modal
    'editLead.title': 'Edit Lead',
    'editLead.realValue': 'Real Value',
    'editLead.status': 'Status',
    'editLead.submit': 'Save Changes',
    'editLead.success': 'Lead updated',
    'editLead.successMsg': 'Changes were saved',
    'editLead.updated': 'Lead updated',

    // Delete
    'delete.title': 'Delete lead',
    'delete.message': 'Are you sure you want to delete "{name}"? This action cannot be undone.',
    'delete.confirm': 'Delete',
    'delete.cancel': 'Cancel',
    'delete.success': 'deleted',
    'delete.error': 'Error deleting lead',

    // Conversations
    'conversations.title': 'Conversations',
    'conversations.subtitle': 'WhatsApp conversations managed by you and AI',
    'conversations.search': 'Search conversations...',
    'conversations.noConversations': 'No conversations',
    'conversations.selectConversation': 'Select a conversation',
    'conversations.aiManaging': 'AI managing',
    'conversations.humanActive': 'Human active',
    'conversations.typePlaceholder': 'Type a message...',
    'conversations.send': 'Send',
    'conversations.noMessages': 'No messages',

    // Analytics
    'analytics.title': 'Analytics',
    'analytics.subtitle': 'Deep analysis of your performance',
    'analytics.avgValue': 'Average Value',
    'analytics.hotLeads': 'Hot Leads',
    'analytics.interestedLeads': 'Interested Leads',
    'analytics.aiMessages': 'AI Messages',
    'analytics.totalMessages': 'Total Messages',
    'analytics.interestLevel': 'Interest Level',
    'analytics.businessTypes': 'Business Types',
    'analytics.noData': 'No data',

    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and preferences',
    'settings.profile': 'Profile',
    'settings.name': 'Name',
    'settings.namePlaceholder': 'Your name',
    'settings.email': 'Email',
    'settings.emailPlaceholder': 'you@email.com',
    'settings.company': 'Company Name',
    'settings.companyPlaceholder': 'My Business',
    'settings.notifications': 'Notifications',
    'settings.newLeadNotif': 'New lead notifications',
    'settings.newLeadNotifDesc': 'Get notified when a new lead comes in',
    'settings.aiAlerts': 'AI conversation alerts',
    'settings.aiAlertsDesc': 'Alert when AI needs human intervention',
    'settings.weeklyReports': 'Weekly reports',
    'settings.weeklyReportsDesc': 'Receive weekly performance summaries',
    'settings.dealClosed': 'Close notification',
    'settings.dealClosedDesc': 'Alert when a deal is closed',
    'settings.automation': 'Automation',
    'settings.aiAutoRespond': 'AI auto-responder',
    'settings.aiAutoRespondDesc': 'Let AI handle initial conversations',
    'settings.autoScoring': 'Automatic scoring',
    'settings.autoScoringDesc': 'Score leads automatically based on engagement',
    'settings.followupReminders': 'Follow-up reminders',
    'settings.followupRemindersDesc': 'Schedule follow-up tasks automatically',
    'settings.appearance': 'Appearance',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.language': 'Language & Region',
    'settings.languageLabel': 'Language',
    'settings.timezone': 'Timezone',
    'settings.profilePhoto': 'Profile Photo',
    'settings.profilePhotoDesc': 'JPG, PNG or WebP. Max 2MB.',
    'settings.uploadPhoto': 'Upload Photo',
    'settings.removePhoto': 'Remove',
    'settings.photoUpdated': 'Photo updated',
    'settings.photoTooLarge': 'File too large. Max 2MB.',
    'settings.save': 'Save Changes',
    'settings.saved': 'Settings saved',

    // Recent activity
    'activity.title': 'Recent Activity',
    'activity.noActivity': 'No recent activity',
    'activity.newLead': 'New lead',
    'activity.aiResponded': 'AI responded to',
    'activity.conversationWith': 'Conversation with',
    'activity.leadRegistered': 'Lead registered',
    'activity.aiHandling': 'AI handling conversation',
    'activity.humanActive': 'Human active',

    // Auth
    'auth.welcomeBack': 'Welcome back',
    'auth.signInSubtitle': 'Sign in to your Impulsa PR dashboard',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signIn': 'Sign In',
    'auth.noAccount': "Don't have an account?",
    'auth.signUp': 'Sign up',
    'auth.createAccount': 'Create your account',
    'auth.signUpSubtitle': 'Start automating your business today',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'John Doe',
    'auth.passwordPlaceholder': 'Min. 6 characters',
    'auth.createBtn': 'Create Account',
    'auth.hasAccount': 'Already have an account?',
    'auth.signInLink': 'Sign in',
    'auth.checkEmail': 'Check your email',
    'auth.confirmSent': 'We sent a confirmation link to',
    'auth.backToSignIn': 'Back to sign in',
    'auth.signOut': 'Sign out',

    // Topbar
    'topbar.search': 'Search leads, conversations...',
    'topbar.searchShort': 'Search...',

    // Sidebar
    'sidebar.automationsActive': 'Automations Active',
    'sidebar.workflowsRunning': '5 workflows running',

    // General
    'general.loading': 'Loading...',
    'general.ai': 'AI',
    'general.human': 'Human',
    'general.leads': 'leads',
  },

  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.leads': 'Prospectos',
    'nav.pipeline': 'Pipeline',
    'nav.conversations': 'Conversaciones',
    'nav.analytics': 'Analíticas',
    'nav.settings': 'Configuración',

    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.subtitle': 'Resumen de tu rendimiento de negocio',
    'dashboard.totalLeads': 'Total Prospectos',
    'dashboard.revenue': 'Ingresos Generados',
    'dashboard.closedLeads': 'Leads Cerrados',
    'dashboard.conversionRate': 'Tasa de Cierre',
    'dashboard.newLead': 'Nuevo Lead',
    'dashboard.vsLastMonth': 'vs mes anterior',
    'dashboard.vsPrev': 'vs periodo anterior',
    'dashboard.pipelineValue': 'Valor del Pipeline',
    'dashboard.openLeads': 'leads abiertos',
    'dashboard.aiRate': 'Tasa de Respuesta AI',
    'dashboard.aiRateDesc': 'de mensajes manejados por AI',
    'dashboard.hotLeads': 'Leads Calientes',
    'dashboard.noHotLeads': 'Sin leads calientes',
    'dashboard.hotLeadsDesc': 'Leads de alto interés aparecerán aquí',
    'dashboard.overallConversion': 'Conversión general',

    // Time filters
    'time.today': 'Hoy',
    'time.7d': '7 días',
    'time.30d': '30 días',
    'time.all': 'Todo',

    // Pipeline
    'pipeline.title': 'Pipeline',
    'pipeline.subtitle': 'Arrastra leads entre etapas para actualizar su estado',
    'pipeline.salesPipeline': 'Pipeline de Ventas',
    'pipeline.dropHere': 'Soltar aquí',
    'pipeline.noLeads': 'Sin leads',
    'pipeline.movedTo': 'Lead movido a',
    'pipeline.moveError': 'Error al mover el lead',

    // Pipeline stages
    'stage.nuevo': 'Nuevo',
    'stage.contactado': 'Contactado',
    'stage.interesado': 'Interesado',
    'stage.cerrado': 'Cerrado',

    // Lead statuses
    'status.nuevo': 'Nuevo',
    'status.contactado': 'Contactado',
    'status.interesado': 'Interesado',
    'status.cerrado': 'Cerrado',

    // Interest levels
    'interest.alto': 'Alto',
    'interest.medio': 'Medio',
    'interest.bajo': 'Bajo',

    // Leads page
    'leads.title': 'Prospectos',
    'leads.subtitle': 'Administra y monitorea todos tus leads',
    'leads.search': 'Buscar leads...',
    'leads.all': 'Todos',
    'leads.name': 'Nombre',
    'leads.phone': 'Teléfono',
    'leads.status': 'Estado',
    'leads.interest': 'Interés',
    'leads.business': 'Negocio',
    'leads.estValue': 'Valor Est.',
    'leads.lastContact': 'Último Contacto',
    'leads.actions': 'Acciones',
    'leads.noLeads': 'No se encontraron leads',
    'leads.of': 'de',
    'leads.auto': 'Auto',
    'leads.deleteLead': 'Eliminar lead',

    // Create lead modal
    'createLead.title': 'Nuevo Lead',
    'createLead.subtitle': 'Agrega un prospecto nuevo',
    'createLead.name': 'Nombre',
    'createLead.namePlaceholder': 'Nombre del prospecto',
    'createLead.phone': 'Teléfono',
    'createLead.phonePlaceholder': '+1 787 555 1234',
    'createLead.estValue': 'Valor Estimado',
    'createLead.submit': 'Crear Lead',
    'createLead.success': 'Lead creado',
    'createLead.successMsg': 'fue agregado exitosamente',
    'createLead.created': 'Lead creado exitosamente',
    'createLead.accountError': 'No se pudo obtener tu cuenta. Inicia sesión de nuevo.',

    // Edit lead modal
    'editLead.title': 'Editar Lead',
    'editLead.realValue': 'Valor Real',
    'editLead.status': 'Estado',
    'editLead.submit': 'Guardar Cambios',
    'editLead.success': 'Lead actualizado',
    'editLead.successMsg': 'Los cambios fueron guardados',
    'editLead.updated': 'Lead actualizado',

    // Delete
    'delete.title': 'Eliminar lead',
    'delete.message': '¿Estás seguro de eliminar "{name}"? Esta acción no se puede deshacer.',
    'delete.confirm': 'Eliminar',
    'delete.cancel': 'Cancelar',
    'delete.success': 'eliminado',
    'delete.error': 'Error al eliminar el lead',

    // Conversations
    'conversations.title': 'Conversaciones',
    'conversations.subtitle': 'Conversaciones de WhatsApp manejadas por ti y por AI',
    'conversations.search': 'Buscar conversaciones...',
    'conversations.noConversations': 'Sin conversaciones',
    'conversations.selectConversation': 'Selecciona una conversación',
    'conversations.aiManaging': 'AI manejando',
    'conversations.humanActive': 'Humano activo',
    'conversations.typePlaceholder': 'Escribe un mensaje...',
    'conversations.send': 'Enviar',
    'conversations.noMessages': 'Sin mensajes',

    // Analytics
    'analytics.title': 'Analíticas',
    'analytics.subtitle': 'Análisis profundo de tu rendimiento',
    'analytics.avgValue': 'Valor Promedio',
    'analytics.hotLeads': 'Leads Calientes',
    'analytics.interestedLeads': 'Leads Interesados',
    'analytics.aiMessages': 'Mensajes AI',
    'analytics.totalMessages': 'Total Mensajes',
    'analytics.interestLevel': 'Nivel de Interés',
    'analytics.businessTypes': 'Tipos de Negocio',
    'analytics.noData': 'Sin datos',

    // Settings
    'settings.title': 'Configuración',
    'settings.subtitle': 'Administra tu cuenta y preferencias',
    'settings.profile': 'Perfil',
    'settings.name': 'Nombre',
    'settings.namePlaceholder': 'Tu nombre',
    'settings.email': 'Email',
    'settings.emailPlaceholder': 'tu@email.com',
    'settings.company': 'Nombre de Empresa',
    'settings.companyPlaceholder': 'Mi Negocio',
    'settings.notifications': 'Notificaciones',
    'settings.newLeadNotif': 'Notificaciones de nuevos leads',
    'settings.newLeadNotifDesc': 'Recibe aviso cuando entra un lead nuevo',
    'settings.aiAlerts': 'Alertas de conversación AI',
    'settings.aiAlertsDesc': 'Aviso cuando el AI necesita intervención humana',
    'settings.weeklyReports': 'Reportes semanales',
    'settings.weeklyReportsDesc': 'Recibe resúmenes de rendimiento semanal',
    'settings.dealClosed': 'Notificación de cierre',
    'settings.dealClosedDesc': 'Aviso cuando se cierra un deal',
    'settings.automation': 'Automatización',
    'settings.aiAutoRespond': 'AI auto-responder',
    'settings.aiAutoRespondDesc': 'Deja que el AI maneje conversaciones iniciales',
    'settings.autoScoring': 'Puntuación automática',
    'settings.autoScoringDesc': 'Puntuar leads automáticamente según engagement',
    'settings.followupReminders': 'Recordatorios de seguimiento',
    'settings.followupRemindersDesc': 'Programar tareas de seguimiento automáticamente',
    'settings.appearance': 'Apariencia',
    'settings.dark': 'Oscuro',
    'settings.light': 'Claro',
    'settings.language': 'Idioma y Región',
    'settings.languageLabel': 'Idioma',
    'settings.timezone': 'Zona Horaria',
    'settings.profilePhoto': 'Foto de Perfil',
    'settings.profilePhotoDesc': 'JPG, PNG o WebP. Máx 2MB.',
    'settings.uploadPhoto': 'Subir Foto',
    'settings.removePhoto': 'Eliminar',
    'settings.photoUpdated': 'Foto actualizada',
    'settings.photoTooLarge': 'Archivo muy grande. Máx 2MB.',
    'settings.save': 'Guardar Cambios',
    'settings.saved': 'Configuración guardada',

    // Recent activity
    'activity.title': 'Actividad Reciente',
    'activity.noActivity': 'Sin actividad reciente',
    'activity.newLead': 'Nuevo lead',
    'activity.aiResponded': 'AI respondió a',
    'activity.conversationWith': 'Conversación con',
    'activity.leadRegistered': 'Lead registrado',
    'activity.aiHandling': 'AI manejando conversación',
    'activity.humanActive': 'Humano activo',

    // Auth
    'auth.welcomeBack': 'Bienvenido de nuevo',
    'auth.signInSubtitle': 'Inicia sesión en tu panel de Impulsa PR',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.signIn': 'Iniciar Sesión',
    'auth.noAccount': '¿No tienes cuenta?',
    'auth.signUp': 'Regístrate',
    'auth.createAccount': 'Crea tu cuenta',
    'auth.signUpSubtitle': 'Comienza a automatizar tu negocio hoy',
    'auth.fullName': 'Nombre Completo',
    'auth.fullNamePlaceholder': 'Juan Pérez',
    'auth.passwordPlaceholder': 'Mín. 6 caracteres',
    'auth.createBtn': 'Crear Cuenta',
    'auth.hasAccount': '¿Ya tienes cuenta?',
    'auth.signInLink': 'Inicia sesión',
    'auth.checkEmail': 'Revisa tu email',
    'auth.confirmSent': 'Enviamos un enlace de confirmación a',
    'auth.backToSignIn': 'Volver a iniciar sesión',
    'auth.signOut': 'Cerrar sesión',

    // Topbar
    'topbar.search': 'Buscar leads, conversaciones...',
    'topbar.searchShort': 'Buscar...',

    // Sidebar
    'sidebar.automationsActive': 'Automatizaciones Activas',
    'sidebar.workflowsRunning': '5 flujos ejecutándose',

    // General
    'general.loading': 'Cargando...',
    'general.ai': 'AI',
    'general.human': 'Humano',
    'general.leads': 'leads',
  },
} as const

type TranslationKey = keyof typeof dictionaries.en

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')

  useEffect(() => {
    const saved = localStorage.getItem('impulsa_locale') as Locale | null
    if (saved && (saved === 'en' || saved === 'es')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('impulsa_locale', newLocale)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = dictionaries[locale] as Record<string, string>
      const fallback = dictionaries.en as Record<string, string>
      let value: string = dict[key] || fallback[key] || key
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v))
        })
      }
      return value
    },
    [locale]
  )

  return (
    <I18nContext value={{ locale, setLocale, t }}>
      {children}
    </I18nContext>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
