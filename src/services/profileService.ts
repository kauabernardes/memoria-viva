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

function fileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'))
    reader.readAsDataURL(file)
  })
}

export async function uploadProfileAvatar(userId: string, file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) throw new Error('Escolha uma imagem JPEG, PNG ou WebP.')
  if (file.size > 2 * 1024 * 1024) throw new Error('A foto de perfil deve ter no máximo 2 MB.')

  if (!isSupabaseConfigured || !supabase) return fileAsDataUrl(file)

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || authData.user?.id !== userId) throw new Error('Sua sessão expirou. Entre novamente para alterar a foto.')

  const path = `${userId}/avatar`
  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: true,
  })
  if (error) {
    if (error.message.toLocaleLowerCase().includes('bucket')) throw new Error('O bucket de avatares ainda não foi configurado no Supabase.')
    throw error
  }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}

export async function getProfileMemories(profileId: string) {
  const memories = await listMemories()
  return memories.filter((memory) => memory.authorId === profileId)
}
