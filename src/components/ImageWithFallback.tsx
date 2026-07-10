import { useState, type ImgHTMLAttributes } from 'react'
import { ImageOff } from 'lucide-react'

export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)

  if (failed || !props.src) {
    return (
      <div className={`image-fallback ${props.className ?? ''}`} role="img" aria-label={props.alt || 'Imagem indisponível'}>
        <ImageOff size={30} />
        <span>Imagem indisponível</span>
      </div>
    )
  }

  return <img {...props} onError={() => setFailed(true)} />
}
