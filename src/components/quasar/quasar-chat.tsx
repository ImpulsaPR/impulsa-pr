'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, RotateCcw, Sparkles, X, Mic, Volume2, VolumeX } from 'lucide-react'
import { useCliente } from '@/hooks/use-cliente'
import { useMetricas } from '@/hooks/use-metricas'
import {
  industries,
  suggestionsByIndustry,
  mockReply,
  autoDetectIndustry,
  buildGreeting,
  type ChatContext,
  type IndustryKey,
} from './quasar-data'

type MsgRole = 'user' | 'ai' | 'system' | 'tool'
type Msg = { id: string; role: MsgRole; text: string }

const INDUSTRY_LABELS: Record<IndustryKey, string> = {
  barberia: 'Barbería / Salón',
  dental: 'Clínica dental',
  realestate: 'Real Estate',
  restaurante: 'Restaurante',
  estetica: 'Estética / Spa',
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
let _id = 0
const uid = () => `m${++_id}`

// Web Speech API minimal types (browser-only, no @types needed)
type SR = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
}
type SRWindow = Window & {
  SpeechRecognition?: new () => SR
  webkitSpeechRecognition?: new () => SR
}

function getRecognition(): SR | null {
  if (typeof window === 'undefined') return null
  const w = window as SRWindow
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  if (!Ctor) return null
  const r = new Ctor()
  r.lang = 'es-PR'
  r.continuous = false
  r.interimResults = false
  return r
}

