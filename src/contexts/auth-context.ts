import { createContext } from 'react'
import type { AuthUser } from '../types'

interface AuthResult {
  error?: string
}

interface SignUpInput {
  username: string
  description?: string
  email: string
  password: string
}

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isDemo: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (input: SignUpInput) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
