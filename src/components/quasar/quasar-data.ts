export type IndustryKey = 'barberia' | 'dental' | 'realestate' | 'restaurante' | 'estetica'

export type Cita = { h: string; c: string; s: string; p: number }
export type Servicio = { n: string; p: number }

export type IndustryData = {
  label: string
  greeting: string
  clientes: string[]
  cliente1: { nombre: string; servicio: string; monto: number }
  servicios: Servicio[]
  citas: Cita[]
  stats: {
    totalHoy: number
    txs: number
    ticket?: number
    leadsCalificados?: number
    showings?: number
    topSvc: string
    topCount: number
    topAmt: number
  }
  semanal: {
    total: number
    growth: string
    clientes: number
    nuevos: number
    completadas: number
    noshow: number
  }
  stock: string
  post: string
  catalog: string[]
}

export const industries: Record<IndustryKey, IndustryData> = {
  barberia: {
    label: 'barbería',
    greeting: 'Perfecto, barbería. Mira lo que te haría tu IA',
    clientes: ['María R.', 'Pedro V.', 'Carmen O.', 'Luis S.', 'Ana F.', 'Roberto D.'],
    cliente1: { nombre: 'María', servicio: 'corte + tinte', monto: 120 },
    servicios: [
      { n: 'Corte hombre', p: 30 },
      { n: 'Corte mujer', p: 45 },
      { n: 'Color completo', p: 120 },
      { n: 'Balayage', p: 180 },
      { n: 'Barba', p: 20 },
      { n: 'Corte + barba', p: 45 },
    ],
    citas: [
      { h: '09:00', c: 'María R.', s: 'Corte + tinte', p: 120 },
      { h: '10:30', c: 'Pedro V.', s: 'Barba', p: 20 },
      { h: '11:00', c: 'Carmen O.', s: 'Balayage', p: 180 },
      { h: '13:00', c: 'Luis S.', s: 'Corte', p: 30 },
      { h: '14:30', c: 'Ana F.', s: 'Manicure + pedicure', p: 70 },
      { h: '16:00', c: 'Roberto D.', s: 'Barba + lineup', p: 25 },
      { h: '17:30', c: 'Isabel M.', s: 'Corte + peinado', p: 65 },
    ],
    stats: { totalHoy: 1847.5, txs: 14, ticket: 131.96, topSvc: 'Corte + barba', topCount: 6, topAmt: 540 },
    semanal: { total: 11284.3, growth: '+12%', clientes: 87, nuevos: 14, completadas: 82, noshow: 5 },
    stock: 'tinte rubio ceniza (quedan 2)',
    post: '20% OFF en servicios de color esta semana — aparta tu cita',
    catalog: ['Corte hombre $30', 'Corte mujer $45', 'Color $120', 'Balayage $180', 'Keratina $150', 'Barba $20', 'Combo corte+barba $45'],
  },
  dental: {
    label: 'clínica dental',
    greeting: 'Nítido, clínica dental. Mira cómo trabajaría tu IA',
    clientes: ['Sra. Martínez', 'Sr. Rivera', 'Lcda. Torres', 'Pedro C.', 'Isabel R.', 'Carlos G.'],
    cliente1: { nombre: 'Sra. Martínez', servicio: 'limpieza + blanqueamiento', monto: 180 },
    servicios: [
      { n: 'Limpieza', p: 80 },
      { n: 'Resina', p: 120 },
      { n: 'Blanqueamiento', p: 350 },
      { n: 'Extracción', p: 150 },
      { n: 'Endodoncia', p: 450 },
      { n: 'Corona', p: 850 },
    ],
    citas: [
      { h: '08:30', c: 'Sra. Martínez', s: 'Limpieza profunda', p: 120 },
      { h: '09:30', c: 'Sr. Rivera', s: 'Consulta + evaluación', p: 50 },
      { h: '10:30', c: 'Lcda. Torres', s: 'Blanqueamiento', p: 350 },
      { h: '12:00', c: 'Pedro C.', s: 'Resina (2 piezas)', p: 240 },
      { h: '14:00', c: 'Carlos G.', s: 'Extracción cordal', p: 200 },
      { h: '15:30', c: 'Isabel R.', s: 'Endodoncia (cita 2/3)', p: 450 },
    ],
    stats: { totalHoy: 2890.0, txs: 9, ticket: 321.11, topSvc: 'Endodoncia + Corona', topCount: 2, topAmt: 1300 },
    semanal: { total: 18450.0, growth: '+8%', clientes: 52, nuevos: 9, completadas: 48, noshow: 4 },
    stock: 'composite A2 (quedan 3 jeringas)',
    post: 'Limpieza + evaluación por $80 — solo este mes. Agenda gratis por WhatsApp',
    catalog: ['Limpieza $80', 'Resina $120', 'Blanqueamiento $350', 'Extracción $150', 'Endodoncia $450', 'Corona $850', 'Consulta $50'],
  },
  realestate: {
    label: 'real estate',
    greeting: 'Real estate. Aquí te muestro cómo tu IA califica leads y agenda showings',
    clientes: ['Juan Rivera', 'Laura Méndez', 'Sr. García', 'Karla S.', 'Andrés P.', 'Fam. Ortiz'],
    cliente1: { nombre: 'Juan Rivera', servicio: 'showing casa Dorado', monto: 0 },
    servicios: [
      { n: 'Casa 3/2 Dorado', p: 385000 },
      { n: 'Apto Condado', p: 240000 },
      { n: 'Casa 4/3 Guaynabo', p: 520000 },
      { n: 'Lote San Juan', p: 180000 },
    ],
    citas: [
      { h: '10:00', c: 'Juan Rivera', s: 'Showing Dorado (3/2)', p: 385000 },
      { h: '11:30', c: 'Laura Méndez', s: 'Showing Condado', p: 240000 },
      { h: '14:00', c: 'Sr. García', s: 'Firma de contrato', p: 520000 },
      { h: '16:00', c: 'Karla S.', s: 'Qualifying call', p: 0 },
      { h: '17:30', c: 'Fam. Ortiz', s: 'Showing Guaynabo', p: 520000 },
    ],
    stats: { totalHoy: 0, txs: 5, leadsCalificados: 3, showings: 3, topSvc: 'Showings Dorado', topCount: 2, topAmt: 770000 },
    semanal: { total: 1250000, growth: 'en pipeline', clientes: 34, nuevos: 18, completadas: 12, noshow: 2 },
    stock: '6 propiedades activas en MLS',
    post: '🏡 Nueva casa en Dorado · 3/2 · $385K · tour virtual en bio',
    catalog: ['Casa 3/2 Dorado · $385K', 'Apto Condado · $240K', 'Casa 4/3 Guaynabo · $520K', 'Lote SJ · $180K', 'Apto Rincón · $310K'],
  },
  restaurante: {
    label: 'restaurante',
    greeting: 'Brutal, restaurante. Mira cómo sería tu IA con reservas y delivery',
    clientes: ['Mesa García', 'Familia Ríos', 'Grupo Diaz', 'Cumpleaños Ana', 'Cena corporativa'],
    cliente1: { nombre: 'Familia Ríos', servicio: 'reserva mesa 6', monto: 0 },
    servicios: [
      { n: 'Mofongo relleno', p: 18 },
      { n: 'Churrasco', p: 32 },
      { n: 'Pescado del día', p: 28 },
      { n: 'Sangría pitcher', p: 24 },
      { n: 'Menú degustación', p: 65 },
    ],
    citas: [
      { h: '18:00', c: 'Mesa García (4 pax)', s: 'Reserva terraza', p: 0 },
      { h: '19:00', c: 'Familia Ríos (6 pax)', s: 'Cumpleaños', p: 0 },
      { h: '19:30', c: 'Grupo Diaz (8 pax)', s: 'Reserva interior', p: 0 },
      { h: '20:30', c: 'Cena Corp. (12 pax)', s: 'Menú degustación', p: 780 },
      { h: '21:00', c: 'Walk-in slots', s: 'Disponible', p: 0 },
    ],
    stats: { totalHoy: 3240.0, txs: 42, ticket: 77.14, topSvc: 'Churrasco', topCount: 18, topAmt: 576 },
    semanal: { total: 22890.0, growth: '+15%', clientes: 278, nuevos: 62, completadas: 265, noshow: 13 },
    stock: 'churrasco premium (pide reorder para viernes)',
    post: '🍖 Viernes de churrasco · sangría 2x1 · reserva tu mesa',
    catalog: ['Mofongo $18', 'Churrasco $32', 'Pescado del día $28', 'Degustación $65', 'Sangría pitcher $24'],
  },
  estetica: {
    label: 'estética',
    greeting: 'Dale, spa/estética. Te muestro cómo tu IA llena la agenda',
    clientes: ['Jennifer L.', 'Andrea M.', 'Sra. Vázquez', 'Karla P.', 'Lucía R.'],
    cliente1: { nombre: 'Jennifer', servicio: 'facial + masaje', monto: 180 },
    servicios: [
      { n: 'Facial limpieza', p: 75 },
      { n: 'Masaje relajante 60min', p: 90 },
      { n: 'Masaje piedras', p: 120 },
      { n: 'Botox unidad', p: 12 },
      { n: 'Depilación láser sesión', p: 150 },
    ],
    citas: [
      { h: '09:00', c: 'Jennifer L.', s: 'Facial + masaje', p: 180 },
      { h: '10:30', c: 'Andrea M.', s: 'Depilación láser piernas', p: 220 },
      { h: '12:00', c: 'Sra. Vázquez', s: 'Botox (30 unidades)', p: 360 },
      { h: '14:00', c: 'Karla P.', s: 'Masaje piedras', p: 120 },
      { h: '16:00', c: 'Lucía R.', s: 'Tratamiento antiedad', p: 280 },
    ],
    stats: { totalHoy: 2640.0, txs: 11, ticket: 240.0, topSvc: 'Botox + láser', topCount: 4, topAmt: 940 },
    semanal: { total: 14380.0, growth: '+18%', clientes: 68, nuevos: 21, completadas: 64, noshow: 4 },
    stock: 'ácido hialurónico (solo 2 jeringas)',
    post: 'Facial + masaje por $149 · ahorra $31 · solo esta semana',
    catalog: ['Facial $75', 'Masaje 60min $90', 'Masaje piedras $120', 'Botox $12/u', 'Láser sesión $150'],
  },
}

