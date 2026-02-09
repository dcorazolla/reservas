// Ensure canvas getContext used by axe-core under jsdom does not throw.
// axe-core probes canvas contexts when checking for icon ligatures/color contrast.
// Some jsdom versions have a getContext implementation that throws "Not implemented".
// Override it with a safe wrapper that returns null on errors.
if (typeof HTMLCanvasElement !== 'undefined') {
	// Ensure getContext never throws in jsdom — return null unconditionally.
	// This avoids axe-core causing test failures when jsdom's implementation
	// throws "Not implemented" in some runner environments.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	;(HTMLCanvasElement.prototype as any).getContext = function (..._args: any[]) {
		return null
	}
}

import '@testing-library/jest-dom';

// You can add other global test setup here if needed.

// Provide a minimal global fetch mock for tests so components that call
// the API (listRooms, listPartners, etc.) do not attempt real network
// requests during CI. Tests that need specific responses should still
// mock the API module directly via `vi.mock(...)`.
if (typeof globalThis.fetch === 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	;(globalThis as any).fetch = async (input: any, _init?: any) => {
		const url = typeof input === 'string' ? input : input?.url || ''
		const jsonResponse = (data: any) => ({
			ok: true,
			status: 200,
			json: async () => data,
			text: async () => JSON.stringify(data),
		})

		if (url.includes('/rooms')) {
			return jsonResponse([
				{ id: 'r1', name: 'Room 1', capacity: 2 },
			])
		}
		if (url.includes('/partners')) {
			return jsonResponse([])
		}

		if (url.includes('/calendar')) {
			return jsonResponse({ start: '2026-02-01', end: '2026-03-02', rooms: [
				{ id: 'r1', name: 'Room 1', capacity: 2, reservations: [] }
			] })
		}

		if (url.includes('/room-blocks')) {
			// GET -> return empty list; POST -> return created block
			if (typeof input === 'string' || !input) {
				// If method unspecified, assume GET
				return jsonResponse([])
			}
			const method = input?.method || 'GET'
			if (method.toUpperCase() === 'GET') return jsonResponse([])
			if (method.toUpperCase() === 'POST') {
				// parse body if available
				try {
					const body = typeof input === 'object' && input.body ? JSON.parse(input.body) : {};
					return jsonResponse({ id: 'generated-block', ...body })
				} catch {
					return jsonResponse({ id: 'generated-block' })
				}
			}
			return jsonResponse([])
		}

		// Default: return 404-like response
		return {
			ok: false,
			status: 404,
			json: async () => ({ message: 'Not found' }),
			text: async () => 'Not found',
		}
	}
}
