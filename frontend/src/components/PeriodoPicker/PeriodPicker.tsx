import React, { useState } from 'react'
import { format, parseISO, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './PeriodPicker.css'

type Props = {
  currentDate: Date
  days: number
  onPickDate: (dateStr: string) => void // 'YYYY-MM' or 'YYYY-MM-DD'
}

export default function PeriodPicker({ currentDate, days, onPickDate }: Props) {
  const [dayMode, setDayMode] = useState(false)

  const monthVal = format(currentDate, 'yyyy-MM')
  const dayVal = format(currentDate, 'yyyy-MM-dd')

  return (
    <div className="period-picker">
      {!dayMode ? (
        <input
          type="month"
          value={monthVal}
          onChange={(e) => onPickDate(e.target.value)}
          aria-label="Selecionar mês e ano"
        />
      ) : (
        <input
          type="date"
          value={dayVal}
          onChange={(e) => onPickDate(e.target.value)}
          aria-label="Selecionar dia"
        />
      )}

      <button
        onClick={() => setDayMode((s) => !s)}
        title={dayMode ? 'Voltar para mês/ano' : 'Abrir seleção por dia'}
        className="btn-nav btn-nav-small period-picker-toggle"
      >
        {dayMode ? 'Mês' : 'Dia'}
      </button>
    </div>
  )
}
