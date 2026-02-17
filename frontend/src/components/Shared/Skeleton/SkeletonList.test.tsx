import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import SkeletonList from './SkeletonList'

describe('SkeletonList', () => {
  it('renders default 3 rows', () => {
    render(<SkeletonList />)
    const list = screen.getByTestId('skeleton-list')
    expect(list).toBeInTheDocument()
    expect(list.querySelectorAll('.skeleton-row')).toHaveLength(3)
  })

  it('renders custom number of rows', () => {
    render(<SkeletonList rows={5} />)
    const list = screen.getByTestId('skeleton-list')
    expect(list.querySelectorAll('.skeleton-row')).toHaveLength(5)
  })

  it('each row has two skeleton blocks', () => {
    render(<SkeletonList rows={1} />)
    const row = screen.getByTestId('skeleton-list').querySelector('.skeleton-row')!
    expect(row.querySelectorAll('.skeleton')).toHaveLength(2)
  })
})
