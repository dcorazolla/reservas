export type LoginPayload = { email: string; password: string }

export async function login(payload: LoginPayload) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Login failed')
  }

  return res.json()
}
