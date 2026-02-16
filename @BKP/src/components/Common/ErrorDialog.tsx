import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react'

type DialogType = 'error' | 'success' | 'info' | 'question';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: DialogType;
};

function defaultTitle(type: DialogType): string {
  switch (type) {
    case 'success':
      return 'Sucesso'
    case 'info':
      return 'Informação'
    case 'question':
      return 'Confirmação'
    case 'error':
    default:
      return 'Erro'
  }
}

function DialogIcon({ type }: { type: DialogType }) {
  switch (type) {
    case 'success':
      return (
        <Icon viewBox="0 0 24 24" color="green.500">
          <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 14.586L6.707 12.293l1.414-1.414L11 13.758l5.879-5.879 1.414 1.414L11 16.586z" />
        </Icon>
      )
    case 'info':
      return (
        <Icon viewBox="0 0 24 24" color="blue.500">
          <path fill="currentColor" d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zM12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2z" />
        </Icon>
      )
    case 'question':
      return <QuestionIcon color="yellow.500" />
    case 'error':
    default:
      return (
        <Icon viewBox="0 0 24 24" color="red.500">
          <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </Icon>
      )
  }
}

// Chakra doesn't export QuestionIcon by default; create a simple fallback
export default function ErrorDialog({ open, title, message, onClose, type = 'error' }: Props) {
  if (!open) return null

  const heading = title || defaultTitle(type)

  return (
    <div role="alertdialog" aria-modal="true" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', zIndex: 1200 }}>
      <div style={{ background: 'white', padding: 16, borderRadius: 6, minWidth: 320 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <DialogIcon type={type} />
          <strong>{heading}</strong>
        </div>
        <div style={{ marginBottom: 12, whiteSpace: 'pre-wrap' }}>{message}</div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )
}