export const suggestionsByIndustry: Record<IndustryKey, string[]> = {
  barberia: ['¿Ventas de hoy?', 'Citas de mañana', 'Cóbrale $45 a María', 'Publica oferta color', '¿Cuánto pierdo sin IA?', 'Mándale audio a Pedro'],
  dental: ['¿Ventas de hoy?', 'Citas de mañana', 'Cóbrale $350 a Sra. Martínez', 'Publica promo limpieza', '¿Cuánto pierdo sin IA?', 'Mensajes sin contestar'],
  realestate: ['Showings de mañana', 'Califica los leads nuevos', 'Publica casa Dorado', 'Agenda showing con Juan', 'Resumen pipeline', 'Mándale audio a Laura'],
  restaurante: ['Reservas de hoy', 'Ventas de hoy', 'Publica viernes de churrasco', 'Cóbrale $780 a cena corp.', '¿Cuánto pierdo sin IA?', 'Catálogo'],
  estetica: ['¿Ventas de hoy?', 'Citas de mañana', 'Cóbrale $180 a Jennifer', 'Publica promo facial', '¿Cuánto pierdo sin IA?', 'Mensajes pendientes'],
}

export const industryKeywords: Record<IndustryKey, RegExp> = {
  dental: /dent|clinic|diente|endodonc|ortodon|limpieza.*diente/i,
  realestate: /real.*estate|propiedad|casa.*vend|inmobili|lead|showing|mls/i,
  restaurante: /restaurant|mesa|reserva.*mesa|cocina|delivery|mofongo|menu del/i,
  estetica: /spa|facial|botox|masaje|estetica|depilac|laser/i,
  barberia: /barber|salon|corte.*pelo|tinte|balayage|barba/i,
}

