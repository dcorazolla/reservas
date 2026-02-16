import { render, screen } from '@testing-library/react'
import TokenExpiryBanner from './TokenExpiryBanner'

// Basic smoke test: render component without errors
test('TokenExpiryBanner renders without crashing', () => {
  // ensure localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: (function () {
      let store: Record<string, string> = {}
      return {
        getItem(key: string) {
          return store[key] ?? null
        },
        setItem(key: string, value: string) {
          store[key] = value
        },
        removeItem(key: string) {
          delete store[key]
        },
        clear() {
          store = {}
        },
      }
    })(),
    writable: true,
  })

  // Render; component uses a custom hook that may return undefined values, but rendering should not throw
  render(<TokenExpiryBanner />)

  // If no banner is shown, container will be empty; at least ensure render didn't throw and document exists
  expect(document.body).toBeTruthy()
})
import React from 'react';
import { render } from '@testing-library/react';
import TokenExpiryBanner from './TokenExpiryBanner';

test('renders without crashing', () => {
  render(<TokenExpiryBanner />);
});
