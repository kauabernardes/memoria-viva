import { mockProfiles } from '../data/mockProfiles'
import type { Profile, ProfileUpdateInput } from '../types'
import { listMemories } from './memoryService'
import { isSupabaseConfigured, supabase } from './supabase'

const DEMO_PROFILE_KEY = 'memoria-viva:profile'

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    username: String(row.username ?? 'Usuário'),
    description: row.description ? String(row.description) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  }
}

function readDemoProfile(): Profile | null {
  try {
    return JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) ?? 'null') as Profile | null
  } catch {
    return null
  }
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase) {
    if (id === 'demo-user') {
      const saved = readDemoProfile()
      if (saved) return saved
      try {
        const session = JSON.parse(localStorage.getItem('memoria-viva:session') ?? 'null') as { username?: string } | null
        return { id, username: session?.username ?? 'Usuário', description: 'Pesquisador de memórias e territórios.' }
      } catch {
        return { id, username: 'Usuário', description: 'Pesquisador de memórias e territórios.' }
      }
    }
    return mockProfiles.find((profile) => profile.id === id) ?? null
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toProfile(data) : null
}

export async function updateProfile(id: string, input: ProfileUpdateInput): Promise<Profile> {
  const updated: Profile = { id, ...input }
  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(updated))
    return updated
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || authData.user?.id !== id) throw new Error('Sua sessão expirou. Entre novamente para editar o perfil.')
  const { data, error } = await supabase
    .from('profiles')
    .update({ username: input.username, description: input.description, avatar_url: input.avatarUrl || null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toProfile(data)
}

export async function getProfileMemories(profileId: string) {
  const memories = await listMemories()
  return memories.filter((memory) => memory.authorId === profileId)
}
