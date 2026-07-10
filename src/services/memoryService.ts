import { mockMemories } from '../data/mockMemories'
import type { Memory, NewMemoryInput } from '../types'
import { isSupabaseConfigured, supabase } from './supabase'

const LOCAL_MEMORIES_KEY = 'memoria-viva:memories'
const LOCAL_FAVORITES_KEY = 'memoria-viva:favorites'

function readLocalMemories(): Memory[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_MEMORIES_KEY) ?? '[]') as Memory[]
  } catch {
    return []
  }
}

function toMemory(row: Record<string, unknown>): Memory {
  const profile = row.profile as { username?: unknown } | null | undefined
  return {
    id: String(row.id),
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : 'Memória do território',
    description: String(row.description),
    category: row.category as Memory['category'],
    community: String(row.community),
    location: String(row.location_name ?? row.location ?? 'Local não informado'),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    image: String(row.image_url ?? row.image ?? ''),
    author: String(profile?.username ?? row.author ?? 'Autoria comunitária'),
    authorId: row.author_id ? String(row.author_id) : undefined,
    distance: String(row.distance ?? '—'),
    featured: Boolean(row.is_featured ?? row.featured),
    createdAt: row.created_at ? String(row.created_at) : undefined,
  }
}

export async function listMemories(): Promise<Memory[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [...readLocalMemories(), ...mockMemories]
  }

  const { data, error } = await supabase
    .from('memories')
    .select('*, profile:profiles!memories_author_id_fkey(username)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => toMemory(row))
}

export async function getMemoryById(id: string): Promise<Memory | null> {
  if (!isSupabaseConfigured || !supabase) {
    return [...readLocalMemories(), ...mockMemories].find((memory) => memory.id === id) ?? null
  }

  const { data, error } = await supabase
    .from('memories')
    .select('*, profile:profiles!memories_author_id_fkey(username)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? toMemory(data) : null
}

export async function createMemory(input: NewMemoryInput): Promise<Memory> {
  const memory: Memory = {
    ...input,
    authorId: isSupabaseConfigured ? undefined : 'demo-user',
    id: crypto.randomUUID ? crypto.randomUUID() : `memory-${Date.now()}`,
    distance: 'novo',
    featured: false,
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured || !supabase) {
    const localMemories = readLocalMemories()
    localStorage.setItem(LOCAL_MEMORIES_KEY, JSON.stringify([memory, ...localMemories]))
    return memory
  }

  // O autor precisa vir da sessão validada pelo Supabase. Usar um id recebido
  // da interface pode divergir de auth.uid() e ser corretamente bloqueado pela RLS.
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    throw new Error('Sua sessão expirou. Entre novamente antes de publicar.')
  }

  const { data, error } = await supabase
    .from('memories')
    .insert({
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      category: input.category,
      community: input.community,
      location_name: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
      image_url: input.image,
      author_id: authData.user.id,
      is_featured: false,
    })
    .select()
    .single()
  if (error) throw error
  return toMemory(data)
}

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FAVORITES_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export async function isFavorite(memoryId: string, userId?: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return readFavorites().includes(memoryId)
  const { data, error } = await supabase
    .from('favorites')
    .select('memory_id')
    .eq('memory_id', memoryId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function toggleFavorite(memoryId: string, userId?: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    const favorites = readFavorites()
    const next = favorites.includes(memoryId)
      ? favorites.filter((id) => id !== memoryId)
      : [...favorites, memoryId]
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(next))
    return next.includes(memoryId)
  }

  const active = await isFavorite(memoryId, userId)
  if (active) {
    const { error } = await supabase.from('favorites').delete().eq('memory_id', memoryId).eq('user_id', userId)
    if (error) throw error
    return false
  }
  const { error } = await supabase.from('favorites').insert({ memory_id: memoryId, user_id: userId })
  if (error) throw error
  return true
}

export async function listFavoriteMemories(userId?: string): Promise<Memory[]> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    const favoriteIds = readFavorites()
    const memories = await listMemories()
    return memories.filter((memory) => favoriteIds.includes(memory.id))
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('memory_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const ids = (data ?? []).map((favorite) => String(favorite.memory_id))
  if (ids.length === 0) return []
  const memories = await listMemories()
  return memories.filter((memory) => ids.includes(memory.id))
}