function speak(text: string) {
  if (typeof window === 'undefined') return
  const synth = window.speechSynthesis
  if (!synth) return
  synth.cancel()
  const clean = text
    .replace(/[*_`#>]/g, '')
    .replace(/[📊📅📈💰👥⭐🚨💸✅💳🔗📱✉️🖼️📍⏰💬🔊▶️🏡🍖]/gu, '')
    .slice(0, 600)
  const u = new SpeechSynthesisUtterance(clean)
  u.lang = 'es-PR'
  u.rate = 1.05
  u.pitch = 1
  synth.speak(u)
}

export function QuasarChat() {
  const { cliente } = useCliente()
  const { data: metricas } = useMetricas(7)

  const [industry, setIndustry] = useState<IndustryKey>('barberia')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [interactions, setInteractions] = useState(0)
  const [ctaShown, setCtaShown] = useState(false)
  const [ctaDismissed, setCtaDismissed] = useState(false)
  const [closerShown, setCloserShown] = useState(false)
  const [closerDismissed, setCloserDismissed] = useState(false)
  const [pending, setPending] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [listening, setListening] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const recogRef = useRef<SR | null>(null)
  const lastIndustryRef = useRef<IndustryKey | null>(null)

  const data = industries[industry]

  const ctx: ChatContext = useMemo(() => {
    const r = metricas?.resumen
    const txs = r ? r.citas_completadas : 0
    const ticket = txs > 0 && r ? Math.round((r.leads_totales * 30) / txs) : null
    return {
      nombre: cliente?.nombre ?? null,
      empresa: cliente?.empresa ?? null,
      mensajesPendientes: r?.mensajes_recibidos ?? null,
      leadsTotales: r?.leads_totales ?? null,
      citasSemana: r?.citas_agendadas ?? null,
      ticketPromedio: ticket,
    }
  }, [cliente, metricas])

  // Init / reset on industry change
  useEffect(() => {
    if (lastIndustryRef.current === industry) return
    lastIndustryRef.current = industry
    setMessages([
      { id: uid(), role: 'system', text: `— Sesión iniciada · ${data.label} —` },
      { id: uid(), role: 'ai', text: buildGreeting(data, ctx) },
    ])
    setInteractions(0)
    setCtaShown(false)
    setCtaDismissed(false)
    setCloserShown(false)
    setCloserDismissed(false)
  }, [industry, data, ctx])

  // Autoscroll
  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const reset = () => {
    setMessages([
      { id: uid(), role: 'system', text: `— Sesión iniciada · ${data.label} —` },
      { id: uid(), role: 'ai', text: buildGreeting(data, ctx) },
    ])
    setInteractions(0)
    setCtaShown(false)
    setCtaDismissed(false)
    setCloserShown(false)
    setCloserDismissed(false)
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    let nextIndustry = industry
    const detected = autoDetectIndustry(trimmed, industry)
    const queued: Msg[] = []
    if (detected) {
      nextIndustry = detected
      queued.push({ id: uid(), role: 'system', text: `— Cambio de contexto · ${industries[detected].label} —` })
      setIndustry(detected)
    }
    queued.push({ id: uid(), role: 'user', text: trimmed })
    setMessages((m) => [...m, ...queued])
    setInput('')
    const nextInteractions = interactions + 1
    setInteractions(nextInteractions)
    setPending(true)

    const mock = mockReply(trimmed, industries[nextIndustry], ctx)
    await sleep(700)

    if (mock.toolSteps && mock.toolSteps.length > 0) {
      for (const step of mock.toolSteps) {
        setMessages((m) => [...m, { id: uid(), role: 'tool', text: '⚡ ' + step }])
        await sleep(550)
      }
    } else if (mock.tool) {
      setMessages((m) => [...m, { id: uid(), role: 'tool', text: '⚡ ' + mock.tool }])
      await sleep(450)
    }

    setMessages((m) => [...m, { id: uid(), role: 'ai', text: mock.output }])
    setPending(false)

    if (voiceOn) speak(mock.output)
    if (nextInteractions >= 3 && !ctaDismissed) setCtaShown(true)
    if (nextInteractions >= 5 && !closerDismissed) setCloserShown(true)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  const toggleMic = () => {
    if (listening) {
      recogRef.current?.stop()
      return
    }
    const r = getRecognition()
    if (!r) {
      alert('Tu navegador no soporta dictado por voz. Usa Chrome o Edge.')
      return
    }
    recogRef.current = r
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      send(transcript)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    setListening(true)
    r.start()
  }

  const toggleVoiceOut = () => {
    if (voiceOn && typeof window !== 'undefined') window.speechSynthesis?.cancel()
    setVoiceOn((v) => !v)
  }

  const firstName = cliente?.nombre?.split(/\s+/)[0]
  const empresa = cliente?.empresa

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-3xl mx-auto w-full animate-page-in">
      {/* Hero */}
      <section className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted">
            Quasar IA · Demo en vivo{empresa ? ` · ${empresa}` : ''}
          </span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] text-foreground">
          esto no es un bot.
        </h1>
        <p className="font-display text-lg text-muted mt-3">
          {firstName
            ? `${firstName}, así trabajaría tu IA. Respuesta < 5s, 24/7, con tu data.`
            : 'IA entrenada para vender tu servicio. Respuesta en menos de 5 segundos, disponible 24/7.'}
        </p>
      </section>

      {/* Industry + voice + reset */}
      <div className="flex items-center gap-3 flex-wrap pt-4">
        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted">
          Industria
        </span>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as IndustryKey)}
          className="bg-card border border-border text-foreground rounded-full px-4 py-2 text-sm font-medium cursor-pointer hover:border-primary focus:border-primary outline-none transition-colors"
        >
          {(Object.keys(INDUSTRY_LABELS) as IndustryKey[]).map((k) => (
            <option key={k} value={k}>
              {INDUSTRY_LABELS[k]}
            </option>
          ))}
        </select>
        <button
          onClick={toggleVoiceOut}
          className={`inline-flex items-center gap-1.5 border px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors ${
            voiceOn
              ? 'bg-primary text-background border-primary'
              : 'bg-transparent text-muted border-border hover:text-primary hover:border-primary'
          }`}
          title="Lectura en voz alta"
        >
          {voiceOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          Voz {voiceOn ? 'on' : 'off'}
        </button>
        <button
          onClick={reset}
          className="ml-auto inline-flex items-center gap-1.5 bg-transparent border border-border text-muted hover:text-primary hover:border-primary px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors"
          title="Reiniciar conversación"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto py-6 flex flex-col gap-3.5">
        {messages.map((m) => {
          if (m.role === 'system') {
            return (
              <div
                key={m.id}
                className="self-center text-[11px] font-semibold tracking-[0.15em] uppercase text-muted py-1 text-center"
              >
                {m.text}
              </div>
            )
          }
          if (m.role === 'tool') {
            return (
              <div
                key={m.id}
                className="self-end -mb-1 text-[10px] font-bold tracking-[0.15em] uppercase text-primary animate-fade-up"
              >
                {m.text}
              </div>
            )
          }
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              className={`max-w-[78%] px-5 py-3.5 rounded-2xl text-[15px] leading-[1.55] whitespace-pre-wrap break-words animate-fade-up ${
                isUser
                  ? 'self-start bg-card text-foreground rounded-bl-md shadow-sm'
                  : 'self-end bg-card-hover text-foreground rounded-br-md'
              }`}
            >
              {m.text}
            </div>
          )
        })}
        {pending && (
          <div className="self-end bg-card-hover rounded-2xl rounded-br-md px-5 py-3.5">
            <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-[blink_1.4s_infinite]" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-[blink_1.4s_infinite_0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-[blink_1.4s_infinite_0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2 py-4 border-t border-border">
        {suggestionsByIndustry[industry].map((txt) => (
          <button
            key={txt}
            type="button"
            onClick={() => send(txt)}
            disabled={pending}
            className="bg-transparent border border-border text-foreground hover:border-primary hover:text-primary hover:bg-card px-4 py-2 rounded-full text-[13px] font-medium transition-colors disabled:opacity-40"
          >
            {txt}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form
        onSubmit={onSubmit}
        className="flex gap-2 items-end p-1.5 pl-5 bg-card border border-border rounded-full focus-within:border-foreground transition-colors"
      >
        <textarea
          value={input}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder={listening ? 'Escuchando...' : 'Escribe o usa el micrófono...'}
          rows={1}
          className="flex-1 bg-transparent border-none text-foreground text-[15px] resize-none outline-none py-3 placeholder:text-muted placeholder:italic max-h-[120px] leading-[1.5]"
        />
        <button
          type="button"
          onClick={toggleMic}
          disabled={pending}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            listening
              ? 'bg-primary text-background animate-pulse'
              : 'bg-transparent text-muted hover:text-primary hover:bg-card-hover'
          }`}
          title={listening ? 'Parar' : 'Hablar'}
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={!input.trim() || pending}
          className="bg-foreground text-background hover:bg-primary px-5 py-2.5 rounded-full font-semibold text-[12px] tracking-[0.05em] uppercase inline-flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
        >
          Enviar <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* CTA banner — soft (3 interacciones) */}
      {ctaShown && !ctaDismissed && !closerShown && (
        <div className="sticky bottom-3 mt-4 mb-1 bg-foreground text-background rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_2px_0_rgba(26,20,16,0.04),0_12px_28px_rgba(26,20,16,0.18)] animate-fade-up">
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.2em] uppercase text-accent-yellow font-bold mb-1">
              Tu turno
            </div>
            <div className="font-display text-xl leading-tight">
              Esto es una demo.{' '}
              <span className="not-italic font-normal text-accent-yellow">
                Tu IA real sería igual
              </span>{' '}
              — con tu data.
            </div>
          </div>
          <a
            href="https://impulsapr.com/"
            target="_blank"
            rel="noreferrer"
            className="bg-primary text-background hover:bg-accent-yellow hover:text-foreground px-5 py-3 rounded-full text-[12px] font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors active:scale-[0.97]"
          >
            Diagnóstico gratis →
          </a>
          <button
            onClick={() => setCtaDismissed(true)}
            className="bg-transparent border-none text-background/60 hover:text-background"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* CTA closer — fuerte (5 interacciones, personalizado) */}
      {closerShown && !closerDismissed && (
        <div className="sticky bottom-3 mt-4 mb-1 bg-foreground text-background rounded-2xl px-6 py-5 shadow-[0_2px_0_rgba(26,20,16,0.04),0_16px_40px_rgba(26,20,16,0.25)] animate-fade-up border border-primary/40">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="text-[10px] tracking-[0.2em] uppercase text-accent-yellow font-bold mb-2">
                {firstName ? `${firstName}, decisión:` : 'Decisión:'}
              </div>
              <div className="font-display text-2xl leading-[1.15] mb-2">
                Llevas 5 mensajes con esta demo.{' '}
                <span className="not-italic font-normal text-accent-yellow">
                  Tu IA real lleva ya 47 conversaciones cerradas
                </span>{' '}
                en otros negocios.
              </div>
              <div className="text-sm text-background/70">
                {empresa
                  ? `Activamos Quasar para ${empresa} esta semana. Onboarding en 48h.`
                  : 'Activamos Quasar para tu negocio esta semana. Onboarding en 48h.'}
              </div>
            </div>
            <button
              onClick={() => setCloserDismissed(true)}
              className="bg-transparent border-none text-background/60 hover:text-background"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <a
              href="https://impulsapr.com/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-primary text-background hover:bg-accent-yellow hover:text-foreground px-5 py-3 rounded-full text-[12px] font-bold tracking-[0.12em] uppercase transition-colors active:scale-[0.97]"
            >
              Activar mi IA →
            </a>
            <button
              type="button"
              onClick={() => send('¿Cuánto pierdo sin IA?')}
              className="px-5 py-3 rounded-full text-[12px] font-bold tracking-[0.12em] uppercase border border-background/20 text-background/80 hover:bg-background/10 transition-colors"
            >
              Ver mi ROI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
