import { isSupabaseConfigured, supabase } from './supabase'

export function getSiteUrl() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim()
  return (configuredUrl || window.location.origin).replace(/\/+$/, '')
}

export function getAuthRedirectUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getSiteUrl()}${normalizedPath}`
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Redefinição de senha indisponível no modo demonstração.')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl('/redefinir-senha'),
  })
  if (error) throw error
}

export async function updatePassword(password: string) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Redefinição de senha indisponível no modo demonstração.')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}
