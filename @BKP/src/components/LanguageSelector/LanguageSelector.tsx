import React from 'react'
import { useTranslation } from 'react-i18next'

const options: { key: string; label: string }[] = [
  { key: 'pt-BR', label: 'Português (BR)' },
  { key: 'es', label: 'Español' },
  { key: 'en', label: 'English' },
  { key: 'fr', label: 'Français' },
]

export default function LanguageSelector({ size = 'sm' }: { size?: string }) {
  const { i18n } = useTranslation()

  const handle = (val: string) => {
    i18n.changeLanguage(val)
    try {
      localStorage.setItem('locale', val)
    } catch (e) {}
  }

  return (
    <select value={i18n.language} onChange={(e) => handle(e.target.value)} aria-label="Select language">
      {options.map((o) => (
        <option key={o.key} value={o.key}>{o.label}</option>
      ))}
    </select>
  )
}
