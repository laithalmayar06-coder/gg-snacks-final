import { useState, type ReactNode } from 'react'

export default function ProductImage({ src, alt, className, children, loading }: { src: string | null; alt: string; className?: string; children: ReactNode; loading?: 'lazy' | 'eager' }) {
  const [failed, setFailed] = useState<string | null>(null)
  if (!src || src === failed) return <>{children}</>
  return <img src={src} alt={alt} loading={loading} decoding="async" className={className} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} onError={() => setFailed(src)} />
}
