import '@testing-library/jest-dom'

// Optional: configure any global mocks or test helpers here.
// For example, you could mock window.matchMedia if tests require it.

if (typeof window !== 'undefined' && !window.matchMedia) {
  // simple stub for matchMedia used by some components
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
