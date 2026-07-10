export const memoryCategories = [
  'histórico',
  'urbano',
  'religioso',
  'indígena',
  'ribeirinho',
  'rural',
] as const

export type MemoryCategory = (typeof memoryCategories)[number]

export interface Profile {
  id: string
  username: string
  description?: string
  avatarUrl?: string
  createdAt?: string
}

export interface ProfileUpdateInput {
  username: string
  description: string
  avatarUrl?: string
}

export interface Memory {
  id: string
  title: string
  subtitle: string
  description: string
  category: MemoryCategory
  categories?: MemoryCategory[]
  community: string
  location: string
  latitude: number
  longitude: number
  image: string
  author: string
  authorId?: string
  authorRole?: string
  distance: string
  featured: boolean
  createdAt?: string
}

export interface Favorite {
  userId: string
  memoryId: string
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  username?: string
}

export interface NewMemoryInput {
  title: string
  subtitle: string
  description: string
  community: string
  category: MemoryCategory
  location: string
  latitude: number
  longitude: number
  image: string
  author: string
}
