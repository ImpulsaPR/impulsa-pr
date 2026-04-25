import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!

const VALID_CATEGORIES = new Set([
  'faq',
  'producto',
  'servicio',
  'politica',
  'correccion',
  'general',
])

interface UpsertBody {
  id?: string
  category: string
  question: string
  answer: string
  tags?: string[]
  source?: string
}

async function embed(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data?.[0]?.embedding || null
}

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY no configurado' }, { status: 500 })
  }

  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: cliente } = await admin
    .from('clientes')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!cliente) return NextResponse.json({ error: 'cliente no encontrado' }, { status: 403 })

  let body: UpsertBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'json invalido' }, { status: 400 })
  }

  const category = (body.category || '').toLowerCase().trim()
  const question = (body.question || '').trim()
  const answer = (body.answer || '').trim()

  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: 'category invalida', valid: Array.from(VALID_CATEGORIES) },
      { status: 400 }
    )
  }
  if (!question || !answer) {
    return NextResponse.json({ error: 'question y answer requeridos' }, { status: 400 })
  }
  if (question.length > 1000 || answer.length > 5000) {
    return NextResponse.json({ error: 'texto demasiado largo' }, { status: 400 })
  }

  // Embed: question + answer juntos = mejor signal semantica
  const embedding = await embed(`${question}\n\n${answer}`)
  if (!embedding) {
    return NextResponse.json({ error: 'embedding fallo' }, { status: 502 })
  }

  const payload = {
    cliente_id: cliente.id,
    category,
    question,
    answer,
    tags: body.tags || null,
    source: body.source || 'manual',
    embedding: embedding as unknown as string,
    updated_at: new Date().toISOString(),
  }

  if (body.id) {
    const { data, error } = await admin
      .from('knowledge_base')
      .update(payload)
      .eq('id', body.id)
      .eq('cliente_id', cliente.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, item: data })
  } else {
    const { data, error } = await admin
      .from('knowledge_base')
      .insert(payload)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, item: data })
  }
}

export async function DELETE(req: Request) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: cliente } = await admin
    .from('clientes')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
  if (!cliente) return NextResponse.json({ error: 'cliente no encontrado' }, { status: 403 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { error } = await admin
    .from('knowledge_base')
    .delete()
    .eq('id', id)
    .eq('cliente_id', cliente.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
