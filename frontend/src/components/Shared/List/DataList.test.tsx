import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'

import DataList from './DataList'

describe('DataList', () => {
  it('renders items with custom className', () => {
    const items = [{ name: 'A' }, { name: 'B' }]
    render(
      <DataList items={items} className="my-list" renderItem={(it) => <span>{it.name}</span>} />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    const ul = screen.getByRole('list')
    expect(ul.className).toContain('data-list')
    expect(ul.className).toContain('my-list')
  })

  it('renders without custom className', () => {
    const items = [{ name: 'C' }]
    render(
      <DataList items={items} renderItem={(it) => <span>{it.name}</span>} />
    )
    const ul = screen.getByRole('list')
    expect(ul.className).toBe('data-list')
  })

  it('renders empty list', () => {
    render(
      <DataList items={[]} renderItem={() => <span>x</span>} />
    )
    const ul = screen.getByRole('list')
    expect(ul.children).toHaveLength(0)
  })
})
