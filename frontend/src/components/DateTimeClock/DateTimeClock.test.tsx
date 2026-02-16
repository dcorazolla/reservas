import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Chakra primitives used by the component so tests don't require the full provider
vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    VStack: (props: any) => React.createElement('div', props, props.children),
  }
})

import DateTimeClock from './DateTimeClock'

describe('DateTimeClock', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-16T12:34:56'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('renders date and time and updates every second', () => {
    render(<DateTimeClock />)

    expect(screen.getByText('16/02/2026')).toBeInTheDocument()
    expect(screen.getByText('12:34:56')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('12:34:57')).toBeInTheDocument()
  })
})
