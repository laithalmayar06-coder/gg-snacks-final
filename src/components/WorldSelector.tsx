import type { CSSProperties } from 'react'
import { Link } from 'react-router'

interface Option { id: string; name: string; accentColor: string; to?: string }
interface Props {
  label: string
  options: Option[]
  value: string
  onChange: (id: string) => void
  variant: 'family' | 'flavor'
}

export default function WorldSelector({ label, options, value, onChange, variant }: Props) {
  return <fieldset className={`world-selector world-selector--${variant}`}>
    <legend>{label}</legend>
    <div className="world-options">
      {options.map((option, index) => option.to ? <Link
        key={option.id} to={option.to} data-selected={value === option.id}
        style={{ '--option-accent': option.accentColor } as CSSProperties}
      >
        <span className="world-option-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span dir="ltr">{option.name}</span>
        <span className="world-option-mark" aria-hidden="true">+</span>
      </Link> : <button
        key={option.id} type="button" aria-pressed={value === option.id}
        style={{ '--option-accent': option.accentColor } as CSSProperties}
        onClick={() => onChange(option.id)}
      >
        <span className="world-option-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span dir={variant === 'family' ? 'ltr' : undefined}>{option.name}</span>
        <span className="world-option-mark" aria-hidden="true">{value === option.id ? '−' : '+'}</span>
      </button>)}
    </div>
  </fieldset>
}
