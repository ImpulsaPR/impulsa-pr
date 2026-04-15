import { getSupabase } from './supabase'
import type { Cliente } from './types'

export async function getCurrentCliente(): Promise<Cliente | null> {
  const supabase = getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('clientes')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return (data as Cliente) || null
}
