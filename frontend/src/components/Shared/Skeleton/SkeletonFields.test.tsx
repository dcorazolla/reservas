import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect } from 'vitest'
import SkeletonFields from './SkeletonFields'

describe('SkeletonFields', () => {
  it('renders default 4 rows', () => {
    render(<SkeletonFields />)
    const container = screen.getByTestId('skeleton-fields')
    expect(container).toBeInTheDocument()
    expect(container.querySelectorAll('.skeleton')).toHaveLength(4)
  })

  it('renders custom number of rows', () => {
    render(<SkeletonFields rows={2} />)
    const container = screen.getByTestId('skeleton-fields')
    expect(container.querySelectorAll('.skeleton')).toHaveLength(2)
  })

  it('each skeleton has skeleton-field class', () => {
    render(<SkeletonFields rows={1} />)
    const skel = screen.getByTestId('skeleton-fields').querySelector('.skeleton')!
    expect(skel).toHaveClass('skeleton-field')
  })
})