const money = (n: number) => (n >= 1000 ? '$' + n.toLocaleString('en-US') : '$' + n.toFixed(2))

const fmtFecha = (d: Date) =>
  d.toLocaleDateString('es-PR', { weekday: 'long', day: 'numeric', month: 'long' })

export type ChatContext = {
  nombre: string | null
  empresa: string | null
  mensajesPendientes: number | null
  leadsTotales: number | null
  citasSemana: number | null
  ticketPromedio: number | null
}

export const emptyContext: ChatContext = {
  nombre: null,
  empresa: null,
  mensajesPendientes: null,
  leadsTotales: null,
  citasSemana: null,
  ticketPromedio: null,
}

export type Scenario = {
  match: RegExp
  tool: string | null
  toolSteps?: string[]
  reply: (industry: IndustryData, m: RegExpMatchArray, ctx: ChatContext) => string
}

const firstName = (full: string | null) =>
  full ? full.trim().split(/\s+/)[0] : null

export function buildGreeting(industry: IndustryData, ctx: ChatContext): string {
  const nombre = firstName(ctx.nombre)
  const empresa = ctx.empresa
  const pendientes = ctx.mensajesPendientes
  if (nombre && empresa && pendientes && pendientes > 0) {
    return `${nombre}, hoy tienes **${pendientes} mensaje${pendientes === 1 ? '' : 's'} sin contestar** en ${empresa}. Mira lo que tu IA habría hecho 👇`
  }
  if (nombre && empresa) {
    return `Hola ${nombre} 👋 Soy Quasar para ${empresa}. ${industry.greeting.split('. ')[1] || 'Pregunta lo que necesites'} 👇`
  }
  return industry.greeting + '. Pregunta lo que necesites 👇'
}

