import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'
import { safeSupabaseError } from '@/lib/safe-error'

export const runtime = 'nodejs'

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim()

interface SearchBody {
  query: string
  limit?: number
  threshold?: number
}

async function embed(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) return null
  try {
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
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY no configurado' }, { status: 500 })
  }

  let body: SearchBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'json invalido' }, { status: 400 })
  }
  const query = (body.query || '').trim()
  if (!query) return NextResponse.json({ error: 'query requerido' }, { status: 400 })

  const limit = Math.min(Math.max(body.limit || 3, 1), 10)
  const threshold = body.threshold ?? 0.5

  // Auth: solo user session. n8n usa la RPC kb_search de Supabase
  // directamente con service-role + cliente_id derivado del bot lookup,
  // así que el endpoint API solo sirve a la UI del dashboard.
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
  const clienteId = cliente?.id
  if (!clienteId) {
    return NextResponse.json({ error: 'cliente no resuelto' }, { status: 403 })
  }

  const embedding = await embed(query)
  if (!embedding) {
    return NextResponse.json({ error: 'embedding fallo' }, { status: 502 })
  }

  const { data, error } = await admin.rpc('kb_search', {
    p_cliente_id: clienteId,
    p_embedding: embedding as unknown as string,
    p_limit: limit,
    p_threshold: threshold,
  })

  if (error) {
    return NextResponse.json(
      { error: safeSupabaseError('kb_search', error).public },
      { status: 500 }
    )
  }

  return NextResponse.json({
    results: data || [],
    count: data?.length || 0,
  })
}
