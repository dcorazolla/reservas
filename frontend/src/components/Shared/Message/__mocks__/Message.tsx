import React from 'react'
import type { FC } from 'react'

interface MessageProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
  autoClose?: number
}

const MockMessage: FC<MessageProps> = ({ type, message }) => {
  return React.createElement('div', { 'data-testid': `message-${type}`, role: 'alert' }, message)
}

export default MockMessage
