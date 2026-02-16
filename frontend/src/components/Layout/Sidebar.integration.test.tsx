import React from 'react'
import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Chakra primitives locally so tests don't require the full provider
vi.mock('@chakra-ui/react', async () => {
	const React = await import('react')
	return {
		Box: (props: any) => React.createElement('div', props, props.children),
		VStack: (props: any) => React.createElement('div', props, props.children),
		Link: (props: any) => React.createElement('a', props, props.children),
		Text: (props: any) => React.createElement('span', props, props.children),
		Button: (props: any) => React.createElement('button', props, props.children),
		useDisclosure: () => ({ isOpen: false, onOpen: () => {}, onClose: () => {} }),
	}
})

// Mock react-router Link to avoid providing Router
vi.mock('react-router-dom', () => ({ Link: (props: any) => React.createElement('a', props, props.children) }))

import Sidebar from './Sidebar'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (k: string) => k }),
}))

describe('Sidebar integration', () => {
	beforeEach(() => {
		const existing = document.querySelector('header')
		if (!existing) {
			const header = document.createElement('header')
			header.getBoundingClientRect = () => ({ height: 48, top: 0, left: 0, right: 0, bottom: 0, width: 0, x: 0, y: 0, toJSON: () => {} })
			document.body.prepend(header)
		}
	})

	it('opens submenu via keyboard (space) and shows child items', async () => {
		render(<Sidebar desktop />)

		// expand via hover first (desktop starts compact)
		const nav = screen.getByLabelText('menu.navigation')
		fireEvent.mouseEnter(nav)

		await waitFor(() => expect(screen.getByText('menu.settings.label')).toBeInTheDocument())

		// press Space on the parent menu item to open children
		const parent = screen.getByText('menu.settings.label')
		fireEvent.keyDown(parent, { key: ' ' })

		await waitFor(() => {
			expect(screen.getByText('menu.settings.properties')).toBeInTheDocument()
		})
	})
})
