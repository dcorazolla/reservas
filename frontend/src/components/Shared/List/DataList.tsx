import React from 'react'
import './data-list.css'

export default function DataList<T>({ items, renderItem, className }: { items: T[]; renderItem: (item: T) => React.ReactNode; className?: string }) {
  return (
    <ul className={className ? `data-list ${className}` : 'data-list'}>
      {items.map((it: T, idx: number) => (
        <li key={idx} className="data-list-item">{renderItem(it)}</li>
      ))}
    </ul>
  )
}
