function baseUrl() {
  if (typeof window !== 'undefined') return ''
  return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function login(email: string, password: string): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to log in')
  return res.json()
}

export async function logout(): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl()}/api/auth/logout`, {
    method: 'POST',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to log out')
  return res.json()
}

export async function getCurrentAdmin(): Promise<{ email: string; role: string } | null> {
  const res = await fetch(`${baseUrl()}/api/auth/me`, { cache: 'no-store' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to fetch current admin')
  return res.json()
}
