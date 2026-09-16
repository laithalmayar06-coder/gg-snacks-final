import { useState, type ReactNode } from 'react'

export default function VisualSlot({ src, label, className = '', children }: { src: string | null; label: string; className?: string; children?: ReactNode }) {
  const [failed, setFailed] = useState<string | null>(null)
  return <div className={`gg-visual-slot ${className}`}>
    {src && src !== failed
      ? <img src={src} alt={label} loading="lazy" decoding="async" onError={() => setFailed(src)} />
      : <div className="gg-visual-fallback">{children}<span className="gg-visual-label">{label}</span></div>}
  </div>
}
