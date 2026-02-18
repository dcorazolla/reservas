import React from 'react'
import { Box, HStack, CloseButton } from '@chakra-ui/react'
import './message.css'

export type MessageType = 'success' | 'error'

interface MessageProps {
  type: MessageType
  message: string
  onClose: () => void
  autoClose?: number // milliseconds, 0 = no auto-close
}

export default function Message({ type, message, onClose, autoClose = 30000 }: MessageProps) {
  React.useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const bgColor = type === 'success' ? 'green.50' : 'red.50'
  const borderColor = type === 'success' ? 'green.500' : 'red.500'
  const textColor = type === 'success' ? 'green.800' : 'red.800'

  return (
    <HStack
      p={3}
      borderRadius="md"
      bg={bgColor}
      borderLeft="4px solid"
      borderColor={borderColor}
      color={textColor}
      justify="space-between"
      className="shared-message"
    >
      <Box>{message}</Box>
      <CloseButton
        size="sm"
        onClick={onClose}
        _hover={{ bg: type === 'success' ? 'green.100' : 'red.100' }}
      />
    </HStack>
  )
}
