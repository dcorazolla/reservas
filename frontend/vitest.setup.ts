// Polyfill canvas getContext used by axe-core under jsdom
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
	// Provide a minimal getContext implementation that returns null
	// axe-core probes canvas contexts when checking for icon ligatures/color contrast.
	// Returning null is acceptable for tests under jsdom.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	HTMLCanvasElement.prototype.getContext = function () {
		return null
	}
}

import '@testing-library/jest-dom';

// You can add other global test setup here if needed.