export const scenarios: Scenario[] = [
  {
    match: /ventas.*(hoy|dia)|hoy.*ventas|cuanto.*vend|cuanto.*hice|facturac/i,
    tool: 'consultar_ventas',
    toolSteps: ['Conectando con Stripe...', 'Cruzando con citas completadas...', 'Calculando ticket promedio...'],
    reply: (d, _m, ctx) => {
      const s = d.stats
      const topCliente = d.clientes[0]
      const empresa = ctx.empresa ? ` de **${ctx.empresa}**` : ''
      return `📊 *Ventas de hoy${empresa}* (${fmtFecha(new Date())}) — ${d.label}

• Total: ${money(s.totalHoy)} (${s.txs} transacciones)
• Ticket promedio: ${money(s.ticket ?? 0)}
• Top servicio: ${s.topSvc} (${money(s.topAmt)}, ${s.topCount} unidades)
• vs. promedio semanal: +18% 📈

Cliente destacado del día: ${topCliente}.
¿Te preparo el reporte en Sheets o lo mando directo a contabilidad?`
    },
  },
  {
    match: /citas.*(mañana|manana|hoy)|mañana.*citas|agenda.*(mañana|hoy)|reservas|que tengo/i,
    tool: 'listar_citas',
    toolSteps: ['Consultando Google Calendar...', 'Cruzando con base de clientes...'],
    reply: (d) => {
      const mañana = new Date(Date.now() + 864e5)
      const lines = d.citas.map((c) => `• ${c.h} — ${c.c} · ${c.s}${c.p ? ' (' + money(c.p) + ')' : ''}`).join('\n')
      return `📅 *Agenda de mañana* (${fmtFecha(mañana)}) — ${d.label}

Tienes ${d.citas.length} ${d.label === 'real estate' ? 'showings/reuniones' : 'citas'} confirmadas:

${lines}

⚠️ Aún hay slots libres. ¿Publico disponibilidad en el story de Instagram?`
    },
  },
  {
    match: /resumen.*seman|semana.*resumen|semanal|ultimos.*dias/i,
    tool: 'consultar_ventas + sheet_reporte',
    toolSteps: ['Consultando Stripe + Calendar...', 'Calculando tendencia 7 días...', 'Detectando clientes inactivos...', 'Generando reporte...'],
    reply: (d, _m, ctx) => {
      const w = d.semanal
      const ticket = ctx.ticketPromedio ?? d.stats.ticket ?? 75
      const pendientes = ctx.mensajesPendientes ?? 47
      const cierre = 0.35
      const perdido = Math.round(pendientes * ticket * cierre)
      const empresa = ctx.empresa ? ` — ${ctx.empresa}` : ''
      return `📈 *Resumen semanal${empresa}* (últimos 7 días)

💰 Ventas totales: ${money(w.total)} (${w.growth})
👥 Clientes atendidos: ${w.clientes} (${w.nuevos} nuevos)
📅 Completadas: ${w.completadas} · No-shows: ${w.noshow}
⭐ Servicio top: ${d.stats.topSvc}

💸 *Lo que perdiste sin IA esta semana*: ~${money(perdido)}
   = ${pendientes} mensajes sin contestar × ticket promedio ${money(ticket)} × 35% tasa de cierre

🚨 *Alertas*:
• 3 clientes VIP sin visita en 30+ días (listos para reactivación)
• Stock bajo: ${d.stock}
• Mejor día: miércoles

¿Te mando el Excel al correo o lo publico en tu dashboard?`
    },
  },
  {
    match: /(cuanto|cuánto).*(pierdo|perd|cuesta)|roi|valor.*ia|que.*pierdo/i,
    tool: 'calculadora_roi',
    toolSteps: ['Analizando mensajes sin contestar...', 'Calculando ticket promedio...', 'Proyectando a 12 meses...'],
    reply: (d, _m, ctx) => {
      const ticket = ctx.ticketPromedio ?? d.stats.ticket ?? 75
      const pendientesSem = ctx.mensajesPendientes ?? 47
      const cierre = 0.35
      const perdidoSem = Math.round(pendientesSem * ticket * cierre)
      const perdidoMes = perdidoSem * 4
      const perdidoAno = perdidoMes * 12
      return `💰 *Calculadora de ROI — sin IA vs con IA*

Datos${ctx.empresa ? ` de ${ctx.empresa}` : ''}:
• Mensajes sin contestar/semana: ${pendientesSem}
• Ticket promedio: ${money(ticket)}
• Tasa de cierre IA estimada: 35%

📉 *Lo que pierdes sin IA*
• Por semana: ~${money(perdidoSem)}
• Por mes: ~${money(perdidoMes)}
• Por año: **${money(perdidoAno)}**

📈 *Con IA activa*
• Recuperas 70% de esos mensajes (responde en <5s, 24/7)
• Ganancia anual proyectada: **${money(Math.round(perdidoAno * 0.7))}**
• Costo IA: $99/mes = $1,188/año
• ROI año 1: **${Math.round(((perdidoAno * 0.7 - 1188) / 1188) * 100)}x**

¿Te activamos tu IA esta semana?`
    },
  },
  {
    match: /agenda.*(reunion|cita|meeting|showing|reserva).*(con|a|para) (\w+)/i,
    tool: 'crear_cita',
    toolSteps: ['Buscando contacto en Google Contacts...', 'Verificando disponibilidad...', 'Generando Meet link...', 'Enviando invitación...'],
    reply: (d, m) => {
      const nombre = m[3] ? m[3].charAt(0).toUpperCase() + m[3].slice(1) : 'contacto'
      const hoy = new Date()
      const f = new Date(hoy.getTime() + 2 * 864e5)
      return `✅ *Cita creada en Google Calendar*

Con ${nombre}
📅 Viernes ${f.getDate()} de ${hoy.toLocaleDateString('es-PR', { month: 'long' })}
🕐 3:00pm – 4:00pm
📍 ${d.label === 'real estate' ? 'Propiedad / tour' : 'Tu local'} · Meet link generado

Mandé invitación por email. ¿Agrego recordatorio 1h antes por WhatsApp?`
    },
  },
  {
    match: /cobr(a|ale|arle).*\$?(\d+).*(a|para) (\w+)|\$(\d+).*a (\w+)/i,
    tool: 'cobrar_cliente + enviar_factura',
    toolSteps: ['Generando link Stripe...', 'Generando link ATH Móvil...', 'Enviando por WhatsApp...'],
    reply: (d, m) => {
      const monto = m[2] || m[5] || String(d.cliente1.monto || 150)
      const raw = m[4] || m[6] || 'cliente'
      const nombre = raw.charAt(0).toUpperCase() + raw.slice(1)
      return `💳 *Link de pago generado*

Cliente: ${nombre}
Monto: $${monto}.00 USD
Concepto: Servicio ${d.label}

🔗 https://checkout.stripe.com/c/pay/cs_live_b1A2c3... (Stripe)
📱 Link ATH Móvil alterno enviado también

✉️ Se lo mandé por WhatsApp a ${nombre}. Cuando pague, genero la factura PDF y te notifico.`
    },
  },
  {
    match: /publica.*(instagram|ig|facebook|fb|redes|post)/i,
    tool: 'publicar_redes',
    toolSteps: ['Generando texto con tu marca...', 'Creando imagen con AI...', 'Programando en Meta Business...'],
    reply: (d) => `📱 *Publicación programada*

Texto generado para ${d.label}:
> "${d.post}"

🖼️ Imagen generada con AI (paleta de tu marca)
📍 Instagram Feed + Story, Facebook Page
⏰ Hora óptima: 6:30pm (máximo engagement)

¿Publico ahora o lo programo? También hago variantes para Reels.`,
  },
  {
    match: /mensajes.*sin.*contestar|pendientes.*respond|contesta|leads/i,
    tool: 'search_cliente + consultar_historial',
    toolSteps: ['Leyendo bandeja WhatsApp Business...', 'Cruzando con historial de cada cliente...', 'Generando respuestas sugeridas...'],
    reply: (d) => {
      const [c1, c2, c3] = d.clientes
      const svc = d.servicios[0]
      return `💬 *Mensajes sin contestar* (4)

1. **${c1}** (hace 2h) — "¿Tienen disponibilidad el sábado pm?"
   → *Sugerida*: "¡Hola! Sí, tengo 2pm y 5pm disponibles. ¿Cuál te sirve?"

2. **${c2}** (hace 3h) — "Cuánto cuesta ${svc.n.toLowerCase()}"
   → *Sugerida*: "${svc.n} está en $${svc.p}. ¿Te agendo?"

3. **${c3}** (hace 5h) — "Quiero cancelar lo de mañana"
   → *Acción*: cancelar + ofrecer reagendar próxima semana.

4. Cliente nuevo (ayer) — Solo envió "hola"
   → *Sugerida*: saludo + preguntar en qué ayudar.

¿Envío todas con las sugeridas o las revisas?`
    },
  },
  {
    match: /audio.*(a|para) (\w+)|mand.*(voz|audio)/i,
    tool: 'enviar_audio (ElevenLabs)',
    toolSteps: ['Generando audio con tu voz clonada...', 'Subiendo a WhatsApp media...', 'Enviando como nota de voz...'],
    reply: (d, m) => {
      const raw = m[2] || d.clientes[1].split(' ')[0]
      const nombre = raw.charAt(0).toUpperCase() + raw.slice(1)
      return `🔊 *Audio generado con tu voz clonada*

Para: ${nombre}
Duración: 0:14
Voz: ElevenLabs (tu voz personalizada)
▶️ [Preview disponible]

Mensaje: "Hola ${nombre}, recordándote tu cita de mañana. Cualquier cosa me avisas, gracias!"

Enviado como nota de voz por WhatsApp ✓`
    },
  },
  {
    match: /(hola|buenas|hey|saludos|que tal|probando)/i,
    tool: null,
    reply: (d, _m, ctx) => {
      const nombre = firstName(ctx.nombre)
      const empresa = ctx.empresa
      const saludo = nombre && empresa
        ? `¡Hola ${nombre}! 👋 Soy Quasar, la IA de ${empresa}.`
        : `¡Buenas! 👋 Soy Quasar, tu asistente para ${d.label}.`
      return `${saludo} Puedo:

• Ver ventas, citas y reportes en tiempo real
• Agendar/cancelar (Google Calendar)
• Cobrar (Stripe / ATH)
• Contestar WhatsApp pendientes
• Publicar en redes
• Generar audios con tu voz

¿Qué necesitas? Prueba las sugerencias 👇`
    },
  },
  {
    match: /catalog|precio|producto|servicio|menu|inventario/i,
    tool: 'catalogo_producto',
    toolSteps: ['Cargando catálogo...', 'Generando previews HD...'],
    reply: (d) => {
      const items = d.catalog.map((x) => `• ${x}`).join('\n')
      return `🖼️ *Catálogo actual — ${d.label}*

${items}

📸 Puedo mandar fotos HD por WhatsApp al cliente que te pregunte. ¿A quién se lo envío?`
    },
  },
]

export function mockReply(
  text: string,
  industry: IndustryData,
  ctx: ChatContext = emptyContext,
): { output: string; tool: string | null; toolSteps?: string[] } {
  for (const s of scenarios) {
    const m = text.match(s.match)
    if (m) return { output: s.reply(industry, m, ctx), tool: s.tool, toolSteps: s.toolSteps }
  }
  return {
    output: `Entiendo que me preguntas: "${text}"

En la demo offline solo tengo escenarios pre-cargados. Prueba con:
• "¿Ventas de hoy?"
• "Citas de mañana"
• "Agenda reunión con Juan viernes 3pm"
• "Cóbrale $150 a María"
• "Publica en Instagram"

En LIVE con tu N8N real, respondo cualquier cosa usando las 13 tools conectadas al AI Agent.`,
    tool: null,
  }
}

export function autoDetectIndustry(text: string, current: IndustryKey): IndustryKey | null {
  for (const key of Object.keys(industryKeywords) as IndustryKey[]) {
    if (industryKeywords[key].test(text) && current !== key) return key
  }
  return null
}
