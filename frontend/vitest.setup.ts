// Ensure canvas getContext used by axe-core under jsdom does not throw.
// axe-core probes canvas contexts when checking for icon ligatures/color contrast.
// Some jsdom versions have a getContext implementation that throws "Not implemented".
// Override it with a safe wrapper that returns null on errors.
if (typeof HTMLCanvasElement !== 'undefined') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const originalGetContext = (HTMLCanvasElement.prototype as any).getContext
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	;(HTMLCanvasElement.prototype as any).getContext = function (..._args: any[]) {
		try {
			if (typeof originalGetContext === 'function') {
				return originalGetContext.apply(this, _args)
			}
			return null
		} catch (e) {
			return null
		}
	}
}

import '@testing-library/jest-dom';

// You can add other global test setup here if needed.
