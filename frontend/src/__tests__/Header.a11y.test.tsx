import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'

// Mock current user hook and react-router navigation used in Header
vi.mock('../auth/useCurrentUser', () => ({
  useCurrentUser: () => ({ user: { name: 'Test User', email: 'test@example.com' } })
}))
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

import { Header } from '../components/Layout'

describe('Header accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(<Header innName="Pousada Teste" />)
    const results = await axe(container)
    expect(Array.isArray(results.violations)).toBe(true)
    expect(results.violations).toHaveLength(0)
  })
})
