import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthUser } from '../types'
import { isSupabaseConfigured, supabase } from '../services/supabase'
import { getAuthRedirectUrl } from '../services/authService'
import { AuthContext, type AuthContextValue } from './auth-context'

const DEMO_SESSION_KEY = 'memoria-viva:session'

function readDemoUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) ?? 'null') as AuthUser | null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => isSupabaseConfigured ? null : readDemoUser())
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      const authUser = data.session?.user
      setUser(authUser ? { id: authUser.id, email: authUser.email ?? '' } : null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user
      setUser(authUser ? { id: authUser.id, email: authUser.email ?? '' } : null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isDemo: !isSupabaseConfigured,
    async signIn(email, password) {
      if (!isSupabaseConfigured || !supabase) {
        const demoUser = { id: 'demo-user', email, username: email.split('@')[0] }
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
        return {}
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? email })
      return {}
    },
    async signUp(input) {
      if (!isSupabaseConfigured || !supabase) {
        const demoUser = { id: 'demo-user', email: input.email, username: input.username }
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
        return {}
      }
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { username: input.username, description: input.description ?? '' },
          emailRedirectTo: getAuthRedirectUrl('/login'),
        },
      })
      if (error) return { error: error.message }
      if (!data.session) {
        setUser(null)
        return { error: 'Cadastro criado. Confirme seu e-mail e faça login para continuar.' }
      }
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? input.email, username: input.username })
      return {}
    },
    async signOut() {
      if (isSupabaseConfigured && supabase) await supabase.auth.signOut()
      localStorage.removeItem(DEMO_SESSION_KEY)
      setUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
