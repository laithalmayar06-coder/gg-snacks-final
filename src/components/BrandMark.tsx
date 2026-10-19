import { officialLogo } from '../data/brand'
import '../styles/brand-mark.css'

// Empty alt is intentional inside links with a translated brand aria-label.
export default function BrandMark({ className = '', alt = '', size = 48 }: { className?: string; alt?: string; size?: number }) {
  return <img className={('official-brand-mark ' + className).trim()} src={officialLogo.small} srcSet={`${officialLogo.small} 128w, ${officialLogo.src} 512w`} sizes={`${size}px`} width={officialLogo.width} height={officialLogo.height} alt={alt} decoding="async" draggable={false} />
}
