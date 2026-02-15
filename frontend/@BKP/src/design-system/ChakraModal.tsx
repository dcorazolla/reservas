import React from 'react'
import {
  Modal as CModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react'

type Props = {
  open: boolean
  title?: string
  children: React.ReactNode
  onClose: () => void
  titleId?: string
  closeOnBackdrop?: boolean
  className?: string
  footer?: React.ReactNode
}

export default function ChakraModal({
  open,
  title,
  children,
  onClose,
  titleId,
  closeOnBackdrop = true,
  className,
  footer,
}: Props) {
  return (
    <CModal isOpen={open} onClose={onClose} closeOnOverlayClick={closeOnBackdrop}>
      <ModalOverlay />
      <ModalContent className={className}>
        {title && <ModalHeader id={titleId}>{title}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </CModal>
  )
}
